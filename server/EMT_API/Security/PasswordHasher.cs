using System.Security.Cryptography;
using System.Text;

namespace EMT_API.Security
{
    public static class PasswordHasher
    {
        // Cấu hình mặc định
        private const int SaltSize = 16;         // 128-bit
        private const int KeySize = 32;         // 256-bit
        private const int Iterations = 100_000;  // đủ mạnh cho dev/prod

        public static string Hash(string password)
        {
            // Tạo salt ngẫu nhiên
            using var rng = RandomNumberGenerator.Create();
            var salt = new byte[SaltSize];
            rng.GetBytes(salt);

            // Dẫn xuất key bằng PBKDF2-HMACSHA256
            using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, Iterations, HashAlgorithmName.SHA256);
            var key = pbkdf2.GetBytes(KeySize);

            // Chuỗi lưu DB: iterations.salt.hash (Base64)
            return $"{Iterations}.{Convert.ToBase64String(salt)}.{Convert.ToBase64String(key)}";
        }

        public static bool Verify(string password, string stored)
        {
            // stored: iterations.salt.hash
            var parts = stored.Split('.', 3);
            if (parts.Length != 3) return false;

            var iterations = int.Parse(parts[0]);
            var salt = Convert.FromBase64String(parts[1]);
            var hash = Convert.FromBase64String(parts[2]);

            using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, iterations, HashAlgorithmName.SHA256);
            var key = pbkdf2.GetBytes(hash.Length);

            // So sánh theo thời gian hằng để tránh timing attack
            return CryptographicOperations.FixedTimeEquals(key, hash);
        }
    }
}
