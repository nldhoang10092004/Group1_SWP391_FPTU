using EMT_API.Data;
using EMT_API.Models;
using Microsoft.EntityFrameworkCore;

namespace EMT_API.DAOs.SubscriptionPlanDAO
{
    public class SubscriptionPlanDAO : ISubscriptionPlanDAO
    {
        private readonly EMTDbContext _db;
        public SubscriptionPlanDAO(EMTDbContext db) => _db = db;

        // ========== CRUD ==========
        public async Task<List<SubscriptionPlan>> GetAllPlansAsync()
        {
            return await _db.SubscriptionPlans
                .OrderBy(p => p.PlanID)
                .ToListAsync();
        }

        public async Task<SubscriptionPlan?> GetPlanByIdAsync(int id)
        {
            return await _db.SubscriptionPlans.FindAsync(id);
        }

        public async Task<SubscriptionPlan?> CreatePlanAsync(SubscriptionPlan plan)
        {
            plan.CreatedAt = DateTime.UtcNow;
            _db.SubscriptionPlans.Add(plan);
            await _db.SaveChangesAsync();
            return plan;
        }

        public async Task<bool> UpdatePlanAsync(SubscriptionPlan plan)
        {
            if (!await _db.SubscriptionPlans.AnyAsync(p => p.PlanID == plan.PlanID))
                return false;

            _db.SubscriptionPlans.Update(plan);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> SoftDeletePlanAsync(int id)
        {
            var plan = await _db.SubscriptionPlans.FindAsync(id);
            if (plan == null) return false;

            if (!plan.IsActive) return false; // already inactive
            plan.IsActive = false;
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> HardDeletePlanAsync(int id)
        {
            var plan = await _db.SubscriptionPlans
                .Include(p => p.PaymentOrders)
                .Include(p => p.UserMemberships)
                .FirstOrDefaultAsync(p => p.PlanID == id);

            if (plan == null) return false;

            bool hasRelations = plan.PaymentOrders.Any() || plan.UserMemberships.Any();
            if (hasRelations) return false;

            _db.SubscriptionPlans.Remove(plan);
            await _db.SaveChangesAsync();
            return true;
        }

        // ========== Validation ==========
        public async Task<bool> PlanCodeExistsAsync(string planCode, int? excludeId = null)
        {
            return await _db.SubscriptionPlans.AnyAsync(p =>
                p.PlanCode == planCode && (!excludeId.HasValue || p.PlanID != excludeId.Value));
        }
    }
}
