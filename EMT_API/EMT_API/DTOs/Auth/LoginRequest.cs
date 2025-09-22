namespace EMT_API.DTOs.Auth
{
    public record LoginRequest(string EmailOrUsername, string Password);
}
