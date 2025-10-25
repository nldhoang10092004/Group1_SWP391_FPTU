# English Mastery Training (EMT) Platform

Hệ thống học tiếng Anh trực tuyến toàn diện với membership-based learning system.

## 📋 Mục lục

- [Giới thiệu](#giới-thiệu)
- [Tính năng chính](#tính-năng-chính)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Cài đặt và Chạy dự án](#cài-đặt-và-chạy-dự-án)
  - [Backend Testing](#4-chạy-unit-tests-cho-backend)
- [Cấu hình Database](#cấu-hình-database)
- [API Documentation](#api-documentation)
- [Đóng góp](#đóng-góp)
- [Team](#team)

## 🎯 Giới thiệu

**English Mastery Training (EMT)** là nền tảng học tiếng Anh trực tuyến được xây dựng cho dự án SWP391 tại FPTU. Hệ thống cung cấp trải nghiệm học tập toàn diện với 4 cấp độ từ Nền tảng đến Chuyên sâu, tích hợp membership system và quản lý học viên thông minh.

### Mô hình Membership

- **Membership-only System**: Người học cần đăng ký membership để truy cập toàn bộ khóa học
- **4 Cấp độ học**: Nền tảng → Cơ bản → Trung cấp → Chuyên sâu
- **Không bán lẻ từng khóa**: Tất cả khóa học đều được truy cập thông qua membership

## ✨ Tính năng chính

### Cho Học viên (Student)
- 📚 Truy cập toàn bộ khóa học qua Membership
- 🎯 Lộ trình học tập 4 cấp độ có cấu trúc
- 💬 Diễn đàn trao đổi và hỏi đáp
- ✍️ Luyện tập Writing, Speaking, Flashcards
- 🏆 Hệ thống thành tích và XP
- 📊 Theo dõi tiến độ học tập
- 🤖 AI Chatbot hỗ trợ học tập
- ⭐ Đánh giá và nhận xét khóa học

### Cho Giảng viên (Teacher)
- 📝 Tạo và quản lý khóa học
- 📑 Tổ chức nội dung theo Chapter và Lesson
- 💬 Hỗ trợ học viên qua diễn đàn
- 📊 Xem thống kê và phân tích khóa học
- 🎥 Upload và quản lý video bài giảng
- 📄 Tạo và quản lý tài liệu học tập

### Cho Quản trị viên (Admin)
- 👥 Quản lý người dùng (Student/Teacher/Admin)
- 🎓 Quản lý giảng viên và phân quyền
- 📚 Kiểm duyệt và quản lý khóa học
- ⭐ Kiểm duyệt đánh giá và phản hồi
- 🎫 Quản lý Voucher và Campaign
- 📝 Tạo và quản lý bài kiểm tra hệ thống
- 📈 Thống kê và báo cáo toàn hệ thống
- 💰 Quản lý thanh toán và membership

### Tính năng khác
- 🔐 Xác thực JWT với Access Token và Refresh Token
- 💳 Tích hợp PayOS cho thanh toán
- 📧 Gửi email thông báo và OTP
- 🔒 Bảo mật cookie HttpOnly cho Refresh Token
- 🌐 CORS được cấu hình cho nhiều domain

## 🛠 Công nghệ sử dụng

### Frontend
- **React 18** - UI Framework
- **Vite** - Build tool và Dev server
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible UI Components
- **Recharts** - Biểu đồ và Charts
- **Lucide React** - Icons
- **Axios** - HTTP Client
- **Sonner** - Toast Notifications

### Backend
- **ASP.NET Core 8.0** - Web API Framework
- **Entity Framework Core** - ORM
- **SQL Server** - Database
- **JWT Bearer Authentication** - Security
- **Swagger/OpenAPI** - API Documentation

### Testing
- **xUnit** - Unit Testing Framework
- **Moq** - Mocking Framework
- **coverlet.collector** - Code Coverage Collection
- **ReportGenerator** - HTML Coverage Reports

### Database
- **SQL Server** - Relational Database
- **Entity Framework Core** - Database Access Layer

### External Services
- **PayOS** - Payment Gateway
- **Email Service** - Gửi email và OTP

## 📁 Cấu trúc dự án

```
Group1_SWP391_FPTU/
├── front-end/                  # React Frontend Application
│   ├── src/
│   │   ├── admin/             # Admin Dashboard Components
│   │   ├── components/        # React Components
│   │   ├── api/               # API Service Layer
│   │   └── utils/             # Utilities và Helpers
│   ├── public/                # Static Assets
│   └── package.json           # Frontend Dependencies
│
├── server/                     # ASP.NET Core Backend
│   ├── EMT_API/
│   │   ├── Controllers/       # API Controllers
│   │   ├── Models/            # Entity Models
│   │   ├── DTOs/              # Data Transfer Objects
│   │   ├── Services/          # Business Logic Services
│   │   ├── Security/          # JWT và Authentication
│   │   ├── Data/              # DbContext và Configurations
│   │   ├── Middlewares/       # Custom Middlewares
│   │   └── Program.cs         # Application Entry Point
│   │
│   └── EMT_API.Tests/         # Unit Tests
│       ├── Controllers/       # Controller Tests
│       ├── Services/          # Service Tests
│       ├── TestResults/       # Test Output (generated)
│       ├── coveragereport/    # Coverage HTML Report (generated)
│       └── EMT_API.Tests.csproj
│
├── EMTDatabase.sql            # Database Schema Script
└── README.md                  # This file
```

## 🚀 Cài đặt và Chạy dự án

### Yêu cầu hệ thống

- **Node.js** >= 18.x
- **.NET SDK** >= 8.0
- **SQL Server** 2019 hoặc mới hơn
- **Git**

### 1. Clone Repository

```bash
git clone https://github.com/nldhoang10092004/Group1_SWP391_FPTU.git
cd Group1_SWP391_FPTU
```

### 2. Cài đặt và Chạy Frontend

```bash
# Di chuyển vào thư mục front-end
cd front-end

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:3000`

#### Build Production

```bash
npm run build
```

### 3. Cài đặt và Chạy Backend

```bash
# Di chuyển vào thư mục server
cd server/EMT_API

# Restore NuGet packages
dotnet restore

# Update appsettings.json với connection string của bạn
# Xem phần "Cấu hình Database" bên dưới

# Chạy API
dotnet run
```

API sẽ chạy tại: `https://localhost:7010`

Swagger UI: `https://localhost:7010/swagger`

### 4. Chạy Unit Tests cho Backend

Backend sử dụng **xUnit** framework để testing với **Moq** cho mocking và **coverlet** để thu thập code coverage.

#### 4.1. Chạy tất cả tests

```bash
# Di chuyển vào thư mục test
cd server/EMT_API.Tests

# Chạy tất cả tests
dotnet test
```

#### 4.2. Chạy tests với code coverage

```bash
# Chạy tests và thu thập code coverage
dotnet test --collect:"XPlat Code Coverage" --results-directory ./TestResults
```

Lệnh này sẽ:
- Chạy tất cả unit tests
- Thu thập code coverage data
- Lưu coverage data vào thư mục `TestResults/` dưới dạng file `coverage.cobertura.xml`

#### 4.3. Tạo HTML Coverage Report

Để xem coverage report dưới dạng HTML đẹp mắt, bạn cần cài đặt `reportgenerator`:

```bash
# Cài đặt reportgenerator tool (chỉ cần chạy 1 lần)
dotnet tool install -g dotnet-reportgenerator-globaltool

# Tạo HTML report từ coverage data
cd server/EMT_API.Tests
reportgenerator -reports:"TestResults/*/coverage.cobertura.xml" -targetdir:"coveragereport" -reporttypes:Html
```

**Xem Coverage Report**: Mở file `server/EMT_API.Tests/coveragereport/index.html` trong trình duyệt để xem chi tiết coverage.

#### 4.4. Chạy tests cụ thể

```bash
# Chạy tests trong một class cụ thể
dotnet test --filter "FullyQualifiedName~AISpeakingControllerTests"

# Chạy một test method cụ thể
dotnet test --filter "FullyQualifiedName~AISpeakingControllerTests.GeneratePrompt_ShouldReturn200_WhenUserHasMembership"
```

#### 4.5. Xem danh sách tests có sẵn

```bash
# List tất cả tests
dotnet test --list-tests
```

#### 4.6. Chạy tests với output chi tiết

```bash
# Verbose output
dotnet test --logger "console;verbosity=detailed"
```

#### 4.7. Tổng hợp một lệnh để chạy tests và tạo coverage report

```bash
# Từ thư mục server/EMT_API.Tests
# Chạy tests với coverage (tiếp tục dù tests fail)
dotnet test --collect:"XPlat Code Coverage" --results-directory ./TestResults ; \
reportgenerator -reports:"TestResults/*/coverage.cobertura.xml" -targetdir:"coveragereport" -reporttypes:Html
```

Sau khi chạy xong, mở file `coveragereport/index.html` để xem coverage report.

**Lưu ý**: Lệnh trên sử dụng `;` thay vì `&&` để đảm bảo coverage report được tạo ngay cả khi có tests fail.

#### 4.8. Cấu trúc Test Project

```
server/EMT_API.Tests/
├── Controllers/          # Tests cho API Controllers
│   └── AISpeakingControllerTests.cs
├── Services/            # Tests cho Business Logic Services
│   ├── TranscriptionModuleTests.cs
│   ├── GradingModuleTests.cs
│   └── PromptModuleTests.cs
├── TestResults/         # Output của test runs (được tạo tự động)
├── coveragereport/      # HTML coverage report (được tạo bởi reportgenerator)
└── EMT_API.Tests.csproj # Test project file
```

**Lưu ý về Tests**:
- Các test hiện tại chủ yếu test AI Speaking features (Controllers và Services)
- Tests sử dụng mock data, không cần database thật hoặc API keys thật
- Một số tests có thể fail nếu thiếu API keys (Deepgram, OpenAI) trong config
- Test coverage report giúp xác định phần code nào đã được test và phần nào chưa

## 🗄 Cấu hình Database

### 1. Tạo Database

Chạy script SQL từ file `EMTDatabase.sql`:

```bash
# Sử dụng SQL Server Management Studio (SSMS)
# Hoặc sử dụng sqlcmd:
sqlcmd -S localhost -i EMTDatabase.sql
```

### 2. Cấu hình Connection String

Cập nhật file `server/EMT_API/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=EMTDatabase;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

**Lưu ý**: Điều chỉnh connection string phù hợp với môi trường của bạn.

### 3. Database Schema Overview

Database gồm các bảng chính:

- **Account** - Tài khoản người dùng (Student/Teacher/Admin)
- **UserDetail** - Thông tin chi tiết người dùng
- **Teacher** - Thông tin giảng viên
- **Course** - Khóa học (4 levels)
- **CourseChapter** - Chương học
- **Lesson** - Bài học
- **Membership** - Gói membership
- **PaymentTransaction** - Giao dịch thanh toán
- **Review** - Đánh giá khóa học
- **Forum**, **Thread**, **Comment** - Hệ thống diễn đàn
- **QuestionSet**, **Question**, **Answer** - Hệ thống bài kiểm tra

Chi tiết schema xem trong file `EMTDatabase.sql`.

## 📚 API Documentation

API documentation có sẵn qua Swagger UI khi chạy backend:

```
https://localhost:7010/swagger
```

### Các endpoint chính:

#### Authentication (`/api/auth`)
- `POST /api/auth/register` - Đăng ký tài khoản mới
- `POST /api/auth/registerTeacher` - Đăng ký tài khoản giảng viên
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Đăng xuất
- `POST /api/auth/send-otp` - Gửi OTP
- `POST /api/auth/forgot-password` - Quên mật khẩu

#### User Management (`/api/user`)
- `GET /api/user/profile` - Lấy thông tin profile
- `PUT /api/user/profile` - Cập nhật profile
- `POST /api/user/change-password` - Đổi mật khẩu

#### Courses (`/api/course`)
- `GET /api/course` - Lấy danh sách khóa học
- `GET /api/course/{id}` - Chi tiết khóa học
- `POST /api/course` - Tạo khóa học mới (Teacher)
- `PUT /api/course/{id}` - Cập nhật khóa học
- `DELETE /api/course/{id}` - Xóa khóa học

#### Membership (`/api/membership`)
- `GET /api/membership/plans` - Lấy danh sách gói
- `POST /api/membership/subscribe` - Đăng ký membership

#### Payment (`/api/payment`)
- Tích hợp với PayOS
- Xử lý callback và webhook

### Authentication

API sử dụng JWT Bearer Authentication. Thêm header:

```
Authorization: Bearer {access_token}
```

## 🔐 Environment Variables

### Backend (`appsettings.json`)

```json
{
  "Jwt": {
    "SecretKey": "your-secret-key-here",
    "Issuer": "EMT_API",
    "Audience": "EMT_Client",
    "AccessTokenMinutes": 15,
    "RefreshTokenDays": 7
  },
  "EmailSettings": {
    "SmtpServer": "smtp.gmail.com",
    "SmtpPort": 587,
    "SenderEmail": "your-email@gmail.com",
    "SenderName": "EMT Platform",
    "Password": "your-app-password"
  },
  "PayOS": {
    "ClientId": "your-payos-client-id",
    "ApiKey": "your-payos-api-key",
    "ChecksumKey": "your-payos-checksum-key"
  }
}
```

### Frontend

Cập nhật API URL trong `front-end/src/api/auth.js`:

```javascript
const API_URL = "https://localhost:7010/api/auth";
```

## 👥 Demo Accounts

### Admin
```
Email: admin@emt.com
Password: admin123
```

### Teacher
```
Email: teacher@emt.com
Password: teacher123
```

### Student
```
Email: student@emt.com
Password: student123
```

## 🤝 Đóng góp

Chúng tôi hoan nghênh mọi đóng góp! Để đóng góp:

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push lên branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 👨‍💻 Team

**Group 1 - SWP391 - FPTU**

- **Project Lead**: [Hoàng](https://github.com/nldhoang10092004)
- Các thành viên khác sẽ được cập nhật

## 📄 License

Dự án này được phát triển cho môn SWP391 tại FPT University.

## 📞 Liên hệ

- GitHub: [nldhoang10092004/Group1_SWP391_FPTU](https://github.com/nldhoang10092004/Group1_SWP391_FPTU)
- Email: [Liên hệ qua GitHub Issues]

## 🙏 Acknowledgments

- FPT University - Môn SWP391
- Các thư viện và framework mã nguồn mở được sử dụng trong dự án
- Cộng đồng developers đã hỗ trợ

---

**Made with ❤️ by Group 1 - SWP391 - FPTU**
