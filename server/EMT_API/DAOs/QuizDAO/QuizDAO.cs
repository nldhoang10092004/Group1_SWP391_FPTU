using EMT_API.Data;
using EMT_API.DTOs.Quiz;
using EMT_API.DTOs.TeacherQuiz;
using EMT_API.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EMT_API.DAOs
{
    public class QuizDAO : IQuizDAO
    {
        private readonly EMTDbContext _db;
        public QuizDAO(EMTDbContext db)
        {
            _db = db;
        }

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

            questionIds.AddRange(
                quiz.Questions
                .Where(q => q.GroupID == null)
                .Select(q => q.QuestionID)
            );

            var assets = await _db.Assets
                .Where(a =>
                    (a.OwnerType == 1 && groupIds.Contains(a.OwnerID)) ||
                    (a.OwnerType == 2 && questionIds.Contains(a.OwnerID))
                )
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

            // Lấy danh sách câu hỏi thuộc quiz
            var quizQuestions = await _db.Questions
                .Where(q => q.QuizID == attempt.QuizID)
                .Include(q => q.Options)
                .ToListAsync();

            if (!quizQuestions.Any())
            {
                attempt.SubmittedAt = DateTime.UtcNow;
                attempt.Status = "SUBMITTED";
                attempt.AutoScore = 0;
                await _db.SaveChangesAsync();
                return 0;
            }

            decimal perQuestion = 100m / quizQuestions.Count;
            decimal totalScore = 0;

            foreach (var ans in request.Answers)
            {
                var question = quizQuestions.FirstOrDefault(q => q.QuestionID == ans.QuestionID);
                if (question == null) continue;

                bool correct = false;

                if (question.QuestionType == 1 && ans.OptionID.HasValue)
                {
                    correct = question.Options.Any(o =>
                        o.OptionID == ans.OptionID &&
                        o.IsCorrect
                    );
                }

                var answer = new Answer
                {
                    AttemptID = attemptId,
                    QuestionID = question.QuestionID,
                    OptionID = ans.OptionID,
                    AnswerText = ans.AnswerText,
                    AnsweredAt = DateTime.UtcNow,
                    GradedScore = correct ? perQuestion : 0
                };

                if (correct)
                    totalScore += perQuestion;

                _db.Answers.Add(answer);
            }

            attempt.SubmittedAt = DateTime.UtcNow;
            attempt.Status = "SUBMITTED";
            attempt.AutoScore = Math.Round(totalScore, 2);

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
        // TEACHER SIDE — QUIZ BASE CRUD
        // =====================================================
        public async Task<bool> TeacherOwnsCourseAsync(int teacherId, int courseId)
        {
            return await _db.Courses
                .AnyAsync(c => c.CourseID == courseId && c.TeacherID == teacherId);
        }

        public async Task<bool> TeacherOwnsQuizAsync(int teacherId, int quizId)
        {
            return await _db.Quizzes
                .Include(q => q.Course)
                .AnyAsync(q => q.QuizID == quizId && q.Course.TeacherID == teacherId);
        }

        public async Task<int> CreateQuizAsync(int courseId, string title, string? description, byte quizType)
        {
            var quiz = new Quiz
            {
                CourseID = courseId,
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

        public async Task<bool> UpdateQuizAsync(int quizId, string? title, string? description, int quizType, bool? isActive)
        {
            var quiz = await _db.Quizzes.FindAsync(quizId);
            if (quiz == null) return false;

            quiz.Title = title ?? quiz.Title;
            quiz.Description = description ?? quiz.Description;
            if (quizType > 0) quiz.QuizType = (byte)quizType;
            if (isActive.HasValue) quiz.IsActive = isActive.Value;

            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteQuizAsync(int quizId)
        {
            using var tx = await _db.Database.BeginTransactionAsync();
            try
            {
                await CascadeDeleteQuizContent(quizId);

                var quiz = await _db.Quizzes.FindAsync(quizId);
                if (quiz != null)
                    _db.Quizzes.Remove(quiz);

                await _db.SaveChangesAsync();
                await tx.CommitAsync();
                return true;
            }
            catch
            {
                await tx.RollbackAsync();
                return false;
            }
        }

        // =====================================================
        // PRIVATE: CASCADE DELETE CONTENT (NO QUIZ DELETE)
        // =====================================================
        private async Task CascadeDeleteQuizContent(int quizId)
        {
            var groups = await _db.QuestionGroups
                .Where(g => g.QuizID == quizId)
                .Select(g => g.GroupID)
                .ToListAsync();

            var questions = await _db.Questions
                .Where(q => q.QuizID == quizId)
                .Select(q => q.QuestionID)
                .ToListAsync();

            var attempts = await _db.Attempts
                .Where(a => a.QuizID == quizId)
                .Select(a => a.AttemptID)
                .ToListAsync();

            if (attempts.Any())
            {
                _db.Answers.RemoveRange(_db.Answers.Where(a => attempts.Contains(a.AttemptID)));
                _db.Attempts.RemoveRange(_db.Attempts.Where(a => attempts.Contains(a.AttemptID)));
            }

            if (questions.Any())
            {
                _db.Options.RemoveRange(_db.Options.Where(o => questions.Contains(o.QuestionID)));
                _db.Assets.RemoveRange(_db.Assets.Where(a => a.OwnerType == 2 && questions.Contains(a.OwnerID)));
                _db.Questions.RemoveRange(_db.Questions.Where(q => questions.Contains(q.QuestionID)));
            }

            if (groups.Any())
            {
                _db.Assets.RemoveRange(_db.Assets.Where(a => a.OwnerType == 1 && groups.Contains(a.OwnerID)));
                _db.QuestionGroups.RemoveRange(_db.QuestionGroups.Where(g => groups.Contains(g.GroupID)));
            }

            await _db.SaveChangesAsync();
        }
        // =====================================================
        // GROUP CRUD
        // =====================================================
        public async Task<int> CreateGroupAsync(int quizId, CreateGroupRequest req)
        {
            var group = new QuestionGroup
            {
                QuizID = quizId,
                Instruction = req.Instruction,
                GroupType = req.GroupType,
                GroupOrder = req.GroupOrder
            };

            _db.QuestionGroups.Add(group);
            await _db.SaveChangesAsync();
            return group.GroupID;
        }

        public async Task<bool> UpdateGroupAsync(int groupId, UpdateGroupRequest req)
        {
            var group = await _db.QuestionGroups.FindAsync(groupId);
            if (group == null) return false;

            if (req.Instruction != null)
                group.Instruction = req.Instruction;

            if (req.GroupType.HasValue)
                group.GroupType = req.GroupType.Value;

            if (req.GroupOrder.HasValue)
                group.GroupOrder = req.GroupOrder.Value;

            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteGroupAsync(int groupId)
        {
            // tìm group
            var group = await _db.QuestionGroups.FindAsync(groupId);
            if (group == null) return false;

            // 1) lấy question của group
            var questionIds = await _db.Questions
                .Where(q => q.GroupID == groupId)
                .Select(q => q.QuestionID)
                .ToListAsync();

            // 2) xoá option
            if (questionIds.Any())
            {
                _db.Options.RemoveRange(
                    _db.Options.Where(o => questionIds.Contains(o.QuestionID))
                );
            }

            // 3) xoá assets (của question)
            if (questionIds.Any())
            {
                _db.Assets.RemoveRange(
                    _db.Assets.Where(a => a.OwnerType == 2 && questionIds.Contains(a.OwnerID))
                );
            }

            // 4) xoá question
            if (questionIds.Any())
            {
                _db.Questions.RemoveRange(
                    _db.Questions.Where(q => questionIds.Contains(q.QuestionID))
                );
            }

            // 5) xoá assets của group
            _db.Assets.RemoveRange(
                _db.Assets.Where(a => a.OwnerType == 1 && a.OwnerID == groupId)
            );

            // 6) xoá group
            _db.QuestionGroups.Remove(group);

            await _db.SaveChangesAsync();
            return true;
        }

        // =====================================================
        // QUESTION CRUD
        // =====================================================
        public async Task<int> CreateQuestionAsync(int groupId, CreateQuestionRequest req)
        {
            // Lấy QuizID từ Group
            var quizId = await _db.QuestionGroups
                .Where(g => g.GroupID == groupId)
                .Select(g => g.QuizID)
                .FirstOrDefaultAsync();

            if (quizId == 0)
                throw new Exception("Group not found");

            var question = new Question
            {
                QuizID = quizId,
                GroupID = groupId,
                Content = req.Content,
                QuestionType = req.QuestionType,
                QuestionOrder = req.QuestionOrder,
                ScoreWeight = req.ScoreWeight,
                MetaJson = req.MetaJson
            };

            _db.Questions.Add(question);
            await _db.SaveChangesAsync();
            return question.QuestionID;
        }

        public async Task<bool> UpdateQuestionAsync(int questionId, UpdateQuestionRequest req)
        {
            var question = await _db.Questions.FindAsync(questionId);
            if (question == null) return false;

            if (req.Content != null)
                question.Content = req.Content;

            if (req.QuestionType.HasValue)
                question.QuestionType = req.QuestionType.Value;

            if (req.QuestionOrder.HasValue)
                question.QuestionOrder = req.QuestionOrder.Value;

            if (req.ScoreWeight.HasValue)
                question.ScoreWeight = req.ScoreWeight.Value;

            if (req.MetaJson != null)
                question.MetaJson = req.MetaJson;

            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteQuestionAsync(int questionId)
        {
            var question = await _db.Questions.FindAsync(questionId);
            if (question == null) return false;

            // 1) xoá options
            _db.Options.RemoveRange(
                _db.Options.Where(o => o.QuestionID == questionId)
            );

            // 2) xoá assets của question
            _db.Assets.RemoveRange(
                _db.Assets.Where(a => a.OwnerType == 2 && a.OwnerID == questionId)
            );

            // 3) xoá chính câu hỏi
            _db.Questions.Remove(question);

            await _db.SaveChangesAsync();
            return true;
        }
        // =====================================================
        // OPTION CRUD
        // =====================================================

        public async Task<int> CreateOptionAsync(int questionId, CreateOptionRequest req)
        {
            // Kiểm tra question có tồn tại không
            var exists = await _db.Questions.AnyAsync(q => q.QuestionID == questionId);
            if (!exists)
                throw new Exception("Question not found");

            var option = new Option
            {
                QuestionID = questionId,
                Content = req.Content,
                IsCorrect = req.IsCorrect
            };

            _db.Options.Add(option);
            await _db.SaveChangesAsync();
            return option.OptionID;
        }

        public async Task<bool> UpdateOptionAsync(int optionId, UpdateOptionRequest req)
        {
            var option = await _db.Options.FindAsync(optionId);
            if (option == null) return false;

            if (req.Content != null)
                option.Content = req.Content;

            if (req.IsCorrect.HasValue)
                option.IsCorrect = req.IsCorrect.Value;

            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteOptionAsync(int optionId)
        {
            var option = await _db.Options.FindAsync(optionId);
            if (option == null) return false;

            _db.Options.Remove(option);
            await _db.SaveChangesAsync();
            return true;
        }
        // =====================================================
        // ASSET CRUD
        // =====================================================

        public async Task<int> CreateAssetForGroupAsync(int groupId, CreateAssetRequest req)
        {
            var exists = await _db.QuestionGroups.AnyAsync(g => g.GroupID == groupId);
            if (!exists)
                throw new Exception("Group not found");

            var asset = new Asset
            {
                OwnerType = 1,
                OwnerID = groupId,
                AssetType = req.AssetType,
                Url = req.Url,
                ContentText = req.ContentText,
                Caption = req.Caption,
                MimeType = req.MimeType
            };

            _db.Assets.Add(asset);
            await _db.SaveChangesAsync();
            return asset.AssetID;
        }

        public async Task<int> CreateAssetForQuestionAsync(int questionId, CreateAssetRequest req)
        {
            var exists = await _db.Questions.AnyAsync(q => q.QuestionID == questionId);
            if (!exists)
                throw new Exception("Question not found");

            var asset = new Asset
            {
                OwnerType = 2,
                OwnerID = questionId,
                AssetType = req.AssetType,
                Url = req.Url,
                ContentText = req.ContentText,
                Caption = req.Caption,
                MimeType = req.MimeType
            };

            _db.Assets.Add(asset);
            await _db.SaveChangesAsync();
            return asset.AssetID;
        }

        public async Task<bool> DeleteAssetAsync(int assetId)
        {
            var asset = await _db.Assets.FindAsync(assetId);
            if (asset == null) return false;

            _db.Assets.Remove(asset);
            await _db.SaveChangesAsync();
            return true;
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
                })
                .ToListAsync();
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

        public async Task<bool> UpdateGlobalQuizAsync(int quizId, UpdateQuizRequest req)
        {
            var quiz = await _db.Quizzes.FindAsync(quizId);
            if (quiz == null) return false;

            if (req.Title != null)
                quiz.Title = req.Title;

            if (req.Description != null)
                quiz.Description = req.Description;

            if (!string.IsNullOrWhiteSpace(req.QuizType) &&
                byte.TryParse(req.QuizType, out var qt))
                quiz.QuizType = qt;

            if (req.IsActive.HasValue)
                quiz.IsActive = req.IsActive.Value;

            await _db.SaveChangesAsync();
            return true;
        }

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
