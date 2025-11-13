using EMT_API.DAOs.SubscriptionPlanDAO;
using EMT_API.DTOs.Admin;
using EMT_API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EMT_API.Controllers.AdminSide
{
    [ApiController]
    [Route("api/admin/plans")]
    [Authorize(Roles = "ADMIN")]
    public class SubscriptionPlanManagementController : ControllerBase
    {
        private readonly ISubscriptionPlanDAO _dao;

        public SubscriptionPlanManagementController(ISubscriptionPlanDAO dao)
        {
            _dao = dao;
        }

        // GET: api/admin/plans/view
        [HttpGet("view")]
        public async Task<IActionResult> GetAllPlans()
        {
            var plans = await _dao.GetAllPlansAsync();
            var result = plans.Select(p => new
            {
                p.PlanID,
                p.PlanCode,
                p.Name,
                p.Price,
                p.DurationDays,
                p.IsActive,
                p.CreatedAt
            });

            return Ok(result);
        }

        // GET: api/admin/plans/{id}
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetPlan(int id)
        {
            var plan = await _dao.GetPlanByIdAsync(id);
            if (plan == null)
                return NotFound(new { message = "Subscription plan not found." });

            return Ok(plan);
        }

        // POST: api/admin/plans/create
        [HttpPost("create")]
        public async Task<IActionResult> CreatePlan([FromBody] CreateSubscriptionPlanRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.PlanCode) || string.IsNullOrWhiteSpace(req.Name))
                return BadRequest(new { message = "PlanCode and Name are required." });

            if (await _dao.PlanCodeExistsAsync(req.PlanCode))
                return Conflict(new { message = "PlanCode already exists." });

            var plan = new SubscriptionPlan
            {
                PlanCode = req.PlanCode,
                Name = req.Name,
                Price = req.Price,
                DurationDays = req.DurationDays,
                IsActive = req.IsActive ?? true
            };

            var created = await _dao.CreatePlanAsync(plan);
            return CreatedAtAction(nameof(GetPlan), new { id = created.PlanID }, new
            {
                message = "Subscription plan created successfully.",
                created.PlanID
            });
        }

        // PUT: api/admin/plans/update/{id}
        [HttpPut("update/{id:int}")]
        public async Task<IActionResult> UpdatePlan(int id, [FromBody] UpdateSubscriptionPlanRequest req)
        {
            var existing = await _dao.GetPlanByIdAsync(id);
            if (existing == null)
                return NotFound(new { message = "Subscription plan not found." });

            if (!string.IsNullOrWhiteSpace(req.PlanCode) && req.PlanCode != existing.PlanCode)
            {
                if (await _dao.PlanCodeExistsAsync(req.PlanCode, id))
                    return Conflict(new { message = "PlanCode already used by another plan." });
                existing.PlanCode = req.PlanCode;
            }

            if (!string.IsNullOrWhiteSpace(req.Name)) existing.Name = req.Name;
            if (req.Price.HasValue) existing.Price = req.Price.Value;
            if (req.DurationDays.HasValue) existing.DurationDays = req.DurationDays.Value;
            if (req.IsActive.HasValue) existing.IsActive = req.IsActive.Value;

            var ok = await _dao.UpdatePlanAsync(existing);
            if (!ok) return BadRequest(new { message = "Failed to update plan." });

            return Ok(new { message = "Subscription plan updated successfully." });
        }

        // DELETE: api/admin/plans/delete/{id}?force=true
        [HttpDelete("delete/{id:int}")]
        public async Task<IActionResult> DeletePlan(int id, [FromQuery] bool force = false)
        {
            bool success;

            if (force)
                success = await _dao.HardDeletePlanAsync(id);
            else
                success = await _dao.SoftDeletePlanAsync(id);

            if (!success)
                return BadRequest(new
                {
                    message = force
                    ? "Cannot hard-delete plan (has dependencies or not found)."
                    : "Cannot soft-delete plan (already inactive or not found)."
                });

            return Ok(new
            {
                message = force
                ? "Subscription plan permanently deleted."
                : "Subscription plan deactivated (soft-delete)."
            });
        }
    }
}
