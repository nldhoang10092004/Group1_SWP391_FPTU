using EMT_API.Data;
using EMT_API.DTOs.Quiz;
using EMT_API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Security.Claims;

namespace EMT_API.Controllers.Teacher
{
    [ApiController]
    [Route("api/teacher/quiz")]
    [Authorize(Roles = "TEACHER")]
    public class TeacherQuizController : ControllerBase
    {
        private readonly EMTDbContext _db;
        public TeacherQuizController(EMTDbContext db) => _db = db;

        private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // ✅ Check quyền sở hữu course
        private async Task<bool> EnsureTeacherOwnsCourse(int courseId)
        {
            var uid = GetUserId();
            return await _db.Courses.AsNoTracking()
                .AnyAsync(c => c.CourseID == courseId && c.TeacherID == uid);
        }

        // ✅ Check quyền sở hữu quiz
        private async Task<bool> EnsureTeacherOwnsQuiz(int quizId)
        {
            var uid = GetUserId();
            return await _db.Quizzes
                .Include(q => q.Course)
                .AnyAsync(q => q.QuizID == quizId && q.Course.TeacherID == uid);
        }

        // ===========================================
        // 🔹 1️⃣ Lấy danh sách quiz theo course (teacher)
        // ===========================================
        [HttpGet("course/{courseId:int}")]
        public async Task<IActionResult> GetQuizzesByCourse(int courseId)
        {
            if (!await EnsureTeacherOwnsCourse(courseId))
                return Forbid();

            var quizzes = await _db.Quizzes
                .Where(q => q.CourseID == courseId)
                .Select(q => new QuizDto
                {
                    QuizID = q.QuizID,
                    Title = q.Title,
                    Description = q.Description,
                    QuizType = q.QuizType
                })
                .ToListAsync();

            return Ok(quizzes);
        }

        // ===========================================
        // 🔹 2️⃣ Lấy chi tiết quiz (giống student, nhưng không cần check membership)
        // ===========================================
        [HttpGet("{quizId:int}")]
        public async Task<IActionResult> GetQuizDetail(int quizId)
        {
            if (!await EnsureTeacherOwnsQuiz(quizId))
                return Forbid();

            var quiz = await _db.Quizzes
                .Include(q => q.QuestionGroups)
                    .ThenInclude(g => g.Questions)
                        .ThenInclude(qs => qs.Options)
                .Include(q => q.Questions)
                    .ThenInclude(qs => qs.Options)
                .FirstOrDefaultAsync(q => q.QuizID == quizId);

            if (quiz == null)
                return NotFound(new { message = "Quiz not found" });

            // Lấy asset tương tự student
            var groupIds = quiz.QuestionGroups.Select(g => g.GroupID).ToList();
            var questionIds = quiz.QuestionGroups.SelectMany(g => g.Questions.Select(q => q.QuestionID)).ToList();

            var assets = await _db.Assets
                .Where(a => (a.OwnerType == 1 && groupIds.Contains(a.OwnerID))
                         || (a.OwnerType == 2 && questionIds.Contains(a.OwnerID)))
                .ToListAsync();

            var dto = new QuizDetailDto
            {
                QuizID = quiz.QuizID,
                Title = quiz.Title,
                Description = quiz.Description,
                Groups = new List<QuestionGroupDto>()
            };

            if (quiz.QuestionGroups.Any())
            {
                dto.Groups = quiz.QuestionGroups.Select(g => new QuestionGroupDto
                {
                    GroupID = g.GroupID,
                    Instruction = g.Instruction,
                    Assets = assets
                        .Where(a => a.OwnerType == 1 && a.OwnerID == g.GroupID)
                        .Select(a => new AssetDto
                        {
                            AssetID = a.AssetID,
                            AssetType = a.AssetType,
                            Url = a.Url,
                            ContentText = a.ContentText,
                            Caption = a.Caption,
                            MimeType = a.MimeType
                        }).ToList(),
                    Questions = g.Questions.Select(qs => new QuestionDto
                    {
                        QuestionID = qs.QuestionID,
                        Content = qs.Content,
                        QuestionType = qs.QuestionType,
                        Options = qs.Options.Select(o => new OptionDto
                        {
                            OptionID = o.OptionID,
                            Content = o.Content
                        }).ToList(),
                        Assets = assets
                            .Where(a => a.OwnerType == 2 && a.OwnerID == qs.QuestionID)
                            .Select(a => new AssetDto
                            {
                                AssetID = a.AssetID,
                                AssetType = a.AssetType,
                                Url = a.Url,
                                ContentText = a.ContentText,
                                Caption = a.Caption,
                                MimeType = a.MimeType
                            }).ToList()
                    }).ToList()
                }).ToList();
            }

            return Ok(dto);
        }

