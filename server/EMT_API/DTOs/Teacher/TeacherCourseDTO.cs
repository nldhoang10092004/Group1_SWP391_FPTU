namespace EMT_API.DTOs.TeacherCourse
{
    public class CourseSummaryDto
    {
        public int CourseID { get; set; }
        public string CourseName { get; set; } = null!;
        public string Description { get; set; } = "";
        public byte CourseLevel { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CourseDetailDto
    {
        public int CourseID { get; set; }
        public string CourseName { get; set; } = null!;
        public string Description { get; set; } = "";
        public byte CourseLevel { get; set; }
        public List<ChapterDetailDto> Chapters { get; set; } = new();
    }

    public class ChapterDetailDto
    {
        public int ChapterID { get; set; }
        public string ChapterName { get; set; } = null!;
        public List<VideoDetailDto> Videos { get; set; } = new();
    }

    public class VideoDetailDto
    {
        public int VideoID { get; set; }
        public string VideoName { get; set; } = null!;
        public string VideoURL { get; set; } = null!;
        public bool IsPreview { get; set; }
    }

    public class CreateCourseRequest
    {
        public string CourseName { get; set; } = null!;
        public string? Description { get; set; }
        public byte CourseLevel { get; set; }
    }

    public class UpdateCourseRequest
    {
        public string CourseName { get; set; } = null!;
        public string? Description { get; set; }
    }

    public class CreateChapterRequest
    {
        public string ChapterName { get; set; } = null!;
    }

    public class UpdateChapterRequest
    {
        public string ChapterName { get; set; } = null!;
    }

    public class CreateVideoRequest
    {
        public string VideoName { get; set; } = null!;
        public string VideoURL { get; set; } = null!;
        public bool IsPreview { get; set; }
    }
}
