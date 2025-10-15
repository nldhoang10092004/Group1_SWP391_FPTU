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

    [HttpPost("webhook")]
    [AllowAnonymous]
    public async Task<IActionResult> Webhook([FromBody] JsonElement body)
    {
        try
        {
            if (!body.TryGetProperty("data", out var dataElem))
                return BadRequest("Invalid payload: missing data");

            var orderId = dataElem.GetProperty("orderCode").GetInt32();

            // ✅ Đọc code thay vì status
            var code = dataElem.TryGetProperty("code", out var codeElem)
                ? codeElem.GetString()
                : "UNKNOWN";
            var desc = dataElem.TryGetProperty("desc", out var descElem)
                ? descElem.GetString()
                : "";

            string status = code switch
            {
                "00" => "PAID",
                _ => "FAILED"
            };

            // Ghi log webhook
            _db.WebhookEvents.Add(new WebhookEvent
            {
                OrderID = orderId,
                UniqueKey = Guid.NewGuid().ToString(),
                Payload = body.ToString(),
                ReceivedAt = DateTime.UtcNow
            });

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

                case "FAILED":
                    order.Status = "CANCELED";
                    break;
            }

            await _db.SaveChangesAsync();
            Console.WriteLine($"✅ Webhook xử lý thành công cho order {orderId} - {status}");
            return Ok();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Webhook error: {ex.Message}");
            return Ok();
        }
    }



}
