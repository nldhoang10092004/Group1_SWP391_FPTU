using EMT_API.Data;
using EMT_API.DTOs.Public;
using EMT_API.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EMT_API.Controllers.Video
{
    [ApiController]
    [Route("api/public/video")]
    public class VideoController : ControllerBase
    {
        private readonly EMTDbContext _db;
        public VideoController(EMTDbContext db) => _db = db;

        [HttpGet("{videoId:int}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetVideo(int videoId)
        {
            var videoDto = await _db.CourseVideos
                .AsNoTracking()
                .Where(v => v.VideoID == videoId)
                .Select(v => new VideoDto
                {
                    VideoID = v.VideoID,
                    VideoName = v.VideoName,
                    VideoURL = v.VideoURL,
                    IsPreview = v.IsPreview
                })
                .FirstOrDefaultAsync();

            if (videoDto == null)
                return NotFound(new { message = "Video not found" });

            // ✅ 1. Ai cũng xem được nếu là preview
            if (videoDto.IsPreview)
            {
                videoDto.CanWatch = true;
                videoDto.RequiresMembership = false;
                return Ok(videoDto);
            }

            // ✅ 2. Nếu có token -> check membership
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                              ?? User.FindFirst("sub")?.Value; // fallback nếu claim nameid không có

            if (!string.IsNullOrEmpty(userIdClaim))
            {
                if (!int.TryParse(userIdClaim, out var userId))
                    return Unauthorized(new { message = "Invalid token" });

                bool hasMembership = await MembershipUtil.HasActiveMembershipAsync(_db, userId);

                if (hasMembership)
                {
                    videoDto.CanWatch = true;
                    videoDto.RequiresMembership = true;
                    return Ok(videoDto);
                }

                return StatusCode(403, new
                {
                    message = "Your membership has expired or is inactive",
                    video = new
                    {
                        videoDto.VideoID,
                        videoDto.VideoName,
                        videoDto.IsPreview,
                        CanWatch = false,
                        RequiresMembership = true
                    }
                });
            }

            // ✅ 3. Guest + không preview
            return Unauthorized(new { message = "You have to buy membership to watch this video" });
        }
    }
}
