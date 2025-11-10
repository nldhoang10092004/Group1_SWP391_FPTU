namespace EMT_API.DTOs.Auth
{
    public record LoginRequest(string EmailOrUsername, string Password);

    public class GoogleLoginDto
    {
        public string IdToken { get; set; } = string.Empty;
    }
}
