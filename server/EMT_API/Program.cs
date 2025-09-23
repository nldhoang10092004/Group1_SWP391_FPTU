using EMT_API.Data;
using Microsoft.EntityFrameworkCore;

namespace EMT_API
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services
            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            // DbContext
            builder.Services.AddDbContext<EMTDbContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            // ===== CORS =====
            const string MyCors = "_myCors";
            builder.Services.AddCors(options =>
            {
                options.AddPolicy(MyCors, p => p
                    .WithOrigins("http://localhost:3000", "https://localhost:3000")
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials()
                );
            });

            // Nếu bạn dùng auth thật, mở hai dòng này (và config scheme)
            // builder.Services.AddAuthentication(/*...*/);
            // builder.Services.AddAuthorization();

            var app = builder.Build();

            // Swagger chỉ cho môi trường Dev
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            // Để ngoài block Dev để redirect HTTPS ổn định (FE gọi https)
            app.UseHttpsRedirection();

            // ===== THỨ TỰ QUAN TRỌNG =====
            app.UseRouting();        // 1) Routing
            app.UseCors(MyCors);     // 2) CORS nằm giữa Routing và MapControllers

            // Nếu có auth:
            // app.UseAuthentication(); // 3) AuthN trước
            app.UseAuthorization();   // 4) AuthZ sau

            app.MapControllers();     // 5) Map endpoints

            app.Run();
        }
    }
}
