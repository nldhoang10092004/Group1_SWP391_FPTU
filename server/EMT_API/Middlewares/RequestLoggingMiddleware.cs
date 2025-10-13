using EMT_API.Data;
using EMT_API.Models;
using System.Security.Claims;

namespace EMT_API.Middlewares
{
    public class RequestLoggingMiddleware
    {
        private readonly RequestDelegate _next;

        public RequestLoggingMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        //Logger
        public async Task InvokeAsync(HttpContext context, EMTDbContext db)
        {
      
            var log = new RequestLog
            {
                Path = context.Request.Path.Value ?? "",
                IP = context.Connection.RemoteIpAddress?.ToString(),
                CreatedAt = DateTime.UtcNow
            };

            if (context.User.Identity?.IsAuthenticated == true)
            {
                var id = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (int.TryParse(id, out int userId)) log.ActorID = userId;
            }

            db.RequestLogs.Add(log);
            await db.SaveChangesAsync();
           
            await _next(context);
        }
    }
}
