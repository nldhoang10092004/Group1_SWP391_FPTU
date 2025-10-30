using Amazon.S3;
using Amazon.S3.Model;

namespace EMT_API.Services
{
    public class CloudflareService
    {
        private readonly string _bucket;
        private readonly string _publicBaseUrl;
        private readonly IAmazonS3 _s3;

        public CloudflareService(IConfiguration config)
        {
            var accountId = config["R2:AccountId"];
            var accessKey = config["R2:AccessKeyId"];
            var secretKey = config["R2:SecretAccessKey"];
            _bucket = config["R2:BucketName"];
            _publicBaseUrl = config["R2:PublicBaseUrl"];

            _s3 = new AmazonS3Client(
                accessKey,
                secretKey,
                new AmazonS3Config
                {
                    ServiceURL = $"https://{accountId}.r2.cloudflarestorage.com",
                    ForcePathStyle = true,
                    UseHttp = false
                });
        }

        // ===================================================
        // 🔹 Upload avatar
        // ===================================================
        public async Task<string> UploadAvatarAsync(Stream fileStream, string fileName, string contentType)
        {
            var key = $"avatars/{Guid.NewGuid():N}{Path.GetExtension(fileName)}";

            var request = new PutObjectRequest
            {
                BucketName = _bucket,
                Key = key,
                InputStream = fileStream,
                ContentType = contentType,
                CannedACL = S3CannedACL.PublicRead
            };

            // ⚙️ Fix lỗi STREAMING-AWS4-HMAC-SHA256-PAYLOAD-TRAILER
            request.DisablePayloadSigning = true;

            await _s3.PutObjectAsync(request);
            return $"{_publicBaseUrl}/{key}";
        }

        // ===================================================
        // 🔹 Upload audio cho quiz
        // ===================================================
        public async Task<string> UploadQuizAudioAsync(Stream fileStream, string fileName, string contentType)
        {
            var key = $"audios/{Guid.NewGuid():N}{Path.GetExtension(fileName)}";

            var request = new PutObjectRequest
            {
                BucketName = _bucket,
                Key = key,
                InputStream = fileStream,
                ContentType = contentType,
                CannedACL = S3CannedACL.PublicRead
            };

            request.DisablePayloadSigning = true;

            await _s3.PutObjectAsync(request);
            return $"{_publicBaseUrl}/{key}";
        }

        // ===================================================
        // 🔹 Upload hình ảnh cho quiz
        // ===================================================
        public async Task<string> UploadQuizImageAsync(Stream fileStream, string fileName, string contentType)
        {
            var allowed = new[] { "image/jpeg", "image/png", "image/webp" };
            if (!allowed.Contains(contentType.ToLower()))
                throw new InvalidOperationException("Invalid image file type.");

            var key = $"images/{Guid.NewGuid():N}{Path.GetExtension(fileName)}";

            var request = new PutObjectRequest
            {
                BucketName = _bucket,
                Key = key,
                InputStream = fileStream,
                ContentType = contentType,
                CannedACL = S3CannedACL.PublicRead
            };

            request.DisablePayloadSigning = true;

            await _s3.PutObjectAsync(request);
            return $"{_publicBaseUrl}/{key}";
        }

        // ===================================================
        // 🔹 Xoá file cũ theo URL
        // ===================================================
        public async Task DeleteFileAsync(string fileUrl)
        {
            if (string.IsNullOrWhiteSpace(fileUrl))
                return;

            var key = fileUrl.Replace($"{_publicBaseUrl}/", "");
            try
            {
                await _s3.DeleteObjectAsync(_bucket, key);
            }
            catch
            {
                // bỏ qua lỗi file không tồn tại
            }
        }
    }
}
