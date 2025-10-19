namespace EMT_API.DTOs.Auth
{
    public class MembershipRequestDto
    {
        public int UserId { get; set; }   // optional nếu FE gửi user id, thường không cần vì lấy từ token
    }

    public class MembershipResponseDto
    {
        public bool HasMembership { get; set; }
        public DateTime? StartsAt { get; set; }
        public DateTime? EndsAt { get; set; }
        public string? PlanName { get; set; }
        public string? Status { get; set; }
    }
}
