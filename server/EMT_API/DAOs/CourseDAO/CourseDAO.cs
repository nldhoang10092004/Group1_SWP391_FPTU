using EMT_API.Data;
using EMT_API.Models;
using Microsoft.EntityFrameworkCore;

namespace EMT_API.DAOs.CourseDAO
{
    public class CourseDAO : ICourseDAO
    {
        private readonly EMTDbContext _db;

        public CourseDAO(EMTDbContext db)
        {
            _db = db;
        }

        // -------- COURSE BASE --------
        public async Task<List<Course>> GetAllCoursesAsync()
        {
            return await _db.Courses
                .Include(c => c.Teacher)
                    .ThenInclude(t => t.TeacherNavigation)
                        .ThenInclude(u => u.UserDetail)
                .OrderBy(c => c.CourseLevel)
                .ToListAsync();
        }

        public async Task<Course?> GetCourseDetailAsync(int courseId)
        {
            return await _db.Courses
                .Include(c => c.Teacher)
                    .ThenInclude(t => t.TeacherNavigation)
                        .ThenInclude(u => u.UserDetail)
                .Include(c => c.CourseChapters)
                    .ThenInclude(ch => ch.CourseVideos)
                .Include(c => c.Quizzes)
                    .ThenInclude(q => q.Questions)
                .FirstOrDefaultAsync(c => c.CourseID == courseId);
        }

        public async Task<bool> CourseExistsAsync(int courseId)
        {
            return await _db.Courses.AnyAsync(c => c.CourseID == courseId);
        }

        // -------- RATING & FEEDBACK --------
        public async Task<(double AverageRating, int TotalFeedback)> GetCourseRatingAsync(int courseId)
        {
            var data = await _db.Feedbacks
                .Where(f => f.CourseId == courseId && f.IsVisible)
                .GroupBy(f => f.CourseId)
                .Select(g => new { Average = g.Average(f => f.Rating), Total = g.Count() })
                .FirstOrDefaultAsync();

            return data == null ? (0, 0) : (Math.Round(data.Average, 2), data.Total);
        }

        public async Task<List<Feedback>> GetCourseFeedbacksAsync(int courseId)
        {
            return await _db.Feedbacks
                .Where(f => f.CourseId == courseId && f.IsVisible)
                .Include(f => f.User)
                    .ThenInclude(u => u.UserDetail)
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();
        }

        public async Task<Feedback?> CreateFeedbackAsync(Feedback feedback)
        {
            _db.Feedbacks.Add(feedback);
            await _db.SaveChangesAsync();
            return feedback;
        }

        public async Task<bool> HasFeedbackAsync(int courseId, int userId)
        {
            return await _db.Feedbacks.AnyAsync(f => f.CourseId == courseId && f.UserId == userId);
        }

        // -------- TEACHER SIDE --------
        public async Task<List<Course>> GetCoursesByTeacherAsync(int teacherId)
        {
            return await _db.Courses
                .Where(c => c.TeacherID == teacherId)
                .OrderBy(c => c.CourseLevel)
                .ToListAsync();
        }

        public async Task<Course?> CreateCourseAsync(Course course)
        {
            _db.Courses.Add(course);
            await _db.SaveChangesAsync();
            return course;
        }

        public async Task<bool> UpdateCourseAsync(Course course)
        {
            if (!await _db.Courses.AnyAsync(c => c.CourseID == course.CourseID))
                return false;

            _db.Courses.Update(course);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteCourseAsync(int courseId)
        {
            var course = await _db.Courses
                .Include(c => c.CourseChapters)
                    .ThenInclude(ch => ch.CourseVideos)
                .Include(c => c.Quizzes)
                    .ThenInclude(q => q.QuestionGroups)
                        .ThenInclude(g => g.Questions)
                            .ThenInclude(qs => qs.Options)
                .Include(c => c.Requests)
                .FirstOrDefaultAsync(c => c.CourseID == courseId);

            if (course == null) return false;

            // Xóa dữ liệu liên quan
            foreach (var quiz in course.Quizzes)
            {
                foreach (var group in quiz.QuestionGroups)
                {
                    _db.Options.RemoveRange(group.Questions.SelectMany(q => q.Options));
                    _db.Questions.RemoveRange(group.Questions);
                }

                _db.Options.RemoveRange(quiz.Questions.SelectMany(q => q.Options));
                _db.Questions.RemoveRange(quiz.Questions);
                _db.QuestionGroups.RemoveRange(quiz.QuestionGroups);
            }

            _db.Quizzes.RemoveRange(course.Quizzes);
            _db.CourseVideos.RemoveRange(course.CourseChapters.SelectMany(ch => ch.CourseVideos));
            _db.CourseChapters.RemoveRange(course.CourseChapters);
            _db.Requests.RemoveRange(course.Requests);

            _db.Courses.Remove(course);
            await _db.SaveChangesAsync();
            return true;
        }

        // -------- CHAPTER --------
        public async Task<CourseChapter?> AddChapterAsync(CourseChapter chapter)
        {
            _db.CourseChapters.Add(chapter);
            await _db.SaveChangesAsync();
            return chapter;
        }

        public async Task<bool> UpdateChapterAsync(CourseChapter chapter)
        {
            if (!await _db.CourseChapters.AnyAsync(c => c.ChapterID == chapter.ChapterID))
                return false;

            _db.CourseChapters.Update(chapter);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteChapterAsync(int chapterId)
        {
            var chapter = await _db.CourseChapters
                .Include(ch => ch.CourseVideos)
                .FirstOrDefaultAsync(ch => ch.ChapterID == chapterId);

            if (chapter == null) return false;

            _db.CourseVideos.RemoveRange(chapter.CourseVideos);
            _db.CourseChapters.Remove(chapter);
            await _db.SaveChangesAsync();
            return true;
        }

        // -------- VIDEO --------
        public async Task<CourseVideo?> GetVideoAsync(int videoId)
        {
            var video = await _db.CourseVideos.FindAsync(videoId);
            return video;
        }
        public async Task<CourseVideo?> AddVideoAsync(CourseVideo video)
        {
            _db.CourseVideos.Add(video);
            await _db.SaveChangesAsync();
            return video;
        }

        public async Task<bool> DeleteVideoAsync(int videoId)
        {
            var video = await _db.CourseVideos.FindAsync(videoId);
            if (video == null) return false;

            _db.CourseVideos.Remove(video);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
