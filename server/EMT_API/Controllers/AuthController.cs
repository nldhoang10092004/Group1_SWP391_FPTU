using EMT_API.Data;                     // Dùng namespace chứa DbContext (EMTDbContext) và các cấu hình dữ liệu
using EMT_API.DTOs.Auth;               // Dùng các DTO cho Auth (RegisterRequest, LoginRequest, ... )
using EMT_API.Models;                  // Dùng các model thực thể (Account, UserDetail, ...)
using EMT_API.Security;                // Dùng lớp bảo mật (PasswordHasher, ResetPasswordTokenService)
using Microsoft.AspNetCore.Mvc;        // Dùng MVC attributes/controller base (ApiController, ControllerBase, ActionResult)
using Microsoft.EntityFrameworkCore;   // Dùng EF Core (DbContext, truy vấn async như AnyAsync/FirstOrDefaultAsync)
using System.IdentityModel.Tokens.Jwt; // (Ở đây chưa phát JWT login, nhưng dùng cho reset token service nếu cần)
using System.Security.Claims;          // (Cho claims JWT nếu cần)
using System.Text;                     // (Cho Encoding, nếu ký JWT)
using Microsoft.IdentityModel.Tokens;  // (Cho TokenValidationParameters/SigningCredentials, nếu ký/verify JWT)
using System.Web;                      // (Không cần trong ASP.NET Core trừ khi bạn dùng HttpUtility; ở dưới dùng Uri.EscapeDataString)
namespace EMT_API.Controllers;         // Khai báo namespace chứa controller

[ApiController]                        // Đánh dấu đây là API controller (tự bind, auto 400 nếu ModelState invalid—nếu bật)
[Route("api/auth")]                    // Route gốc cho controller: /api/auth/*
public class AuthController : ControllerBase
{
    private readonly EMTDbContext _db;             // Inject DbContext để truy cập DB
    public AuthController(EMTDbContext db) => _db = db; // Constructor injection, gán vào field _db

    [HttpPost("register")]                          // POST /api/auth/register
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest req)
    {
        // 1) Kiểm tra trùng email/username (DB của bạn đã có Unique Index, nhưng check sớm để trả lỗi đẹp)
        if (await _db.Accounts.AnyAsync(a => a.Email == req.Email))        // Query: có account nào trùng email không?
            return Conflict("Email đã tồn tại.");                          // 409 Conflict nếu trùng
        if (await _db.Accounts.AnyAsync(a => a.Username == req.Username))  // Query: có account nào trùng username không?
            return Conflict("Username đã tồn tại.");                       // 409 Conflict nếu trùng

        // 2) Hash mật khẩu
        var hashed = PasswordHasher.Hash(req.Password); // Băm mật khẩu (không lưu plaintext)

        // 3) Tạo Account
        var acc = new Account
        {
            Email = req.Email,                 // Gán email từ request
            Username = req.Username,           // Gán username từ request
            Hashpass = hashed,                 // Lưu hash mật khẩu
            CreateAt = DateTime.UtcNow,        // Thời điểm tạo (UTC)
            Status = "ACTIVE",                 // Trạng thái tài khoản (mặc định ACTIVE)
            Role = "STUDENT"                   // Vai trò mặc định (có thể đổi theo luồng)
        };
        _db.Accounts.Add(acc);                 // Track entity mới
        await _db.SaveChangesAsync();          // Lưu vào DB, sinh AccountID

        // (Tùy chọn) Tạo UserDetail rỗng
        if (await _db.UserDetails.FindAsync(acc.AccountID) is null) // Nếu chưa có UserDetail cùng key
        {
            _db.UserDetails.Add(new UserDetail
            {
                AccountID = acc.AccountID      // Dùng AccountID làm khóa/khóa ngoại
            });
            await _db.SaveChangesAsync();      // Lưu UserDetail
        }

        var resp = new AuthResponse(acc.AccountID, acc.Email, acc.Username, acc.Role, acc.Status); // Tạo DTO trả về
        return CreatedAtAction(nameof(Register), resp); // 201 Created + payload (không có Location hữu ích)
    }

    [HttpPost("login")]                         // POST /api/auth/login
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest req)
    {
        // Cho phép login bằng Email hoặc Username
        var acc = await _db.Accounts
            .FirstOrDefaultAsync(a => a.Email == req.EmailOrUsername || a.Username == req.EmailOrUsername); // Tìm theo email/username

        if (acc is null || string.IsNullOrEmpty(acc.Hashpass)) // Không tồn tại hoặc không có hash (tài khoản lỗi)
            return Unauthorized("Sai thông tin đăng nhập.");   // 401 Unauthorized (không tiết lộ cụ thể)

        var ok = PasswordHasher.Verify(req.Password, acc.Hashpass); // So sánh mật khẩu nhập với hash trong DB
        if (!ok) return Unauthorized("Sai thông tin đăng nhập.");   // Sai pass → 401

        // Update LastLoginAt
        acc.LastLoginAt = DateTime.UtcNow;     // Cập nhật lần đăng nhập gần nhất
        await _db.SaveChangesAsync();          // Lưu vào DB

        var resp = new AuthResponse(acc.AccountID, acc.Email, acc.Username, acc.Role, acc.Status); // DTO kết quả login
        return Ok(resp);                       // 200 OK (chưa phát JWT trong bản này)
    }

    // Với bản tối giản không có phiên → logout là no-op
    [HttpPost("logout")]                       // POST /api/auth/logout
    public IActionResult Logout() => Ok(new { message = "Logged out (client side)." }); // Trả message (FE tự xóa token/cookie)

    [HttpPost("forgot-password")]              // POST /api/auth/forgot-password
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest req, [FromServices] IConfiguration cfg)
    {
        // Luôn trả 200 để không lộ email có tồn tại hay không
        var acc = await _db.Accounts.FirstOrDefaultAsync(a => a.Email == req.Email); // Tìm account theo email
        if (acc is null) return Ok(new { message = "If the email exists, a reset link has been sent." }); // Không nói có/không

        // Tạo token reset 30'
        var token = ResetPasswordTokenService.Create(acc, cfg); // Tạo JWT (hoặc token) có exp ~30 phút + fingerprint

        // Tạo link (FE của bạn sẽ có trang nhập mật khẩu mới, nhận token từ query)
        var link = $"{cfg["FrontendBaseUrl"]}/reset-password?token={Uri.EscapeDataString(token)}"; // Dựng URL tới FE, escape token

        // TODO: Gửi email cho user với link này.
        // Tạm thời DEV: trả link ra để bạn copy test (xóa khi lên prod)
        return Ok(new { message = "Reset link generated.", resetLink = link }); // 200 + link (chỉ dùng DEV)
    }

    [HttpPost("reset-password")]               // POST /api/auth/reset-password
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

} // Kết thúc AuthController
