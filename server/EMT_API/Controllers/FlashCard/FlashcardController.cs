using EMT_API.Data;
using EMT_API.DTOs.Flashcard;
using EMT_API.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EMT_API.Controllers
{
    [ApiController]
    [Route("api/flashcard")]
    public class FlashcardController : ControllerBase
    {
        private readonly EMTDbContext _db;

        public FlashcardController(EMTDbContext db)
        {
            _db = db;
        }

        // ============================================
        // Helper: Lấy userId từ JWT
        // ============================================
        private int? GetUserId()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                        ?? User.FindFirst("sub")?.Value;
            return string.IsNullOrEmpty(idClaim) ? null : int.Parse(idClaim);
        }

        // ============================================
        // 1️⃣ Lấy danh sách flashcard set
        // ============================================
        [HttpGet("sets")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllPublicSets()
        {
            var sets = await _db.FlashcardSets
                .Where(s => s.CourseId == null)
                .Select(s => new FlashcardSetDto
                {
                    SetID = s.SetId,
                    Title = s.Title,
                    Description = s.Description
                })
                .ToListAsync();

            return Ok(sets);
        }

        [HttpGet("sets/{courseId:int}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllSetsByCourse(int courseId)
        {
            var sets = await _db.FlashcardSets
                .Where(s => s.CourseId == courseId)
                .Select(s => new FlashcardSetDto
                {
                    SetID = s.SetId,
                    CourseID = s.CourseId,
                    Title = s.Title,
                    Description = s.Description
                })
                .ToListAsync();

            return Ok(sets);
        }

        // ============================================
        // 2️⃣ Lấy chi tiết 1 set (check membership nếu có CourseId)
        // ============================================
        [HttpGet("set/{setId:int}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetSetDetail(int setId)
        {
            var set = await _db.FlashcardSets
                .Include(s => s.FlashcardItems)
                .FirstOrDefaultAsync(s => s.SetId == setId);

            if (set == null)
                return NotFound(new { message = "Flashcard set not found" });

            // Nếu có CourseId → yêu cầu membership
            if (set.CourseId.HasValue)
            {
                var userId = GetUserId();
                if (userId == null)
                    return Unauthorized(new { message = "Login required to access this flashcard set." });

                bool hasMembership = await MembershipUtil.HasActiveMembershipAsync(_db, userId.Value);
                if (!hasMembership)
                    return StatusCode(403, new { message = "Membership required or expired." });
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

        // ============================================
        // 3️⃣ Tạo flashcard set mới (Admin / Teacher)
        // ============================================
        [HttpPost("set")]
        [Authorize(Roles = "ADMIN,TEACHER")]
        public async Task<IActionResult> CreateSet([FromBody] CreateFlashcardSetRequest request)
        {
            var set = new EMT_API.Models.FlashcardSet
            {
                CourseId = request.CourseID,
                Title = request.Title,
                Description = request.Description,
                CreatedAt = DateTime.UtcNow
            };

            _db.FlashcardSets.Add(set);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Flashcard set created successfully", setId = set.SetId });
        }

        // ============================================
        // 4️⃣ Thêm flashcard item vào set
        // ============================================
        [HttpPost("item")]
        [Authorize(Roles = "ADMIN,TEACHER")]
        public async Task<IActionResult> AddItem([FromBody] CreateFlashcardItemRequest request)
        {
            var set = await _db.FlashcardSets.FindAsync(request.SetID);
            if (set == null)
                return NotFound(new { message = "Flashcard set not found" });

            var item = new EMT_API.Models.FlashcardItem
            {
                SetId = request.SetID,
                FrontText = request.FrontText,
                BackText = request.BackText,
                Example = request.Example,
                CreatedAt = DateTime.UtcNow
            };

            _db.FlashcardItems.Add(item);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Flashcard item added successfully", itemId = item.ItemId });
        }
    }
}
