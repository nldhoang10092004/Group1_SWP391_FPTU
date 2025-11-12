namespace EMT_API.DTOs.TeacherDTOs
{

    // ✅ DTO cho request
    public class TeacherUpdateInfoRequest
    {
        public string? Description { get; set; }
        public List<string>? CertUrls { get; set; } // nhận danh sách URL sau khi upload
    }
}
