namespace EMT_API.DTOs.Admin
{
    public class CreateTeacherRequest
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string? Description { get; set; }
        public string? CertJson { get; set; }
    }
}
