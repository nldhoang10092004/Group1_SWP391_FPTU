using EMT_API.Data;
using EMT_API.DTOs.Auth;
using EMT_API.Models;
using EMT_API.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.Web;
namespace EMT_API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly EMTDbContext _db;
    public AuthController(EMTDbContext db) => _db = db;

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest req)
    {
        // 1) Kiểm tra trùng email/username (DB của bạn đã có Unique Index, nhưng check sớm để trả lỗi đẹp)
        if (await _db.Accounts.AnyAsync(a => a.Email == req.Email))
            return Conflict("Email đã tồn tại.");
        if (await _db.Accounts.AnyAsync(a => a.Username == req.Username))
            return Conflict("Username đã tồn tại.");

        // 2) Hash mật khẩu
        var hashed = PasswordHasher.Hash(req.Password);

        // 3) Tạo Account
        var acc = new Account
        {
            Email = req.Email,
            Username = req.Username,
            Hashpass = hashed,
            CreateAt = DateTime.UtcNow,
            Status = "ACTIVE",      // DB có default, nhưng set rõ ràng
            Role = "STUDENT"        // hoặc "TEACHER"/"ADMIN" tuỳ theo luồng
        };
        _db.Accounts.Add(acc);
        await _db.SaveChangesAsync();

        // (Tùy chọn) Tạo UserDetail rỗng
        if (await _db.UserDetails.FindAsync(acc.AccountID) is null)
        {
            _db.UserDetails.Add(new UserDetail
            {
                AccountID = acc.AccountID
            });
            await _db.SaveChangesAsync();
        }

        var resp = new AuthResponse(acc.AccountID, acc.Email, acc.Username, acc.Role, acc.Status);
        return CreatedAtAction(nameof(Register), resp);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest req)
    {
        // Cho phép login bằng Email hoặc Username
        var acc = await _db.Accounts
            .FirstOrDefaultAsync(a => a.Email == req.EmailOrUsername || a.Username == req.EmailOrUsername);

        if (acc is null || string.IsNullOrEmpty(acc.Hashpass))
            return Unauthorized("Sai thông tin đăng nhập.");

        var ok = PasswordHasher.Verify(req.Password, acc.Hashpass);
        if (!ok) return Unauthorized("Sai thông tin đăng nhập.");

        // Update LastLoginAt
        acc.LastLoginAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        var resp = new AuthResponse(acc.AccountID, acc.Email, acc.Username, acc.Role, acc.Status);
        return Ok(resp);
    }

    // Với bản tối giản không có phiên → logout là no-op
    [HttpPost("logout")]
    public IActionResult Logout() => Ok(new { message = "Logged out (client side)." });

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest req, [FromServices] IConfiguration cfg)
    {
        // Luôn trả 200 để không lộ email có tồn tại hay không
        var acc = await _db.Accounts.FirstOrDefaultAsync(a => a.Email == req.Email);
        if (acc is null) return Ok(new { message = "If the email exists, a reset link has been sent." });

        // Tạo token reset 30'
        var token = ResetPasswordTokenService.Create(acc, cfg);

        // Tạo link (FE của bạn sẽ có trang nhập mật khẩu mới, nhận token từ query)
        var link = $"{cfg["FrontendBaseUrl"]}/reset-password?token={Uri.EscapeDataString(token)}";

        // TODO: Gửi email cho user với link này.
        // Tạm thời DEV: trả link ra để bạn copy test (xóa khi lên prod)
        return Ok(new { message = "Reset link generated.", resetLink = link });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest req, [FromServices] IConfiguration cfg)
    {
        if (string.IsNullOrWhiteSpace(req.NewPassword) || req.NewPassword != req.ConfirmNewPassword)
            return BadRequest("Mật khẩu xác nhận không khớp.");

        if (!ResetPasswordTokenService.TryValidate(req.Token, cfg, out var accountId, out var fpFromToken))
            return BadRequest("Token không hợp lệ hoặc đã hết hạn.");

        var acc = await _db.Accounts.FirstOrDefaultAsync(a => a.AccountID == accountId);
        if (acc is null) return BadRequest("Tài khoản không tồn tại.");

        // So khớp fingerprint để chống dùng lại token sau khi đã đổi pass
        var nowFp = ResetPasswordTokenService.Fingerprint(acc.Hashpass);
        if (!string.Equals(nowFp, fpFromToken, StringComparison.Ordinal))
            return BadRequest("Token đã bị vô hiệu (mật khẩu đã thay đổi).");

        // Đổi mật khẩu
        acc.Hashpass = PasswordHasher.Hash(req.NewPassword);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Đổi mật khẩu thành công." });
    }

}
