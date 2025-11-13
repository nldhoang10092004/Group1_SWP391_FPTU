using EMT_API.DTOs.Flashcard;
using EMT_API.DTOs.FlashCard;
using EMT_API.Utils;
using EMT_API.DAOs.FlashcardDAO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using EMT_API.DAOs;

namespace EMT_API.Controllers
{
    [ApiController]
    [Route("api/flashcard")]
    public class FlashcardController : ControllerBase
    {
        private readonly IFlashcardDAO _dao;
        private readonly IMembershipDAO _mdao;


        public FlashcardController(IFlashcardDAO dao, IMembershipDAO mdao)
        {
            _dao = dao;
            _mdao = mdao;
        }

        private int? GetUserId()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                        ?? User.FindFirst("sub")?.Value;
            return string.IsNullOrEmpty(idClaim) ? null : int.Parse(idClaim);
        }

        // ---------------------------
        // 1️⃣ Lấy danh sách flashcard set public
        // ---------------------------
        [HttpGet("sets")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllPublicSets()
        {
            var sets = await _dao.GetAllPublicSetsAsync();
            var dtos = sets.Select(s => new FlashcardSetDto
            {
                SetID = s.SetId,
                Title = s.Title,
                Description = s.Description
            });
            return Ok(dtos);
        }

        // ---------------------------
        // 2️⃣ Lấy danh sách theo course
        // ---------------------------
        [HttpGet("sets/{courseId:int}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllSetsByCourse(int courseId)
        {
            var sets = await _dao.GetSetsByCourseAsync(courseId);
            var dtos = sets.Select(s => new FlashcardSetDto
            {
                SetID = s.SetId,
                CourseID = s.CourseId,
                Title = s.Title,
                Description = s.Description
            });
            return Ok(dtos);
        }

        // ---------------------------
        // 3️⃣ Lấy chi tiết 1 set (check membership)
        // ---------------------------
        [HttpGet("set/{setId:int}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetSetDetail(int setId)
        {
            var set = await _dao.GetSetDetailAsync(setId);
            if (set == null)
                return NotFound(new { message = "Flashcard set not found" });

            // Check quyền nếu có CourseId
            if (set.CourseId.HasValue)
            {
                if (!User.IsInRole("ADMIN") && !User.IsInRole("TEACHER"))
                {
                    var userId = GetUserId();
                    if (userId == null)
                        return Unauthorized(new { message = "Login required to access this flashcard set." });

                    bool hasMembership = await _mdao.HasActiveMembershipAsync(userId.Value);
                    if (!hasMembership)
                        return StatusCode(403, new { message = "Membership required or expired." });
                }
            }

            var dto = new FlashcardSetDetailDto
            {
                SetID = set.SetId,
                CourseID = set.CourseId,
                Title = set.Title,
                Description = set.Description,
                Items = set.FlashcardItems.Select(i => new FlashcardItemDto
                {
                    ItemID = i.ItemId,
                    FrontText = i.FrontText,
                    BackText = i.BackText,
                    Example = i.Example
                }).ToList()
            };

            return Ok(dto);
        }
    }
}
