namespace EMT_API.DTOs.Auth
{
    public record ResetPasswordRequest(string Token, string NewPassword, string ConfirmNewPassword);
}
