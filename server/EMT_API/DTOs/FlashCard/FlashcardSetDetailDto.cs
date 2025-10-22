namespace EMT_API.DTOs.Flashcard
{
    public class FlashcardSetDetailDto : FlashcardSetDto
    {
        public List<FlashcardItemDto> Items { get; set; } = new();
    }
}
