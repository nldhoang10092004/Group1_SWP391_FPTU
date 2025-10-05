using EMT_API.Data;
using EMT_API.Models;
using EMT_API.DTOs.Admin;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static EMT_API.Controllers.AuthController;
using EMT_API.Security;
using EMT_API.DTOs.Auth;

namespace EMT_API.Controllers.Admin;
[ApiController]
[Route("api/admin/courses")]
[AdminOnly]

public class CourseManagementController : ControllerBase
{
    private readonly EMTDbContext _db;
}
