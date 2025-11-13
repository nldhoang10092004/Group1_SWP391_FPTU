using EMT_API.Models;

namespace EMT_API.DAOs.MembershipDAO
{
    public interface IMembershipDAO
    {
        // ====== Query membership ======
        Task<UserMembership?> GetActiveMembershipByUserAsync(int userId);
        Task<List<UserMembership>> GetMembershipHistoryAsync(int userId);

        // ====== Create & Update ======
        Task<UserMembership> CreateMembershipAsync(UserMembership membership);
        Task<bool> UpdateMembershipStatusAsync(long membershipId, string newStatus);

        // ====== Utility ======
        Task<bool> HasActiveMembershipAsync(int userId);
    }
}