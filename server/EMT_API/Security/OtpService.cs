using Microsoft.Extensions.Caching.Memory;

namespace EMT_API.Security
{
    public class OtpService : IOtpService
    {
        private readonly IMemoryCache _cache;
        private readonly TimeSpan _ttl = TimeSpan.FromMinutes(5);
        private readonly TimeSpan _cooldown = TimeSpan.FromSeconds(60);

        public OtpService(IMemoryCache cache) { _cache = cache; }

        public string Generate(string email)
        {
            var lastKey = $"otp-lastsend:{email}";
            if (_cache.TryGetValue(lastKey, out DateTime lastSend))
            {
                if (DateTime.UtcNow - lastSend < _cooldown)
                {
                    throw new InvalidOperationException("Vui lòng chờ 60 giây trước khi gửi lại OTP.");
                } 
            }
            var otp = new Random().Next(100_000, 999_999).ToString();
            _cache.Set($"otp:{email}", otp, _ttl);
            _cache.Set(lastKey, DateTime.UtcNow, _ttl);
            return otp;
        }

        public bool Verify(string email, string otp)
        {
            var key = $"otp:{email}";
            if (_cache.TryGetValue(key, out string? cachedOTP) && cachedOTP.Equals(otp))
            {
                _cache.Remove(key); // xóa sau khi xác minh
                return true;
            }
            return false;
        }
    }
}
