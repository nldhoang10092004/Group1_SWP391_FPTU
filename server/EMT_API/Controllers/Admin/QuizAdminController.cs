using EMT_API.DAOs;
using EMT_API.DTOs.Quiz;
using EMT_API.DTOs.TeacherQuiz;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace EMT_API.Controllers.AdminSide
{
    [ApiController]
    [Route("api/admin/quiz")]
    [Authorize(Roles = "ADMIN")]
    public class QuizAdminController : ControllerBase
    {
        private readonly IQuizDAO _quizDao;

        public QuizAdminController(IQuizDAO quizDao)
        {
            _quizDao = quizDao;
        }

        // =====================================================
        // GLOBAL QUIZ CRUD (CourseID = null)
        // =====================================================

        [HttpGet]
        public async Task<IActionResult> GetAllGlobalQuizzes()
        {
            var quizzes = await _quizDao.GetAllGlobalQuizzesAsync();
            return Ok(quizzes);
        }

        [HttpGet("{quizId:int}")]
        public async Task<IActionResult> GetQuizDetail(int quizId)
        {
            var quiz = await _quizDao.GetGlobalQuizDetailAsync(quizId);
            return quiz != null ? Ok(quiz) : NotFound();
        }

        [HttpPost]
        public async Task<IActionResult> CreateGlobalQuiz([FromBody] TeacherCreateQuizRequest req)
        {
            var quizId = await _quizDao.CreateGlobalQuizAsync(req.Title, req.Description, req.QuizType);
            return Ok(new { message = "Global quiz created", quizId });
        }

        [HttpPut("{quizId:int}")]
        public async Task<IActionResult> UpdateGlobalQuiz(int quizId, [FromBody] UpdateQuizRequest req)
        {
            var ok = await _quizDao.UpdateGlobalQuizAsync(quizId, req);
            return ok ? Ok(new { message = "Global quiz updated" }) : NotFound();
        }

        [HttpDelete("{quizId:int}")]
        public async Task<IActionResult> DeleteGlobalQuiz(int quizId)
        {
            var ok = await _quizDao.DeleteGlobalQuizAsync(quizId);
            return ok ? Ok(new { message = "Global quiz deleted" }) : NotFound();
        }

        // =====================================================
        // GROUP CRUD (GLOBAL)
        // =====================================================

        [HttpPost("{quizId:int}/group")]
        public async Task<IActionResult> CreateGroup(int quizId, [FromBody] CreateGroupRequest req)
        {
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
        // QUESTION CRUD (GLOBAL)
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
        // OPTION CRUD (GLOBAL)
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
        // ASSET CRUD (GLOBAL)
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
