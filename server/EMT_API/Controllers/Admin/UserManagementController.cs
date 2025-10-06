using EMT_API.Data;
using EMT_API.DTOs.Admin;
using EMT_API.DTOs.Auth;
using EMT_API.Models;
using EMT_API.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static EMT_API.Controllers.AuthController;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace EMT_API.Controllers.Admin;
[ApiController]
[Route("api/admin/users")]
//[AdminOnly]
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
}

