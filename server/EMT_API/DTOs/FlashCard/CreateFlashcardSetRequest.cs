namespace EMT_API.DTOs.Flashcard
{
    public class CreateFlashcardSetRequest
    {
        public int? CourseID { get; set; }  // nếu null => free
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}
