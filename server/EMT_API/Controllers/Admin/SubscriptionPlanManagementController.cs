using EMT_API.Data;
using EMT_API.Models;
using EMT_API.DTOs.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EMT_API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/plans")]
    [Authorize(Roles = "ADMIN")]
    public class SubscriptionPlanManagementController : ControllerBase
    {
        private readonly EMTDbContext _db;
        public SubscriptionPlanManagementController(EMTDbContext db) => _db = db;

        // GET: api/admin/plans/view
        [HttpGet("view")]
        public async Task<IActionResult> GetAllPlans()
        {
            var plans = await _db.SubscriptionPlans
                .OrderBy(p => p.PlanID)
                .Select(p => new
                {
                    p.PlanID,
                    p.PlanCode,
                    p.Name,
                    p.Price,
                    p.DurationDays,
                    p.IsActive,
                    p.CreatedAt
                })
                .ToListAsync();

            return Ok(plans);
        }

        // GET: api/admin/plans/{id}
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetPlan(int id)
        {
            var plan = await _db.SubscriptionPlans.FindAsync(id);
            if (plan == null) return NotFound(new { message = "Subscription plan not found." });

            return Ok(new
            {
                plan.PlanID,
                plan.PlanCode,
                plan.Name,
                plan.Price,
                plan.DurationDays,
                plan.IsActive,
                plan.CreatedAt
            });
        }

        // POST: api/admin/plans/create
        [HttpPost("create")]
        public async Task<IActionResult> CreatePlan([FromBody] CreateSubscriptionPlanRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.PlanCode) || string.IsNullOrWhiteSpace(req.Name))
                return BadRequest(new { message = "PlanCode and Name are required." });

            // unique PlanCode check
            var exists = await _db.SubscriptionPlans.AnyAsync(p => p.PlanCode == req.PlanCode);
            if (exists) return Conflict(new { message = "PlanCode already exists." });

            var plan = new SubscriptionPlan
            {
                PlanCode = req.PlanCode,
                Name = req.Name,
                Price = req.Price,
                DurationDays = req.DurationDays,
                IsActive = req.IsActive ?? true,
                CreatedAt = DateTime.UtcNow
            };

            _db.SubscriptionPlans.Add(plan);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPlan), new { id = plan.PlanID }, new
            {
                message = "Subscription plan created successfully.",
                planId = plan.PlanID
            });
        }

        // PUT: api/admin/plans/update/{id}
        [HttpPut("update/{id:int}")]
        public async Task<IActionResult> UpdatePlan(int id, [FromBody] UpdateSubscriptionPlanRequest req)
        {
            var plan = await _db.SubscriptionPlans.FindAsync(id);
            if (plan == null) return NotFound(new { message = "Subscription plan not found." });

            // If changing PlanCode, ensure unique
            if (!string.IsNullOrWhiteSpace(req.PlanCode) && req.PlanCode != plan.PlanCode)
            {
                var other = await _db.SubscriptionPlans.AnyAsync(p => p.PlanCode == req.PlanCode && p.PlanID != id);
                if (other) return Conflict(new { message = "PlanCode already used by another plan." });
                plan.PlanCode = req.PlanCode;
            }

            if (!string.IsNullOrWhiteSpace(req.Name)) plan.Name = req.Name;
            if (req.Price.HasValue) plan.Price = req.Price.Value;
            if (req.DurationDays.HasValue) plan.DurationDays = req.DurationDays.Value;
            if (req.IsActive.HasValue) plan.IsActive = req.IsActive.Value;

            await _db.SaveChangesAsync();
            return Ok(new { message = "Subscription plan updated successfully." });
        }

        // DELETE: api/admin/plans/delete/{id}?force=true
        // Default behavior: soft-delete (set IsActive = false).
        // If ?force=true provided, attempt hard-delete (danger: FK constraints may block).
        [HttpDelete("delete/{id:int}")]
        public async Task<IActionResult> DeletePlan(int id, [FromQuery] bool force = false)
        {
            var plan = await _db.SubscriptionPlans
                .Include(p => p.PaymentOrders)
                .Include(p => p.UserMemberships)
                .FirstOrDefaultAsync(p => p.PlanID == id);

            if (plan == null) return NotFound(new { message = "Subscription plan not found." });

            if (!force)
            {
                // Soft-delete: mark inactive
                if (!plan.IsActive)
                    return BadRequest(new { message = "Plan is already inactive." });

                plan.IsActive = false;
                await _db.SaveChangesAsync();
                return Ok(new { message = "Subscription plan has been deactivated (soft-delete)." });
            }
            else
            {
                // Hard-delete: ensure no dependent records (safe check)
                bool hasOrders = await _db.PaymentOrders.AnyAsync(o => o.PlanID == id);
                bool hasMemberships = await _db.UserMemberships.AnyAsync(um => um.PlanID == id);

                if (hasOrders || hasMemberships)
                {
                    return BadRequest(new
                    {
                        message = "Cannot hard-delete plan because there are related PaymentOrders or UserMemberships. Consider soft-delete instead."
                    });
                }

                _db.SubscriptionPlans.Remove(plan);
                await _db.SaveChangesAsync();
                return Ok(new { message = "Subscription plan permanently deleted." });
            }
        }
    }
}
