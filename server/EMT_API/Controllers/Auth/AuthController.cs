using EMT_API.Data;                     // DbContext
using EMT_API.DTOs.Auth;               // AuthResponse, RegisterRequest, LoginRequest
using EMT_API.Models;                  // Account, UserDetail
using EMT_API.Security;                // PasswordHasher, ResetPasswordTokenService
using EMT_API.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace EMT_API.Controllers.Auth;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly EMTDbContext _db;
    private readonly ITokenService _tokens;
    private readonly IConfiguration _cfg;

    public AuthController(EMTDbContext db, ITokenService tokens, IConfiguration cfg)
    {
        _db = db;
        _tokens = tokens;
        _cfg = cfg;
    }

    // ---------------------------
    // REGISTER
    // ---------------------------
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest req, [FromServices] IOtpService otpSvc)
    {
        // ✅ Kiểm tra đầu vào cơ bản
        if (string.IsNullOrWhiteSpace(req.Email) ||
            string.IsNullOrWhiteSpace(req.Username) ||
            string.IsNullOrWhiteSpace(req.Password) ||
            string.IsNullOrWhiteSpace(req.ConfirmPassword) ||
            string.IsNullOrWhiteSpace(req.Otp))
        {
            return BadRequest("Vui lòng nhập đầy đủ thông tin.");
        }

        // ✅ Kiểm tra mật khẩu xác nhận
        if (req.Password != req.ConfirmPassword)
            return BadRequest("Mật khẩu xác nhận không khớp.");
        // 0️⃣ Kiểm tra OTP trước
        if (!otpSvc.Verify(req.Email, req.Otp))
            return Unauthorized("OTP không hợp lệ hoặc đã hết hạn.");

        // 1) Check trùng
        if (await _db.Accounts.AnyAsync(a => a.Email == req.Email))
            return Conflict("Email đã tồn tại.");
        if (await _db.Accounts.AnyAsync(a => a.Username == req.Username))
            return Conflict("Username đã tồn tại.");

        // 2) Hash mật khẩu
        var hashed = PasswordHasher.Hash(req.Password);

        // 3) Tạo account
        var acc = new Account
        {
            Email = req.Email,
            Username = req.Username,
            Hashpass = hashed,
            CreateAt = DateTime.UtcNow,
            Status = "ACTIVE",
            Role = "STUDENT"
        };
        _db.Accounts.Add(acc);
        await _db.SaveChangesAsync();

        // (tuỳ chọn) Tạo UserDetail rỗng nếu chưa có
        if (await _db.UserDetails.FindAsync(acc.AccountID) is null)
        {
            _db.UserDetails.Add(new UserDetail { AccountID = acc.AccountID });
            await _db.SaveChangesAsync();
        }

        // 4) Cấp token ngay sau register (giữ API nhất quán với AuthResponse rút gọn)
        var access = _tokens.CreateAccessToken(acc, acc.RefreshTokenVersion);
        var (rt, exp) = _tokens.CreateRefreshToken();

        acc.RefreshTokenHash = _tokens.HashRefreshToken(rt);
        acc.RefreshTokenExpiresAt = exp.UtcDateTime;
        acc.LastLoginAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        SetRefreshCookie(rt, exp);

        return CreatedAtAction(nameof(Register),
            new AuthResponse(
                AccountID: acc.AccountID,
                AccessToken: access,
                ExpiresIn: int.Parse(_cfg["Jwt:AccessTokenMinutes"]!) * 60
            ));
    }

    [HttpPost("registerTeacher")]
    public async Task<ActionResult<AuthResponse>> RegisterTeacher([FromBody] RegisterRequest req)
    {
        // 1) Check trùng
        if (await _db.Accounts.AnyAsync(a => a.Email == req.Email))
            return Conflict("Email đã tồn tại.");
        if (await _db.Accounts.AnyAsync(a => a.Username == req.Username))
            return Conflict("Username đã tồn tại.");

        // 2) Hash mật khẩu
        var hashed = PasswordHasher.Hash(req.Password);

        // 3) Tạo account
        var acc = new Account
        {
            Email = req.Email,
            Username = req.Username,
            Hashpass = hashed,
            CreateAt = DateTime.UtcNow,
            Status = "ACTIVE",
            Role = "TEACHER"
        };
        _db.Accounts.Add(acc);
        await _db.SaveChangesAsync();


        _db.UserDetails.Add(new UserDetail { AccountID = acc.AccountID });
        _db.Teachers.Add(new Teacher { TeacherID = acc.AccountID });
        await _db.SaveChangesAsync();

        // 4) Cấp token ngay sau register (giữ API nhất quán với AuthResponse rút gọn)
        var access = _tokens.CreateAccessToken(acc, acc.RefreshTokenVersion);
        var (rt, exp) = _tokens.CreateRefreshToken();

        acc.RefreshTokenHash = _tokens.HashRefreshToken(rt);
        acc.RefreshTokenExpiresAt = exp.UtcDateTime;
        acc.LastLoginAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        SetRefreshCookie(rt, exp);

        return CreatedAtAction(nameof(Register),
            new AuthResponse(
                AccountID: acc.AccountID,
                AccessToken: access,
                ExpiresIn: int.Parse(_cfg["Jwt:AccessTokenMinutes"]!) * 60
            ));
    }

    [HttpPost("send-otp")]
    public async Task<IActionResult> SendOtp(
    [FromBody] SendOtpRequest req,
    [FromServices] IOtpService otpSvc,
    [FromServices] EmailSender mailer)
    {
        try
        {
            var otp = otpSvc.Generate(req.Email);
            var html = $"<h3>Mã OTP của bạn là <b>{otp}</b></h3><p>Hết hạn sau 5 phút.</p>";

            await mailer.SendEmailAsync(req.Email, "Xác thực tài khoản EMT", html);
            return Ok(new { message = "Đã gửi OTP tới email." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }


    // ---------------------------
    // LOGIN
    // ---------------------------
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest req)
    {
        var user = await _db.Accounts
            .FirstOrDefaultAsync(a => a.Email == req.EmailOrUsername || a.Username == req.EmailOrUsername);
        if (user is null) return Unauthorized("Email/username không đúng.");

        if (!PasswordHasher.Verify(req.Password, user.Hashpass))
            return Unauthorized("Mật khẩu không đúng.");

        var access = _tokens.CreateAccessToken(user, user.RefreshTokenVersion);
        var (rt, exp) = _tokens.CreateRefreshToken();

        user.RefreshTokenHash = _tokens.HashRefreshToken(rt);
        user.RefreshTokenExpiresAt = exp.UtcDateTime;
        user.LastLoginAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        SetRefreshCookie(rt, exp);

        return Ok(new AuthResponse(
            AccountID: user.AccountID,
            AccessToken: access,
            ExpiresIn: int.Parse(_cfg["Jwt:AccessTokenMinutes"]!) * 60
        ));
    }

    // ---------------------------
    // REFRESH TOKEN (xoay vòng)
    // ---------------------------
    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponse>> Refresh()
    {
        var rt = Request.Cookies["emt_rt"];
        if (string.IsNullOrEmpty(rt)) return Unauthorized("Missing refresh token.");

        // FE gửi kèm access token cũ (có thể hết hạn) ở header Authorization
        var bearer = Request.Headers.Authorization.ToString();
        var accessOld = bearer?.StartsWith("Bearer ") == true ? bearer["Bearer ".Length..] : null;
        if (string.IsNullOrEmpty(accessOld)) return Unauthorized("Missing access token.");

        var principal = _tokens.ValidateExpiredAccessToken(accessOld);
        var sub = principal?.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? principal?.FindFirstValue(JwtRegisteredClaimNames.Sub);
        if (!int.TryParse(sub, out var uid)) return Unauthorized("Cannot identify user.");

        var user = await _db.Accounts.FindAsync(uid);
        if (user is null) return Unauthorized();

        // Hết hạn -> buộc login lại
        if (user.RefreshTokenExpiresAt is null || user.RefreshTokenExpiresAt <= DateTime.UtcNow)
        {
            ClearRefreshCookie();
            user.RefreshTokenHash = null;
            await _db.SaveChangesAsync();
            return Unauthorized("Refresh token expired.");
        }

        // So khớp hash
        var incomingHash = _tokens.HashRefreshToken(rt);
        if (!string.Equals(incomingHash, user.RefreshTokenHash, StringComparison.Ordinal))
        {
            // Phát hiện reuse -> revoke toàn bộ session đang sống: bump version
            user.RefreshTokenVersion += 1;
            user.RefreshTokenHash = null;
            user.RefreshTokenExpiresAt = null;
            await _db.SaveChangesAsync();
            ClearRefreshCookie();
            return Unauthorized("Refresh token reuse detected.");
        }

        // Hợp lệ -> phát cặp mới + xoay vòng
        var access = _tokens.CreateAccessToken(user, user.RefreshTokenVersion);
        var (newRt, newExp) = _tokens.CreateRefreshToken();
        user.RefreshTokenHash = _tokens.HashRefreshToken(newRt);
        user.RefreshTokenExpiresAt = newExp.UtcDateTime;
        await _db.SaveChangesAsync();

        SetRefreshCookie(newRt, newExp);

        return Ok(new AuthResponse(
            AccountID: user.AccountID,
            AccessToken: access,
            ExpiresIn: int.Parse(_cfg["Jwt:AccessTokenMinutes"]!) * 60
        ));
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var uid = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await _db.Accounts.FindAsync(uid);
        if (user != null)
        {
            user.RefreshTokenHash = null;
            user.RefreshTokenExpiresAt = null;
            await _db.SaveChangesAsync();
        }
        ClearRefreshCookie();
        return Ok();
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest req, [FromServices] IConfiguration cfg, [FromServices] EmailSender mailer)
    {
        // Luôn trả 200 để không lộ email có tồn tại hay không
        var acc = await _db.Accounts.FirstOrDefaultAsync(a => a.Email == req.Email); // Tìm account theo email
        if (acc is null) return Ok(new { message = "If the email exists, a reset link has been sent." }); // Không nói có/không

        // Tạo token reset 30'
        var token = ResetPasswordTokenService.Create(acc, cfg); // Tạo JWT (hoặc token) có exp ~30 phút + fingerprint

        // Tạo link (FE của bạn sẽ có trang nhập mật khẩu mới, nhận token từ query)
        var link = $"{cfg["FrontendBaseUrl"]}/reset-password?token={Uri.EscapeDataString(token)}"; // Dựng URL tới FE, escape token

        // Gửi email (HTML)
        var subject = "Reset mật khẩu tài khoản EMT";

        var html = EmailTemplate.BuildResetPasswordEmail(acc.Username ?? acc.Email, link);
        try
        {
            await mailer.SendEmailAsync(acc.Email!, "Đặt lại mật khẩu tài khoản EMT", html);
        }
        catch
        {
            // Không lộ lỗi SMTP ra ngoài; vẫn trả 200 để không bị dò email
            // TODO: _logger.LogError(ex, "Failed to send reset email to {Email}", acc.Email);
        }

        return Ok(new { message = "Reset link generated.", resetLink = link }); // 200 + link (chỉ dùng DEV)
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest req, [FromServices] IConfiguration cfg)
    {
        if (string.IsNullOrWhiteSpace(req.NewPassword) || req.NewPassword != req.ConfirmNewPassword) // Kiểm tra 2 ô mật khẩu
            return BadRequest("Mật khẩu xác nhận không khớp.");                                      // 400 nếu không hợp lệ

        if (!ResetPasswordTokenService.TryValidate(req.Token, cfg, out var accountId, out var fpFromToken)) // Validate token (chữ ký/exp/iss/aud…)
            return BadRequest("Token không hợp lệ hoặc đã hết hạn.");                                       // 400 nếu token fail

        var acc = await _db.Accounts.FirstOrDefaultAsync(a => a.AccountID == accountId); // Lấy account theo id từ token
        if (acc is null) return BadRequest("Tài khoản không tồn tại.");                 // 400 nếu không có

        // So khớp fingerprint để chống dùng lại token sau khi đã đổi pass
        var nowFp = ResetPasswordTokenService.Fingerprint(acc.Hashpass); // Tạo fingerprint hiện tại (từ hashpass đang lưu)
        if (!string.Equals(nowFp, fpFromToken, StringComparison.Ordinal)) // Nếu fingerprint khác => pass đã đổi sau khi phát token
            return BadRequest("Token đã bị vô hiệu (mật khẩu đã thay đổi)."); // Chặn dùng lại token cũ

        // Đổi mật khẩu
        acc.Hashpass = PasswordHasher.Hash(req.NewPassword); // Băm mật khẩu mới
        await _db.SaveChangesAsync();                        // Lưu DB

        return Ok(new { message = "Đổi mật khẩu thành công." }); // 200 OK
    }

    // ---------------------------
    // Helpers (cookie)
    // ---------------------------
    private void SetRefreshCookie(string rt, DateTimeOffset exp)
    {
        Response.Cookies.Append("emt_rt", rt, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,              // Bật HTTPS ở môi trường thật
            SameSite = SameSiteMode.Strict,
            Expires = exp
        });
    }

    private void ClearRefreshCookie()
    {
        Response.Cookies.Delete("emt_rt", new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict
        });
    }
}
