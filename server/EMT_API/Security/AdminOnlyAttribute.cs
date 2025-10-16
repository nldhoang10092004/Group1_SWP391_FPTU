using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EMT_API.Security
{
    //adminonly attribute
    public class AdminOnlyAttribute : Attribute, IAuthorizationFilter
    {
        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var role = context.HttpContext.User.FindFirstValue(ClaimTypes.Role);
            if (role != "ADMIN")
            {
                context.Result = new ForbidResult(); //403 if error
            }
        }
    }
}
