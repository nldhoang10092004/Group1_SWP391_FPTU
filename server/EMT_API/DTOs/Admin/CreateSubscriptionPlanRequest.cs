namespace EMT_API.DTOs.Admin
{
    public class CreateSubscriptionPlanRequest
    {
        public string PlanCode { get; set; } = string.Empty; 
        public string Name { get; set; } = string.Empty;     
        public decimal Price { get; set; }                   
        public int DurationDays { get; set; }               
        public bool? IsActive { get; set; } = true;
    }
}
