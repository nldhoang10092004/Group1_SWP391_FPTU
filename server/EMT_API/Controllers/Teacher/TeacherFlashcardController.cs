using EMT_API.Data;
using EMT_API.DTOs.Flashcard;
using EMT_API.DTOs.FlashCard;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EMT_API.Controllers.TeacherSide
{
    [ApiController]
    [Route("api/teacher/flashcard")]
    [Authorize(Roles = "TEACHER")]
    public class TeacherFlashcardController : ControllerBase
    {
        private readonly EMTDbContext _db;
        public TeacherFlashcardController(EMTDbContext db) => _db = db;

        private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // Helper: check quyền sở hữu course
        private async Task<bool> EnsureTeacherOwnsCourse(int courseId)
        {
            var uid = GetUserId();
            var course = await _db.Courses.AsNoTracking()
                .FirstOrDefaultAsync(c => c.CourseId == courseId);
            return course != null && course.TeacherId == uid;
        }

        // Helper: check quyền sở hữu set (nếu set thuộc course)
        private async Task<bool> EnsureTeacherOwnsSet(int setId)
        {
            var set = await _db.FlashcardSets.AsNoTracking().FirstOrDefaultAsync(s => s.SetId == setId);
            if (set == null) return false;
            if (set.CourseId == null) return true; // set public: cho phép
            return await EnsureTeacherOwnsCourse(set.CourseId.Value);
        }

        // READ: Lấy set public (tham khảo trong UI giáo viên)
        [HttpGet("sets/public")]
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

        // READ: Lấy set theo Course (chỉ course của giáo viên)
        [HttpGet("sets/course/{courseId:int}")]
        public async Task<IActionResult> GetAllSetsByCourse(int courseId)
        {
            if (!await EnsureTeacherOwnsCourse(courseId))
                return Forbid();

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

        // READ: Lấy chi tiết 1 set
        [HttpGet("set/{setId:int}")]
        public async Task<IActionResult> GetSetDetail(int setId)
        {
            if (!await EnsureTeacherOwnsSet(setId))
                return Forbid();

            var set = await _db.FlashcardSets
                .Include(s => s.FlashcardItems)
                .FirstOrDefaultAsync(s => s.SetId == setId);

            if (set == null) return NotFound(new { message = "Flashcard set not found" });

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

        // CREATE: Tạo set (nếu gắn CourseID thì course phải thuộc GV)
        [HttpPost("set")]
        public async Task<IActionResult> CreateSet([FromBody] CreateFlashcardSetRequest request)
        {
            if (request.CourseID.HasValue)
            {
                if (!await EnsureTeacherOwnsCourse(request.CourseID.Value))
                    return Forbid();
            }

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

        // CREATE: Thêm item (set phải thuộc GV hoặc là public)
        [HttpPost("item")]
        public async Task<IActionResult> AddItem([FromBody] CreateFlashcardItemRequest request)
        {
            if (!await EnsureTeacherOwnsSet(request.SetID))
                return Forbid();

            var set = await _db.FlashcardSets.FindAsync(request.SetID);
            if (set == null) return NotFound(new { message = "Flashcard set not found" });

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

        // UPDATE: Set
        [HttpPut("set/{setId:int}")]
        public async Task<IActionResult> UpdateSet(int setId, [FromBody] UpdateFlashcardSetRequest request)
        {
            if (!await EnsureTeacherOwnsSet(setId))
                return Forbid();

            var set = await _db.FlashcardSets.FindAsync(setId);
            if (set == null) return NotFound();

            set.Title = request.Title;
            set.Description = request.Description;

            _db.FlashcardSets.Update(set);
            await _db.SaveChangesAsync();
            return Ok(new { message = "Updated" });
        }

        // UPDATE: Item
        [HttpPut("item/{itemId:int}")]
        public async Task<IActionResult> UpdateItem(int itemId, [FromBody] CreateFlashcardItemRequest request)
        {
            var item = await _db.FlashcardItems.FindAsync(itemId);
            if (item == null) return NotFound();

            // Đảm bảo item thuộc set mà GV sở hữu
            if (!await EnsureTeacherOwnsSet(item.SetId))
                return Forbid();

            item.FrontText = request.FrontText;
            item.BackText = request.BackText;
            item.Example = request.Example;

            _db.FlashcardItems.Update(item);
            await _db.SaveChangesAsync();
            return Ok(new { message = "Updated" });
        }

        // DELETE: Set (xóa kèm items)
        [HttpDelete("set/{setId:int}")]
        public async Task<IActionResult> DeleteSet(int setId)
        {
            if (!await EnsureTeacherOwnsSet(setId))
                return Forbid();

            var set = await _db.FlashcardSets
                .Include(s => s.FlashcardItems)
                .FirstOrDefaultAsync(s => s.SetId == setId);

            if (set == null) return NotFound();

            if (set.FlashcardItems.Any()) _db.FlashcardItems.RemoveRange(set.FlashcardItems);
            _db.FlashcardSets.Remove(set);
            await _db.SaveChangesAsync();
            return Ok(new { message = "Deleted" });
        }

        // DELETE: Item
        [HttpDelete("item/{itemId:int}")]
        public async Task<IActionResult> DeleteItem(int itemId)
        {
            var item = await _db.FlashcardItems.FindAsync(itemId);
            if (item == null) return NotFound();

            if (!await EnsureTeacherOwnsSet(item.SetId))
                return Forbid();

            _db.FlashcardItems.Remove(item);
            await _db.SaveChangesAsync();
            return Ok(new { message = "Deleted" });
        }
    }
}
