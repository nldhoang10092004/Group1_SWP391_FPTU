using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EMT_API.Controllers.CourseManagement
{
    [ApiController]                        // Đánh dấu đây là API controller (tự bind, auto 400 nếu ModelState invalid—nếu bật)
    [Route("api/user/course")]
    [Authorize]
    public class CourseController : ControllerBase
    {
    }
}
