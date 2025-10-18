namespace EMT_API.DTOs.Admin
{
    public class CreateCustomerRequest
    {
        public string Email { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public string Role { get; set; } = "STUDENT";
    }
}
