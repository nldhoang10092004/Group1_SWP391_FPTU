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

    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest req)
    {
        if (await _db.Accounts.AnyAsync(a => a.Email == req.Email))
            return Conflict("Email already exists!");
        var acc = new Account
        {
            Email = req.Email,
            Username = req.Username,
            Hashpass = PasswordHasher.Hash(req.Password),
            Role = req.Role,
            Status = "ACTIVE",
            CreateAt = DateTime.UtcNow
        };

        _db.Accounts.Add(acc);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Account creation successful!" });
    }

    [HttpPut("{id}/lock")]
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
        var user = await _db.Accounts.FindAsync(request.UserId);
        if (user == null)
            return NotFound(new { message = "User not found" });

        user.Role = request.Role;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Role updated successfully." });
    }
}

