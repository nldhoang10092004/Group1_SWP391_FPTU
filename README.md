# 🎓 English Mastery Training (EMT) Platform

[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org/)
[![SQL Server](https://img.shields.io/badge/SQL%20Server-2019+-CC2927?logo=microsoft-sql-server)](https://www.microsoft.com/sql-server)
[![License](https://img.shields.io/badge/License-Academic-green)](LICENSE)

> **Nền tảng học tiếng Anh trực tuyến toàn diện** với hệ thống membership, AI-powered learning, và quản lý khóa học thông minh.

**Dự án:** SWP391 - FPT University  
**Nhóm:** Group 1  
**Ngày thi:** 01/11/2024 - AI4SE

---

## 📋 Mục lục

- [🎯 Tổng quan dự án](#-tổng-quan-dự-án)
- [🏗️ Kiến trúc hệ thống](#️-kiến-trúc-hệ-thống)
- [✨ Tính năng chính](#-tính-năng-chính)
- [🛠️ Công nghệ sử dụng](#️-công-nghệ-sử-dụng)
- [📁 Cấu trúc dự án](#-cấu-trúc-dự-án)
- [🚀 Hướng dẫn cài đặt](#-hướng-dẫn-cài-đặt)
- [▶️ Chạy dự án](#️-chạy-dự-án)
- [🗄️ Cấu hình Database](#️-cấu-hình-database)
- [📚 API Documentation](#-api-documentation)
- [🧪 Testing](#-testing)
- [👥 Team](#-team)
- [📞 Liên hệ](#-liên-hệ)

## 🎯 Tổng quan dự án

**English Mastery Training (EMT)** là nền tảng học tiếng Anh trực tuyến toàn diện, được xây dựng với công nghệ hiện đại và tích hợp AI để mang lại trải nghiệm học tập tối ưu.

### 🎭 Vai trò người dùng

| Vai trò | Mô tả | Quyền hạn chính |
|---------|-------|----------------|
| **👨‍🎓 Student** | Học viên | Học khóa học, làm bài tập, tham gia diễn đàn, sử dụng AI Chatbot |
| **👨‍🏫 Teacher** | Giảng viên | Tạo và quản lý khóa học, upload tài liệu, hỗ trợ học viên |
| **👨‍💼 Admin** | Quản trị viên | Quản lý toàn bộ hệ thống, kiểm duyệt nội dung, thống kê báo cáo |

### 💎 Mô hình Membership

```
┌─────────────────────────────────────────────────────────────────┐
│                    MEMBERSHIP-BASED SYSTEM                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Đăng ký Membership → Truy cập TẤT CẢ khóa học (4 cấp độ)     │
│                                                                 │
│  🔰 Nền tảng  →  📚 Cơ bản  →  🎯 Trung cấp  →  🏆 Chuyên sâu │
│                                                                 │
│  ✅ Không bán lẻ từng khóa                                     │
│  ✅ Truy cập không giới hạn trong thời gian membership         │
│  ✅ Lộ trình học tập có cấu trúc                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER (FRONTEND)                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │
│  │   Student    │  │   Teacher    │  │    Admin     │                │
│  │  Dashboard   │  │  Dashboard   │  │  Dashboard   │                │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                │
│         │                 │                  │                         │
│         └─────────────────┴──────────────────┘                         │
│                           │                                            │
│                  React 18 + Vite + Tailwind CSS                       │
│                   Axios API Client + JWT Auth                         │
│                                                                         │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                    HTTPS / REST API
                             │
┌────────────────────────────┴────────────────────────────────────────────┐
│                      API LAYER (BACKEND)                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                      ASP.NET Core 8.0 Web API                   │  │
│  ├─────────────────────────────────────────────────────────────────┤  │
│  │                                                                 │  │
│  │  🔐 JWT Authentication    📝 Controllers    🛡️ Middlewares    │  │
│  │                                                                 │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │  │
│  │  │ Auth API │  │Course API│  │ AI API   │  │Payment   │      │  │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘      │  │
│  │       │             │             │             │              │  │
│  └───────┼─────────────┼─────────────┼─────────────┼──────────────┘  │
│          │             │             │             │                  │
│  ┌───────┴─────────────┴─────────────┴─────────────┴──────────────┐  │
│  │                    SERVICE LAYER                               │  │
│  ├────────────────────────────────────────────────────────────────┤  │
│  │  • AISpeakingService  • AIWritingService  • PayOSService      │  │
│  │  • GoogleDriveService • CloudflareService • EmailService      │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                             │                                          │
│                    Entity Framework Core                               │
│                             │                                          │
└─────────────────────────────┼──────────────────────────────────────────┘
                              │
┌─────────────────────────────┴──────────────────────────────────────────┐
│                     DATA LAYER (DATABASE)                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                     SQL Server 2019+                            │  │
│  ├─────────────────────────────────────────────────────────────────┤  │
│  │                                                                 │  │
│  │  📊 Tables:                                                     │  │
│  │  • Account, UserDetail, Teacher                                │  │
│  │  • Course, CourseChapter, Lesson                               │  │
│  │  • Membership, PaymentTransaction                              │  │
│  │  • Forum, Thread, Comment                                      │  │
│  │  • QuestionSet, Question, Answer                               │  │
│  │  • Review, Flashcard, UserProgress                             │  │
│  │                                                                 │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                     EXTERNAL SERVICES                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  🤖 AI Services:        💳 Payment:        ☁️ Cloud:                  │
│  • OpenAI GPT          • PayOS             • Google Drive              │
│  • Google Gemini                           • Cloudflare                │
│  • Deepgram STT                            • AWS S3                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## ✨ Tính năng chính

### 👨‍🎓 Dành cho Học viên (Student)

<table>
<tr>
<td width="50%">

**📚 Học tập**
- Truy cập toàn bộ khóa học qua Membership
- Lộ trình học tập 4 cấp độ có cấu trúc
- Video bài giảng chất lượng cao
- Tài liệu học tập đa dạng

**✍️ Luyện tập**
- AI Writing Assistant (chấm điểm tự động)
- AI Speaking Practice (phân tích phát âm)
- Flashcards học từ vựng
- Bài kiểm tra và Quiz

</td>
<td width="50%">

**🤖 AI-Powered Features**
- AI Chatbot hỗ trợ 24/7
- Tự động sinh đề Speaking
- Chấm điểm Writing bằng AI
- Phân tích phát âm (Speech-to-Text)

**📊 Theo dõi tiến độ**
- Dashboard cá nhân
- Hệ thống điểm XP và thành tích
- Lịch sử học tập chi tiết
- Đánh giá và review khóa học

</td>
</tr>
</table>

### 👨‍🏫 Dành cho Giảng viên (Teacher)

<table>
<tr>
<td width="50%">

**📝 Quản lý khóa học**
- Tạo và chỉnh sửa khóa học
- Tổ chức theo Chapter và Lesson
- Upload video lên Google Drive
- Quản lý tài liệu học tập

</td>
<td width="50%">

**📊 Thống kê & Hỗ trợ**
- Dashboard giảng viên
- Thống kê học viên và engagement
- Hỗ trợ qua diễn đàn
- Quản lý Flashcards cho học viên

</td>
</tr>
</table>

### 👨‍💼 Dành cho Quản trị viên (Admin)

<table>
<tr>
<td width="50%">

**👥 Quản lý hệ thống**
- Quản lý tài khoản (Student/Teacher/Admin)
- Phân quyền và kiểm duyệt giảng viên
- Quản lý khóa học và nội dung
- Kiểm duyệt review và feedback

</td>
<td width="50%">

**📈 Thống kê & Báo cáo**
- Dashboard tổng quan hệ thống
- Thống kê doanh thu và membership
- Phân tích hành vi người dùng
- Quản lý voucher và campaign

</td>
</tr>
</table>

### 🔐 Tính năng bảo mật & Tích hợp

<table>
<tr>
<td width="33%">

**🔒 Authentication**
- JWT Bearer Authentication
- Access Token + Refresh Token
- Cookie HttpOnly bảo mật
- OTP Email verification
- OAuth2 Google Login

</td>
<td width="33%">

**💳 Payment Integration**
- Tích hợp PayOS Gateway
- Xử lý thanh toán tự động
- Webhook notification
- Quản lý giao dịch

</td>
<td width="34%">

**🌐 API & Services**
- RESTful API chuẩn
- Swagger Documentation
- CORS configuration
- Email Service (SMTP)
- Cloud Storage (Drive, S3)

</td>
</tr>
</table>

## 🛠️ Công nghệ sử dụng

### 🎨 Frontend Stack

<table>
<tr>
<td width="33%">

**Core Framework**
- ![React](https://img.shields.io/badge/React-18-61DAFB?logo=react) React 18
- ![Vite](https://img.shields.io/badge/Vite-6.3-646CFF?logo=vite) Vite Build Tool
- ![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript) ES6+

</td>
<td width="33%">

**UI & Styling**
- ![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss) Tailwind CSS
- ![Radix](https://img.shields.io/badge/Radix-UI-161618?logo=radix-ui) Radix UI Components
- ![MUI](https://img.shields.io/badge/Material-UI-007FFF?logo=mui) Material-UI
- ![Bootstrap](https://img.shields.io/badge/Bootstrap-5-7952B3?logo=bootstrap) Bootstrap 5

</td>
<td width="34%">

**Libraries**
- ![Axios](https://img.shields.io/badge/Axios-1.12-5A29E4?logo=axios) HTTP Client
- ![React Router](https://img.shields.io/badge/React_Router-7-CA4245?logo=react-router) Routing
- ![Recharts](https://img.shields.io/badge/Recharts-3-22B2DA) Charts
- ![Redux](https://img.shields.io/badge/Redux-Toolkit-764ABC?logo=redux) State Management

</td>
</tr>
</table>

### ⚙️ Backend Stack

<table>
<tr>
<td width="33%">

**Core Framework**
- ![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet) ASP.NET Core 8.0
- ![C#](https://img.shields.io/badge/C%23-12-239120?logo=c-sharp) C# 12
- ![EF Core](https://img.shields.io/badge/EF_Core-9.0-512BD4) Entity Framework Core 9.0

</td>
<td width="33%">

**Authentication & Security**
- ![JWT](https://img.shields.io/badge/JWT-8.14-000000?logo=json-web-tokens) JWT Bearer Auth
- ![OAuth](https://img.shields.io/badge/OAuth-2.0-EB5424?logo=oauth) OAuth2 Google
- HttpOnly Cookies
- OTP Email Verification

</td>
<td width="34%">

**API & Documentation**
- ![Swagger](https://img.shields.io/badge/Swagger-OpenAPI-85EA2D?logo=swagger) Swagger/OpenAPI
- RESTful API Design
- CORS Configuration
- Middleware Pipeline

</td>
</tr>
</table>

### 🗄️ Database & Storage

<table>
<tr>
<td width="50%">

**Database**
- ![SQL Server](https://img.shields.io/badge/SQL_Server-2019+-CC2927?logo=microsoft-sql-server) SQL Server 2019+
- Entity Framework Core ORM
- Database-First Approach
- Stored Procedures & Views

</td>
<td width="50%">

**Cloud Storage**
- ![Google Drive](https://img.shields.io/badge/Google_Drive-API-4285F4?logo=google-drive) Google Drive API
- ![AWS](https://img.shields.io/badge/AWS-S3-FF9900?logo=amazon-aws) AWS S3 Storage
- ![Cloudflare](https://img.shields.io/badge/Cloudflare-R2-F38020?logo=cloudflare) Cloudflare Service

</td>
</tr>
</table>

### 🤖 AI & External Services

<table>
<tr>
<td width="25%">

**AI Services**
- OpenAI GPT
- Google Gemini
- Deepgram STT
- AI Grading System

</td>
<td width="25%">

**Payment**
- PayOS Gateway
- Webhook Handling
- Transaction Management

</td>
<td width="25%">

**Communication**
- SMTP Email Service
- Email Templates
- OTP Generation

</td>
<td width="25%">

**Testing**
- xUnit Testing
- Unit Tests
- Integration Tests
- Coverage Reports

</td>
</tr>
</table>

### 🔧 Development Tools

```
Version Control:     Git, GitHub
Package Managers:    npm, NuGet
IDE:                 Visual Studio, VS Code
API Testing:         Swagger UI, Postman
Database Tools:      SQL Server Management Studio (SSMS)
Container:           Docker (optional)
```

## 📁 Cấu trúc dự án

### 📂 Cây thư mục tổng quan

```
Group1_SWP391_FPTU/
│
├── 📁 front-end/                       # 🎨 FRONTEND - React Application
│   ├── 📁 src/                         # Source code chính
│   │   ├── 📁 components/              # React Components theo module
│   │   │   ├── 📁 Admin/               # ⚙️ Admin Dashboard
│   │   │   │   ├── ReviewManagement.js    # Quản lý đánh giá
│   │   │   │   ├── UserManagement.js      # Quản lý người dùng
│   │   │   │   ├── CourseManagement.js    # Quản lý khóa học
│   │   │   │   └── 📁 ui/                 # UI Components (Button, Dialog, Card)
│   │   │   ├── 📁 Teacher/             # 👨‍🏫 Teacher Dashboard
│   │   │   ├── 📁 User/                # 👨‍🎓 Student Interface
│   │   │   ├── 📁 Home/                # 🏠 Landing Page
│   │   │   ├── 📁 Profile/             # 👤 User Profile
│   │   │   ├── 📁 AIChat/              # 🤖 AI Chatbot Component
│   │   │   ├── 📁 Header/              # Header Navigation
│   │   │   └── 📁 Footer/              # Footer Component
│   │   │
│   │   ├── 📁 middleware/              # API Client Layer
│   │   │   ├── axiosInstance.js        # Axios configuration với interceptors
│   │   │   ├── auth.js                 # Authentication API calls
│   │   │   ├── courseAPI.js            # Course API calls
│   │   │   ├── userAPI.js              # User API calls
│   │   │   ├── membershipAPI.js        # Membership API calls
│   │   │   ├── paymentAPI.js           # Payment API calls
│   │   │   ├── flashcardAPI.js         # Flashcard API calls
│   │   │   ├── speakingAPI.js          # AI Speaking API calls
│   │   │   ├── writingAPI.js           # AI Writing API calls
│   │   │   ├── QuizAPI.js              # Quiz API calls
│   │   │   └── 📁 admin/               # Admin-specific APIs
│   │   │       ├── userManagementAPI.js
│   │   │       ├── courseManagementAPI.js
│   │   │       └── dashboardAdminAPI.js
│   │   │
│   │   ├── 📁 redux/                   # Redux State Management
│   │   │   ├── store.js                # Redux store configuration
│   │   │   └── slices/                 # Redux slices
│   │   │
│   │   ├── App.jsx                     # Root Component
│   │   └── index.js                    # Entry Point
│   │
│   ├── 📁 public/                      # Static Files
│   │   ├── index.html                  # HTML Template
│   │   └── assets/                     # Images, icons, fonts
│   │
│   ├── package.json                    # Dependencies & Scripts
│   └── vite.config.ts                  # Vite Configuration
│
├── 📁 server/                          # 🖥️ BACKEND - ASP.NET Core
│   ├── 📁 EMT_API/                     # Main API Project
│   │   ├── 📁 Controllers/             # API Controllers (REST Endpoints)
│   │   │   ├── 📁 Auth/                # 🔐 Authentication Controllers
│   │   │   │   ├── AuthController.cs       # Login, Register, Refresh Token
│   │   │   │   └── OTPController.cs        # OTP Verification
│   │   │   ├── 📁 Course/              # 📚 Course Management
│   │   │   │   ├── CourseController.cs     # CRUD Operations
│   │   │   │   ├── ChapterController.cs    # Chapter Management
│   │   │   │   └── LessonController.cs     # Lesson Management
│   │   │   ├── 📁 Admin/               # ⚙️ Admin Operations
│   │   │   ├── 📁 Teacher/             # 👨‍🏫 Teacher Operations
│   │   │   ├── 📁 Profile/             # 👤 User Profile
│   │   │   ├── 📁 Payment/             # 💳 Payment Processing
│   │   │   ├── 📁 FlashCard/           # 📇 Flashcard Management
│   │   │   ├── 📁 Quiz/                # ❓ Quiz & Exam
│   │   │   ├── 📁 AIExam/              # 🤖 AI-powered Exams
│   │   │   ├── 📁 Video/               # 🎥 Video Management
│   │   │   ├── 📁 GoogleDrive/         # ☁️ Google Drive Integration
│   │   │   ├── 📁 Public/              # 🌐 Public APIs (no auth)
│   │   │   └── 📁 Common/              # 🔧 Common Utilities
│   │   │
│   │   ├── 📁 Models/                  # Entity Models (Database Tables)
│   │   │   ├── Account.cs              # User accounts
│   │   │   ├── UserDetail.cs           # User profile details
│   │   │   ├── Teacher.cs              # Teacher information
│   │   │   ├── Course.cs               # Course entity
│   │   │   ├── CourseChapter.cs        # Course chapters
│   │   │   ├── Lesson.cs               # Lessons
│   │   │   ├── Membership.cs           # Membership plans
│   │   │   ├── PaymentTransaction.cs   # Payment records
│   │   │   ├── Review.cs               # Course reviews
│   │   │   ├── Forum.cs                # Forum/Discussion
│   │   │   └── ... (30+ entities)
│   │   │
│   │   ├── 📁 DTOs/                    # Data Transfer Objects
│   │   │   ├── 📁 Auth/                # Authentication DTOs
│   │   │   ├── 📁 Course/              # Course DTOs
│   │   │   ├── 📁 Admin/               # Admin DTOs
│   │   │   ├── 📁 Profile/             # Profile DTOs
│   │   │   ├── 📁 AITest/              # AI Test DTOs
│   │   │   └── 📁 Common/              # Common DTOs
│   │   │
│   │   ├── 📁 Services/                # Business Logic Layer
│   │   │   ├── AISpeakingService.cs    # 🤖 AI Speaking (OpenAI/Gemini)
│   │   │   ├── AIWritingService.cs     # ✍️ AI Writing Grading
│   │   │   ├── PayOSService.cs         # 💳 Payment Integration
│   │   │   ├── GoogleDriveService.cs   # ☁️ File Upload
│   │   │   └── CloudflareService.cs    # ☁️ CDN Service
│   │   │
│   │   ├── 📁 Data/                    # Database Context
│   │   │   ├── ApplicationDbContext.cs # EF Core DbContext
│   │   │   └── Configurations/         # Entity Configurations
│   │   │
│   │   ├── 📁 Security/                # Security & JWT
│   │   │   ├── TokenService.cs         # JWT Token Generation
│   │   │   └── PasswordHasher.cs       # Password Encryption
│   │   │
│   │   ├── 📁 Middlewares/             # Custom Middlewares
│   │   │   ├── JwtMiddleware.cs        # JWT Validation
│   │   │   ├── ErrorHandlerMiddleware.cs # Global Error Handler
│   │   │   └── LoggingMiddleware.cs    # Request Logging
│   │   │
│   │   ├── 📁 Utils/                   # Utilities & Helpers
│   │   │   ├── EmailHelper.cs          # Email sending
│   │   │   └── FileHelper.cs           # File operations
│   │   │
│   │   ├── Program.cs                  # 🚀 Application Entry Point
│   │   ├── appsettings.json            # ⚙️ Configuration (DB, JWT, APIs)
│   │   └── EMT_API.csproj              # Project file
│   │
│   ├── 📁 EMT_API.Tests/               # 🧪 TESTING PROJECT (xUnit)
│   │   ├── 📁 Services/                # Service Layer Tests
│   │   │   ├── PromptModuleTests.cs        # Test AI Prompt Generation
│   │   │   ├── GradingModuleTests.cs       # Test AI Grading
│   │   │   └── TranscriptionModuleTests.cs # Test Speech-to-Text
│   │   │
│   │   ├── 📁 Controllers/             # Controller Tests
│   │   │   └── AISpeakingControllerTests.cs
│   │   │
│   │   ├── 📁 TestResults/             # Test Reports
│   │   ├── 📁 coverage-html/           # Code Coverage Reports
│   │   └── EMT_API.Tests.csproj        # Test Project File
│   │
│   └── EMT_API.sln                     # Visual Studio Solution
│
├── 📁 AIChat/                          # 🤖 Standalone AI Chatbot
│   └── AI.js                           # Vanilla JS Chatbot (Google Gemini/OpenAI)
│
├── 📄 EMTDatabase.sql                  # 🗄️ Database Schema Script
├── 📄 SavePlan.sql                     # Additional SQL Scripts
├── 📄 package.json                     # Root package.json (Vite config)
├── 📄 vite.config.ts                   # Root Vite configuration
├── 📄 .gitignore                       # Git ignore rules
└── 📄 README.md                        # 📖 This file
```

### 📋 Chi tiết các module chính

#### 🎨 Frontend (React)
- **Components**: UI components tổ chức theo role (Admin/Teacher/Student)
- **Middleware**: API client layer với Axios, JWT interceptors
- **Redux**: Global state management cho authentication, user data
- **Routing**: React Router cho navigation giữa các trang

#### 🖥️ Backend (ASP.NET Core)
- **Controllers**: RESTful API endpoints, organized by feature domain
- **Services**: Business logic, AI integration, payment processing
- **Models**: Entity Framework Core entities mapping to database
- **DTOs**: Data transfer objects for API requests/responses
- **Security**: JWT authentication, password hashing, authorization

#### 🗄️ Database (SQL Server)
- **30+ Tables**: User management, courses, lessons, membership, payments
- **Relationships**: Foreign keys, one-to-many, many-to-many
- **Indexes**: Optimized for query performance
- **Stored Procedures**: Complex business logic in database

## 🚀 Hướng dẫn cài đặt

### ✅ Yêu cầu hệ thống

Trước khi bắt đầu, đảm bảo máy tính của bạn đã cài đặt:

| Công cụ | Version | Link Download |
|---------|---------|---------------|
| **Node.js** | >= 18.x | [nodejs.org](https://nodejs.org/) |
| **.NET SDK** | >= 8.0 | [dotnet.microsoft.com](https://dotnet.microsoft.com/download) |
| **SQL Server** | 2019+ | [microsoft.com/sql-server](https://www.microsoft.com/sql-server) |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) |
| **VS Code** (Optional) | Latest | [code.visualstudio.com](https://code.visualstudio.com/) |
| **Visual Studio** (Optional) | 2022+ | [visualstudio.microsoft.com](https://visualstudio.microsoft.com/) |

### 📥 Bước 1: Clone Repository

```bash
# Clone dự án về máy
git clone https://github.com/nldhoang10092004/Group1_SWP391_FPTU.git

# Di chuyển vào thư mục dự án
cd Group1_SWP391_FPTU
```

## ▶️ Chạy dự án

### 🗄️ Bước 2: Cấu hình Database (BẮT BUỘC CHẠY TRƯỚC)

#### 2.1. Tạo Database từ Script SQL

```bash
# Mở SQL Server Management Studio (SSMS)
# Hoặc sử dụng command line:

# Windows (PowerShell):
sqlcmd -S localhost -E -i EMTDatabase.sql

# macOS/Linux:
sqlcmd -S localhost -U sa -P YourPassword -i EMTDatabase.sql
```

#### 2.2. Cấu hình Connection String

Mở file `server/EMT_API/appsettings.json` và cập nhật connection string:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=EMTDatabase;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

**Lưu ý cho các trường hợp:**
- **Windows Authentication**: Dùng `Trusted_Connection=True`
- **SQL Server Authentication**: Dùng `User Id=sa;Password=YourPassword;`
- **Azure SQL**: Thay đổi Server name và thêm credentials

### 🖥️ Bước 3: Chạy Backend (API Server)

```bash
# Di chuyển vào thư mục API
cd server/EMT_API

# Restore các NuGet packages
dotnet restore

# Build project
dotnet build

# Chạy API server
dotnet run
```

✅ **Backend đã chạy thành công khi thấy:**
```
Now listening on: https://localhost:7010
Now listening on: http://localhost:5000
Application started. Press Ctrl+C to shut down.
```

🔗 **Các URL quan trọng:**
- API Base: `https://localhost:7010`
- Swagger UI: `https://localhost:7010/swagger`
- Health Check: `https://localhost:7010/health`

### 🎨 Bước 4: Chạy Frontend (React App)

Mở terminal mới (để backend tiếp tục chạy):

```bash
# Di chuyển vào thư mục frontend
cd front-end

# Cài đặt dependencies
npm install

# Chạy development server
npm start
```

**Hoặc nếu dùng Vite:**
```bash
npm run dev
```

✅ **Frontend đã chạy thành công khi thấy:**
```
  VITE v6.3.5  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

🔗 **Truy cập ứng dụng:**
- Frontend: `http://localhost:3000`
- Admin Dashboard: `http://localhost:3000/admin`
- Teacher Dashboard: `http://localhost:3000/teacher`

### 🔄 Luồng hoạt động của hệ thống

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER ACCESS FLOW                             │
└─────────────────────────────────────────────────────────────────┘

   Browser (http://localhost:3000)
        │
        │ 1. User visits website
        ▼
   ┌─────────────────────┐
   │   REACT FRONTEND    │
   │   (Vite Dev Server) │
   └──────────┬──────────┘
              │
              │ 2. API Calls (Axios)
              │    - POST /api/auth/login
              │    - GET /api/course
              │    - POST /api/membership/subscribe
              ▼
   ┌─────────────────────┐
   │  ASP.NET CORE API   │
   │  (localhost:7010)   │
   └──────────┬──────────┘
              │
              │ 3. JWT Authentication
              │ 4. Business Logic (Services)
              │ 5. Database Queries (EF Core)
              ▼
   ┌─────────────────────┐
   │    SQL SERVER       │
   │   (EMTDatabase)     │
   └─────────────────────┘
              │
              │ 6. Return Data
              ▼
   ┌─────────────────────┐
   │   EXTERNAL APIs     │
   │ • PayOS Payment     │
   │ • OpenAI / Gemini   │
   │ • Deepgram STT      │
   │ • Google Drive      │
   └─────────────────────┘
```

### 📦 Build cho Production

#### Build Frontend
```bash
cd front-end
npm run build

# Output sẽ ở thư mục: front-end/build/
# Deploy các file static này lên web server
```

#### Build Backend
```bash
cd server/EMT_API
dotnet publish -c Release -o ./publish

# Output sẽ ở thư mục: server/EMT_API/publish/
# Deploy lên IIS, Azure, hoặc Linux server
```

## 🗄️ Cấu hình Database

### 📊 Database Schema Overview

Database **EMTDatabase** gồm **30+ bảng** được tổ chức theo các nhóm chức năng:

<table>
<tr>
<td width="50%">

**👤 User Management**
- `Account` - Tài khoản (Student/Teacher/Admin)
- `UserDetail` - Thông tin chi tiết người dùng
- `Teacher` - Thông tin giảng viên
- `UserProgress` - Tiến độ học tập
- `UserAchievement` - Thành tích của user

**📚 Course Management**
- `Course` - Khóa học (4 levels)
- `CourseChapter` - Chương trong khóa học
- `Lesson` - Bài học chi tiết
- `LessonContent` - Nội dung bài học
- `CourseEnrollment` - Đăng ký khóa học
- `Review` - Đánh giá khóa học

**💳 Payment & Membership**
- `Membership` - Các gói membership
- `UserMembership` - Membership của user
- `PaymentTransaction` - Lịch sử giao dịch
- `Voucher` - Mã giảm giá
- `VoucherUsage` - Lịch sử sử dụng voucher

</td>
<td width="50%">

**📝 Learning & Assessment**
- `QuestionSet` - Bộ đề thi/quiz
- `Question` - Câu hỏi
- `Answer` - Đáp án
- `UserAnswer` - Câu trả lời của user
- `ExamResult` - Kết quả thi
- `Flashcard` - Thẻ học từ vựng
- `FlashcardDeck` - Bộ flashcard

**💬 Community**
- `Forum` - Diễn đàn
- `Thread` - Chủ đề thảo luận
- `Comment` - Bình luận
- `Notification` - Thông báo

**🤖 AI & Media**
- `AITestHistory` - Lịch sử test AI
- `SpeakingSubmission` - Bài nộp Speaking
- `WritingSubmission` - Bài nộp Writing
- `VideoResource` - Tài nguyên video
- `Document` - Tài liệu học tập

</td>
</tr>
</table>

### 🔗 Entity Relationships

```
Account (1) ──────────────(N) Course
   │                           │
   │ (1)                       │ (1)
   │                           │
   ▼ (1)                       ▼ (N)
UserDetail              CourseChapter
   │                           │
   │ (1)                       │ (1)
   │                           │
   ▼ (N)                       ▼ (N)
UserMembership              Lesson
   │
   │ (N)
   │
   ▼ (1)
Membership
```

### ⚙️ Environment Configuration

#### Backend Configuration (`appsettings.json`)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=EMTDatabase;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  
  "Jwt": {
    "SecretKey": "your-super-secret-key-at-least-32-characters-long",
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
    "Password": "your-app-specific-password"
  },
  
  "PayOS": {
    "ClientId": "your-payos-client-id",
    "ApiKey": "your-payos-api-key",
    "ChecksumKey": "your-payos-checksum-key"
  },
  
  "OpenAI": {
    "ApiKey": "your-openai-api-key",
    "Model": "gpt-4"
  },
  
  "Google": {
    "GeminiApiKey": "your-gemini-api-key"
  },
  
  "Deepgram": {
    "ApiKey": "your-deepgram-api-key"
  },
  
  "GoogleDrive": {
    "ClientId": "your-google-client-id",
    "ClientSecret": "your-google-client-secret",
    "RefreshToken": "your-refresh-token"
  },
  
  "AWS": {
    "AccessKey": "your-aws-access-key",
    "SecretKey": "your-aws-secret-key",
    "BucketName": "your-bucket-name",
    "Region": "ap-southeast-1"
  }
}
```

#### Frontend API Configuration

Cập nhật API base URL trong các file middleware:

**File:** `front-end/src/middleware/axiosInstance.js`
```javascript
const axiosInstance = axios.create({
  baseURL: 'https://localhost:7010/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});
```

### 🔑 Demo Accounts

Sau khi chạy script `EMTDatabase.sql`, bạn có thể sử dụng các tài khoản demo:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| **Admin** | admin@emt.com | Admin@123 | Quản trị viên hệ thống |
| **Teacher** | teacher@emt.com | Teacher@123 | Giảng viên demo |
| **Student** | student@emt.com | Student@123 | Học viên demo |

## 📚 API Documentation

### 🌐 Swagger UI

API documentation được tự động generate và có sẵn qua Swagger UI:

```
🔗 https://localhost:7010/swagger
```

### 🔐 Authentication Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                    JWT AUTHENTICATION FLOW                       │
└──────────────────────────────────────────────────────────────────┘

1. Login Request:
   POST /api/auth/login
   Body: { "email": "user@emt.com", "password": "password123" }
   
   ↓
   
2. Server Response:
   {
     "accessToken": "eyJhbGciOiJIUzI1NiIs...",  // 15 minutes
     "refreshToken": "stored in HttpOnly Cookie", // 7 days
     "user": { ... }
   }
   
   ↓
   
3. Subsequent Requests:
   Header: "Authorization: Bearer {accessToken}"
   
   ↓
   
4. Token Expired?
   POST /api/auth/refresh
   → Returns new accessToken
   
   ↓
   
5. Logout:
   POST /api/auth/logout
   → Invalidates refreshToken cookie
```

### 📋 API Endpoints Overview

<table>
<tr>
<td width="50%">

#### 🔐 Authentication (`/api/auth`)
```
POST   /api/auth/register          # Đăng ký Student
POST   /api/auth/register-teacher  # Đăng ký Teacher
POST   /api/auth/login             # Đăng nhập
POST   /api/auth/refresh           # Refresh token
POST   /api/auth/logout            # Đăng xuất
POST   /api/auth/send-otp          # Gửi OTP email
POST   /api/auth/verify-otp        # Xác thực OTP
POST   /api/auth/forgot-password   # Quên mật khẩu
POST   /api/auth/reset-password    # Reset mật khẩu
POST   /api/auth/google-login      # Login với Google
```

#### 👤 User Profile (`/api/profile`)
```
GET    /api/profile                # Lấy thông tin profile
PUT    /api/profile                # Cập nhật profile
POST   /api/profile/avatar         # Upload avatar
POST   /api/profile/change-password # Đổi mật khẩu
GET    /api/profile/progress       # Tiến độ học tập
```

#### 📚 Course Management (`/api/course`)
```
GET    /api/course                 # Danh sách khóa học
GET    /api/course/{id}            # Chi tiết khóa học
POST   /api/course                 # Tạo khóa học [Teacher]
PUT    /api/course/{id}            # Cập nhật khóa học [Teacher]
DELETE /api/course/{id}            # Xóa khóa học [Teacher]
GET    /api/course/{id}/chapters   # Chapters của khóa học
POST   /api/course/{id}/enroll     # Đăng ký khóa học
GET    /api/course/my-courses      # Khóa học của tôi
```

#### 📖 Lesson Management (`/api/lesson`)
```
GET    /api/lesson/{id}            # Chi tiết bài học
POST   /api/lesson                 # Tạo bài học [Teacher]
PUT    /api/lesson/{id}            # Cập nhật bài học
DELETE /api/lesson/{id}            # Xóa bài học
POST   /api/lesson/{id}/complete   # Đánh dấu hoàn thành
```

</td>
<td width="50%">

#### 💳 Membership & Payment (`/api/membership`)
```
GET    /api/membership/plans       # Danh sách gói membership
POST   /api/membership/subscribe   # Đăng ký membership
GET    /api/membership/current     # Membership hiện tại
POST   /api/membership/cancel      # Hủy membership
GET    /api/membership/history     # Lịch sử membership
```

#### 💰 Payment (`/api/payment`)
```
POST   /api/payment/create         # Tạo payment link (PayOS)
POST   /api/payment/webhook        # PayOS webhook
GET    /api/payment/status/{id}    # Trạng thái thanh toán
GET    /api/payment/history        # Lịch sử giao dịch
POST   /api/payment/refund         # Hoàn tiền [Admin]
```

#### 🤖 AI Learning (`/api/ai`)
```
POST   /api/ai/speaking/generate   # Sinh đề Speaking
POST   /api/ai/speaking/submit     # Nộp bài Speaking
POST   /api/ai/speaking/grade      # Chấm điểm Speaking
POST   /api/ai/writing/submit      # Nộp bài Writing
POST   /api/ai/writing/grade       # Chấm điểm Writing
POST   /api/ai/chat                # AI Chatbot
```

#### 📇 Flashcard (`/api/flashcard`)
```
GET    /api/flashcard              # Danh sách flashcard decks
GET    /api/flashcard/{id}         # Chi tiết deck
POST   /api/flashcard              # Tạo flashcard [Teacher]
PUT    /api/flashcard/{id}         # Cập nhật flashcard
DELETE /api/flashcard/{id}         # Xóa flashcard
POST   /api/flashcard/{id}/review  # Review flashcard
```

#### 💬 Forum (`/api/forum`)
```
GET    /api/forum                  # Danh sách threads
GET    /api/forum/{id}             # Chi tiết thread
POST   /api/forum                  # Tạo thread mới
POST   /api/forum/{id}/comment     # Comment vào thread
PUT    /api/forum/comment/{id}     # Edit comment
DELETE /api/forum/comment/{id}     # Xóa comment
```

#### ⚙️ Admin (`/api/admin`)
```
GET    /api/admin/users            # Quản lý users
PUT    /api/admin/users/{id}/role  # Thay đổi role
DELETE /api/admin/users/{id}       # Xóa user
GET    /api/admin/courses          # Quản lý courses
PUT    /api/admin/courses/{id}/approve # Duyệt course
GET    /api/admin/statistics       # Thống kê hệ thống
GET    /api/admin/dashboard        # Dashboard data
```

</td>
</tr>
</table>

### 📝 Request/Response Examples

#### Example 1: User Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "student@emt.com",
  "password": "Student@123"
}

→ Response 200 OK
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "student@emt.com",
    "fullName": "John Doe",
    "role": "Student",
    "avatar": "https://..."
  }
}
```

#### Example 2: Get Courses
```http
GET /api/course?level=1&page=1&pageSize=10
Authorization: Bearer {accessToken}

→ Response 200 OK
{
  "data": [
    {
      "id": 1,
      "title": "English for Beginners",
      "description": "...",
      "level": 1,
      "teacherId": 2,
      "teacherName": "Jane Smith",
      "duration": 40,
      "rating": 4.5,
      "enrollmentCount": 150
    }
  ],
  "totalCount": 25,
  "page": 1,
  "pageSize": 10
}
```

#### Example 3: AI Speaking Test
```http
POST /api/ai/speaking/generate
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "level": "Intermediate",
  "topic": "Daily Life"
}

→ Response 200 OK
{
  "promptId": "abc123",
  "question": "Describe your typical morning routine...",
  "instructions": "You have 2 minutes to prepare and 3 minutes to speak.",
  "expiresAt": "2024-11-01T10:30:00Z"
}
```

### 🔧 HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request thành công |
| 201 | Created | Tạo resource thành công |
| 400 | Bad Request | Request không hợp lệ |
| 401 | Unauthorized | Chưa đăng nhập hoặc token hết hạn |
| 403 | Forbidden | Không có quyền truy cập |
| 404 | Not Found | Resource không tồn tại |
| 500 | Server Error | Lỗi server |

## 🧪 Testing

Dự án có hệ thống testing toàn diện với **xUnit framework**.

### 🔬 Test Structure

```
EMT_API.Tests/
├── Services/
│   ├── PromptModuleTests.cs          # Test AI prompt generation
│   ├── GradingModuleTests.cs         # Test AI grading system
│   └── TranscriptionModuleTests.cs   # Test speech-to-text
├── Controllers/
│   └── AISpeakingControllerTests.cs  # Test API controllers
└── coverage-html/                    # Code coverage reports
```

### ▶️ Chạy Tests

```bash
# Di chuyển vào thư mục test
cd server/EMT_API.Tests

# Chạy tất cả tests
dotnet test

# Chạy tests với code coverage
dotnet test --collect:"XPlat Code Coverage"

# Chạy tests và tạo HTML coverage report
dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=html
```

### 📊 Test Coverage

Xem báo cáo coverage tại: `server/EMT_API.Tests/coverage-html/index.html`

### 🎯 Test Categories

<table>
<tr>
<td width="50%">

**Unit Tests**
- Service layer logic
- AI prompt generation
- Grading algorithms
- Data validation
- Helper functions

</td>
<td width="50%">

**Integration Tests**
- API controllers
- Database operations
- Authentication flow
- External API calls
- End-to-end scenarios

</td>
</tr>
</table>

### ✅ Test Example

```csharp
[Fact]
public async Task AISpeaking_GeneratePrompt_ReturnsValidPrompt()
{
    // Arrange
    var service = new AISpeakingService(_mockConfig);
    var request = new GeneratePromptRequest 
    { 
        Level = "Intermediate",
        Topic = "Daily Life" 
    };

    // Act
    var result = await service.GeneratePrompt(request);

    // Assert
    Assert.NotNull(result);
    Assert.NotEmpty(result.Question);
    Assert.True(result.Question.Length > 20);
}
```

## 👥 Team

### 👨‍💻 Group 1 - SWP391 - FPTU

<table>
<tr>
<td align="center">
<strong>Project Lead & Lead Developer</strong><br>
<a href="https://github.com/nldhoang10092004">
<img src="https://github.com/nldhoang10092004.png" width="100px;" alt="Hoàng"/><br>
<sub><b>Nguyễn Lê Đức Hoàng</b></sub>
</a><br>
🎯 Backend Lead | 🤖 AI Integration
</td>
<td align="center">
<strong>Frontend Developer</strong><br>
<sub><b>Thành viên 2</b></sub><br>
⚛️ React | 🎨 UI/UX
</td>
<td align="center">
<strong>Backend Developer</strong><br>
<sub><b>Thành viên 3</b></sub><br>
🔧 .NET Core | 🗄️ Database
</td>
<td align="center">
<strong>Full Stack Developer</strong><br>
<sub><b>Thành viên 4</b></sub><br>
🌐 Integration | 📊 Testing
</td>
</tr>
</table>

### 🎯 Vai trò & Trách nhiệm

| Thành viên | Vai trò | Công việc chính |
|------------|---------|----------------|
| **Hoàng** | Project Lead | Backend API, AI Integration, Database Design, DevOps |
| **Thành viên 2** | Frontend Lead | React Components, UI/UX, State Management |
| **Thành viên 3** | Backend Developer | Controllers, Services, Authentication, Payment |
| **Thành viên 4** | Full Stack | Testing, Documentation, Integration |

---

## 🚀 Deployment

### 📦 Production Deployment

<table>
<tr>
<td width="33%">

**Frontend**
- Platform: Vercel / Netlify
- Build: `npm run build`
- Deploy: Auto from `main` branch

</td>
<td width="33%">

**Backend**
- Platform: Azure / AWS
- Build: `dotnet publish`
- Container: Docker (optional)

</td>
<td width="34%">

**Database**
- Platform: Azure SQL / AWS RDS
- Migration: EF Core Migrations
- Backup: Daily automated

</td>
</tr>
</table>

### 🐳 Docker (Optional)

```bash
# Build backend Docker image
cd server/EMT_API
docker build -t emt-api .
docker run -p 7010:80 emt-api

# Build frontend Docker image
cd front-end
docker build -t emt-frontend .
docker run -p 3000:80 emt-frontend
```

---

## 📊 Project Statistics

```
📁 Total Files:        500+
📝 Lines of Code:      50,000+
⚛️ React Components:   100+
🔌 API Endpoints:      80+
🗄️ Database Tables:    30+
🧪 Unit Tests:         50+
👥 Contributors:       4
⏱️ Development Time:   3 months
```

---

## 📄 License

Dự án này được phát triển cho môn **SWP391** tại **FPT University**.

© 2024 Group 1 - All Rights Reserved

---

## 📞 Liên hệ

<table>
<tr>
<td width="50%">

**📧 Contact Information**
- 🌐 GitHub: [Group1_SWP391_FPTU](https://github.com/nldhoang10092004/Group1_SWP391_FPTU)
- 📧 Email: Via GitHub Issues
- 🎓 University: FPT University
- 📚 Course: SWP391 - Software Engineering Project

</td>
<td width="50%">

**🔗 Useful Links**
- [📖 API Documentation](https://localhost:7010/swagger)
- [🐛 Report Bug](https://github.com/nldhoang10092004/Group1_SWP391_FPTU/issues)
- [💡 Request Feature](https://github.com/nldhoang10092004/Group1_SWP391_FPTU/issues)
- [📝 Wiki](https://github.com/nldhoang10092004/Group1_SWP391_FPTU/wiki)

</td>
</tr>
</table>

---

## 🙏 Acknowledgments

Chúng em xin gửi lời cảm ơn đến:

- **FPT University** - Cung cấp môi trường học tập và hỗ trợ dự án
- **Giảng viên hướng dẫn** - Những góp ý quý báu trong suốt quá trình phát triển
- **Open Source Community** - Các thư viện và framework được sử dụng:
  - React, ASP.NET Core, Entity Framework Core
  - OpenAI, Google Gemini, Deepgram
  - PayOS, Tailwind CSS, Radix UI
- **AI4SE Course** - Kiến thức về AI trong Software Engineering
- **Nhóm phát triển** - Sự cống hiến và teamwork của các thành viên

---

## 🎓 Academic Context

**Môn học:** SWP391 - Software Engineering Project  
**Học kỳ:** Fall 2024  
**Trường:** FPT University - TP.HCM  
**Ngày thi:** 01/11/2024  
**Mục tiêu:** Áp dụng AI vào Software Engineering (AI4SE)

---

## 🌟 Key Highlights

```
✨ Membership-based Learning Platform
🤖 AI-Powered Speaking & Writing Tests  
💳 Integrated Payment Gateway (PayOS)
🎯 4-Level Structured Course System
📊 Real-time Analytics Dashboard
🔐 Secure JWT Authentication
☁️ Cloud Storage Integration
🧪 Comprehensive Testing Suite
📱 Responsive Design
🌐 RESTful API Architecture
```

---

<div align="center">

## 🏆 Built for AI4SE Exam - 01/11/2024

**Made with ❤️ and ☕ by Group 1 - SWP391 - FPTU**

[![GitHub Stars](https://img.shields.io/github/stars/nldhoang10092004/Group1_SWP391_FPTU?style=social)](https://github.com/nldhoang10092004/Group1_SWP391_FPTU)
[![GitHub Forks](https://img.shields.io/github/forks/nldhoang10092004/Group1_SWP391_FPTU?style=social)](https://github.com/nldhoang10092004/Group1_SWP391_FPTU)
[![GitHub Issues](https://img.shields.io/github/issues/nldhoang10092004/Group1_SWP391_FPTU)](https://github.com/nldhoang10092004/Group1_SWP391_FPTU/issues)

**[⬆ Back to Top](#-english-mastery-training-emt-platform)**

</div>
