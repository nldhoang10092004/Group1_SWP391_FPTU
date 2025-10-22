namespace EMT_API.DTOs.Admin
{
    public class DisplayUserResponse
    {
        public int AccountID { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
        public string Status { get; set; }
    }
}