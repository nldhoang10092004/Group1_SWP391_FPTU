using EMT_API.Data;
using EMT_API.Models;
using Microsoft.EntityFrameworkCore;

namespace EMT_API.DAOs.FlashcardDAO
{
    public class FlashcardDAO : IFlashcardDAO
    {
        private readonly EMTDbContext _db;

        public FlashcardDAO(EMTDbContext db)
        {
            _db = db;
        }

        // ---- READ ----
        public async Task<List<FlashcardSet>> GetAllPublicSetsAsync()
        {
            return await _db.FlashcardSets
                .Where(s => s.CourseId == null)
                .Include(s => s.FlashcardItems)
                .ToListAsync();
        }

        public async Task<List<FlashcardSet>> GetSetsByCourseAsync(int courseId)
        {
            return await _db.FlashcardSets
                .Where(s => s.CourseId == courseId)
                .Include(s => s.FlashcardItems)
                .ToListAsync();
        }

        public async Task<FlashcardSet?> GetSetDetailAsync(int setId)
        {
            return await _db.FlashcardSets
                .Include(s => s.FlashcardItems)
                .FirstOrDefaultAsync(s => s.SetId == setId);
        }

        // ---- CREATE ----
        public async Task<FlashcardSet> CreateSetAsync(FlashcardSet set)
        {
            _db.FlashcardSets.Add(set);
            await _db.SaveChangesAsync();
            return set;
        }

        public async Task<FlashcardItem> CreateItemAsync(FlashcardItem item)
        {
            _db.FlashcardItems.Add(item);
            await _db.SaveChangesAsync();
            return item;
        }

        // ---- UPDATE ----
        public async Task<bool> UpdateSetAsync(FlashcardSet set)
        {
            if (!await _db.FlashcardSets.AnyAsync(s => s.SetId == set.SetId))
                return false;

            _db.FlashcardSets.Update(set);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateItemAsync(FlashcardItem item)
        {
            if (!await _db.FlashcardItems.AnyAsync(i => i.ItemId == item.ItemId))
                return false;

            _db.FlashcardItems.Update(item);
            await _db.SaveChangesAsync();
            return true;
        }

        // ---- DELETE ----
        public async Task<bool> DeleteSetAsync(int setId)
        {
            var set = await _db.FlashcardSets
                .Include(s => s.FlashcardItems)
                .FirstOrDefaultAsync(s => s.SetId == setId);

            if (set == null) return false;

            if (set.FlashcardItems.Any())
                _db.FlashcardItems.RemoveRange(set.FlashcardItems);

            _db.FlashcardSets.Remove(set);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteItemAsync(int itemId)
        {
            var item = await _db.FlashcardItems.FindAsync(itemId);
            if (item == null) return false;

            _db.FlashcardItems.Remove(item);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
