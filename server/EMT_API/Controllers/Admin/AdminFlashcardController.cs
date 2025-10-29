using EMT_API.Data;
using EMT_API.DTOs.Flashcard;
using EMT_API.DTOs.FlashCard;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EMT_API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/flashcard")]
    [Authorize(Roles = "ADMIN")]
    public class AdminFlashcardController : ControllerBase
    {
        private readonly EMTDbContext _db;
        public AdminFlashcardController(EMTDbContext db) => _db = db;

        // READ: Lấy tất cả set public (CourseId = NULL)
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

        // READ: Lấy tất cả set theo Course
        [HttpGet("sets/course/{courseId:int}")]
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

        // READ: Lấy chi tiết 1 set (ADMIN không cần check membership)
        [HttpGet("set/{setId:int}")]
        public async Task<IActionResult> GetSetDetail(int setId)
        {
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

        // CREATE: Tạo set
        [HttpPost("set")]
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

        // CREATE: Thêm item
        [HttpPost("item")]
        public async Task<IActionResult> AddItem([FromBody] CreateFlashcardItemRequest request)
        {
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

            _db.FlashcardItems.Remove(item);
            await _db.SaveChangesAsync();
            return Ok(new { message = "Deleted" });
        }
    }
}
