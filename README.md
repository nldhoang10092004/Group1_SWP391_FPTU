# English Mastery Training (EMT) Platform

Hệ thống học tiếng Anh trực tuyến với mô hình membership-based, cung cấp các khóa học từ nền tảng đến chuyên sâu.

## 📋 Mục lục

- [Tổng quan dự án](#tổng-quan-dự-án)
- [Backend - Chi tiết](#backend---chi-tiết)
  - [Công nghệ sử dụng](#công-nghệ-sử-dụng)
  - [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
  - [Cấu trúc thư mục](#cấu-trúc-thư-mục)
  - [Database Schema](#database-schema)
  - [API Endpoints](#api-endpoints)
  - [Authentication & Authorization](#authentication--authorization)
  - [Các dịch vụ tích hợp](#các-dịch-vụ-tích-hợp)
  - [Cấu hình môi trường](#cấu-hình-môi-trường)
  - [Hướng dẫn cài đặt và chạy](#hướng-dẫn-cài-đặt-và-chạy)
- [Frontend](#frontend)
- [Database](#database)
- [Deployment](#deployment)

## 🎯 Tổng quan dự án

EMT Platform là một hệ thống e-learning chuyên sâu cho việc học tiếng Anh, bao gồm:

- **Membership-based model**: Người dùng đăng ký gói membership để truy cập toàn bộ nội dung
- **4 cấp độ khóa học**: Nền tảng → Cơ bản → Trung cấp → Chuyên sâu
- **Quản lý đa cấp**: Admin, Teacher, Student
- **Tính năng đầy đủ**: Video bài giảng, Quiz, Payment, Email notification, Profile management

---

## 🔧 Backend - Chi tiết

### Công nghệ sử dụng

| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| **ASP.NET Core** | 8.0 | Web API Framework |
| **Entity Framework Core** | 9.0.9 | ORM - Database Access |
| **SQL Server** | - | Database |
| **JWT Bearer** | 8.0.20 | Authentication |
| **Swagger/OpenAPI** | 6.6.2 | API Documentation |
| **Docker** | - | Containerization |

### Kiến trúc hệ thống

Backend sử dụng kiến trúc **Clean Architecture** với phân tách rõ ràng các layer:

```
┌─────────────────────────────────────────────────────────────┐
│                      Presentation Layer                      │
│                    (Controllers + DTOs)                       │
├─────────────────────────────────────────────────────────────┤
│                      Business Logic Layer                     │
│                   (Services + Security)                       │
├─────────────────────────────────────────────────────────────┤
│                       Data Access Layer                       │
│                  (Models + DbContext + Data)                  │
├─────────────────────────────────────────────────────────────┤
│                      Infrastructure Layer                     │
│              (Middlewares + Utils + External APIs)            │
└─────────────────────────────────────────────────────────────┘
```

### Cấu trúc thư mục

```
server/EMT_API/
│
├── Controllers/              # API Controllers - Xử lý HTTP requests
│   ├── Admin/               # Admin management endpoints
│   │   ├── UserManagementController.cs    # Quản lý người dùng
│   │   └── CourseManagementController.cs  # Quản lý khóa học
│   ├── Auth/                # Authentication endpoints
│   │   └── AuthController.cs              # Register, Login, Logout, Refresh Token
│   ├── Payment/             # Payment processing
│   │   └── PaymentController.cs           # PayOS integration, Webhooks
│   ├── Profile/             # User profile management
│   │   └── ProfileController.cs           # Get/Update profile, Avatar upload
│   └── Public/              # Public endpoints (no auth required)
│       ├── CourseController.cs            # Public course listing
│       └── PlanController.cs              # Subscription plans
│
├── DTOs/                     # Data Transfer Objects
│   ├── Admin/               # Admin-specific DTOs
│   │   ├── CreateUserRequest.cs
│   │   ├── UpdateUserAccountRequest.cs
│   │   └── AssignRoleRequest.cs
│   ├── Auth/                # Authentication DTOs
│   │   ├── RegisterRequest.cs
│   │   ├── LoginRequest.cs
│   │   ├── AuthResponse.cs
│   │   ├── ForgotPasswordRequest.cs
│   │   ├── ResetPasswordRequest.cs
│   │   └── SendOtpRequest.cs
│   ├── Profile/             # Profile management DTOs
│   │   ├── UpdateUserDetailRequest.cs
│   │   ├── ChangePasswordRequest.cs
│   │   └── AvatarUploadRequest.cs
│   └── Public/
│       └── CourseDtos.cs    # Public course data structures
│
├── Models/                   # Database Entity Models
│   ├── Account.cs           # User account (Username, Email, Role, Status)
│   ├── Account.Auth.cs      # Auth-related properties (RefreshToken, etc.)
│   ├── UserDetail.cs        # User profile details (FullName, DOB, Address, Avatar)
│   ├── Teacher.cs           # Teacher-specific data (Certificates, Description)
│   ├── Course.cs            # Course information
│   ├── CourseChapter.cs     # Course chapters
│   ├── CourseVideo.cs       # Video lessons
│   ├── Quiz.cs              # Quizzes
│   ├── Question.cs          # Quiz questions
│   ├── Option.cs            # Question options
│   ├── Answer.cs            # User answers
│   ├── Attempt.cs           # Quiz attempts
│   ├── SubscriptionPlan.cs  # Membership plans
│   ├── UserMembership.cs    # User subscriptions
│   ├── PaymentOrder.cs      # Payment transactions
│   ├── WebhookEvent.cs      # Payment webhook logs
│   └── Request.cs           # System requests/logs
│
├── Data/                     # Database Context
│   └── EMTDbContext.cs      # EF Core DbContext configuration
│
├── Security/                 # Security & Authentication
│   ├── TokenService.cs      # JWT Token generation & validation
│   ├── PasswordHasher.cs    # Password hashing (BCrypt)
│   ├── OtpService.cs        # OTP generation & verification
│   ├── ResetPasswordTokenService.cs  # Password reset tokens
│   └── AdminOnlyAttribute.cs         # Custom authorization attribute
│
├── Services/                 # Business Logic Services
│   ├── PayOSService.cs      # Payment gateway integration
│   └── EmailSender.cs       # Email service (SMTP)
│
├── Middlewares/              # Custom Middlewares
│   └── RequestLoggingMiddleware.cs  # Log all HTTP requests
│
├── Utils/                    # Utility classes
│   └── (Helper classes)
│
├── Program.cs               # Application entry point & configuration
├── appsettings.json         # Configuration file
├── appsettings.Development.json
├── Dockerfile               # Docker container configuration
└── EMT_API.csproj          # Project file
```

### Database Schema

#### Core Tables (User Management)

**Account** - Thông tin tài khoản cơ bản
```sql
- AccountID (PK, Identity)
- Username (Unique)
- Email (Unique)
- Hashpass (BCrypt hashed)
- Role (STUDENT | TEACHER | ADMIN)
- Status (ACTIVE | LOCKED)
- CreateAt
- RefreshToken, RefreshExpiry (for JWT)
- GoogleSub (Google OAuth)
```

**UserDetail** - Thông tin chi tiết người dùng (1-1 với Account)
```sql
- AccountID (PK, FK)
- FullName
- Dob (Date of Birth)
- Address
- Phone
- AvatarURL
```

**Teacher** - Thông tin giảng viên (1-1 với Account)
```sql
- TeacherID (PK, FK = AccountID)
- Description
- JoinAt
- CertJson (JSON array chứng chỉ)
```

#### Course Structure

**Course** - Khóa học
```sql
- CourseID (PK)
- TeacherID (FK)
- CourseName
- Description
- CourseLevel (1-4: Nền tảng → Chuyên sâu)
- CreateAt
```

**CourseChapter** - Chương học
```sql
- ChapterID (PK)
- CourseID (FK)
- ChapterName
```

**CourseVideo** - Video bài giảng
```sql
- VideoID (PK)
- ChapterID (FK)
- VideoName
- VideoURL
- IsPreview (cho phép xem không cần membership)
```

#### Quiz System

**Quiz** - Bài kiểm tra
```sql
- QuizID (PK)
- CourseID (FK)
- QuizName
- PassScore
- TimeLimit
```

**Question**, **Option**, **Answer**, **Attempt** - Câu hỏi, đáp án, kết quả

#### Membership & Payment

**SubscriptionPlan** - Gói membership
```sql
- PlanID (PK)
- PlanName
- PlanPrice
- DurationDays
- Description
```

**UserMembership** - Membership của user
```sql
- MembershipID (PK)
- AccountID (FK)
- PlanID (FK)
- StartDate, EndDate
- Status (ACTIVE | EXPIRED)
```

**PaymentOrder** - Đơn hàng thanh toán
```sql
- OrderID (PK)
- AccountID (FK)
- PlanID (FK)
- Amount
- Status (PENDING | PAID | FAILED)
- PaymentMethod, TransactionID
```

### API Endpoints

#### 🔓 Public Endpoints (No Authentication)

**Authentication**
```
POST   /api/auth/register          # Đăng ký tài khoản mới
POST   /api/auth/registerTeacher   # Đăng ký giáo viên
POST   /api/auth/login             # Đăng nhập
POST   /api/auth/send-otp          # Gửi OTP qua email
POST   /api/auth/forgot-password   # Quên mật khẩu
POST   /api/auth/reset-password    # Reset mật khẩu
```

**Public Course Information**
```
GET    /api/public/course          # Danh sách khóa học
GET    /api/public/course/{id}     # Chi tiết khóa học (chỉ preview)
GET    /api/public/plan            # Danh sách gói membership
```

#### 🔐 Authenticated Endpoints

**Auth Management**
```
POST   /api/auth/refresh           # Refresh access token (dùng refresh token trong cookie)
POST   /api/auth/logout            # Đăng xuất (xóa refresh token)
```

**User Profile** (Requires: Any authenticated user)
```
GET    /api/user/profile/detail    # Lấy thông tin profile
PUT    /api/user/profile/detail    # Cập nhật thông tin
GET    /api/user/profile/avatar    # Lấy URL avatar
PUT    /api/user/profile/avatar    # Upload avatar (multipart/form-data)
```

**Payment** (Requires: STUDENT role)
```
POST   /api/payment/create         # Tạo link thanh toán PayOS
POST   /api/payment/webhook        # PayOS webhook callback (AllowAnonymous)
```

#### 👑 Admin Only Endpoints (Requires: ADMIN role)

**User Management**
```
GET    /api/admin/users            # Danh sách tất cả users
GET    /api/admin/users/search     # Tìm kiếm user (query: q, role, status)
POST   /api/admin/users            # Tạo user mới
PUT    /api/admin/users/{id}       # Cập nhật thông tin user
PUT    /api/admin/users/{id}/lock  # Khóa tài khoản
PUT    /api/admin/users/{id}/unlock # Mở khóa tài khoản
POST   /api/admin/users/assign-role # Gán role cho user
```

**Course Management**
```
(Similar structure for course approval, hiding, etc.)
```

### Authentication & Authorization

#### JWT-based Authentication

**Token Structure:**
```json
{
  "Access Token": {
    "type": "JWT Bearer",
    "duration": "30 minutes",
    "claims": [
      "nameid (AccountID)",
      "unique_name (Username)",
      "email",
      "role (STUDENT/TEACHER/ADMIN)"
    ]
  },
  "Refresh Token": {
    "type": "Secure HttpOnly Cookie",
    "duration": "14 days",
    "storage": "Database (Account.RefreshToken)"
  }
}
```

**Flow đăng nhập:**
```
1. User POST /api/auth/login với { username, password }
2. Server verify credentials
3. Server generate Access Token (JWT) + Refresh Token (GUID)
4. Access Token trả về trong response body
5. Refresh Token lưu trong HttpOnly Cookie
6. Client lưu Access Token (localStorage/memory)
7. Client gửi Access Token trong header: "Authorization: Bearer {token}"
```

**Flow refresh token:**
```
1. Access Token hết hạn (401 Unauthorized)
2. Client POST /api/auth/refresh (refresh token tự động gửi qua cookie)
3. Server verify refresh token từ database
4. Server generate new Access Token + new Refresh Token
5. Trả về token mới (cũ bị vô hiệu hóa)
```

#### Authorization Policies

**Role-based Authorization:**
```csharp
[Authorize(Roles = "ADMIN")]           // Chỉ Admin
[Authorize(Roles = "STUDENT")]         // Chỉ Student
[Authorize(Roles = "TEACHER,ADMIN")]   // Teacher hoặc Admin
[Authorize]                            // Bất kỳ user đã đăng nhập
[AllowAnonymous]                       // Public endpoint
```

**Custom Policy:**
```csharp
// Program.cs
builder.Services.AddAuthorization(opt => {
    opt.AddPolicy("AdminOnly", policy =>
        policy.RequireAuthenticatedUser()
              .RequireRole("ADMIN"));
});

// Controller
[Authorize(Policy = "AdminOnly")]
```

#### Security Features

✅ **Password Security**
- BCrypt hashing với work factor 12
- Minimum password requirements (thực hiện ở validation layer)

✅ **Token Security**
- HMAC-SHA256 signature
- Clock skew: 30 seconds
- RefreshToken rotation (single-use)

✅ **CORS Configuration**
- Whitelist origins
- Credentials support (cookies)

✅ **Request Logging**
- Middleware ghi log tất cả requests
- Bao gồm: User, IP, Endpoint, Timestamp

### Các dịch vụ tích hợp

#### 📧 Email Service (SMTP)

**Configuration:**
```json
{
  "EmailSettings": {
    "Server": "smtp.gmail.com",
    "Port": 587,
    "SenderName": "English Master",
    "Email": "your-email@gmail.com",
    "Password": "app-password-here"
  }
}
```

**Use cases:**
- ✉️ Gửi OTP cho đăng ký tài khoản
- ✉️ Reset password link
- ✉️ Thông báo membership expiry (future)

**Implementation:**
```csharp
// Services/EmailSender.cs
public class EmailSender {
    public async Task SendEmailAsync(string to, string subject, string body)
    // Sử dụng SmtpClient với TLS
}
```

#### 💳 Payment Service (PayOS)

**Configuration:**
```json
{
  "PayOS": {
    "ClientId": "your-client-id",
    "ApiKey": "your-api-key",
    "ChecksumKey": "your-checksum-key",
    "ReturnUrl": "http://localhost:3000/payment-success",
    "CancelUrl": "http://localhost:3000/payment-cancel"
  }
}
```

**Flow thanh toán:**
```
1. Student chọn gói membership
2. POST /api/payment/create với { planId }
3. Backend tạo PaymentOrder (status: PENDING)
4. Gọi PayOS API để tạo payment link
5. Trả về checkoutUrl cho frontend
6. User thanh toán trên PayOS
7. PayOS gọi webhook /api/payment/webhook
8. Backend verify webhook signature
9. Update PaymentOrder status (PAID/FAILED)
10. Nếu PAID: Tạo/gia hạn UserMembership
```

**Webhook Security:**
- Verify signature từ PayOS
- Idempotent processing (check WebhookEvent table)
- Log mọi webhook events

### Cấu hình môi trường

#### appsettings.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.;Database=EMTDatabase;User Id=sa;Password=your-password;TrustServerCertificate=True"
  },
  "Jwt": {
    "Issuer": "EMT.Api",
    "Audience": "EMT.Api.Client",
    "Key": "your-secret-key-at-least-32-characters-long",
    "AccessTokenMinutes": 30,
    "RefreshTokenDays": 14
  },
  "FrontendBaseUrl": "http://localhost:3000",
  "EmailSettings": { /* ... */ },
  "PayOS": { /* ... */ }
}
```

#### Environment Variables (Production)

Đối với production, nên sử dụng environment variables hoặc Azure Key Vault:

```bash
ConnectionStrings__DefaultConnection="..."
Jwt__Key="..."
EmailSettings__Password="..."
PayOS__ApiKey="..."
```

#### appsettings.Development.json

File này override settings cho môi trường development (không commit sensitive data):

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft.AspNetCore": "Information"
    }
  }
}
```

### Hướng dẫn cài đặt và chạy

#### Yêu cầu hệ thống

- **.NET SDK 8.0** trở lên
- **SQL Server 2019** trở lên (hoặc SQL Server Express)
- **Visual Studio 2022** hoặc **VS Code** + C# extension
- **(Optional)** Docker Desktop

#### Bước 1: Clone repository

```bash
git clone https://github.com/nldhoang10092004/Group1_SWP391_FPTU.git
cd Group1_SWP391_FPTU/server
```

#### Bước 2: Restore dependencies

```bash
cd EMT_API
dotnet restore
```

#### Bước 3: Setup Database

**Option A: Sử dụng SQL Script**
```bash
# Chạy file EMTDatabase.sql trong SQL Server Management Studio (SSMS)
# hoặc dùng sqlcmd:
sqlcmd -S localhost -U sa -P your-password -i ../../EMTDatabase.sql
```

**Option B: Sử dụng EF Core Migrations** (nếu có)
```bash
dotnet ef database update
```

#### Bước 4: Cấu hình appsettings.json

```bash
# Copy template và điền thông tin
cp appsettings.json appsettings.Development.json
# Sửa ConnectionStrings, EmailSettings, PayOS config
```

#### Bước 5: Chạy application

**Development mode:**
```bash
dotnet run
# hoặc
dotnet watch run  # Auto-reload on code changes
```

**Production build:**
```bash
dotnet build -c Release
dotnet publish -c Release -o ./publish
cd publish
dotnet EMT_API.dll
```

Application sẽ chạy tại:
- HTTP: `http://localhost:5000`
- HTTPS: `https://localhost:5001`
- Swagger UI: `https://localhost:5001/swagger`

#### Bước 6: Test API với Swagger

1. Mở trình duyệt: `https://localhost:5001/swagger`
2. Test endpoint `/api/auth/register` để tạo tài khoản
3. Test endpoint `/api/auth/login` để lấy access token
4. Click nút **Authorize** (🔓), nhập: `Bearer {your-access-token}`
5. Test các protected endpoints

#### Docker Deployment

```bash
# Build image
docker build -t emt-api:latest -f EMT_API/Dockerfile .

# Run container
docker run -d -p 8080:8080 -p 8081:8081 \
  -e ConnectionStrings__DefaultConnection="..." \
  -e Jwt__Key="..." \
  --name emt-api \
  emt-api:latest

# View logs
docker logs -f emt-api
```

#### Troubleshooting

**Lỗi: "A connection was successfully established with the server..."**
```bash
# Kiểm tra SQL Server đang chạy
# Windows: services.msc → SQL Server (MSSQLSERVER)
# Linux/Mac: Docker SQL Server container
```

**Lỗi: "The certificate chain was issued by an authority that is not trusted"**
```bash
# Thêm TrustServerCertificate=True vào ConnectionString
```

**Lỗi: "Unable to resolve service for type 'ITokenService'"**
```bash
# Kiểm tra Program.cs đã register service chưa:
builder.Services.AddScoped<ITokenService, TokenService>();
```

---

## 🎨 Frontend

Frontend được xây dựng với **React 18** + **Vite**.

### Công nghệ chính:
- React 18
- React Router v6
- Tailwind CSS
- Recharts (biểu đồ)
- Lucide React (icons)
- Sonner (toast notifications)

### Cấu trúc thư mục:
```
front-end/
├── src/
│   ├── admin/          # Admin dashboard components
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── utils/          # Utilities & API services
│   ├── App.jsx
│   └── main.jsx
└── public/
```

### Chạy Frontend:
```bash
cd front-end
npm install
npm start           # Development: http://localhost:3000
npm run build       # Production build
```

Chi tiết xem [front-end/README.md](./front-end/README.md)

---

## 💾 Database

**SQL Server** với schema được định nghĩa trong `EMTDatabase.sql`

### Key Features:
- ✅ Normalized schema (3NF)
- ✅ Foreign key constraints
- ✅ Unique constraints (Username, Email)
- ✅ Check constraints (Role, Status, CourseLevel)
- ✅ Indexed columns (performance)
- ✅ View: `vUserHasActiveMembership` (check user access)

### Backup & Restore:
```sql
-- Backup
BACKUP DATABASE EMTDatabase TO DISK = 'C:\Backup\EMTDatabase.bak'

-- Restore
RESTORE DATABASE EMTDatabase FROM DISK = 'C:\Backup\EMTDatabase.bak'
```

---

## 🚀 Deployment

### Backend Deployment Options:

#### 1. Azure App Service
```bash
# Azure CLI
az webapp up --name emt-api --resource-group rg-emt --runtime "DOTNETCORE:8.0"
```

#### 2. Docker + Azure Container Instances
```bash
# Build & push to ACR
az acr build --registry emtregistry --image emt-api:v1 .

# Deploy to ACI
az container create --resource-group rg-emt --name emt-api \
  --image emtregistry.azurecr.io/emt-api:v1 \
  --dns-name-label emt-api --ports 80 443
```

#### 3. IIS (Windows Server)
```bash
# Publish to folder
dotnet publish -c Release -o C:\inetpub\wwwroot\emt-api

# Tạo site mới trong IIS Manager
# Point to C:\inetpub\wwwroot\emt-api
# Configure Application Pool (.NET CLR Version: No Managed Code)
```

### Database Deployment:
- Azure SQL Database (recommended)
- SQL Server on VM
- Managed Instance

### CI/CD:
Repository này có thể tích hợp:
- **GitHub Actions**: `.github/workflows/dotnet.yml`
- **Azure DevOps**: Pipeline YAML

---

## 📚 Tài liệu bổ sung

### API Documentation:
- Swagger UI: `https://localhost:5001/swagger`
- Postman Collection: (TODO)

### Code Standards:
- C# Coding Conventions
- RESTful API Design
- Clean Architecture principles

### Security Best Practices:
- OWASP Top 10 compliance
- Regular dependency updates
- Secrets management

---

## 👥 Team & Contributors

**Group 1 - SWP391 - FPTU**

### Roles:
- Backend Development: ASP.NET Core Web API
- Frontend Development: React + Tailwind
- Database Design: SQL Server
- DevOps: Docker, CI/CD

---

## 📝 License

This project is for educational purposes (Software Engineering Project - SWP391)

---

## 📞 Contact & Support

- GitHub Issues: [Create new issue](https://github.com/nldhoang10092004/Group1_SWP391_FPTU/issues)
- Email: (contact email here)

---

**Last Updated:** October 2025
**Version:** 1.0.0
