namespace EMT_API.DTOs.Auth
{
    /// <summary>
    /// Dữ liệu trả về sau khi login / refresh token thành công
    /// </summary>
    public record AuthResponse(
        int AccountID,
        string AccessToken,
        int ExpiresIn
    );
}
