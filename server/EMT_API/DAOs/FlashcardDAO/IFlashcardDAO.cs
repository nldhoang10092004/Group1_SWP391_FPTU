using EMT_API.Models;

namespace EMT_API.DAOs.FlashcardDAO
{
    public interface IFlashcardDAO
    {
        // ---- READ ----
        Task<List<FlashcardSet>> GetAllPublicSetsAsync();
        Task<List<FlashcardSet>> GetSetsByCourseAsync(int courseId);
        Task<FlashcardSet?> GetSetDetailAsync(int setId);

        // ---- CREATE ----
        Task<FlashcardSet> CreateSetAsync(FlashcardSet set);
        Task<FlashcardItem> CreateItemAsync(FlashcardItem item);

        // ---- UPDATE ----
        Task<bool> UpdateSetAsync(FlashcardSet set);
        Task<bool> UpdateItemAsync(FlashcardItem item);

        // ---- DELETE ----
        Task<bool> DeleteSetAsync(int setId);
        Task<bool> DeleteItemAsync(int itemId);
    }
}
