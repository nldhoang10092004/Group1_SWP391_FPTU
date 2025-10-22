using EMT_API.Data;
using Microsoft.EntityFrameworkCore;

namespace EMT_API.Utils;

public static class MembershipUtil
{
    /// <summary>
    /// Kiểm tra xem user có membership còn hiệu lực không.
    /// </summary>
    public static async Task<bool> HasActiveMembershipAsync(EMTDbContext db, int userId)
    {
        return await db.UserMemberships
            .AnyAsync(um =>
                um.UserID == userId &&
                um.Status == "ACTIVE" &&
                DateTime.UtcNow >= um.StartsAt &&
                DateTime.UtcNow <= um.EndsAt
            );
    }
}
