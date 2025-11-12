using EMT_API.Models;

namespace EMT_API.DAOs.PaymentDAO
{
    public interface IPaymentDAO
    {
        // ===== CRUD & QUERY =====
        Task<PaymentOrder?> GetOrderByIdAsync(int orderId);
        Task<List<PaymentOrder>> GetOrdersByUserAsync(int userId);
        Task<PaymentOrder> CreateOrderAsync(PaymentOrder order);
        Task<bool> UpdateOrderStatusAsync(int orderId, string status);

        // ===== Webhook & Membership =====
        Task LogWebhookEventAsync(int orderId, string payload);
        Task HandlePaymentSuccessAsync(PaymentOrder order);
        Task HandlePaymentFailedAsync(PaymentOrder order);
    }
}
