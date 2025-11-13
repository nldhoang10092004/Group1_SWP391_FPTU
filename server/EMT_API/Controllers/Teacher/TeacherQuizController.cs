using EMT_API.DAOs;
using EMT_API.DTOs.TeacherQuiz;
using EMT_API.DTOs.Quiz;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

namespace EMT_API.Controllers.TeacherSide
{
    [ApiController]
    [Route("api/teacher/quiz")]
    [Authorize(Roles = "TEACHER")]
    public class TeacherQuizController : ControllerBase
    {
        private readonly IQuizDAO _quizDao;

        public TeacherQuizController(IQuizDAO quizDao)
        {
            _quizDao = quizDao;
        }

        private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // =====================================================
        // QUIZ CRUD
        // =====================================================

        [HttpGet("course/{courseId:int}")]
        public async Task<IActionResult> GetQuizzesByCourse(int courseId)
        {
            var teacherId = GetUserId();
            if (!await _quizDao.TeacherOwnsCourseAsync(teacherId, courseId))
                return Forbid();

            var quizzes = await _quizDao.GetQuizzesByCourseAsync(courseId);
            return Ok(quizzes);
        }

        [HttpGet("{quizId:int}")]
        public async Task<IActionResult> GetQuizDetail(int quizId)
        {
            var teacherId = GetUserId();
            if (!await _quizDao.TeacherOwnsQuizAsync(teacherId, quizId))
                return Forbid();

            var quiz = await _quizDao.GetQuizDetailAsync(quizId);
            return quiz != null ? Ok(quiz) : NotFound();
        }

        [HttpPost]
        public async Task<IActionResult> CreateQuiz([FromBody] TeacherCreateQuizRequest req)
        {
            var teacherId = GetUserId();
            if (!await _quizDao.TeacherOwnsCourseAsync(teacherId, req.CourseID))
                return Forbid();

            var quizId = await _quizDao.CreateQuizAsync(req.CourseID, req.Title, req.Description, req.QuizType);
            return Ok(new { message = "Quiz created successfully", quizId });
        }

        [HttpPut("{quizId:int}")]
        public async Task<IActionResult> UpdateQuiz(int quizId, [FromBody] TeacherUpdateQuizRequest req)
        {
            var teacherId = GetUserId();
            if (!await _quizDao.TeacherOwnsQuizAsync(teacherId, quizId))
                return Forbid();

            var ok = await _quizDao.UpdateQuizAsync(quizId, req.Title, req.Description, req.QuizType, req.IsActive);
            return ok ? Ok(new { message = "Quiz updated successfully" }) : NotFound();
        }

        [HttpDelete("{quizId:int}")]
        public async Task<IActionResult> DeleteQuiz(int quizId)
        {
            var teacherId = GetUserId();
            if (!await _quizDao.TeacherOwnsQuizAsync(teacherId, quizId))
                return Forbid();

            var ok = await _quizDao.DeleteQuizAsync(quizId);
            return ok ? Ok(new { message = "Quiz deleted successfully" }) : NotFound();
        }


        // =====================================================
        // GROUP CRUD
        // =====================================================

        [HttpPost("{quizId:int}/group")]
        public async Task<IActionResult> CreateGroup(int quizId, [FromBody] CreateGroupRequest req)
        {
            var teacherId = GetUserId();
            if (!await _quizDao.TeacherOwnsQuizAsync(teacherId, quizId))
                return Forbid();

            var id = await _quizDao.CreateGroupAsync(quizId, req);
            return Ok(new { message = "Group created", groupId = id });
        }

        [HttpPut("group/{groupId:int}")]
        public async Task<IActionResult> UpdateGroup(int groupId, [FromBody] UpdateGroupRequest req)
        {
            var ok = await _quizDao.UpdateGroupAsync(groupId, req);
            return ok ? Ok(new { message = "Group updated" }) : NotFound();
        }

        [HttpDelete("group/{groupId:int}")]
        public async Task<IActionResult> DeleteGroup(int groupId)
        {
            var ok = await _quizDao.DeleteGroupAsync(groupId);
            return ok ? Ok(new { message = "Group deleted" }) : NotFound();
        }


        // =====================================================
        // QUESTION CRUD
        // =====================================================

        [HttpPost("group/{groupId:int}/question")]
        public async Task<IActionResult> CreateQuestion(int groupId, [FromBody] CreateQuestionRequest req)
        {
            var id = await _quizDao.CreateQuestionAsync(groupId, req);
            return Ok(new { message = "Question created", questionId = id });
        }

        [HttpPut("question/{questionId:int}")]
        public async Task<IActionResult> UpdateQuestion(int questionId, [FromBody] UpdateQuestionRequest req)
        {
            var ok = await _quizDao.UpdateQuestionAsync(questionId, req);
            return ok ? Ok(new { message = "Question updated" }) : NotFound();
        }

        [HttpDelete("question/{questionId:int}")]
        public async Task<IActionResult> DeleteQuestion(int questionId)
        {
            var ok = await _quizDao.DeleteQuestionAsync(questionId);
            return ok ? Ok(new { message = "Question deleted" }) : NotFound();
        }


        // =====================================================
        // OPTION CRUD
        // =====================================================

        [HttpPost("question/{questionId:int}/option")]
        public async Task<IActionResult> CreateOption(int questionId, [FromBody] CreateOptionRequest req)
        {
            var id = await _quizDao.CreateOptionAsync(questionId, req);
            return Ok(new { message = "Option created", optionId = id });
        }

        [HttpPut("option/{optionId:int}")]
        public async Task<IActionResult> UpdateOption(int optionId, [FromBody] UpdateOptionRequest req)
        {
            var ok = await _quizDao.UpdateOptionAsync(optionId, req);
            return ok ? Ok(new { message = "Option updated" }) : NotFound();
        }

        [HttpDelete("option/{optionId:int}")]
        public async Task<IActionResult> DeleteOption(int optionId)
        {
            var ok = await _quizDao.DeleteOptionAsync(optionId);
            return ok ? Ok(new { message = "Option deleted" }) : NotFound();
        }


        // =====================================================
        // ASSET CRUD
        // =====================================================

        [HttpPost("group/{groupId:int}/asset")]
        public async Task<IActionResult> CreateAssetForGroup(int groupId, [FromBody] CreateAssetRequest req)
        {
            var id = await _quizDao.CreateAssetForGroupAsync(groupId, req);
            return Ok(new { message = "Asset created", assetId = id });
        }

        [HttpPost("question/{questionId:int}/asset")]
        public async Task<IActionResult> CreateAssetForQuestion(int questionId, [FromBody] CreateAssetRequest req)
        {
            var id = await _quizDao.CreateAssetForQuestionAsync(questionId, req);
            return Ok(new { message = "Asset created", assetId = id });
        }

        [HttpDelete("asset/{assetId:int}")]
        public async Task<IActionResult> DeleteAsset(int assetId)
        {
            var ok = await _quizDao.DeleteAssetAsync(assetId);
            return ok ? Ok(new { message = "Asset deleted" }) : NotFound();
        }
    }
}
