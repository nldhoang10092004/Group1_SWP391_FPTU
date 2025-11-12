using EMT_API.DAOs.FlashcardDAO;
using EMT_API.DTOs.Flashcard;
using EMT_API.DTOs.FlashCard;
using EMT_API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EMT_API.Controllers.AdminSide
{
    [ApiController]
    [Route("api/admin/flashcard")]
    [Authorize(Roles = "ADMIN")]
    public class AdminFlashcardController : ControllerBase
    {
        private readonly IFlashcardDAO _dao;

        public AdminFlashcardController(IFlashcardDAO dao)
        {
            _dao = dao;
        }

        [HttpGet("sets/public")]
        public async Task<IActionResult> GetAllPublicSets()
        {
            var sets = await _dao.GetAllPublicSetsAsync();
            var dtos = sets.Select(s => new FlashcardSetDto
            {
                SetID = s.SetId,
                CourseID = s.CourseId,
                Title = s.Title,
                Description = s.Description
            });
            return Ok(dtos);
        }

        [HttpGet("sets/course/{courseId:int}")]
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

        [HttpGet("set/{setId:int}")]
        public async Task<IActionResult> GetSetDetail(int setId)
        {
            var set = await _dao.GetSetDetailAsync(setId);
            if (set == null)
                return NotFound(new { message = "Flashcard set not found" });

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

        [HttpPost("set")]
        public async Task<IActionResult> CreateSet([FromBody] CreateFlashcardSetRequest req)
        {
            var set = new FlashcardSet
            {
                CourseId = req.CourseID,
                Title = req.Title,
                Description = req.Description,
                CreatedAt = DateTime.UtcNow
            };
            var created = await _dao.CreateSetAsync(set);
            return Ok(new { message = "Flashcard set created successfully", setId = created.SetId });
        }

        [HttpPost("item")]
        public async Task<IActionResult> AddItem([FromBody] CreateFlashcardItemRequest req)
        {
            var item = new FlashcardItem
            {
                SetId = req.SetID,
                FrontText = req.FrontText,
                BackText = req.BackText,
                Example = req.Example,
                CreatedAt = DateTime.UtcNow
            };
            var created = await _dao.CreateItemAsync(item);
            return Ok(new { message = "Flashcard item added successfully", itemId = created.ItemId });
        }

        [HttpPut("set/{setId:int}")]
        public async Task<IActionResult> UpdateSet(int setId, [FromBody] UpdateFlashcardSetRequest req)
        {
            var set = new FlashcardSet
            {
                SetId = setId,
                Title = req.Title,
                Description = req.Description
            };
            var ok = await _dao.UpdateSetAsync(set);
            return ok ? Ok(new { message = "Updated" }) : NotFound();
        }

        [HttpPut("item/{itemId:int}")]
        public async Task<IActionResult> UpdateItem(int itemId, [FromBody] CreateFlashcardItemRequest req)
        {
            var item = new FlashcardItem
            {
                ItemId = itemId,
                FrontText = req.FrontText,
                BackText = req.BackText,
                Example = req.Example
            };
            var ok = await _dao.UpdateItemAsync(item);
            return ok ? Ok(new { message = "Updated" }) : NotFound();
        }

        [HttpDelete("set/{setId:int}")]
        public async Task<IActionResult> DeleteSet(int setId)
        {
            var ok = await _dao.DeleteSetAsync(setId);
            return ok ? Ok(new { message = "Deleted" }) : NotFound();
        }

        [HttpDelete("item/{itemId:int}")]
        public async Task<IActionResult> DeleteItem(int itemId)
        {
            var ok = await _dao.DeleteItemAsync(itemId);
            return ok ? Ok(new { message = "Deleted" }) : NotFound();
        }
    }
}
