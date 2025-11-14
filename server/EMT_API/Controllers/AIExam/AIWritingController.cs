using EMT_API.Data;
using EMT_API.DTOs.AIWriting;
using EMT_API.Models;
using EMT_API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using EMT_API.Utils;
using EMT_API.DAOs.MembershipDAO;
namespace EMT_API.Controllers.AI
{
    [ApiController]
    [Route("api/user/ai-writing")]
    [Authorize(Roles = "STUDENT")]
    public class AIWritingController : ControllerBase
    {
        private readonly IMembershipDAO _db;
        private readonly AIWritingService _ai;

        public AIWritingController(IMembershipDAO db, AIWritingService ai)
        {
            _db = db;
            _ai = ai;
        }

        private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);


        [HttpPost("generate")]
        public async Task<ActionResult<AIWritingPromptResponse>> GeneratePrompt()
        {
            bool hasMembership = await _db.HasActiveMembershipAsync(GetUserId());
            if (!hasMembership)
                return StatusCode(403, new { message = "Membership required or expired." });
            var (title, content) = await _ai.GenerateWritingPromptAsync();
            return Ok(new AIWritingPromptResponse
            {
                Title = title,
                Content = content
            });
        }

        [HttpPost("submit")]
        public async Task<ActionResult<AIWritingFeedbackResponse>> Submit([FromBody] AIWritingSubmitRequest req)
        {
            bool hasMembership = await _db.HasActiveMembershipAsync(GetUserId());

            if (!hasMembership)
                return StatusCode(403, new { message = "Membership required or expired." });
            if (req == null || string.IsNullOrWhiteSpace(req.AnswerText))
                return BadRequest("AnswerText cannot be empty.");
            if (string.IsNullOrWhiteSpace(req.PromptContent))
                return BadRequest("Missing AI-generated generated question.");

            // Gọi AI chấm điểm
            var (overall, task, coherence, lexical, grammar, feedback) =
                await _ai.GradeWritingAsync(req.AnswerText);

            return Ok(new AIWritingFeedbackResponse
            {
                Score = overall,
                TaskResponse = task,
                Coherence = coherence,
                LexicalResource = lexical,
                Grammar = grammar,
                Feedback = feedback
            });
        }


    }
}
