namespace EMT_API.DTOs.Flashcard
{
    public class FlashcardSetDto
    {
        public int SetID { get; set; }
        public int? CourseID { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}
