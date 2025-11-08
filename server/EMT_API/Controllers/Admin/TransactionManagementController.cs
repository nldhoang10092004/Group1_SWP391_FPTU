using EMT_API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace EMT_API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/transactions")]
    [Authorize(Roles = "ADMIN")]
    public class TransactionManagementController : ControllerBase
    {
        private readonly EMTDbContext _db;

        public TransactionManagementController(EMTDbContext db)
        {
            _db = db;
        }

        // -----------------------------------------------------
        // 1️⃣ Xem toàn bộ lịch sử giao dịch
        // -----------------------------------------------------
        [HttpGet("view")]
        public async Task<IActionResult> GetAllTransactions()
        {
            var transactions = await _db.PaymentOrders
                .Include(t => t.Buyer)
                .Include(t => t.Plan)
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new
                {
                    t.OrderID,
                    BuyerID = t.BuyerID,
                    BuyerUsername = t.Buyer.Username,
                    BuyerEmail = t.Buyer.Email,
                    PlanID = t.PlanID,
                    PlanName = t.Plan.Name,
                    t.Amount,
                    t.Status,
                    t.CreatedAt,
                    t.PaidAt
                })
                .ToListAsync();

            return Ok(transactions);
        }

        // -----------------------------------------------------
        // 2️⃣ Tìm kiếm giao dịch theo OrderID, Email, Trạng thái, hoặc Tên gói
        // -----------------------------------------------------
        [HttpGet("search")]
        public async Task<IActionResult> SearchTransactions([FromQuery] string? keyword)
        {
            var query = _db.PaymentOrders
                .Include(t => t.Buyer)
                .Include(t => t.Plan)
                .AsQueryable();

            if (!string.IsNullOrEmpty(keyword))
            {
                keyword = keyword.ToLower();
                query = query.Where(t =>
                    t.OrderID.ToString().Contains(keyword) ||
                    t.Buyer.Username.ToLower().Contains(keyword) ||
                    t.Buyer.Email.ToLower().Contains(keyword) ||
                    t.Plan.Name.ToLower().Contains(keyword) ||
                    t.Status.ToLower().Contains(keyword));
            }

            var results = await query
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new
                {
                    t.OrderID,
                    BuyerID = t.BuyerID,
                    BuyerUsername = t.Buyer.Username,
                    BuyerEmail = t.Buyer.Email,
                    PlanID = t.PlanID,
                    PlanName = t.Plan.Name,
                    t.Amount,
                    t.Status,
                    t.CreatedAt,
                    t.PaidAt
                })
                .ToListAsync();

            return Ok(results);
        }

        // -----------------------------------------------------
        // 3️⃣ Xem chi tiết một giao dịch (bao gồm log webhook)
        // -----------------------------------------------------
        [HttpGet("detail/{orderId:int}")]
        public async Task<IActionResult> GetTransactionDetail(int orderId)
        {
            var transaction = await _db.PaymentOrders
                .Include(t => t.Buyer)
                .Include(t => t.Plan)
                .Include(t => t.WebhookEvents)
                .FirstOrDefaultAsync(t => t.OrderID == orderId);

            if (transaction == null)
                return NotFound(new { message = "Transaction not found." });

            var data = new
            {
                transaction.OrderID,
                Buyer = new
                {
                    transaction.BuyerID,
                    transaction.Buyer.Username,
                    transaction.Buyer.Email
                },
                Plan = new
                {
                    transaction.PlanID,
                    transaction.Plan.PlanCode,
                    transaction.Plan.Name,
                    transaction.Plan.Price,
                    transaction.Plan.DurationDays
                },
                transaction.Amount,
                transaction.Status,
                transaction.CreatedAt,
                transaction.PaidAt,
                WebhookEvents = transaction.WebhookEvents
                    .OrderByDescending(w => w.ReceivedAt)
                    .Select(w => new
                    {
                        w.WebhookID,
                        w.UniqueKey,
                        w.Signature,
                        w.ReceivedAt,
                        w.Payload
                    })
            };

            return Ok(data);
        }
    }
}
