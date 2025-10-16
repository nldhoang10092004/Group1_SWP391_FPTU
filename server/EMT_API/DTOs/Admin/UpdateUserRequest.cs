namespace EMT_API.DTOs.Admin
{
    public class UpdateUserRequest
    {
        public string Status { get; set; } = "ACTIVE";
        public string Role { get; set; } = "STUDENT";
    }
}
