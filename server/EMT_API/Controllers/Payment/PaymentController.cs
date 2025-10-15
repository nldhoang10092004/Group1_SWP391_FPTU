using EMT_API.Data;
using EMT_API.Models;
using EMT_API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;

[ApiController]
[Route("api/payment")]
public class PaymentController : ControllerBase
{
    private readonly PayOSService _payos;
    private readonly EMTDbContext _db;

    public PaymentController(PayOSService payos, EMTDbContext db)
    {
        _payos = payos;
        _db = db;
    }

    [HttpPost("create")]
    [Authorize(Roles = "STUDENT")]
    public async Task<IActionResult> CreatePayment([FromBody] int planId)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var url = await _payos.CreatePaymentAsync(userId, planId);
        return Ok(new { checkoutUrl = url });
    }

    // Webhook callback từ PayOS
    [HttpPost("webhook")]
    public async Task<IActionResult> Webhook([FromBody] JsonElement body)
    {
        var orderId = body.GetProperty("orderCode").GetInt32();
        var status = body.GetProperty("status").GetString();
        var uniqueKey = body.GetProperty("id").GetString(); // event id unique

        // Chống xử lý trùng
        if (await _db.WebhookEvents.AnyAsync(w => w.UniqueKey == uniqueKey))
            return Ok();

        var evt = new WebhookEvent
        {
            OrderID = orderId,
            UniqueKey = uniqueKey!,
            Payload = body.ToString()
        };
        _db.WebhookEvents.Add(evt);

        var order = await _db.PaymentOrders.FindAsync(orderId);
        if (order == null) return Ok();

        switch (status)
        {
            case "PAID":
                order.Status = "PAID";
                order.PaidAt = DateTime.UtcNow;

                var plan = await _db.SubscriptionPlans.FindAsync(order.PlanID);
                if (plan != null)
                {
                    _db.UserMemberships.Add(new UserMembership
                    {
                        UserID = order.BuyerID,
                        PlanID = plan.PlanID,
                        StartsAt = DateTime.UtcNow,
                        EndsAt = DateTime.UtcNow.AddDays(plan.DurationDays),
                        Status = "ACTIVE"
                    });
                }
                break;

            case "CANCELED":
            case "FAILED":
                order.Status = "CANCELED";
                break;

            default:
                // Có thể log thêm cho debug
                order.Status = "PENDING";
                break;
        }

        await _db.SaveChangesAsync();
        return Ok();
    }

}
