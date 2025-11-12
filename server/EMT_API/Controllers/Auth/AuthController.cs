using EMT_API.Data;
using EMT_API.DTOs.Auth;
using EMT_API.Models;
using EMT_API.Security;
using EMT_API.Utils;
using EMT_API.DAOs.UserDAO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Google.Apis.Auth;

namespace EMT_API.Controllers.Auth;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IUserDAO _dao;
    private readonly ITokenService _tokens;
    private readonly IConfiguration _cfg;

    public AuthController(ITokenService tokens, IConfiguration cfg, IUserDAO dao)
    {
        _dao = dao;
        _tokens = tokens;
        _cfg = cfg;
    }

    // ---------------------------
    // REGISTER (STUDENT)
    // ---------------------------
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest req, [FromServices] IOtpService otpSvc)
    {
        if (string.IsNullOrWhiteSpace(req.Email) ||
            string.IsNullOrWhiteSpace(req.Username) ||
            string.IsNullOrWhiteSpace(req.Password) ||
            string.IsNullOrWhiteSpace(req.ConfirmPassword) ||
            string.IsNullOrWhiteSpace(req.Otp))
        {
            return BadRequest("Vui lòng nhập đầy đủ thông tin.");
        }

        if (req.Password != req.ConfirmPassword)
            return BadRequest("Mật khẩu xác nhận không khớp.");

        if (!otpSvc.Verify(req.Email, req.Otp))
            return Unauthorized("OTP không hợp lệ hoặc đã hết hạn.");

        if (await _dao.IsEmailExistsAsync(req.Email))
            return Conflict("Email đã tồn tại.");
        if (await _dao.IsUsernameExistsAsync(req.Username))
            return Conflict("Username đã tồn tại.");

        var hashed = PasswordHasher.Hash(req.Password);

        var acc = new Account
        {
            Email = req.Email,
            Username = req.Username,
            Hashpass = hashed,
            CreateAt = DateTime.UtcNow,
            Status = "ACTIVE",
            Role = "STUDENT"
        };

        await _dao.CreateAccountAsync(acc);
        await _dao.CreateUserDetailAsync(acc.AccountID);

        var access = _tokens.CreateAccessToken(acc, acc.RefreshTokenVersion);
        var (rt, exp) = _tokens.CreateRefreshToken();

        acc.RefreshTokenHash = _tokens.HashRefreshToken(rt);
        acc.RefreshTokenExpiresAt = exp.UtcDateTime;
        acc.LastLoginAt = DateTime.UtcNow;
        await _dao.UpdateAccountAsync(acc);

        SetRefreshCookie(rt, exp);

        return CreatedAtAction(nameof(Register),
            new AuthResponse(
                AccountID: acc.AccountID,
                AccessToken: access,
                ExpiresIn: int.Parse(_cfg["Jwt:AccessTokenMinutes"]!) * 60
            ));
    }

    // ---------------------------
    // REGISTER (TEACHER)
    // ---------------------------
    [HttpPost("registerTeacher")]
    public async Task<ActionResult<AuthResponse>> RegisterTeacher([FromBody] RegisterRequest req)
    {
        if (await _dao.IsEmailExistsAsync(req.Email))
            return Conflict("Email đã tồn tại.");
        if (await _dao.IsUsernameExistsAsync(req.Username))
            return Conflict("Username đã tồn tại.");

        var hashed = PasswordHasher.Hash(req.Password);

        var acc = new Account
        {
            Email = req.Email,
            Username = req.Username,
            Hashpass = hashed,
            CreateAt = DateTime.UtcNow,
            Status = "ACTIVE",
            Role = "TEACHER"
        };

        await _dao.CreateAccountAsync(acc);
        await _dao.CreateUserDetailAsync(acc.AccountID);
        await _dao.CreateTeacherAsync(acc.AccountID);

        var access = _tokens.CreateAccessToken(acc, acc.RefreshTokenVersion);
        var (rt, exp) = _tokens.CreateRefreshToken();

        acc.RefreshTokenHash = _tokens.HashRefreshToken(rt);
        acc.RefreshTokenExpiresAt = exp.UtcDateTime;
        acc.LastLoginAt = DateTime.UtcNow;
        await _dao.UpdateAccountAsync(acc);

        SetRefreshCookie(rt, exp);

        return CreatedAtAction(nameof(RegisterTeacher),
            new AuthResponse(
                AccountID: acc.AccountID,
                AccessToken: access,
                ExpiresIn: int.Parse(_cfg["Jwt:AccessTokenMinutes"]!) * 60
            ));
    }

    // ---------------------------
    // SEND OTP
    // ---------------------------
    [HttpPost("send-otp")]
    public async Task<IActionResult> SendOtp([FromBody] SendOtpRequest req,
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
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.EmailOrUsername) || string.IsNullOrWhiteSpace(req.Password))
            return BadRequest("Vui lòng nhập đầy đủ email/username và mật khẩu.");

        if (req.EmailOrUsername.Trim().Length < 8)
            return BadRequest("Email/username phải có tối thiểu 8 ký tự.");

        var passPattern = @"^(?=.*[a-z])(?=.*[A-Z]).{8,}$";
        if (!System.Text.RegularExpressions.Regex.IsMatch(req.Password, passPattern))
            return BadRequest("Mật khẩu phải có ít nhất 8 ký tự, gồm ít nhất 1 chữ hoa và 1 chữ thường.");

        var user = await _dao.GetByEmailOrUsernameAsync(req.EmailOrUsername);
        if (user is null)
            return Unauthorized("Email/username không đúng.");

        if (!PasswordHasher.Verify(req.Password, user.Hashpass))
            return Unauthorized("Mật khẩu không đúng.");

        if (!user.Status.Equals("ACTIVE"))
            return Unauthorized("Tài khoản đã bị khoá, vui lòng liên hệ hỗ trợ.");

        var access = _tokens.CreateAccessToken(user, user.RefreshTokenVersion);
        var (rt, exp) = _tokens.CreateRefreshToken();

        user.RefreshTokenHash = _tokens.HashRefreshToken(rt);
        user.RefreshTokenExpiresAt = exp.UtcDateTime;
        user.LastLoginAt = DateTime.UtcNow;
        await _dao.UpdateAccountAsync(user);

        SetRefreshCookie(rt, exp);

        string redirectUrl = user.Role switch
        {
            "ADMIN" => "http://localhost:3000/admin/dashboard",
            "TEACHER" => "http://localhost:3000/teacher/dashboard",
            _ => "http://localhost:3000/home"
        };

        return Ok(new
        {
            AccountID = user.AccountID,
            AccessToken = access,
            ExpiresIn = int.Parse(_cfg["Jwt:AccessTokenMinutes"]!) * 60,
            Role = user.Role,
            RedirectUrl = redirectUrl
        });
    }

    // ---------------------------
    // LOGIN WITH GOOGLE
    // ---------------------------
    [HttpPost("login/google")]
    public async Task<IActionResult> LoginWithGoogle([FromBody] GoogleLoginDto dto)
    {
        if (string.IsNullOrEmpty(dto.IdToken))
            return BadRequest("Missing ID token");

        GoogleJsonWebSignature.Payload payload;
        try
        {
            payload = await GoogleJsonWebSignature.ValidateAsync(dto.IdToken);
        }
        catch
        {
            return Unauthorized("Invalid Google token");
        }

        var user = await _dao.GetByEmailAsync(payload.Email ?? $"{payload.Subject}@googleuser.com");
        if (user == null)
        {
            user = new Account
            {
                Email = payload.Email ?? $"{payload.Subject}@googleuser.com",
                Username = (payload.Email ?? payload.Subject).Split('@')[0],
                GoogleSub = payload.Subject,
                Role = "STUDENT"
            };

            await _dao.CreateAccountAsync(user);
            await _dao.CreateUserDetailAsync(user.AccountID);
        }

        var access = _tokens.CreateAccessToken(user, user.RefreshTokenVersion);
        var (rt, exp) = _tokens.CreateRefreshToken();

        user.RefreshTokenHash = _tokens.HashRefreshToken(rt);
        user.RefreshTokenExpiresAt = exp.UtcDateTime;
        user.LastLoginAt = DateTime.UtcNow;
        await _dao.UpdateAccountAsync(user);

        SetRefreshCookie(rt, exp);

        string redirectUrl = user.Role switch
        {
            "ADMIN" => "http://localhost:3000/admin/dashboard",
            "TEACHER" => "http://localhost:3000/teacher/dashboard",
            _ => "http://localhost:3000/home"
        };

        return Ok(new
        {
            AccountID = user.AccountID,
            AccessToken = access,
            ExpiresIn = int.Parse(_cfg["Jwt:AccessTokenMinutes"]!) * 60,
            Role = user.Role,
            RedirectUrl = redirectUrl
        });
    }

    // ---------------------------
    // REFRESH TOKEN
    // ---------------------------
    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponse>> Refresh()
    {
        var rt = Request.Cookies["emt_rt"];
        if (string.IsNullOrEmpty(rt)) return Unauthorized("Missing refresh token.");

        var bearer = Request.Headers.Authorization.ToString();
        var accessOld = bearer?.StartsWith("Bearer ") == true ? bearer["Bearer ".Length..] : null;
        if (string.IsNullOrEmpty(accessOld)) return Unauthorized("Missing access token.");

        var principal = _tokens.ValidateExpiredAccessToken(accessOld);
        var sub = principal?.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? principal?.FindFirstValue(JwtRegisteredClaimNames.Sub);
        if (!int.TryParse(sub, out var uid)) return Unauthorized("Cannot identify user.");

        var user = await _dao.GetByIdAsync(uid);
        if (user is null) return Unauthorized();

        if (user.RefreshTokenExpiresAt is null || user.RefreshTokenExpiresAt <= DateTime.UtcNow)
        {
            ClearRefreshCookie();
            user.RefreshTokenHash = null;
            await _dao.UpdateAccountAsync(user);
            return Unauthorized("Refresh token expired.");
        }

        var incomingHash = _tokens.HashRefreshToken(rt);
        if (!string.Equals(incomingHash, user.RefreshTokenHash, StringComparison.Ordinal))
        {
            user.RefreshTokenVersion += 1;
            user.RefreshTokenHash = null;
            user.RefreshTokenExpiresAt = null;
            await _dao.UpdateAccountAsync(user);
            ClearRefreshCookie();
            return Unauthorized("Refresh token reuse detected.");
        }

        var access = _tokens.CreateAccessToken(user, user.RefreshTokenVersion);
        var (newRt, newExp) = _tokens.CreateRefreshToken();
        user.RefreshTokenHash = _tokens.HashRefreshToken(newRt);
        user.RefreshTokenExpiresAt = newExp.UtcDateTime;
        await _dao.UpdateAccountAsync(user);

        SetRefreshCookie(newRt, newExp);

        return Ok(new AuthResponse(
            AccountID: user.AccountID,
            AccessToken: access,
            ExpiresIn: int.Parse(_cfg["Jwt:AccessTokenMinutes"]!) * 60
        ));
    }

    // ---------------------------
    // LOGOUT
    // ---------------------------
    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var uid = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await _dao.GetByIdAsync(uid);
        if (user != null)
        {
            user.RefreshTokenHash = null;
            user.RefreshTokenExpiresAt = null;
            await _dao.UpdateAccountAsync(user);
        }
        ClearRefreshCookie();
        return Ok();
    }

    // ---------------------------
    // PASSWORD RESET
    // ---------------------------
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest req,
        [FromServices] IConfiguration cfg,
        [FromServices] EmailSender mailer)
    {
        var acc = await _dao.GetByEmailAsync(req.Email);
        if (acc is null) return Ok(new { message = "If the email exists, a reset link has been sent." });

        var token = ResetPasswordTokenService.Create(acc, cfg);
        var link = $"{cfg["FrontendBaseUrl"]}/reset-password?token={Uri.EscapeDataString(token)}";

        var html = EmailTemplate.BuildResetPasswordEmail(acc.Username ?? acc.Email, link);
        try
        {
            await mailer.SendEmailAsync(acc.Email!, "Đặt lại mật khẩu tài khoản EMT", html);
        }
        catch { }

        return Ok(new { message = "Reset link generated.", resetLink = link });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest req, [FromServices] IConfiguration cfg)
    {
        if (string.IsNullOrWhiteSpace(req.NewPassword) || req.NewPassword != req.ConfirmNewPassword)
            return BadRequest("Mật khẩu xác nhận không khớp.");

        if (!ResetPasswordTokenService.TryValidate(req.Token, cfg, out var accountId, out var fpFromToken))
            return BadRequest("Token không hợp lệ hoặc đã hết hạn.");

        var acc = await _dao.GetByIdAsync(accountId);
        if (acc is null) return BadRequest("Tài khoản không tồn tại.");

        var nowFp = ResetPasswordTokenService.Fingerprint(acc.Hashpass);
        if (!string.Equals(nowFp, fpFromToken, StringComparison.Ordinal))
            return BadRequest("Token đã bị vô hiệu.");

        acc.Hashpass = PasswordHasher.Hash(req.NewPassword);
        await _dao.UpdateAccountAsync(acc);

        return Ok(new { message = "Đổi mật khẩu thành công." });
    }

    // ---------------------------
    // Helper cookie methods
    // ---------------------------
    private void SetRefreshCookie(string rt, DateTimeOffset exp)
    {
        Response.Cookies.Append("emt_rt", rt, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
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
