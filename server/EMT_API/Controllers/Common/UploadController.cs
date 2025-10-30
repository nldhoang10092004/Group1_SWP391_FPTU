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
        [RequestSizeLimit(100_000_000)] // 100MB (đủ cho video)
        public async Task<IActionResult> UploadAsset([FromForm] FileUploadRequest req)
        {
            if (req.File == null || req.File.Length == 0)
                return BadRequest("No file uploaded.");

            string url;

            switch (req.Type.ToLower())
            {
                case "audio":
                    url = await _r2.UploadQuizAudioAsync(req.File.OpenReadStream(), req.File.FileName, req.File.ContentType);
                    break;
                case "image":
                    url = await _r2.UploadQuizImageAsync(req.File.OpenReadStream(), req.File.FileName, req.File.ContentType);
                    break;
                case "video":
                    url = await _r2.UploadVideoAsync(req.File.OpenReadStream(), req.File.FileName, req.File.ContentType);
                    break;
                default:
                    return BadRequest("Invalid type. Only 'audio', 'image', or 'video' allowed.");
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
