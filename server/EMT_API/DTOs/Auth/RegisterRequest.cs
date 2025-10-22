namespace EMT_API.DTOs.Auth;

public class RegisterRequest
{
    public string Email { get; set; } = string.Empty;

    public string Username { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;

    public string ConfirmPassword { get; set; } = string.Empty;
    public string Otp { get; set; } = string.Empty;
}
