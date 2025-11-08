using EMT_API.Data;
using EMT_API.DTOs.Profile;
using EMT_API.Models;
using EMT_API.Security;
using EMT_API.Services; 
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EMT_API.Controllers.Profile
{
    [ApiController]
    [Route("api/user/profile")]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly EMTDbContext _db;
        private readonly CloudflareService _r2;

        public ProfileController(EMTDbContext db, CloudflareService r2)
        {
            _db = db;
            _r2 = r2;
        }

        [HttpGet("detail")]
        public async Task<ActionResult> GetDetail()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
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

        [HttpGet("avatar")]
        public async Task<ActionResult> GetAvatar()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            var detail = await _db.UserDetails.FirstOrDefaultAsync(x => x.AccountID == userId);
            if (detail == null) return NotFound("User not found");

            if (string.IsNullOrEmpty(detail.AvatarURL))
                return NotFound("User has no avatar.");

            return Ok(new { avatarUrl = detail.AvatarURL });
        }

        [HttpPut("detail")]
        public async Task<ActionResult> UpdateDetail([FromBody] UpdateUserDetailRequest req)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            var detail = await _db.UserDetails.FirstOrDefaultAsync(x => x.AccountID == userId);
            if (detail == null) return NotFound("Account not found");
            if (!string.IsNullOrWhiteSpace(req.FullName)) detail.FullName = req.FullName;
            if (req.Dob.HasValue) detail.Dob = req.Dob.Value;
            if (!string.IsNullOrWhiteSpace(req.Address)) detail.Address = req.Address.Trim();
            if (!string.IsNullOrWhiteSpace(req.Phone)) detail.Phone = req.Phone.Trim();

            await _db.SaveChangesAsync();
            return Ok(new { message = "Update profile successfully" });
        }

        [HttpPut("avatar")]
        [RequestSizeLimit(5 * 1024 * 1024)]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult> ChangeAvatar([FromForm] AvatarUploadRequest req)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var detail = await _db.UserDetails.FirstOrDefaultAsync(x => x.AccountID == userId);
            if (detail == null) return NotFound("User not found");
            if (req.File == null || req.File.Length == 0) return BadRequest("No file uploaded.");

            var allowed = new[] { "image/jpeg", "image/png", "image/webp" };
            if (!allowed.Contains(req.File.ContentType.ToLower()))
                return BadRequest("Invalid file type.");

            // Xoá avatar cũ nếu có
            if (!string.IsNullOrEmpty(detail.AvatarURL))
                await _r2.DeleteFileAsync(detail.AvatarURL);

            // 🧠 Sinh tên file ngẫu nhiên kiểu GUID (32 ký tự)
            var ext = Path.GetExtension(req.File.FileName).ToLowerInvariant();
            var randomName = $"{Guid.NewGuid():N}{ext}";
            var keyPath = $"avatars/{randomName}";

            await using var stream = req.File.OpenReadStream();
            var newUrl = await _r2.UploadAvatarAsync(stream, keyPath, req.File.ContentType);

            detail.AvatarURL = newUrl;
            await _db.SaveChangesAsync();

            return Ok(new { message = "Avatar updated", avatarUrl = newUrl });
        }


        [HttpPut("password")]
        public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordRequest req)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            if (req.NewPassword != req.ConfirmNewPassword)
                return BadRequest("New password and confirm do not match.");

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
