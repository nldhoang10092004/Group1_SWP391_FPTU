using EMT_API.Models;

namespace EMT_API.DAOs.SubscriptionPlanDAO
{
    public interface ISubscriptionPlanDAO
    {
        // --- CRUD ---
        Task<List<SubscriptionPlan>> GetAllPlansAsync();
        Task<SubscriptionPlan?> GetPlanByIdAsync(int id);
        Task<SubscriptionPlan?> CreatePlanAsync(SubscriptionPlan plan);
        Task<bool> UpdatePlanAsync(SubscriptionPlan plan);
        Task<bool> SoftDeletePlanAsync(int id);
        Task<bool> HardDeletePlanAsync(int id);

        // --- Validation ---
        Task<bool> PlanCodeExistsAsync(string planCode, int? excludeId = null);
    }
}
