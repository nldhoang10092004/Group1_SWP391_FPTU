using Microsoft.AspNetCore.Mvc;

namespace EMT_API.Controllers.Quiz
{
    [Route("api/user/quiz")]

    public class QuizController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
