namespace EMT_API.DTOs.Public
{
    public class CourseDtos
    {
    }
}
namespace EMT_API.DTOs.Public
{
    // PLAN
    public class PlanDto
    {
        public int PlanID { get; set; }
        public string PlanCode { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int DurationDays { get; set; }
    }

    // COURSE
    public class CourseDto
    {
        public int CourseID { get; set; }
        public string CourseName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int CourseLevel { get; set; }
        public List<ChapterDto> Chapters { get; set; } = new();
    }

    public class ChapterDto
    {
        public int ChapterID { get; set; }
        public string ChapterName { get; set; } = string.Empty;
        public List<VideoDto> Videos { get; set; } = new();
    }

    public class VideoDto
    {
        public int VideoID { get; set; }
        public string VideoName { get; set; } = string.Empty;
        public string VideoURL { get; set; } = string.Empty;
        public bool IsPreview { get; set; }
    }
}
