using EMT_API.DAOs;
using EMT_API.DAOs.CourseDAO;
using EMT_API.DAOs.MembershipDAO;
using EMT_API.DTOs.Public;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;
using EMT_API.DAOs.MembershipDAO;

namespace EMT_API.Controllers.Video
{
    [ApiController]
    [Route("api/public/video")]
    public class VideoController : ControllerBase
    {
        private readonly ICourseDAO _courseDao;
        private readonly IMembershipDAO _membershipDao;

        public VideoController(ICourseDAO courseDao, IMembershipDAO membershipDao)
        {
            _courseDao = courseDao;
            _membershipDao = membershipDao;
        }

        [HttpGet("{videoId:int}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetVideo(int videoId)
        {
            var video = await _courseDao.GetVideoAsync(videoId);
            if (video == null)
                return NotFound(new { message = "Video not found" });

            var dto = new VideoDto
            {
                VideoID = video.VideoID,
                VideoName = video.VideoName,
                VideoURL = video.VideoURL,
                IsPreview = video.IsPreview
            };

            // ✅ 1️⃣ Ai cũng xem được nếu là preview
            if (dto.IsPreview)
            {
                dto.CanWatch = true;
                dto.RequiresMembership = false;
                return Ok(dto);
            }

            // ✅ 2️⃣ Nếu user có token thì check membership
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                            ?? User.FindFirst("sub")?.Value;

            if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out var userId))
            {
                bool hasMembership = await _membershipDao.HasActiveMembershipAsync(userId);

                if (hasMembership)
                {
                    dto.CanWatch = true;
                    dto.RequiresMembership = true;
                    return Ok(dto);
                }

                return StatusCode(403, new
                {
                    message = "Your membership has expired or is inactive",
                    video = new
                    {
                        dto.VideoID,
                        dto.VideoName,
                        dto.IsPreview,
                        CanWatch = false,
                        RequiresMembership = true
                    }
                });
            }

            // ✅ 3️⃣ Guest + không preview
            return Unauthorized(new { message = "You must have an active membership to watch this video." });
        }
    }
}
