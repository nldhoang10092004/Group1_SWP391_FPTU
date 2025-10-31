using Microsoft.AspNetCore.Mvc;

namespace EMT_API.Controllers.Admin
{
    public class ScoreController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
