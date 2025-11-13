using EMT_API.Data;
using EMT_API.DTOs.Quiz;
using EMT_API.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;

namespace EMT_API.DAOs
{
    public class QuizDAO : IQuizDAO
    {
        private readonly EMTDbContext _db;
        public QuizDAO(EMTDbContext db) => _db = db;

        // =====================================================
        // USER SIDE
        // =====================================================
        public async Task<List<QuizDto>> GetQuizzesByCourseAsync(int courseId)
        {
            return await _db.Quizzes
                .Where(q => q.CourseID == courseId && q.IsActive)
                .Select(q => new QuizDto
                {
                    QuizID = q.QuizID,
                    Title = q.Title,
                    Description = q.Description,
                    QuizType = q.QuizType
                })
                .ToListAsync();
        }

        public async Task<List<QuizDto>> GetGlobalQuizzesAsync()
        {
            return await _db.Quizzes
                .Where(q => q.CourseID == null && q.IsActive)
                .Select(q => new QuizDto
                {
                    QuizID = q.QuizID,
                    Title = q.Title,
                    Description = q.Description,
                    QuizType = q.QuizType
                })
                .ToListAsync();
        }

        public async Task<QuizDetailDto?> GetQuizDetailAsync(int quizId)
        {
            var quiz = await _db.Quizzes
                .Include(q => q.QuestionGroups)
                    .ThenInclude(g => g.Questions)
                        .ThenInclude(qs => qs.Options)
                .Include(q => q.Questions)
                    .ThenInclude(qs => qs.Options)
                .FirstOrDefaultAsync(q => q.QuizID == quizId);

            if (quiz == null) return null;

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
                Groups = quiz.QuestionGroups.Select(g => new QuestionGroupDto
                {
                    GroupID = g.GroupID,
                    Instruction = g.Instruction,
                    Assets = assets.Where(a => a.OwnerType == 1 && a.OwnerID == g.GroupID)
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
                        }).ToList()
                    }).ToList()
                }).ToList()
            };

            return dto;
        }

        public async Task<int> StartQuizAsync(int quizId, int userId)
        {
            var attempt = new Attempt
            {
                QuizID = quizId,
                UserID = userId,
                Status = "IN_PROGRESS"
            };
            _db.Attempts.Add(attempt);
            await _db.SaveChangesAsync();
            return attempt.AttemptID;
        }

        public async Task<decimal?> SubmitQuizAsync(int attemptId, int userId, SubmitQuizRequest request)
        {
            var attempt = await _db.Attempts
                .Include(a => a.Quiz)
                .FirstOrDefaultAsync(a => a.AttemptID == attemptId && a.UserID == userId);

            if (attempt == null) return null;

            decimal total = 0, max = 0;
            foreach (var ans in request.Answers)
            {
                var question = await _db.Questions
                    .Include(q => q.Options)
                    .FirstOrDefaultAsync(q => q.QuestionID == ans.QuestionID);
                if (question == null) continue;

                var answer = new Answer
                {
                    AttemptID = attemptId,
                    QuestionID = question.QuestionID,
                    OptionID = ans.OptionID,
                    AnswerText = ans.AnswerText,
                    AnsweredAt = DateTime.UtcNow
                };

                if (question.QuestionType == 1 && ans.OptionID.HasValue)
                {
                    bool correct = question.Options.Any(o => o.OptionID == ans.OptionID && o.IsCorrect);
                    answer.GradedScore = correct ? question.ScoreWeight : 0;
                    total += answer.GradedScore ?? 0;
                    max += question.ScoreWeight;
                }
                _db.Answers.Add(answer);
            }

            attempt.SubmittedAt = DateTime.UtcNow;
            attempt.Status = "SUBMITTED";
            attempt.AutoScore = max > 0 ? Math.Round(total / max * 100, 2) : (decimal?)null;
            await _db.SaveChangesAsync();

            return attempt.AutoScore;
        }

        public async Task<List<object>> GetAttemptHistoryAsync(int userId)
        {
            return await _db.Attempts
                .Include(a => a.Quiz)
                .Where(a => a.UserID == userId)
                .OrderByDescending(a => a.StartedAt)
                .Select(a => new
                {
                    a.AttemptID,
                    a.QuizID,
                    a.Quiz.Title,
                    a.StartedAt,
                    a.SubmittedAt,
                    a.Status,
                    a.AutoScore
                } as object)
                .ToListAsync();
        }

        // =====================================================
        // TEACHER SIDE (chỉ tóm lược)
        // =====================================================
        public async Task<bool> TeacherOwnsCourseAsync(int teacherId, int courseId)
            => await _db.Courses.AnyAsync(c => c.CourseID == courseId && c.TeacherID == teacherId);

        public async Task<bool> TeacherOwnsQuizAsync(int teacherId, int quizId)
            => await _db.Quizzes.Include(q => q.Course)
                    .AnyAsync(q => q.QuizID == quizId && q.Course.TeacherID == teacherId);

        public async Task<int> CreateQuizAsync(int courseId, string title, string? desc, byte quizType)
        {
            var quiz = new Quiz { CourseID = courseId, Title = title, Description = desc, QuizType = quizType };
            _db.Quizzes.Add(quiz);
            await _db.SaveChangesAsync();
            return quiz.QuizID;
        }

        public async Task<bool> UpdateQuizAsync(int quizId, string? title, string? desc, int quizType, bool? active)
        {
            var quiz = await _db.Quizzes.FindAsync(quizId);
            if (quiz == null) return false;
            quiz.Title = title ?? quiz.Title;
            quiz.Description = desc ?? quiz.Description;
            quiz.QuizType = (byte)(quizType > 0 ? quizType : quiz.QuizType);
            if (active.HasValue) quiz.IsActive = active.Value;
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteQuizAsync(int quizId)
        {
            var quiz = await _db.Quizzes.FirstOrDefaultAsync(q => q.QuizID == quizId);
            if (quiz == null) return false;
            _db.Quizzes.Remove(quiz);
            await _db.SaveChangesAsync();
            return true;
        }

        // ImportQuizAsync tương tự controller (để refactor sau)
        public async Task<bool> ImportQuizAsync(int quizId, ImportQuizRequest payload)
        {
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
                    await _db.SaveChangesAsync(); // cần GroupID cho FK

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
                            await _db.SaveChangesAsync(); // cần QuestionID cho FK

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
                return true;
            }
            catch (Exception)
            {
                await tx.RollbackAsync();
                return false;
            }
        }


        // =====================================================
        // ADMIN SIDE
        // =====================================================
        public async Task<List<QuizDto>> GetAllGlobalQuizzesAsync()
        {
            return await _db.Quizzes
                .Where(q => q.CourseID == null)
                .Select(q => new QuizDto
                {
                    QuizID = q.QuizID,
                    Title = q.Title,
                    Description = q.Description,
                    QuizType = q.QuizType
                }).ToListAsync();
        }

        public async Task<QuizDetailDto?> GetGlobalQuizDetailAsync(int quizId)
        {
            return await GetQuizDetailAsync(quizId);
        }

        public async Task<int> CreateGlobalQuizAsync(string title, string? description, byte quizType)
        {
            var quiz = new Quiz
            {
                CourseID = null,
                Title = title,
                Description = description,
                QuizType = quizType,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            _db.Quizzes.Add(quiz);
            await _db.SaveChangesAsync();
            return quiz.QuizID;
        }

        public async Task<bool> DeleteGlobalQuizAsync(int quizId)
        {
            return await DeleteQuizAsync(quizId);
        }

        public async Task<bool> ImportGlobalQuizAsync(int quizId, ImportQuizRequest request)
        {
            return await ImportQuizAsync(quizId, request);
        }

        public async Task<bool> UpdateGlobalQuizAsync(int quizId, UpdateQuizRequest req)
        {
            var quiz = await _db.Quizzes.FirstOrDefaultAsync(q => q.QuizID == quizId);
            if (quiz == null) return false;
            quiz.Title = req.Title ?? quiz.Title;
            quiz.Description = req.Description ?? quiz.Description;
            if (!string.IsNullOrWhiteSpace(req.QuizType) && byte.TryParse(req.QuizType, out var qt))
                quiz.QuizType = qt;
            if (req.IsActive.HasValue) quiz.IsActive = req.IsActive.Value;
            await _db.SaveChangesAsync();
            return true;
        }

        //Attemp
        public async Task<List<object>> GetAttemptsAsync(string role, int userId)
        {
            IQueryable<Attempt> query = _db.Attempts
                .Include(a => a.Quiz)
                .ThenInclude(q => q.Course)
                .AsNoTracking();

            role = role.ToUpper();

            if (role == "STUDENT")
            {
                query = query.Where(a =>
                    a.UserID == userId &&
                    a.Status.ToLower() == "submitted" &&
                    a.SubmittedAt != null);
            }
            else if (role == "TEACHER")
            {
                query = query.Where(a =>
                    a.Status.ToLower() == "submitted" &&
                    a.SubmittedAt != null &&
                    a.Quiz.Course != null &&
                    a.Quiz.Course.TeacherID == userId);
            }
            else if (role == "ADMIN")
            {
                query = query.Where(a =>
                    a.Status.ToLower() == "submitted" &&
                    a.SubmittedAt != null &&
                    a.Quiz.CourseID == null);
            }
            else
            {
                return new List<object>(); // không hỗ trợ role khác
            }

            return await query
                .OrderByDescending(a => a.SubmittedAt)
                .Select(a => new
                {
                    a.AttemptID,
                    a.QuizID,
                    QuizTitle = a.Quiz.Title,
                    a.SubmittedAt,
                    a.AutoScore,
                    a.Status,
                    StudentID = a.UserID,
                    Course = a.Quiz.Course != null ? a.Quiz.Course.CourseName : null
                } as object)
                .ToListAsync();
        }

    }
}
