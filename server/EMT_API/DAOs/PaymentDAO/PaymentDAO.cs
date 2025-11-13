using EMT_API.Data;
using EMT_API.Models;
using Microsoft.EntityFrameworkCore;

namespace EMT_API.DAOs.PaymentDAO
{
    public class PaymentDAO : IPaymentDAO
    {
        private readonly EMTDbContext _db;

        public PaymentDAO(EMTDbContext db)
        {
            _db = db;
        }

        // =============================
        // 🔹 CRUD
        // =============================
        public async Task<PaymentOrder?> GetOrderByIdAsync(int orderId)
        {
            return await _db.PaymentOrders
                .Include(o => o.Plan)
                .Include(o => o.Buyer)
                .FirstOrDefaultAsync(o => o.OrderID == orderId);
        }

        public async Task<List<PaymentOrder>> GetOrdersByUserAsync(int userId)
        {
            return await _db.PaymentOrders
                .Where(o => o.BuyerID == userId)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();
        }

        public async Task<PaymentOrder> CreateOrderAsync(PaymentOrder order)
        {
            order.CreatedAt = DateTime.UtcNow;
            _db.PaymentOrders.Add(order);
            await _db.SaveChangesAsync();
            return order;
        }

        public async Task<bool> UpdateOrderStatusAsync(int orderId, string status)
        {
            var order = await _db.PaymentOrders.FindAsync(orderId);
            if (order == null) return false;

            order.Status = status;
            if (status == "PAID") order.PaidAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return true;
        }

        // =============================
        // 🔹 Webhook Handling
        // =============================
        public async Task LogWebhookEventAsync(int orderId, string payload)
        {
            _db.WebhookEvents.Add(new WebhookEvent
            {
                OrderID = orderId,
                UniqueKey = Guid.NewGuid().ToString(),
                Payload = payload,
                ReceivedAt = DateTime.UtcNow
            });
            await _db.SaveChangesAsync();
        }

        public async Task HandlePaymentSuccessAsync(PaymentOrder order)
        {
            var plan = await _db.SubscriptionPlans.FindAsync(order.PlanID);
            if (plan == null) return;

            _db.UserMemberships.Add(new UserMembership
            {
                UserID = order.BuyerID,
                PlanID = plan.PlanID,
                StartsAt = DateTime.UtcNow,
                EndsAt = DateTime.UtcNow.AddDays(plan.DurationDays),
                Status = "ACTIVE"
            });

            order.Status = "PAID";
            order.PaidAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
        }

        public async Task HandlePaymentFailedAsync(PaymentOrder order)
        {
            order.Status = "CANCELED";
            await _db.SaveChangesAsync();
        }
    }
}
