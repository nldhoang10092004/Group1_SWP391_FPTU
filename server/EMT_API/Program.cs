using EMT_API.Data;
using EMT_API.Middlewares;
using EMT_API.Security; // để dùng TokenService
using EMT_API.Services;
using EMT_API.Utils;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Reflection;
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
            builder.Services.AddSwaggerGen(c =>
            {
                // 🧩 1. Thông tin mô tả API
                c.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "EMT API",
                    Version = "v1",
                    Description = "English Mastery Training API"
                });

                // 🧩 2. Định nghĩa security scheme Bearer
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    In = ParameterLocation.Header,
                    Description = "Nhập **Bearer {access_token}** vào đây",
                    Name = "Authorization",
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = "Bearer"
                });

                // 🧩 3. Áp dụng scheme cho tất cả endpoint
                c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });

                // (tuỳ chọn) Nếu bạn muốn Swagger đọc XML comment từ code
                var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
                var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
                if (File.Exists(xmlPath))
                    c.IncludeXmlComments(xmlPath);
            });

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

            builder.Services.AddAuthorization(opt =>
            {
                // Map Role claim (phòng trường hợp bạn dùng "role" hay "roles")
                opt.AddPolicy("TeacherOnly", policy =>
                    policy.RequireAuthenticatedUser()
                          .RequireClaim(ClaimTypes.Role, "TEACHER"));
            });

            builder.Services.AddAuthorization(opt =>
            {
                // Map Role claim (phòng trường hợp bạn dùng "role" hay "roles")
                opt.AddPolicy("StudentOnly", policy =>
                    policy.RequireAuthenticatedUser()
                          .RequireClaim(ClaimTypes.Role, "STUDENT"));
            });

            builder.Services.AddAuthorization();

            builder.Services.AddMemoryCache();
            builder.Services.AddSingleton<IOtpService, OtpService>();

            // ===== Token Service (tạo access/refresh token) =====
            builder.Services.AddSingleton<ITokenService, TokenService>();
            builder.Services.AddHttpContextAccessor();

            // Payment Service
            builder.Services.AddHttpClient<PayOSService>();
            builder.Services.AddScoped<PayOSService>();

            //AI Exam Services
            builder.Services.AddScoped<AIWritingService>();
            builder.Services.AddScoped<AISpeakingService>();

            //Google Drive Service
            builder.Services.AddSingleton<GoogleDriveService>();

            //Cloudflare R2 Service
            builder.Services.AddSingleton<CloudflareService>();

            //Json accept /n
            builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Encoder =
            System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping;
    });


            // ===== CORS =====
            const string MyCors = "_myCors";

            builder.Services.AddCors(options =>
            {
                options.AddPolicy(MyCors, policy => policy
                    .WithOrigins(
                        "http://localhost:3000",
                        "https://localhost:3000",
                        "http://localhost:3002",             // 👈 thêm FE port
                        "https://beerier-superlogically-maxwell.ngrok-free.dev" // 👈 và cả domain ngrok
                    )
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials());
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
            app.UseMiddleware<RequestLoggingMiddleware>();
            app.MapControllers();

            app.Run();
        }
    }
}
