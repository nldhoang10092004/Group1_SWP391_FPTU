using Microsoft.AspNetCore.Http;

namespace EMT_API.DTOs.Common
{
    /// <summary>
    /// Dùng để upload file (audio / image / video / document) qua form-data.
    /// Dành cho Teacher hoặc Admin.
    /// </summary>
    public class FileUploadRequest
    {
        /// <summary>
        /// File cần upload (bắt buộc)
        /// </summary>
        public IFormFile File { get; set; } = null!;

        /// <summary>
        /// Loại file: "audio", "image", "video", "document"
        /// </summary>
        public string Type { get; set; } = null!;
    }
}
