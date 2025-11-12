using EMT_API.Data;
using EMT_API.DTOs.Quiz;
using EMT_API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EMT_API.Controllers.AdminSide
{
    [ApiController]
    [Route("api/admin/quiz")]
    [Authorize(Roles = "ADMIN")]
    public class QuizAdminController : ControllerBase
    {
        private readonly EMTDbContext _db;
        public QuizAdminController(EMTDbContext db) => _db = db;

        // ===========================================
        // 1️⃣ Lấy tất cả quiz global (CourseID = null)
        // ===========================================
        [HttpGet]
        public async Task<IActionResult> GetAllGlobalQuizzes()
        {
            var quizzes = await _db.Quizzes
                .Where(q => q.CourseID == null)
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
        // 2️⃣ Xem chi tiết quiz global (bao gồm asset)
        // ===========================================
        [HttpGet("{quizId:int}")]
        public async Task<IActionResult> GetQuizDetail(int quizId)
        {
            var quiz = await _db.Quizzes
                .Include(q => q.QuestionGroups)
                    .ThenInclude(g => g.Questions)
                        .ThenInclude(qs => qs.Options)
                .Include(q => q.Questions)
                    .ThenInclude(qs => qs.Options)
                .FirstOrDefaultAsync(q => q.QuizID == quizId && q.CourseID == null);

            if (quiz == null)
                return NotFound(new { message = "Quiz not found or not global" });

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
                            Content = o.Content,
                            IsCorrect = o.IsCorrect
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
            else
            {
                dto.Groups.Add(new QuestionGroupDto
                {
                    GroupID = 0,
                    Instruction = "Ungrouped questions",
                    Questions = quiz.Questions.Select(q => new QuestionDto
                    {
                        QuestionID = q.QuestionID,
                        Content = q.Content,
                        QuestionType = q.QuestionType,
                        Options = q.Options.Select(o => new OptionDto
                        {
                            OptionID = o.OptionID,
                            Content = o.Content,
                            IsCorrect = o.IsCorrect
                        }).ToList(),
                        Assets = assets
                            .Where(a => a.OwnerType == 2 && a.OwnerID == q.QuestionID)
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
                });
            }

            return Ok(dto);
        }

        // ===========================================
        // 3️⃣ Tạo quiz global (CourseID = null)
        // ===========================================
        [HttpPost]
        public async Task<IActionResult> CreateGlobalQuiz([FromBody] TeacherCreateQuizRequest req)
        {
            var quiz = new EMT_API.Models.Quiz
            {
                CourseID = null,
                Title = req.Title,
                Description = req.Description,
                QuizType = req.QuizType,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _db.Quizzes.Add(quiz);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Global quiz created successfully", quizId = quiz.QuizID });
        }

        // ===========================================
        // 4️⃣ Xóa quiz global và toàn bộ dữ liệu con
        // ===========================================
        [HttpDelete("{quizId:int}")]
        public async Task<IActionResult> DeleteGlobalQuiz(int quizId)
        {
            using var tx = await _db.Database.BeginTransactionAsync();
            try
            {
                var quiz = await _db.Quizzes
                    .Include(q => q.QuestionGroups)
                        .ThenInclude(g => g.Questions)
                    .FirstOrDefaultAsync(q => q.QuizID == quizId && q.CourseID == null);

                if (quiz == null)
                    return NotFound(new { message = "Quiz not found or not global" });

                var gIds = quiz.QuestionGroups.Select(g => g.GroupID).ToList();
                var qIds = quiz.QuestionGroups.SelectMany(g => g.Questions.Select(q => q.QuestionID)).ToList();
                var flatQIds = await _db.Questions
                    .Where(q => q.QuizID == quizId && q.GroupID == null)
                    .Select(q => q.QuestionID)
                    .ToListAsync();

                qIds.AddRange(flatQIds);

                if (qIds.Any())
                    _db.Options.RemoveRange(_db.Options.Where(o => qIds.Contains(o.QuestionID)));

                _db.Assets.RemoveRange(_db.Assets.Where(a =>
                    (a.OwnerType == 1 && gIds.Contains(a.OwnerID)) ||
                    (a.OwnerType == 2 && qIds.Contains(a.OwnerID))));

                if (qIds.Any())
                    _db.Questions.RemoveRange(_db.Questions.Where(q => qIds.Contains(q.QuestionID)));

                if (gIds.Any())
                    _db.QuestionGroups.RemoveRange(_db.QuestionGroups.Where(g => gIds.Contains(g.GroupID)));

                _db.Quizzes.Remove(quiz);
                await _db.SaveChangesAsync();
                await tx.CommitAsync();

                return Ok(new { message = "Global quiz deleted successfully" });
            }
            catch (Exception ex)
            {
                await tx.RollbackAsync();
                return StatusCode(500, new { message = "Delete failed", error = ex.Message });
            }
        }

        // ===========================================
        // 5️⃣ Import nội dung quiz global từ JSON
        // ===========================================
        [HttpPost("{quizId:int}/import")]
        public async Task<IActionResult> ImportGlobalQuiz(int quizId, [FromBody] ImportQuizRequest payload)
        {
            var quiz = await _db.Quizzes.FirstOrDefaultAsync(q => q.QuizID == quizId && q.CourseID == null);
            if (quiz == null)
                return NotFound(new { message = "Quiz not found or not global" });

            using var tx = await _db.Database.BeginTransactionAsync();
            try
            {
                var gIds = await _db.QuestionGroups
                    .Where(g => g.QuizID == quizId)
                    .Select(g => g.GroupID)
                    .ToListAsync();

                var qIds = gIds.Any()
                    ? await _db.Questions.Where(q => q.GroupID.HasValue && gIds.Contains(q.GroupID.Value))
                        .Select(q => q.QuestionID).ToListAsync()
                    : await _db.Questions.Where(q => q.QuizID == quizId && q.GroupID == null)
                        .Select(q => q.QuestionID).ToListAsync();

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
                    await _db.SaveChangesAsync();

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
                            await _db.SaveChangesAsync();

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

                await _db.SaveChangesAsync();
                await tx.CommitAsync();

                return Ok(new { message = "Global quiz imported successfully" });
            }
            catch (Exception ex)
            {
                await tx.RollbackAsync();
                return StatusCode(500, new { message = "Import failed", error = ex.Message });
            }
        }
        // ===========================================
        // 6️⃣ Cập nhật thông tin quiz global
        // ===========================================
        [HttpPut("{quizId:int}")]
        public async Task<IActionResult> UpdateGlobalQuiz(int quizId, [FromBody] UpdateQuizRequest req)
        {
            var quiz = await _db.Quizzes
                .Include(q => q.QuestionGroups)
                    .ThenInclude(g => g.Questions)
                        .ThenInclude(qs => qs.Options)
                .FirstOrDefaultAsync(q => q.QuizID == quizId && q.CourseID == null);

            if (quiz == null)
                return NotFound(new { message = "Quiz not found or not global" });

            // ✅ Cập nhật thông tin cơ bản
            if (!string.IsNullOrWhiteSpace(req.Title))
                quiz.Title = req.Title;

            if (!string.IsNullOrWhiteSpace(req.Description))
                quiz.Description = req.Description;

            if (!string.IsNullOrWhiteSpace(req.QuizType) && byte.TryParse(req.QuizType, out var quizType))
                quiz.QuizType = quizType;

            if (req.IsActive.HasValue)
                quiz.IsActive = req.IsActive.Value;

            // ✅ Cập nhật nhóm và câu hỏi nếu có gửi kèm
            if (req.Groups != null && req.Groups.Any())
            {
                foreach (var g in req.Groups)
                {
                    var existingGroup = quiz.QuestionGroups.FirstOrDefault(x => x.GroupID == g.GroupID);
                    if (existingGroup != null)
                    {
                        if (!string.IsNullOrWhiteSpace(g.Instruction))
                            existingGroup.Instruction = g.Instruction;

                        // ✅ Cập nhật câu hỏi trong group
                        if (g.Questions != null && g.Questions.Any())
                        {
                            foreach (var q in g.Questions)
                            {
                                var existingQ = existingGroup.Questions.FirstOrDefault(x => x.QuestionID == q.QuestionID);
                                if (existingQ != null)
                                {
                                    if (!string.IsNullOrWhiteSpace(q.Content))
                                        existingQ.Content = q.Content;
                                    if (!string.IsNullOrWhiteSpace(q.QuestionType) && byte.TryParse(q.QuestionType, out var qType))
                                        existingQ.QuestionType = qType;

                                    if (q.Options != null && q.Options.Any())
                                    {
                                        foreach (var o in q.Options)
                                        {
                                            var existingOpt = existingQ.Options.FirstOrDefault(x => x.OptionID == o.OptionID);
                                            if (existingOpt != null)
                                            {
                                                if (!string.IsNullOrWhiteSpace(o.Content))
                                                    existingOpt.Content = o.Content;
                                                if (o.IsCorrect.HasValue)
                                                    existingOpt.IsCorrect = o.IsCorrect.Value;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            quiz.CreatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return Ok(new { message = "Quiz updated successfully", quizId = quiz.QuizID });
        }
    }
}
