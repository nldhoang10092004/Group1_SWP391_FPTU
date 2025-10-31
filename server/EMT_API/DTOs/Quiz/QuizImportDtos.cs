namespace EMT_API.DTOs.Quiz
{
    // ===================================================
    // 🔹 Tạo quiz shell
    // ===================================================
    public class TeacherCreateQuizRequest
    {
        public int CourseID { get; set; }            // khoá học chứa quiz
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public byte QuizType { get; set; }           // 1=Listening, 2=Reading, 3=Writing, 4=Speaking
    }

    // ===================================================
    // 🔹 Import toàn bộ nội dung quiz
    // ===================================================
    public class ImportQuizRequest
    {
        public List<QuestionGroupImportDto> Groups { get; set; } = new();
    }

    // ===================================================
    // 🔹 QuestionGroup (nhóm câu hỏi)
    // ===================================================
    public class QuestionGroupImportDto
    {
        public int GroupOrder { get; set; }          // thứ tự nhóm
        public byte GroupType { get; set; }          // loại nhóm (1=Listening, 2=Reading...)
        public string? Instruction { get; set; }     // hướng dẫn/đề dẫn
        public List<AssetImportDto>? Assets { get; set; } = new();
        public List<QuestionImportDto>? Questions { get; set; } = new();
    }

    // ===================================================
    // 🔹 Question (câu hỏi)
    // ===================================================
    public class QuestionImportDto
    {
        public string Content { get; set; } = null!;
        public byte QuestionType { get; set; }       // 1=MCQ, 2=Fill, 3=Essay...
        public int QuestionOrder { get; set; }       // thứ tự câu
        public decimal ScoreWeight { get; set; } = 1;
        public string? MetaJson { get; set; }        // metadata mở rộng
        public List<OptionImportDto>? Options { get; set; } = new();
        public List<AssetImportDto>? Assets { get; set; } = new();
    }

    // ===================================================
    // 🔹 Option (lựa chọn trong MCQ)
    // ===================================================
    public class OptionImportDto
    {
        public string Content { get; set; } = null!;
        public bool IsCorrect { get; set; }
    }

    // ===================================================
    // 🔹 Asset (file/audio/image/text kèm theo)
    // ===================================================
    public class AssetImportDto
    {
        public byte AssetType { get; set; }          // 1=audio, 2=image, 3=text, 4=file, 5=video
        public string? Url { get; set; }             // link Cloudflare R2
        public string? ContentText { get; set; }     // nếu asset là text/passage
        public string? Caption { get; set; }         // chú thích hiển thị
        public string? MimeType { get; set; }        // MIME type file (image/png, audio/mpeg...)
    }
}
