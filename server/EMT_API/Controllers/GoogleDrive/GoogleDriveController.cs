using EMT_API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
namespace EMT_API.Controllers.GoogleDrive
{
    [ApiController]
    [Route("api/google-drive")]
    public class GoogleDriveController : ControllerBase
    {
        private readonly GoogleDriveService _drive;
        private readonly IConfiguration _cfg;
        public GoogleDriveController(GoogleDriveService drive, IConfiguration cfg)
        {
            _drive = drive;
            _cfg = cfg;
        }

        [HttpGet("list")]
        public async Task<IActionResult> List()
        {
            var files = await _drive.ListFilesAsync(_cfg["GoogleService:RootFolderID"]);
            return Ok(files.Select(f => new
            {
                f.Id,
                f.Name,
                f.MimeType,
                f.Size,
                f.ModifiedTime
            }));
        }



    }
}
