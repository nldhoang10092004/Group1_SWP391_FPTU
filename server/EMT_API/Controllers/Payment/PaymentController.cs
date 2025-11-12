using EMT_API.DAOs.PaymentDAO;
using EMT_API.DTOs.Payment;
using EMT_API.Models;
using EMT_API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Text.Json;

namespace EMT_API.Controllers.UserSide
{
    [ApiController]
    [Route("api/payment")]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentDAO _dao;
        private readonly PayOSService _payos;

        public PaymentController(IPaymentDAO dao, PayOSService payos)
        {
            _dao = dao;
            _payos = payos;
        }

        // ===============================
        // 🔹 Student tạo đơn thanh toán
        // ===============================
        [HttpPost("create")]
        [Authorize(Roles = "STUDENT")]
        public async Task<IActionResult> CreatePayment([FromBody] CreatePaymentRequest request)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            int planId = request.PlanId;

            var url = await _payos.CreatePaymentAsync(userId, planId);
            return Ok(new { paymentUrl = url });
        }

        // ===============================
        // 🔹 PayOS Webhook Callback
        // ===============================
        [HttpPost("webhook")]
        [AllowAnonymous]
        public async Task<IActionResult> Webhook([FromBody] JsonElement body)
        {
            try
            {
                if (!body.TryGetProperty("data", out var dataElem))
                    return BadRequest("Invalid payload: missing data");

                var orderId = dataElem.GetProperty("orderCode").GetInt32();
                var code = dataElem.TryGetProperty("code", out var codeElem)
                    ? codeElem.GetString() : "UNKNOWN";

                string status = code == "00" ? "PAID" : "FAILED";

                await _dao.LogWebhookEventAsync(orderId, body.ToString() ?? "{}");

                var order = await _dao.GetOrderByIdAsync(orderId);
                if (order == null)
                    return Ok(new { message = "Order not found, ignored" });

                if (status == "PAID")
                    await _dao.HandlePaymentSuccessAsync(order);
                else
                    await _dao.HandlePaymentFailedAsync(order);

                Console.WriteLine($"✅ Webhook handled for order {orderId} - {status}");
                return Ok();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Webhook error: {ex.Message}");
                return Ok();
            }
        }
    }
}
