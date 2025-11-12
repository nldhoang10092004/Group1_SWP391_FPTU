using EMT_API.Data;
using EMT_API.DTOs.TeacherDTOs;
using EMT_API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;

namespace EMT_API.Controllers.TeacherController
{
    [ApiController]
    [Route("api/teacher/info")]
    public class TeacherInformationController : ControllerBase
    {
        private readonly EMTDbContext _db;
        public TeacherInformationController(EMTDbContext db) => _db = db;

        private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet("{teacherId:int}")]
        public async Task<IActionResult> GetInformation(int teacherId)
        {

            var teacher = await _db.Teachers
                .Include(t => t.TeacherNavigation) // ✅ join đúng với model
                .FirstOrDefaultAsync(t => t.TeacherID == teacherId);

            if (teacher == null)
                return NotFound(new { message = "Teacher not found" });

            // Parse CertJson -> list<string>
            List<string> certs = new();
            if (!string.IsNullOrWhiteSpace(teacher.CertJson))
            {
                try
                {
                    using var doc = JsonDocument.Parse(teacher.CertJson);
                    if (doc.RootElement.TryGetProperty("certs", out var certArray) &&
                        certArray.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var item in certArray.EnumerateArray())
                        {
                            if (item.ValueKind == JsonValueKind.String)
                                certs.Add(item.GetString()!);
                        }
                    }
                }
                catch (JsonException)
                {
                    // Nếu JSON lỗi, bỏ qua
                }
            }

                return Ok(new
            {
                teacher.TeacherID,
                fullName = teacher.TeacherNavigation.Username, // ✅ dùng navigation đúng
                joinAt = teacher.JoinAt,
                description = teacher.Description,
                certs
            });
        }

        [HttpPut]
        [Authorize(Roles = "TEACHER")]
        public async Task<IActionResult> UpdateInformation([FromBody] TeacherUpdateInfoRequest req)
        {
            var uid = GetUserId();
            var teacher = await _db.Teachers.FirstOrDefaultAsync(t => t.TeacherID == uid);
            if (teacher == null)
                return NotFound(new { message = "Teacher not found" });

            if (!string.IsNullOrWhiteSpace(req.Description))
                teacher.Description = req.Description;

            if (req.CertUrls != null && req.CertUrls.Any())
            {
                var certJson = JsonSerializer.Serialize(new { certs = req.CertUrls });
                teacher.CertJson = certJson;
            }

            await _db.SaveChangesAsync();

            return Ok(new
            {
                message = "Teacher information updated successfully",
                teacher.TeacherID,
                teacher.Description,
                teacher.CertJson
            });
        }
    }

}
