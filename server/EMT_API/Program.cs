using EMT_API.Data;
using EMT_API.Security; // để dùng TokenService
using EMT_API.Utils;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;

namespace EMT_API
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // ===== Add Core Services =====
            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            // ===== Database =====
            builder.Services.AddDbContext<EMTDbContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            // ===== JWT Authentication =====
            var jwt = builder.Configuration.GetSection("Jwt");
            var key = Encoding.UTF8.GetBytes(jwt["Key"]!);

            builder.Services
                .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = jwt["Issuer"],
                        ValidAudience = jwt["Audience"],
                        IssuerSigningKey = new SymmetricSecurityKey(key),
                        ClockSkew = TimeSpan.FromSeconds(30)
                    };
                });

            // 🔐 Thêm Authorization + Policy “AdminOnly”
            builder.Services.AddAuthorization(opt =>
            {
                // Map Role claim (phòng trường hợp bạn dùng "role" hay "roles")
                opt.AddPolicy("AdminOnly", policy =>
                    policy.RequireAuthenticatedUser()
                          .RequireClaim(ClaimTypes.Role, "ADMIN"));
            });

            builder.Services.AddAuthorization();



            // ===== Token Service (tạo access/refresh token) =====
            builder.Services.AddSingleton<ITokenService, TokenService>();
            builder.Services.AddHttpContextAccessor();

            // ===== CORS =====
            const string MyCors = "_myCors";
            builder.Services.AddCors(options =>
            {
                options.AddPolicy(MyCors, policy => policy
                    .WithOrigins("http://localhost:3000", "https://localhost:3000")
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials()
                );
            });

            // ===== Email Sender =====
            builder.Services.Configure<EmailSetting>(builder.Configuration.GetSection("EmailSettings"));
            builder.Services.AddSingleton<EmailSender>();

            var app = builder.Build();

            // ===== Swagger =====
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            // ===== Middlewares =====
            app.UseHttpsRedirection();

            app.UseStaticFiles();
            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = new PhysicalFileProvider(
                    Path.Combine(Directory.GetCurrentDirectory(), "avatars")),
                RequestPath = "/avatars"
            });

            app.UseRouting();
            app.UseCors(MyCors);

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
