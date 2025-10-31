namespace EMT_API.DTOs.Admin
{
    public class TransactionViewResponse
    {
        public int PaymentOrderID { get; set; }
        public string TransactionID { get; set; }
        public string PaymentMethod { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int UserID { get; set; }
        public string UserName { get; set; }
        public string? PlanName { get; set; }
    }
}