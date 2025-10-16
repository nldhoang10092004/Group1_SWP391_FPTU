namespace EMT_API.DTOs.Profile
{
    public class UpdateUserDetailRequest
    {
        public string? FullName { get; set; }
        public string? Phone { get; set; }
        public string? Bio { get; set; }
        public DateOnly? Dob { get; set; }
        public string? Gender { get; set; }    // nếu có
        public string? Address { get; set; }   // nếu có
    }
}