        // ===========================================
        // 🔹 3️⃣ Tạo quiz mới (teacher tạo trong course của mình)
        // ===========================================
        [HttpPost]
        public async Task<IActionResult> CreateQuiz([FromBody] CreateQuizRequest req)
        {
            if (!await EnsureTeacherOwnsCourse(req.CourseID))
                return Forbid();

            var quiz = new EMT_API.Models.Quiz
            {
                CourseID = req.CourseID,
                Title = req.Title,
                Description = req.Description,
                QuizType = req.QuizType,      // 1=Listening, 2=Reading, 3=Writing, 4=Speaking
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _db.Quizzes.Add(quiz);
            await _db.SaveChangesAsync();

            return Ok(new
            {
                message = "Quiz created successfully",
                quizId = quiz.QuizID
            });
        }

        // ===========================================
        // 🔹 4️⃣ Xoá quiz (và toàn bộ dữ liệu con)
        // ===========================================
        [HttpDelete("{quizId:int}")]
        public async Task<IActionResult> DeleteQuiz(int quizId)
        {
            if (!await EnsureTeacherOwnsQuiz(quizId))
                return Forbid();

            using var tx = await _db.Database.BeginTransactionAsync();
            try
            {
                var quiz = await _db.Quizzes
                    .Include(q => q.QuestionGroups)
                        .ThenInclude(g => g.Questions)
                    .FirstOrDefaultAsync(q => q.QuizID == quizId);

                if (quiz == null)
                    return NotFound(new { message = "Quiz not found" });

                // Lấy danh sách GroupID và QuestionID để xoá phụ thuộc
                var gIds = quiz.QuestionGroups.Select(g => g.GroupID).ToList();
                var qIds = quiz.QuestionGroups
                    .SelectMany(g => g.Questions.Select(q => q.QuestionID))
                    .ToList();

                // Nếu quiz có câu hỏi rời (không group)
                var flatQIds = await _db.Questions
                    .Where(q => q.QuizID == quizId && q.GroupID == null)
                    .Select(q => q.QuestionID)
                    .ToListAsync();
                qIds.AddRange(flatQIds);

                // Xoá Options
                if (qIds.Any())
                    _db.Options.RemoveRange(_db.Options.Where(o => qIds.Contains(o.QuestionID)));

                // Xoá Assets
                _db.Assets.RemoveRange(_db.Assets.Where(a =>
                    (a.OwnerType == 1 && gIds.Contains(a.OwnerID)) ||
                    (a.OwnerType == 2 && qIds.Contains(a.OwnerID))));

                // Xoá Questions
                if (qIds.Any())
                    _db.Questions.RemoveRange(_db.Questions.Where(q => qIds.Contains(q.QuestionID)));

                // Xoá Groups
                if (gIds.Any())
                    _db.QuestionGroups.RemoveRange(_db.QuestionGroups.Where(g => gIds.Contains(g.GroupID)));

                // Cuối cùng xoá Quiz
                _db.Quizzes.Remove(quiz);

                await _db.SaveChangesAsync();
                await tx.CommitAsync();

                return Ok(new { message = "Quiz deleted successfully" });
            }
            catch (Exception ex)
            {
                await tx.RollbackAsync();
                return StatusCode(500, new { message = "Delete failed", error = ex.Message });
            }
        }


        [HttpPost("{quizId:int}/import")]
        public async Task<IActionResult> ImportQuiz(int quizId, [FromBody] ImportQuizRequest payload)
        {
            if (!await EnsureTeacherOwnsQuiz(quizId))
                return Forbid();

            using var tx = await _db.Database.BeginTransactionAsync();
            try
            {
                // 1️⃣ Xóa dữ liệu cũ (groups/questions/options/assets)
                var gIds = await _db.QuestionGroups
                    .Where(g => g.QuizID == quizId)
                    .Select(g => g.GroupID)
                    .ToListAsync();

                var qIds = gIds.Any()
                    ? await _db.Questions
                        .Where(q => q.GroupID.HasValue && gIds.Contains(q.GroupID.Value))
                        .Select(q => q.QuestionID)
                        .ToListAsync()
                    : await _db.Questions
                        .Where(q => q.QuizID == quizId && q.GroupID == null)
                        .Select(q => q.QuestionID)
                        .ToListAsync();

                if (qIds.Any())
                    _db.Options.RemoveRange(_db.Options.Where(o => qIds.Contains(o.QuestionID)));

                _db.Assets.RemoveRange(_db.Assets.Where(a =>
                    (a.OwnerType == 1 && gIds.Contains(a.OwnerID)) ||
                    (a.OwnerType == 2 && qIds.Contains(a.OwnerID))));

                if (gIds.Any())
                    _db.Questions.RemoveRange(_db.Questions.Where(q => q.GroupID.HasValue && gIds.Contains(q.GroupID.Value)));
                else
                    _db.Questions.RemoveRange(_db.Questions.Where(q => q.QuizID == quizId && q.GroupID == null));

                if (gIds.Any())
                    _db.QuestionGroups.RemoveRange(_db.QuestionGroups.Where(g => g.QuizID == quizId));

                await _db.SaveChangesAsync();

                // 2️⃣ Import lại dữ liệu từ payload
                foreach (var g in payload.Groups)
                {
                    var group = new QuestionGroup
                    {
                        QuizID = quizId,
                        Instruction = g.Instruction,
                        GroupType = g.GroupType,
                        GroupOrder = g.GroupOrder
                    };
                    _db.QuestionGroups.Add(group);
                    await _db.SaveChangesAsync(); // Giữ lại 1 lần ở đây để có GroupID (bắt buộc vì cần FK)

                    // Assets của Group
                    if (g.Assets?.Any() == true)
                    {
                        _db.Assets.AddRange(g.Assets.Select(a => new Asset
                        {
                            OwnerType = 1,
                            OwnerID = group.GroupID,
                            AssetType = a.AssetType,
                            Url = a.Url,
                            ContentText = a.ContentText,
                            Caption = a.Caption,
                            MimeType = a.MimeType
                        }));
                    }

                    // Câu hỏi
                    if (g.Questions?.Any() == true)
                    {
                        foreach (var q in g.Questions)
                        {
                            var question = new Question
                            {
                                QuizID = quizId,
                                GroupID = group.GroupID,
                                Content = q.Content,
                                QuestionType = q.QuestionType,
                                QuestionOrder = q.QuestionOrder,
                                ScoreWeight = q.ScoreWeight,
                                MetaJson = q.MetaJson
                            };
                            _db.Questions.Add(question);
                            await _db.SaveChangesAsync(); // giữ lại 1 lần để lấy QuestionID

                            if (q.Options?.Any() == true)
                            {
                                _db.Options.AddRange(q.Options.Select(o => new Option
                                {
                                    QuestionID = question.QuestionID,
                                    Content = o.Content,
                                    IsCorrect = o.IsCorrect
                                }));
                            }

                            if (q.Assets?.Any() == true)
                            {
                                _db.Assets.AddRange(q.Assets.Select(a => new Asset
                                {
                                    OwnerType = 2,
                                    OwnerID = question.QuestionID,
                                    AssetType = a.AssetType,
                                    Url = a.Url,
                                    ContentText = a.ContentText,
                                    Caption = a.Caption,
                                    MimeType = a.MimeType
                                }));
                            }
                        }
                    }
                }

                // ✅ Lưu toàn bộ còn lại (options + assets)
                await _db.SaveChangesAsync();
                await tx.CommitAsync();

                return Ok(new { message = "Quiz saved successfully" });
            }
            catch (Exception ex)
            {
                await tx.RollbackAsync();
                return StatusCode(500, new { message = "Import failed", error = ex.Message });
            }
        }


    }
}
