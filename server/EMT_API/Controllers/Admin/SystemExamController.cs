using Microsoft.AspNetCore.Mvc;

namespace EMT_API.Controllers.Admin
{
    public class SystemExamController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
