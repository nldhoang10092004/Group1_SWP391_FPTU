using EMT_API.Models;

namespace EMT_API.DAOs.UserDAO
{
    public interface IUserDAO
    {
        // ==== AUTH DAO ====
        Task<Account?> GetByEmailOrUsernameAsync(string emailOrUsername);
        Task<Account?> GetByEmailAsync(string email);
        Task<bool> IsEmailExistsAsync(string email);
        Task<bool> IsUsernameExistsAsync(string username);
        Task<Account> CreateAccountAsync(Account acc);
        Task<UserDetail> CreateUserDetailAsync(int accountId);
        Task<Teacher> CreateTeacherAsync(int accountId, string? desc = null, string? cert = null);
        Task UpdateAccountAsync(Account acc);
        Task<Account?> GetByIdAsync(int id);

        // ==== ADMIN DAO ====
        Task<List<Account>> GetAllUsersAsync();
        Task<List<Account>> GetAllStudentsAsync();
        Task<List<Account>> GetAllTeachersAsync();
        Task<Account?> LockUserAsync(int id);
        Task<Account?> UnlockUserAsync(int id);
        Task<List<Account>> SearchUsersAsync(string? keyword, string? role, string? status);
        Task<Account?> AssignRoleAsync(int userId, string newRole);
    }
}
