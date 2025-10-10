using EMT_API.Data;                     // Dùng namespace chứa DbContext (EMTDbContext) và các cấu hình dữ liệu
using EMT_API.DTOs.Profile;
using EMT_API.Models;                  // Dùng các model thực thể (Account, UserDetail, ...)
using EMT_API.Security;
using Microsoft.AspNetCore.Mvc;        // Dùng MVC attributes/controller base (ApiController, ControllerBase, ActionResult)
using Microsoft.EntityFrameworkCore;   // Dùng EF Core (DbContext, truy vấn async như AnyAsync/FirstOrDefaultAsync)
using System.IO;
using System.Linq;
namespace EMT_API.Controllers.Profile
{
    [ApiController]                        // Đánh dấu đây là API controller (tự bind, auto 400 nếu ModelState invalid—nếu bật)
    [Route("api/user/profile")]
    public class ProfileController : ControllerBase
    {
        private readonly EMTDbContext _db;
        public ProfileController(EMTDbContext db)
        {
            _db = db;
        }

        [HttpGet("{userId:int}/detail")]
        public async Task<ActionResult> GetDetail([FromRoute] int userId)
        {
            var detail = await _db.UserDetails.FirstOrDefaultAsync(x => x.AccountID == userId);
            if (detail == null) return NotFound("Account not found");

            return Ok(new
            {
                detail.AccountID,
                detail.FullName,
                detail.Dob,
                detail.Address,
                detail.Phone
            });
        }

        [HttpGet("{userId:int}/avatar")]
        public async Task<ActionResult> GetAvatar([FromRoute] int userId)
        {
            var detail = await _db.UserDetails.FirstOrDefaultAsync(x => x.AccountID == userId);
            if (detail == null) return NotFound("User not found");

            if (string.IsNullOrEmpty(detail.AvatarURL))
                return NotFound("User has no avatar.");

            // Trả về đường dẫn public để FE tự load ảnh
            return Ok(new
            {
                avatarUrl = detail.AvatarURL
            });
        }

        [HttpPut("{userId:int}/detail")]
        public async Task<ActionResult> UpdateDetail([FromRoute] int userId, [FromBody] UpdateUserDetailRequest req)
        {
            var detail = await _db.UserDetails.FirstOrDefaultAsync(x => x.AccountID == userId);
            if (detail == null) return NotFound("Account not found");
            if (!string.IsNullOrWhiteSpace(req.FullName)) detail.FullName = req.FullName;
            if (req.Dob.HasValue) detail.Dob = req.Dob.Value;
            if (!string.IsNullOrWhiteSpace(req.Address)) detail.Address = req.Address.Trim();
            if (!string.IsNullOrWhiteSpace(req.Phone)) detail.Phone = req.Phone.Trim();
            await _db.SaveChangesAsync();
            return Ok(new { message = "Update profile successfully" });

        }
        [HttpPut("{userId:int}/avatar")]
        [RequestSizeLimit(5 * 1024 * 1024)]
        [Consumes("multipart/form-data")] // <-- bắt buộc cho Swagger hiển thị upload
        public async Task<ActionResult> ChangeAvatar(
    [FromRoute] int userId,
    [FromForm] AvatarUploadRequest req)  // <-- bọc IFormFile trong model
        {
            var detail = await _db.UserDetails.FirstOrDefaultAsync(x => x.AccountID == userId);
            if (detail == null) return NotFound("User not found");

            if (req.File == null || req.File.Length == 0)
                return BadRequest("No file uploaded.");

            var allowed = new[] { "image/jpeg", "image/png", "image/webp", "image/jpg" };
            if (!allowed.Contains(req.File.ContentType.ToLower()))
                return BadRequest("Only JPEG/PNG/WebP images are allowed.");

            var allowedExt = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var ext = Path.GetExtension(req.File.FileName).ToLowerInvariant();
            if (!allowedExt.Contains(ext))
                return BadRequest("Invalid file extension.");

            var avatarDir = Path.Combine(Directory.GetCurrentDirectory(), "avatars");
            Directory.CreateDirectory(avatarDir);

            var fileName = $"{Guid.NewGuid():N}{ext}";
            var fullPath = Path.Combine(avatarDir, fileName);

            await using (var stream = System.IO.File.Create(fullPath))
            {
                await req.File.CopyToAsync(stream); // nhớ await
            }

            // (tuỳ chọn) xoá ảnh cũ
            if (!string.IsNullOrEmpty(detail.AvatarURL))
            {
                var oldName = detail.AvatarURL.Replace("/avatars/", "");
                var oldPath = Path.Combine(avatarDir, oldName);
                if (System.IO.File.Exists(oldPath)) System.IO.File.Delete(oldPath);
            }

            detail.AvatarURL = $"/avatars/{fileName}";
            await _db.SaveChangesAsync();

            return Ok(new { message = "Avatar updated.", avatarUrl = detail.AvatarURL });
        }

        // 3) Change password by userId (không JWT)
        [HttpPut("{userId:int}/password")]
        public async Task<ActionResult> ChangePassword([FromRoute] int userId, [FromBody] ChangePasswordRequest req)
        {
            if (req.NewPassword != req.ConfirmNewPassword)
                return BadRequest("New password and confirm do not match.");

            // tuỳ mô hình của bạn: nếu Account là bảng mật khẩu
            var acc = await _db.Accounts.FirstOrDefaultAsync(a => a.AccountID == userId);
            if (acc == null) return NotFound("Account not found.");

            var ok = PasswordHasher.Verify(req.CurrentPassword, acc.Hashpass);
            if (!ok) return Unauthorized("Current password is incorrect.");

            acc.Hashpass = PasswordHasher.Hash(req.NewPassword);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Password changed successfully." });
        }

    }
}
