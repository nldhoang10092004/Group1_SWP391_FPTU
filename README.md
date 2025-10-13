# EMT - AI-Powered English Learning Platform 🎓

[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![.NET Core](https://img.shields.io/badge/.NET-8.0-purple.svg)](https://dotnet.microsoft.com/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.8-purple.svg)](https://getbootstrap.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**EMT (English Master Training)** là một nền tảng học ngoại ngữ tích hợp Trí tuệ Nhân tạo, cung cấp trải nghiệm học tập cá nhân hóa với 4 kỹ năng: Nghe (Listening), Nói (Speaking), Đọc (Reading), và Viết (Writing).

## 📋 Mục lục

- [Giới thiệu](#giới-thiệu)
- [Tính năng](#tính-năng)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cài đặt](#cài-đặt)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Hướng dẫn sử dụng](#hướng-dẫn-sử-dụng)
- [API Documentation](#api-documentation)
- [Nhóm phát triển](#nhóm-phát-triển)

## 🎯 Giới thiệu

### Lý do chọn đề tài

Trong bối cảnh toàn cầu hóa, nhu cầu học ngoại ngữ (đặc biệt là tiếng Anh) để giao tiếp, học tập và làm việc ngày càng trở nên cấp thiết. Tuy nhiên, người học thường gặp phải những thách thức như:

- **Chi phí cao**: Các khóa học chất lượng, đặc biệt là có giảng viên bản ngữ, thường có mức giá đắt đỏ
- **Thiếu linh hoạt**: Lịch học cố định tại các trung tâm gây khó khăn cho người đi làm hoặc có thời gian biểu bận rộn
- **Không được đánh giá chuyên sâu**: Các kỹ năng khó đánh giá như Writing và Speaking thường không nhận được phản hồi tức thì và chi tiết
- **Phương pháp học thụ động**: Nhiều nền tảng thiếu các công cụ ôn tập thông minh, dẫn đến việc học không hiệu quả, dễ quên bài

**EMT** ra đời với mục tiêu trở thành một nền tảng học tập toàn diện, thông minh và tiết kiệm, mang lại trải nghiệm cá nhân hóa và hiệu quả cho người học, đồng thời tạo ra một môi trường giảng dạy trực tuyến chuyên nghiệp cho giáo viên.

### Phạm vi dự án

Dự án tập trung phát triển một **Minimum Viable Product (MVP)** với các tính năng cốt lõi:

- Hệ thống đăng ký, đăng nhập và phân quyền cho 3 đối tượng: **Học viên**, **Giảng viên** và **Quản trị viên**
- Cổng thanh toán tích hợp **PayOS** (sandbox mode) để mua khóa học
- Hệ thống quản lý khóa học cho phép giảng viên tạo và quản lý nội dung (video, tài liệu)
- Hệ thống học tập: Video lessons, cấp độ học, Flashcards thông minh (SM-2 algorithm), Quiz tự động
- **Tính năng AI**: Chấm điểm và nhận xét tự động bài viết (Writing) sử dụng AI

## ✨ Tính năng

### 🔐 Xác thực & Phân quyền
- Đăng ký/Đăng nhập với JWT Authentication
- Tích hợp Google OAuth 2.0 để đăng nhập nhanh
- Phân quyền 3 loại người dùng: Student, Teacher, Admin
- Quản lý profile người dùng
- Quên mật khẩu & Reset password qua email

### 📚 Quản lý khóa học
- Tạo và quản lý khóa học (Teacher)
- Upload video bài giảng và tài liệu
- Phân cấp độ học: Beginner, Intermediate, Advanced
- Theo dõi tiến độ học tập

### 🎓 Học tập tương tác
- **Video Lessons**: Học qua video với ghi chú
- **Flashcards**: Ôn tập từ vựng với thuật toán lặp lại ngắt quãng (SM-2)
- **Quiz**: Bài tập trắc nghiệm tự động chấm điểm
- **Practice**: Luyện viết, ngữ pháp, phát âm

### 🤖 AI-Powered Features
- Chấm điểm tự động bài viết (Writing)
- Phản hồi chi tiết và đề xuất cải thiện
- Đánh giá ngữ pháp, từ vựng, cấu trúc câu

### 💳 Thanh toán
- Tích hợp cổng thanh toán PayOS
- Mua khóa học trực tuyến
- Lịch sử giao dịch

### 📊 Thống kê & Báo cáo
- Theo dõi tiến độ học tập
- Thống kê điểm số
- Dashboard cho admin

## 🛠️ Công nghệ sử dụng

### Frontend
- **React** 19.1.1 - UI library
- **React Router** 7.9.1 - Routing
- **Bootstrap** 5.3.8 & React-Bootstrap 2.10.10 - UI components
- **Material-UI** 7.3.2 - Additional UI components
- **React Icons** 5.5.0 - Icon library
- **Google OAuth** 0.12.2 - Google authentication
- **Axios** 1.12.2 - HTTP client
- **SASS** 1.92.1 - CSS preprocessor
- **JWT Decode** 4.0.0 - Token handling

### Backend
- **ASP.NET Core** 8.0 - Web API framework
- **Entity Framework Core** 9.0.9 - ORM
- **SQL Server** - Database
- **JWT Bearer** 8.0.20 - Authentication
- **Swagger** 6.6.2 - API documentation

### Mock API (Development)
- **Express.js** 5.1.0 - Mock authentication server
- **CORS** 2.8.5 - Cross-origin resource sharing
- **Body Parser** 2.2.0 - Request body parsing

### DevOps & Tools
- **Docker** - Containerization
- **Git** - Version control
- **Visual Studio Code** - IDE
- **Postman** - API testing

## 📦 Cài đặt

### Yêu cầu hệ thống

- **Node.js** >= 16.x
- **.NET SDK** >= 8.0
- **SQL Server** (LocalDB or Express)
- **Git**

### Bước 1: Clone repository

```bash
git clone https://github.com/nldhoang10092004/Group1_SWP391_FPTU.git
cd Group1_SWP391_FPTU
```

### Bước 2: Cài đặt Database

```bash
# Import database từ file EMTDatabase.sql vào SQL Server
# Sử dụng SQL Server Management Studio hoặc command line
sqlcmd -S localhost -i EMTDatabase.sql
```

### Bước 3: Cấu hình Backend

```bash
cd server/EMT_API

# Cập nhật connection string trong appsettings.json
# "DefaultConnection": "Server=localhost;Database=EMTDatabase;Trusted_Connection=True;TrustServerCertificate=True;"

# Restore dependencies
dotnet restore

# Build project
dotnet build
```

### Bước 4: Cấu hình Frontend

```bash
cd front-end

# Install dependencies
npm install

# Tạo file .env (nếu cần)
# REACT_APP_API_URL=https://localhost:7010
```

## 🚀 Chạy ứng dụng

### Chạy Backend

```bash
cd server/EMT_API
dotnet run
```

Backend sẽ chạy tại: `https://localhost:7010`
Swagger UI: `https://localhost:7010/swagger`

### Chạy Mock API (Development - Optional)

Để phát triển và test frontend mà không cần backend chính, bạn có thể chạy mock API:

```bash
cd front-end/login-api

# Install dependencies (lần đầu tiên)
npm install

# Start mock server
node server.js
```

Mock API sẽ chạy tại: `http://localhost:3003`

**Tài khoản demo trong Mock API:**
- Học viên: `students@gmail.com` / `1234567890`
- Admin: `admin@gmail.com` / `admin123`

### Chạy Frontend

```bash
cd front-end
npm start
```

Frontend sẽ chạy tại: `http://localhost:3000`

## 📁 Cấu trúc dự án

```
Group1_SWP391_FPTU/
├── front-end/                 # React frontend application
│   ├── public/               # Static files
│   ├── src/
│   │   ├── api/             # API integration
│   │   ├── components/      # React components
│   │   │   ├── Home/       # Homepage
│   │   │   ├── User/       # User management
│   │   │   ├── Profile/    # User profile
│   │   │   ├── Header/     # Navigation header
│   │   │   └── Password/   # Password management
│   │   ├── styles/         # CSS/SASS files
│   │   └── App.js          # Main app component
│   ├── login-api/           # Mock authentication API (development)
│   │   ├── server.js       # Express mock server
│   │   └── package.json    # Mock API dependencies
│   └── package.json         # NPM dependencies
│
├── server/                    # ASP.NET Core backend
│   ├── EMT_API/
│   │   ├── Controllers/     # API controllers
│   │   │   ├── Auth/       # Authentication
│   │   │   ├── Admin/      # Admin endpoints
│   │   │   ├── Public/     # Public endpoints
│   │   │   └── Profile/    # Profile management
│   │   ├── Models/         # Data models
│   │   ├── Data/           # DbContext
│   │   ├── DTOs/           # Data transfer objects
│   │   ├── Security/       # JWT & security
│   │   ├── Utils/          # Utilities
│   │   ├── Program.cs      # App configuration
│   │   └── appsettings.json # Configuration
│   └── EMT_API.sln         # Solution file
│
├── EMTDatabase.sql           # Database schema
├── .gitignore               # Git ignore rules
└── README.md                # This file
```

## 📖 Hướng dẫn sử dụng

### Đăng ký tài khoản

1. Truy cập trang chủ
2. Click "Đăng ký" trên navigation bar
3. Nhập thông tin: Email, Username, Password
4. Xác nhận email (nếu được yêu cầu)

### Đăng nhập

1. Click "Đăng nhập"
2. Nhập Email/Username và Password
3. System sẽ redirect dựa trên role:
   - **Student** → Dashboard học viên
   - **Teacher** → Quản lý khóa học
   - **Admin** → Admin panel

#### Tài khoản demo

Để dùng thử hệ thống, bạn có thể sử dụng các tài khoản demo sau:

- **Học viên (Student)**
  - Email: `students@gmail.com`
  - Password: `1234567890`

- **Giảng viên (Teacher)**
  - Email: `teacher@emt.com`
  - Password: `password123`

### Học viên (Student)

- Xem danh sách khóa học theo cấp độ
- Đăng ký và thanh toán khóa học
- Học bài qua video và flashcards
- Làm quiz và mock test
- Theo dõi tiến độ học tập

### Giảng viên (Teacher)

- Tạo và quản lý khóa học
- Upload video bài giảng
- Tạo quiz và bài tập
- Xem thống kê học viên

### Quản trị viên (Admin)

- Quản lý người dùng
- Quản lý khóa học
- Xem báo cáo hệ thống
- Cấu hình hệ thống

## 🔌 API Documentation

### Authentication Endpoints

```
POST /api/auth/register        # Đăng ký tài khoản học viên
POST /api/auth/registerTeacher # Đăng ký tài khoản giảng viên
POST /api/auth/login           # Đăng nhập
POST /api/auth/forgot-password # Quên mật khẩu
POST /api/auth/reset-password  # Reset mật khẩu
POST /api/auth/refresh-token   # Refresh JWT token
```

### Profile Endpoints

```
GET  /api/profile             # Lấy thông tin profile
PUT  /api/profile             # Cập nhật profile
POST /api/profile/avatar      # Upload avatar
```

### Public Endpoints

```
GET /api/public/course        # Lấy danh sách khóa học
GET /api/public/course/{id}   # Lấy chi tiết khóa học
GET /api/public/plan          # Lấy danh sách gói đăng ký
```

### Admin Endpoints

```
GET  /api/admin/users         # Danh sách người dùng
PUT  /api/admin/users/{id}    # Cập nhật người dùng
DELETE /api/admin/users/{id}  # Xóa người dùng
```

Xem full API documentation tại Swagger: `https://localhost:7010/swagger`

## 👥 Nhóm phát triển

**Group 1 - SWP391 - FPTU**

Dự án được phát triển bởi nhóm sinh viên Đại học FPT trong môn SWP391

### Liên hệ

- **Repository**: [github.com/nldhoang10092004/Group1_SWP391_FPTU](https://github.com/nldhoang10092004/Group1_SWP391_FPTU)
- **Issues**: [GitHub Issues](https://github.com/nldhoang10092004/Group1_SWP391_FPTU/issues)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- FPT University - FPTU
- Course: SWP391 - Software Development Project
- Semester: 2024

---

**Note**: Đây là một dự án học tập, không dùng cho mục đích thương mại.

**Happy Learning! 🚀📚**
