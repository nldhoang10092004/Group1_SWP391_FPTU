namespace EMT_API.DTOs.Admin
{
    public class UpdateSubscriptionPlanRequest
    {
        public string? PlanCode { get; set; }
        public string? Name { get; set; }
        public decimal? Price { get; set; }
        public int? DurationDays { get; set; }
        public bool? IsActive { get; set; }
    }
}
