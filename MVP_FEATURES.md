# MVP Features - Week 7 Completion

This document describes the Student and Teacher features implemented for the MVP.

## Student Features

### 1. Student Dashboard (`/student/dashboard`)
- View personal statistics (XP, Streak, Level, Progress)
- Weekly goals tracking (lessons and study time)
- Available courses preview
- Recent achievements display

### 2. Student Courses (`/student/courses`)
- Browse all available courses
- Filter courses by level (1-4)
- View course information (name, description, teacher, level)
- Navigate to course details

### 3. Student Course Detail (`/student/courses/:courseId`)
- View complete course information
- See course chapters and videos
- Preview free videos
- Enroll in courses

## Teacher Features

### 1. Teacher Dashboard (`/teacher/dashboard`)
- View teaching statistics (total courses, chapters, videos, students)
- Recent courses list
- Quick access to course management
- Teacher profile information

### 2. Teacher Course Management (`/teacher/courses/manage`)
- Create new courses with name, description, and level
- Edit existing courses
- Delete courses
- View course statistics (chapters, videos count)

## Backend API Endpoints

### Student Endpoints
- `GET /api/student/courses` - Get all courses
- `GET /api/student/courses/{courseId}` - Get course details
- `GET /api/student/courses/level/{level}` - Get courses by level
- `GET /api/student/dashboard` - Get student dashboard data

### Teacher Endpoints
- `GET /api/teacher/{teacherId}/courses` - Get teacher's courses
- `GET /api/teacher/{teacherId}/dashboard` - Get teacher dashboard
- `POST /api/teacher/{teacherId}/courses` - Create new course
- `PUT /api/teacher/{teacherId}/courses/{courseId}` - Update course
- `DELETE /api/teacher/{teacherId}/courses/{courseId}` - Delete course
- `POST /api/teacher/{teacherId}/courses/{courseId}/chapters` - Add chapter
- `PUT /api/teacher/{teacherId}/courses/{courseId}/chapters/{chapterId}` - Update chapter
- `DELETE /api/teacher/{teacherId}/courses/{courseId}/chapters/{chapterId}` - Delete chapter
- `POST /api/teacher/{teacherId}/courses/{courseId}/chapters/{chapterId}/videos` - Add video
- `PUT /api/teacher/{teacherId}/courses/{courseId}/videos/{videoId}` - Update video
- `DELETE /api/teacher/{teacherId}/courses/{courseId}/videos/{videoId}` - Delete video

## How to Use

### For Students:
1. Login with student credentials
2. Navigate to "Dashboard" to see your progress
3. Click "Khóa học" to browse available courses
4. Click on any course to view details and lessons

### For Teachers:
1. Login with teacher credentials
2. Navigate to "Dashboard" to see teaching statistics
3. Click "Quản lý khóa học" to manage courses
4. Create new courses, add chapters and videos
5. Edit or delete existing courses

## Demo Accounts

### Student Account:
- Email: `students@gmail.com`
- Password: `1234567890`

### Teacher Account:
- Email: `teacher@emt.com`
- Password: `password123`

## Technical Stack

### Backend:
- ASP.NET Core 8.0
- Entity Framework Core
- SQL Server
- JWT Authentication

### Frontend:
- React 18
- React Router v6
- React Bootstrap
- Axios for API calls
- SCSS for styling

## Course Levels

The system supports 4 course levels:
1. Level 1 - Nền tảng (Foundation)
2. Level 2 - Cơ bản (Basic)
3. Level 3 - Trung cấp (Intermediate)
4. Level 4 - Chuyên sâu (Advanced)

Each course level can only have one course (unique constraint).

## Future Enhancements

- User enrollment tracking
- Progress tracking for students
- Quiz integration
- Flashcard system
- Video upload functionality (currently uses URLs)
- Payment integration for course enrollment
- Certificate generation
- Student-teacher messaging
