using EMT_API.Data;
using EMT_API.DTOs.Admin;
using EMT_API.DTOs.Auth;
using EMT_API.Models;
using EMT_API.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static EMT_API.Controllers.Auth.AuthController;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace EMT_API.Controllers.AdminSide;
[ApiController]
[Route("api/admin/users")]
[Authorize(Roles = "ADMIN")]
public class UserManagementController : ControllerBase
{
    private readonly EMTDbContext _db;  
    public UserManagementController(EMTDbContext db) => _db = db;

    [HttpPost("create")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest req)
    {
        // 1️⃣ Validate role
        var validRoles = new[] { "STUDENT", "TEACHER", "ADMIN" };
        if (!validRoles.Contains(req.Role.ToUpper()))
            return BadRequest(new { message = "Invalid role! Must be STUDENT, TEACHER, or ADMIN." });

        // 2️⃣ Check email trùng
        if (await _db.Accounts.AnyAsync(a => a.Email == req.Email))
            return Conflict(new { message = "Email already exists!" });

        // 3️⃣ Tạo Account
        var acc = new Account
        {
            Email = req.Email,
            Username = req.Username,
            Hashpass = PasswordHasher.Hash(req.Password),
            Role = req.Role.ToUpper(),
            Status = "ACTIVE",
            CreateAt = DateTime.UtcNow
        };

        _db.Accounts.Add(acc);
        await _db.SaveChangesAsync(); // để có AccountID

        // 4️⃣ Nếu là STUDENT hoặc TEACHER → tạo UserDetail
        if (req.Role.Equals("STUDENT", StringComparison.OrdinalIgnoreCase) ||
            req.Role.Equals("TEACHER", StringComparison.OrdinalIgnoreCase))
        {
            var userDetail = new UserDetail
            {
                AccountID = acc.AccountID,
                FullName = null,
                Dob = null,
                Address = null,
                Phone = null,
                AvatarURL = null
            };
            _db.UserDetails.Add(userDetail);
        }

        // 5️⃣ Nếu là TEACHER → tạo Teacher record
        if (req.Role.Equals("TEACHER", StringComparison.OrdinalIgnoreCase))
        {
            var teacher = new Teacher
            {
                TeacherID = acc.AccountID,
                Description = req.Description,
                JoinAt = DateTime.UtcNow,
                CertJson = req.CertJson
            };
            _db.Teachers.Add(teacher);
        }

        await _db.SaveChangesAsync();

        // 6️⃣ Trả về thông tin cơ bản
        return Ok(new
        {
            message = "User created successfully!",
            accountId = acc.AccountID,
            username = acc.Username,
            email = acc.Email,
            role = acc.Role
        });
    }

    [HttpGet]
    public async Task<IActionResult> GetAllUser()
    {
        var users = await _db.Accounts
            .Select(a => new { name = a.AccountID, email = a.Email, username = a.Username, role = a.Role, status = a.Status })
            .ToListAsync();
        var returnWrapper = new { data = users };
        return Ok(returnWrapper);
    }

    //Chỉ hiển thị các tài khoản có role = STUDENT
    [HttpGet("students")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> GetAllStudents()
    {
        var customers = await _db.Accounts
            .Where(a => a.Role == "STUDENT")
            .Select(a => new DisplayUserResponse
            {
                AccountID = a.AccountID,
                Username = a.Username,
                Email = a.Email,
                Role = a.Role,
                Status = a.Status
            })
            .ToListAsync();

        return Ok(customers);
    }

    //Chỉ hiển thị các tài khoản có role = TEACHER
    [HttpGet("teachers")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> GetAllTeachers()
    {
        var teachers = await _db.Accounts
            .Where(a => a.Role == "TEACHER")
            .Select(a => new DisplayUserResponse
            {
                AccountID = a.AccountID,
                Username = a.Username,
                Email = a.Email,
                Role = a.Role,
                Status = a.Status
            })
            .ToListAsync();

        return Ok(teachers);
    }

    [HttpPut("{id}/lock")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> LockUser(int id)
    {
        var acc = await _db.Accounts.FindAsync(id);
        if (acc == null) return NotFound("User not found!");

        if (acc.Status == "LOCKED")
            return BadRequest("This account already locked!");
        acc.Status = "LOCKED";
        await _db.SaveChangesAsync();

        return Ok(new { messsage = "Account is locked!"}); 
    }

    [HttpPut("{id}/unlock")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> UnlockUser(int id)
    {
        var acc = await _db.Accounts.FindAsync(id);
        if (acc == null) return NotFound("User not found!");
        if (acc.Status == "ACTIVE")
            return BadRequest("This account already activate!");
        acc.Status = "ACTIVE";
        await _db.SaveChangesAsync();

        return Ok(new { message = "Account is activate!" });
    }

    [HttpGet("search")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> SearchUsers([FromQuery] string? q, [FromQuery] string? role, [FromQuery] string? status)
    {
        var query = _db.Accounts.AsQueryable();

        if (!string.IsNullOrWhiteSpace(q))
            query = query.Where(u => u.Username.Contains(q) || u.Username.Contains(q));

        if (!string.IsNullOrWhiteSpace(role))
            query = query.Where(u => u.Role == role);

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(u => u.Status == status);

        var results = await query.ToListAsync();

        return Ok(results);
    }

    [HttpPost("assign-role")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> AssignUserRole([FromBody] AssignRoleRequest request)
    {
        var validRoles = new[] { "ADMIN", "TEACHER", "STUDENT" };

        // Kiểm tra role hợp lệ
        if (!validRoles.Contains(request.Role.ToUpper()))
        {
            return BadRequest(new { message = "Invalid role. Role must be ADMIN, TEACHER, or STUDENT." });
        }

        var user = await _db.Accounts.FindAsync(request.UserId);
        if (user == null)
            return NotFound(new { message = "User not found." });

        user.Role = request.Role.ToUpper();
        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Role updated successfully.",
            user = new
            {
                user.AccountID,
                user.Username,
                user.Email,
                user.Role
            }
        });
    }
}

