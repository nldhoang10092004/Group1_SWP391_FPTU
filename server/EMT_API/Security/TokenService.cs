using EMT_API.Data;
using EMT_API.Models;
using EMT_API.Utils;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace EMT_API.Security;

public interface ITokenService
{
    string CreateAccessToken(Account acc, int version);
    (string token, DateTimeOffset exp) CreateRefreshToken();
    string HashRefreshToken(string token);

    // ✅ Đổi tên cho khớp controller
    ClaimsPrincipal? ValidateExpiredAccessToken(string token);

    // (tuỳ chọn) Alias giữ tương thích ngược nếu nơi khác đã gọi
    ClaimsPrincipal? ReadExpiredAccessToken(string token);
}

public sealed class TokenService : ITokenService
{
    private readonly IConfiguration _cfg;
    private readonly byte[] _key;
    private readonly EMTDbContext _db;


    public TokenService(IConfiguration cfg)
    {
        _cfg = cfg;
        _key = Encoding.UTF8.GetBytes(_cfg["Jwt:Key"]!);
    }

    public string CreateAccessToken(Account acc, int version)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, acc.AccountID.ToString()),
            new(ClaimTypes.NameIdentifier, acc.AccountID.ToString()),
            new(ClaimTypes.Name, acc.Username ?? acc.Email),
            new(ClaimTypes.Role, acc.Role ?? "STUDENT"),
            new("rt_ver", version.ToString())
        };

        var creds = new SigningCredentials(new SymmetricSecurityKey(_key), SecurityAlgorithms.HmacSha256);
        var now = DateTime.UtcNow;
        var exp = now.AddMinutes(int.Parse(_cfg["Jwt:AccessTokenMinutes"]!));

        var token = new JwtSecurityToken(
            issuer: _cfg["Jwt:Issuer"],
            audience: _cfg["Jwt:Audience"],
            claims: claims,
            notBefore: now,
            expires: exp,
            signingCredentials: creds
        );
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public (string token, DateTimeOffset exp) CreateRefreshToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(32); // 256-bit
        var token = Convert.ToBase64String(bytes);
        var exp = DateTimeOffset.UtcNow.AddDays(int.Parse(_cfg["Jwt:RefreshTokenDays"]!));
        return (token, exp);
    }

    public string HashRefreshToken(string token)
    {
        using var sha = SHA256.Create();
        return Convert.ToBase64String(sha.ComputeHash(Encoding.UTF8.GetBytes(token)));
    }

    // ✅ Tên method khớp với AuthController
    public ClaimsPrincipal? ValidateExpiredAccessToken(string token)
    {
        var handler = new JwtSecurityTokenHandler();
        var p = new TokenValidationParameters
        {
            ValidIssuer = _cfg["Jwt:Issuer"],
            ValidAudience = _cfg["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(_key),
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = false // cho phép đọc token đã hết hạn
        };
        try { return handler.ValidateToken(token, p, out _); }
        catch { return null; }
    }

    // Alias (gọi lại method trên)
    public ClaimsPrincipal? ReadExpiredAccessToken(string token) => ValidateExpiredAccessToken(token);
}
