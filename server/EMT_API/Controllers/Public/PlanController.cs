using EMT_API.Data;
using EMT_API.DTOs.Public;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EMT_API.Controllers.Public

{
    [ApiController]
    [Route("api/public/plan")]
    // ADMIN, STUDENT, TEACHER
    public class PlanController : ControllerBase
    {
        private readonly EMTDbContext _db;
        public PlanController(EMTDbContext db) => _db = db;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PlanDto>>> GetPlans()
        {
            var plans = await _db.SubscriptionPlans
                .Where(p => p.IsActive == true)
                .Select(p => new PlanDto
                {
                    PlanID = p.PlanID,
                    PlanCode = p.PlanCode,
                    Name = p.Name,
                    Price = p.Price,
                    DurationDays = p.DurationDays
                })
                .ToListAsync();
            return Ok(new {Plan = plans});
        }
    }
}
