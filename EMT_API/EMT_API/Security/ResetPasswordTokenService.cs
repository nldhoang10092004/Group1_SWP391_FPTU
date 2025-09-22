using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using EMT_API.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace EMT_API.Security
{
    public static class ResetPasswordTokenService
    {
        // Tạo token reset hợp lệ 30 phút, nhúng fingerprint của hash hiện tại
        public static string Create(Account acc, IConfiguration cfg)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(cfg["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // "Fingerprint" = SHA256 của Hashpass, tránh lộ hash gốc
            var pwdFingerprint = Sha256Base64(acc.Hashpass ?? string.Empty);

            var claims = new List<Claim>
            {
                new("sub", acc.AccountID.ToString()),
                new("typ", "pwd_reset"),               // mục đích token
                new("pwdv", pwdFingerprint)            // version mật khẩu hiện tại
            };

            var token = new JwtSecurityToken(
                issuer: cfg["Jwt:Issuer"],
                audience: cfg["Jwt:Audience"],
                claims: claims,
                notBefore: DateTime.UtcNow,
                expires: DateTime.UtcNow.AddMinutes(30),  // HẠN 30'
                signingCredentials: creds
            );
            return new JwtSecurityTokenHandler().WriteToken(token);
        }



        // Validate và lấy ra accountId + fingerprint trong token
        public static bool TryValidate(string token, IConfiguration cfg, out int accountId, out string pwdFingerprint)
        {
            JwtSecurityTokenHandler.DefaultMapInboundClaims = false; 
            accountId = 0; pwdFingerprint = string.Empty;

            var handler = new JwtSecurityTokenHandler();
            var parameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateIssuerSigningKey = true,
                ValidateLifetime = true,                        // ✅ BẮT BUỘC bật
                ValidIssuer = cfg["Jwt:Issuer"],
                ValidAudience = cfg["Jwt:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(
        Encoding.UTF8.GetBytes((cfg["Jwt:Key"] ?? "").Trim()) // ✅ Trim tránh xuống dòng/space
    ),
                ClockSkew = TimeSpan.FromMinutes(2)            // ✅ nới 1–2'
            };


            try
            {
                var principal = handler.ValidateToken(token, parameters, out var _);
                // bắt buộc đúng mục đích
                if (principal.FindFirst("typ")?.Value != "pwd_reset") return false;

                var sub = principal.FindFirst("sub")?.Value;
                var fp = principal.FindFirst("pwdv")?.Value;
                if (string.IsNullOrWhiteSpace(sub) || string.IsNullOrWhiteSpace(fp)) return false;

                accountId = int.Parse(sub);
                pwdFingerprint = fp;
                return true;
            }
            catch
            {
                return false;
            }
        }

        public static string Fingerprint(string? hashpass)
         => Sha256Base64(hashpass ?? string.Empty);

        private static string Sha256Base64(string input)
        {
            using var sha = SHA256.Create();
            var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(input));
            return Convert.ToBase64String(bytes);
        }
    }
}
