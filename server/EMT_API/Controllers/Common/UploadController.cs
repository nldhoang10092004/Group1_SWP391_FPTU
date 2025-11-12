using EMT_API.DTOs.Common;
using EMT_API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EMT_API.Controllers
{
    [ApiController]
    [Route("api/upload")]
    [Authorize(Roles = "TEACHER,ADMIN")]
    public class UploadController : ControllerBase
    {
        private readonly CloudflareService _r2;
        public UploadController(CloudflareService r2) => _r2 = r2;

        [HttpPost("asset")]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(1_000_000_000)] // 1GB
        public async Task<IActionResult> UploadAsset([FromForm] FileUploadRequest req)
        {
            if (req.File == null || req.File.Length == 0)
                return BadRequest("No file uploaded.");

            var ext = Path.GetExtension(req.File.FileName).ToLower();
            string url;

            switch (req.Type.ToLower())
            {
                case "audio":
                    if (!new[] { ".mp3", ".wav", ".m4a" }.Contains(ext))
                        return BadRequest("Invalid audio format. Allowed: .mp3, .wav, .m4a");
                    url = await _r2.UploadQuizAudioAsync(req.File.OpenReadStream(), req.File.FileName, req.File.ContentType);
                    break;

                case "image":
                    if (!new[] { ".jpg", ".jpeg", ".png", ".webp" }.Contains(ext))
                        return BadRequest("Invalid image format. Allowed: .jpg, .jpeg, .png, .webp");
                    url = await _r2.UploadQuizImageAsync(req.File.OpenReadStream(), req.File.FileName, req.File.ContentType);
                    break;

                case "video":
                    if (!new[] { ".mp4", ".mov", ".avi", ".mkv" }.Contains(ext))
                        return BadRequest("Invalid video format. Allowed: .mp4, .mov, .avi, .mkv");
                    url = await _r2.UploadVideoAsync(req.File.OpenReadStream(), req.File.FileName, req.File.ContentType);
                    break;

                case "certificate":
                    if (!new[] { ".jpg", ".jpeg", ".png", ".pdf" }.Contains(ext))
                        return BadRequest("Invalid certificate format. Allowed: .jpg, .jpeg, .png, .pdf");
                    url = await _r2.UploadTeacherCertAsync(req.File.OpenReadStream(), req.File.FileName, req.File.ContentType);
                    break;

                default:
                    return BadRequest("Invalid type. Only 'audio', 'image', 'video', or 'certificate' allowed.");
            }

            return Ok(new
            {
                message = "File uploaded successfully",
                type = req.Type,
                url
            });
        }
    }
}
