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

namespace EMT_API.Controllers.Admin;
[ApiController]
[Route("api/admin/users")]
[Authorize(Roles = "ADMIN")]
public class UserManagementController : ControllerBase
{
    private readonly EMTDbContext _db;  
    public UserManagementController(EMTDbContext db) => _db = db;

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

    [HttpPost("student")]
    public async Task<IActionResult> CreateStudent([FromBody] CreateCustomerRequest req)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // Kiểm tra trùng Email
        if (await _db.Accounts.AnyAsync(a => a.Email == req.Email))
            return Conflict(new { message = "Email already exists!" });

        // Kiểm tra trùng Username
        if (await _db.Accounts.AnyAsync(a => a.Username == req.Username))
            return Conflict(new { message = "Username already exists!" });

        var acc = new Account
        {
            Email = req.Email.Trim(),
            Username = req.Username.Trim(),
            Hashpass = PasswordHasher.Hash(req.Password),
            Role = "STUDENT",
            Status = "ACTIVE",
            CreateAt = DateTime.UtcNow
        };

        _db.Accounts.Add(acc);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Student account created successfully!",
            account = new
            {
                acc.AccountID,
                acc.Username,
                acc.Email,
                acc.Role,
                acc.Status
            }
        });
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
    [HttpPut("{id}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> UpdateUserAccount(int id, [FromBody] UpdateUserAccountRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var user = await _db.Accounts.FindAsync(id);
        if (user == null)
            return NotFound($"User với ID {id} không tồn tại.");

        // Cập nhật những trường được gửi lên (nếu không null hoặc không rỗng)
        if (!string.IsNullOrEmpty(request.Role))
            user.Role = request.Role;
        if (!string.IsNullOrEmpty(request.Status))
            user.Status = request.Status;
        if (!string.IsNullOrEmpty(request.FullName))
            user.Username = request.FullName;
        // Thêm cập nhật cho các trường khác nếu có

        await _db.SaveChangesAsync();
        return Ok(user);
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

    [HttpPost("create-teacher")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> CreateTeacher([FromBody] CreateTeacherRequest req)
    {
        // Kiểm tra email trùng
        if (await _db.Accounts.AnyAsync(a => a.Email == req.Email))
            return Conflict(new { message = "Email already exists!" });

        // 1️⃣ Tạo tài khoản giáo viên (Account)
        var acc = new Account
        {
            Email = req.Email,
            Username = req.Username,
            Hashpass = PasswordHasher.Hash(req.Password),
            Role = "TEACHER",
            Status = "ACTIVE",
            CreateAt = DateTime.UtcNow
        };

        _db.Accounts.Add(acc);
        await _db.SaveChangesAsync(); // Lưu để có AccountID

        // 2️⃣ Tạo thông tin trong bảng Teacher
        var teacher = new Teacher
        {
            TeacherID = acc.AccountID,       // Liên kết 1-1 với Account
            Description = req.Description ?? string.Empty,
            JoinAt = DateTime.UtcNow,
            CertJson = req.CertJson ?? "{}" // Dữ liệu chứng chỉ JSON rỗng nếu không có
        };
        _db.Teachers.Add(teacher);

        // 3️⃣ Tạo bản ghi rỗng trong UserDetail
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

        // Lưu tất cả
        await _db.SaveChangesAsync();

        // 4️⃣ Trả kết quả chuẩn
        return Ok(new
        {
            message = "Teacher created successfully!",
            teacherId = teacher.TeacherID,
            account = new
            {
                acc.AccountID,
                acc.Username,
                acc.Email,
                acc.Role,
                acc.Status
            }
        });
    }
}

