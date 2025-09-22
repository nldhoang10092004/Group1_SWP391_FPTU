namespace EMT_API.DTOs.Auth
{
    public record AuthResponse(int AccountID, string Email, string Username, string Role, string Status);
}
