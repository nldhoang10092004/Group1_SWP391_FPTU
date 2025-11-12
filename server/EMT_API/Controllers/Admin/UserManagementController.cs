using EMT_API.DTOs.Admin;
using EMT_API.DTOs.Auth;
using EMT_API.Models;
using EMT_API.Security;
using EMT_API.DAOs.UserDAO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EMT_API.Controllers.AdminSide;

[ApiController]
[Route("api/admin/users")]
[Authorize(Roles = "ADMIN")]
public class UserManagementController : ControllerBase
{
    private readonly IUserDAO _dao;

    public UserManagementController(IUserDAO dao)
    {
        _dao = dao;
    }

    // ---------------------------
    // CREATE USER (Admin tạo thủ công)
    // ---------------------------
    [HttpPost("create")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest req)
    {
        var validRoles = new[] { "STUDENT", "TEACHER", "ADMIN" };
        if (!validRoles.Contains(req.Role.ToUpper()))
            return BadRequest(new { message = "Invalid role! Must be STUDENT, TEACHER, or ADMIN." });

        if (await _dao.IsEmailExistsAsync(req.Email))
            return Conflict(new { message = "Email already exists!" });

        var acc = new Account
        {
            Email = req.Email,
            Username = req.Username,
            Hashpass = PasswordHasher.Hash(req.Password),
            Role = req.Role.ToUpper(),
            Status = "ACTIVE",
            CreateAt = DateTime.UtcNow
        };

        await _dao.CreateAccountAsync(acc);

        // Nếu là STUDENT hoặc TEACHER → tạo UserDetail
        if (req.Role.Equals("STUDENT", StringComparison.OrdinalIgnoreCase) ||
            req.Role.Equals("TEACHER", StringComparison.OrdinalIgnoreCase))
        {
            await _dao.CreateUserDetailAsync(acc.AccountID);
        }

        // Nếu là TEACHER → tạo Teacher record
        if (req.Role.Equals("TEACHER", StringComparison.OrdinalIgnoreCase))
        {
            await _dao.CreateTeacherAsync(acc.AccountID, req.Description, req.CertJson);
        }

        return Ok(new
        {
            message = "User created successfully!",
            accountId = acc.AccountID,
            username = acc.Username,
            email = acc.Email,
            role = acc.Role
        });
    }

    // ---------------------------
    // GET ALL USERS
    // ---------------------------
    [HttpGet]
    public async Task<IActionResult> GetAllUser()
    {
        var users = await _dao.GetAllUsersAsync();
        var data = users.Select(a => new
        {
            a.AccountID,
            a.Email,
            a.Username,
            a.Role,
            a.Status
        });
        return Ok(new { data });
    }

    // ---------------------------
    // GET STUDENTS ONLY
    // ---------------------------
    [HttpGet("students")]
    public async Task<IActionResult> GetAllStudents()
    {
        var students = await _dao.GetAllStudentsAsync();
        return Ok(students.Select(a => new
        {
            a.AccountID,
            a.Username,
            a.Email,
            a.Role,
            a.Status
        }));
    }

    // ---------------------------
    // GET TEACHERS ONLY
    // ---------------------------
    [HttpGet("teachers")]
    public async Task<IActionResult> GetAllTeachers()
    {
        var teachers = await _dao.GetAllTeachersAsync();
        return Ok(teachers.Select(a => new
        {
            a.AccountID,
            a.Username,
            a.Email,
            a.Role,
            a.Status
        }));
    }

    // ---------------------------
    // LOCK USER
    // ---------------------------
    [HttpPut("{id}/lock")]
    public async Task<IActionResult> LockUser(int id)
    {
        var acc = await _dao.LockUserAsync(id);
        if (acc == null)
            return NotFound("User not found!");

        return Ok(new { message = "Account locked successfully!" });
    }

    // ---------------------------
    // UNLOCK USER
    // ---------------------------
    [HttpPut("{id}/unlock")]
    public async Task<IActionResult> UnlockUser(int id)
    {
        var acc = await _dao.UnlockUserAsync(id);
        if (acc == null)
            return NotFound("User not found!");

        return Ok(new { message = "Account activated successfully!" });
    }

    // ---------------------------
    // SEARCH USERS (optional filters)
    // ---------------------------
    [HttpGet("search")]
    public async Task<IActionResult> SearchUsers([FromQuery] string? q, [FromQuery] string? role, [FromQuery] string? status)
    {
        var results = await _dao.SearchUsersAsync(q, role, status);
        return Ok(results.Select(u => new
        {
            u.AccountID,
            u.Username,
            u.Email,
            u.Role,
            u.Status
        }));
    }

    // ---------------------------
    // ASSIGN ROLE
    // ---------------------------
    [HttpPost("assign-role")]
    public async Task<IActionResult> AssignUserRole([FromBody] AssignRoleRequest req)
    {
        var validRoles = new[] { "ADMIN", "TEACHER", "STUDENT" };
        if (!validRoles.Contains(req.Role.ToUpper()))
            return BadRequest(new { message = "Invalid role. Role must be ADMIN, TEACHER, or STUDENT." });

        var user = await _dao.AssignRoleAsync(req.UserId, req.Role.ToUpper());
        if (user == null)
            return NotFound(new { message = "User not found." });

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
