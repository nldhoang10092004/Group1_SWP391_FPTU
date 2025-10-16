using EMT_API.Data;
using EMT_API.DTOs.Admin;
using EMT_API.DTOs.Auth;
using EMT_API.Models;
using EMT_API.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static EMT_API.Controllers.Auth.AuthController;

namespace EMT_API.Controllers.Admin;
[ApiController]
[Route("api/admin/courses")]
[Authorize(Roles = "ADMIN")]

public class CourseManagementController : ControllerBase
{
    private readonly EMTDbContext _db;
}
