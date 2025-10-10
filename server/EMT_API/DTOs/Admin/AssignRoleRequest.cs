namespace EMT_API.DTOs.Admin
{
    public class AssignRoleRequest
    {
        public int UserId { get; set; }
        public string Role { get; set; } = string.Empty;
    }
}
