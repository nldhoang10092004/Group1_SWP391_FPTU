using EMT_API.Data;
using EMT_API.Models;
using Microsoft.EntityFrameworkCore;

namespace EMT_API.DAOs.UserDAO
{
    public class UserDAO : IUserDAO
    {
        private readonly EMTDbContext _db;

        public UserDAO(EMTDbContext db)
        {
            _db = db;
        }

        // ===== AUTH DAO =====

        public async Task<Account?> GetByEmailOrUsernameAsync(string emailOrUsername)
        {
            return await _db.Accounts
                .FirstOrDefaultAsync(a => a.Email == emailOrUsername || a.Username == emailOrUsername);
        }

        public async Task<Account?> GetByEmailAsync(string email)
        {
            return await _db.Accounts.FirstOrDefaultAsync(a => a.Email == email);
        }

        public async Task<bool> IsEmailExistsAsync(string email)
        {
            return await _db.Accounts.AnyAsync(a => a.Email == email);
        }

        public async Task<bool> IsUsernameExistsAsync(string username)
        {
            return await _db.Accounts.AnyAsync(a => a.Username == username);
        }

        public async Task<Account> CreateAccountAsync(Account acc)
        {
            _db.Accounts.Add(acc);
            await _db.SaveChangesAsync();
            return acc;
        }

        public async Task<UserDetail> CreateUserDetailAsync(int accountId)
        {
            var detail = new UserDetail { AccountID = accountId };
            _db.UserDetails.Add(detail);
            await _db.SaveChangesAsync();
            return detail;
        }

        public async Task<Teacher> CreateTeacherAsync(int accountId, string? desc = null, string? cert = null)
        {
            var teacher = new Teacher
            {
                TeacherID = accountId,
                Description = desc,
                CertJson = cert,
                JoinAt = DateTime.UtcNow
            };
            _db.Teachers.Add(teacher);
            await _db.SaveChangesAsync();
            return teacher;
        }

        public async Task UpdateAccountAsync(Account acc)
        {
            _db.Accounts.Update(acc);
            await _db.SaveChangesAsync();
        }

        public async Task<Account?> GetByIdAsync(int id)
        {
            return await _db.Accounts.FindAsync(id);
        }

        // ===== ADMIN DAO =====

        public async Task<List<Account>> GetAllUsersAsync()
        {
            return await _db.Accounts.ToListAsync();
        }

        public async Task<List<Account>> GetAllStudentsAsync()
        {
            return await _db.Accounts
                .Where(a => a.Role == "STUDENT")
                .ToListAsync();
        }

        public async Task<List<Account>> GetAllTeachersAsync()
        {
            return await _db.Accounts
                .Where(a => a.Role == "TEACHER")
                .ToListAsync();
        }

        public async Task<Account?> LockUserAsync(int id)
        {
            var acc = await _db.Accounts.FindAsync(id);
            if (acc == null) return null;
            acc.Status = "LOCKED";
            await _db.SaveChangesAsync();
            return acc;
        }

        public async Task<Account?> UnlockUserAsync(int id)
        {
            var acc = await _db.Accounts.FindAsync(id);
            if (acc == null) return null;
            acc.Status = "ACTIVE";
            await _db.SaveChangesAsync();
            return acc;
        }

        public async Task<List<Account>> SearchUsersAsync(string? keyword, string? role, string? status)
        {
            var query = _db.Accounts.AsQueryable();

            if (!string.IsNullOrWhiteSpace(keyword))
                query = query.Where(u => u.Email.Contains(keyword) || u.Username.Contains(keyword));

            if (!string.IsNullOrWhiteSpace(role))
                query = query.Where(u => u.Role == role);

            if (!string.IsNullOrWhiteSpace(status))
                query = query.Where(u => u.Status == status);

            return await query.ToListAsync();
        }

        public async Task<Account?> AssignRoleAsync(int userId, string newRole)
        {
            var user = await _db.Accounts.FindAsync(userId);
            if (user == null) return null;

            user.Role = newRole;
            await _db.SaveChangesAsync();
            return user;
        }
    }
}
