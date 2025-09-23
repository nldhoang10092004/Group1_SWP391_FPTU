namespace EMT_API.DTOs.Auth
{
    /// <summary>
    /// Dữ liệu trả về sau khi login/register thành công
    /// </summary>
    public record AuthResponse(
        int AccountID,
        string Email,
        string Username,
        string Role,
        string Status
    );
}
