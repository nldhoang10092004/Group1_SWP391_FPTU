# Component Structure - Student & Teacher Features

## Application Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         App (Root)                               │
│                    Header (Navigation)                           │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ├── Login/Register Modal
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
   [STUDENT]                               [TEACHER]
        │                                       │
        ├── /student/dashboard                 ├── /teacher/dashboard
        │   StudentDashboard                   │   TeacherDashboard
        │   ├── Stats Cards (XP, Streak, etc)  │   ├── Stats Cards (Courses, Videos, etc)
        │   ├── Weekly Goals                   │   ├── Recent Courses Table
        │   ├── Course Preview Cards           │   └── Teacher Info Card
        │   └── Achievements                   │
        │                                       ├── /teacher/courses/manage
        ├── /student/courses                   │   TeacherCourseManagement
        │   StudentCourses                     │   ├── Create Course Modal
        │   ├── Level Filter Buttons           │   ├── Edit Course Modal
        │   └── Course Cards Grid              │   ├── Delete Course Action
        │                                       │   └── Courses Table
        └── /student/courses/:id               │
            StudentCourseDetail                └── [Future: Chapter/Video Management]
            ├── Course Header (Gradient)
            ├── Teacher Info
            ├── Chapters Accordion
            │   └── Video List
            └── Enrollment CTA
```

## API Service Layer

```
┌──────────────────────────────────────────────────────────┐
│                     API Services                          │
├──────────────────────────────────────────────────────────┤
│  studentAPI.js                │  teacherAPI.js           │
│  ├── getAllCourses()          │  ├── getTeacherCourses() │
│  ├── getCourseDetails()       │  ├── getTeacherDashboard()│
│  ├── getCoursesByLevel()      │  ├── createCourse()      │
│  └── getStudentDashboard()    │  ├── updateCourse()      │
│                                │  ├── deleteCourse()      │
│                                │  ├── addChapter()        │
│                                │  ├── updateChapter()     │
│                                │  ├── deleteChapter()     │
│                                │  ├── addVideo()          │
│                                │  ├── updateVideo()       │
│                                │  └── deleteVideo()       │
└──────────────────────────────────────────────────────────┘
                          │
                          ↓
┌──────────────────────────────────────────────────────────┐
│                  Backend Controllers                      │
├──────────────────────────────────────────────────────────┤
│  StudentController.cs         │  TeacherController.cs    │
│  /api/student                 │  /api/teacher            │
│  ├── GET /courses             │  ├── GET /{id}/courses   │
│  ├── GET /courses/{id}        │  ├── GET /{id}/dashboard │
│  ├── GET /courses/level/{lvl} │  ├── POST /{id}/courses  │
│  └── GET /dashboard           │  ├── PUT /{id}/courses/{cid}│
│                                │  ├── DELETE /{id}/courses/{cid}│
│                                │  └── [Chapter/Video CRUD]│
└──────────────────────────────────────────────────────────┘
                          │
                          ↓
┌──────────────────────────────────────────────────────────┐
│                    Database Layer                         │
│                  Entity Framework Core                    │
├──────────────────────────────────────────────────────────┤
│  Models:                                                  │
│  ├── Account (with Teacher navigation)                   │
│  ├── Teacher (1:N with Courses)                          │
│  ├── Course (1:N with Chapters, Videos)                  │
│  ├── CourseChapter (1:N with Videos)                     │
│  └── CourseVideo (with ResourceJson)                     │
└──────────────────────────────────────────────────────────┘
```

## Component Dependencies

### Student Components

```
StudentDashboard
├── React Bootstrap (Container, Row, Col, Card, Button, ProgressBar)
├── React Router (useNavigate)
├── API: getStudentDashboard(), getAllCourses()
└── Styling: StudentDashboard.scss

StudentCourses
├── React Bootstrap (Container, Row, Col, Card, Button, Badge)
├── React Router (useNavigate)
├── API: getAllCourses(), getCoursesByLevel()
└── Styling: StudentCourses.scss

StudentCourseDetail
├── React Bootstrap (Container, Row, Col, Card, Accordion, Badge, Button)
├── React Router (useParams, useNavigate)
├── API: getCourseDetails()
└── Styling: StudentCourseDetail.scss
```

### Teacher Components

```
TeacherDashboard
├── React Bootstrap (Container, Row, Col, Card, Button, Table)
├── React Router (useNavigate)
├── API: getTeacherDashboard()
└── Styling: TeacherDashboard.scss

TeacherCourseManagement
├── React Bootstrap (Container, Row, Col, Card, Button, Table, Modal, Form, Alert)
├── React Router (useNavigate)
├── API: getTeacherCourses(), createCourse(), updateCourse(), deleteCourse()
└── Styling: TeacherCourseManagement.scss
```

## Data Flow

### Student Course Viewing Flow
```
1. User logs in as Student
   └─> Redirected to /student/dashboard
       └─> StudentDashboard fetches data
           ├─> getStudentDashboard() → displays stats
           └─> getAllCourses() → shows course previews

2. User clicks "Xem tất cả khóa học"
   └─> Navigate to /student/courses
       └─> StudentCourses component
           └─> getAllCourses() → displays all courses

3. User filters by level
   └─> getCoursesByLevel(level) → shows filtered courses

4. User clicks "Xem chi tiết" on a course
   └─> Navigate to /student/courses/{courseId}
       └─> StudentCourseDetail component
           └─> getCourseDetails(courseId)
               └─> Shows course info, chapters, videos
```

### Teacher Course Management Flow
```
1. User logs in as Teacher
   └─> Redirected to /teacher/dashboard
       └─> TeacherDashboard fetches data
           └─> getTeacherDashboard(teacherId)
               └─> Shows stats and recent courses

2. User clicks "Quản lý khóa học"
   └─> Navigate to /teacher/courses/manage
       └─> TeacherCourseManagement component
           └─> getTeacherCourses(teacherId)
               └─> Shows all teacher's courses in table

3. User clicks "Tạo khóa học mới"
   └─> Opens modal with form
       └─> User fills in details
           └─> createCourse(teacherId, data)
               └─> Success → Refresh course list
               └─> Error → Show error message

4. User clicks edit icon
   └─> Opens modal with pre-filled form
       └─> User modifies details
           └─> updateCourse(teacherId, courseId, data)
               └─> Success → Refresh course list

5. User clicks delete icon
   └─> Confirmation dialog
       └─> deleteCourse(teacherId, courseId)
           └─> Success → Refresh course list
```

## State Management

### Component State (useState)
- Dashboard data (user stats, courses)
- Loading states
- Error messages
- Success messages
- Modal visibility
- Form inputs
- Selected items

### Props Flow
- Minimal prop drilling (components are mostly independent)
- Route params passed via React Router (useParams)
- Navigation handled via useNavigate hook

### Future Considerations
- Consider Context API for user authentication state
- Consider Redux/Zustand for complex state management
- Consider React Query for server state management

## Styling Architecture

```
SCSS Structure
├── Variables (colors, sizes) - inherited from existing theme
├── Component-specific styles
│   ├── .student-dashboard { ... }
│   ├── .student-courses { ... }
│   ├── .student-course-detail { ... }
│   ├── .teacher-dashboard { ... }
│   └── .teacher-course-management { ... }
├── Responsive breakpoints (@media queries)
└── Bootstrap overrides (minimal)

Design System:
- Primary Color: #667eea (purple gradient)
- Secondary Color: #764ba2
- Accent Colors: Various gradients
- Card shadows: 0 2px 8px rgba(0,0,0,0.1)
- Border radius: 15px for cards
- Transitions: 0.3s ease
```

## Responsive Design

```
Breakpoints:
├── Mobile (< 768px)
│   ├── Single column layout
│   ├── Stacked navigation
│   └── Full-width cards
├── Tablet (768px - 992px)
│   ├── Two column grid
│   └── Compact navigation
└── Desktop (> 992px)
    ├── Three column grid
    └── Full navigation

Components use Bootstrap's responsive grid:
- xs (default): 1 column
- md: 2 columns
- lg: 3 columns
- xl: 4 columns (where applicable)
```

## File Organization

```
Group1_SWP391_FPTU/
├── server/
│   └── EMT_API/
│       └── Controllers/
│           ├── StudentController.cs    (154 lines)
│           └── TeacherController.cs    (320 lines)
│
├── front-end/
│   └── src/
│       ├── api/
│       │   ├── studentAPI.js           (27 lines)
│       │   └── teacherAPI.js           (69 lines)
│       │
│       └── components/
│           ├── Student/
│           │   ├── StudentDashboard.js        (198 lines)
│           │   ├── StudentDashboard.scss      (80 lines)
│           │   ├── StudentCourses.js          (136 lines)
│           │   ├── StudentCourses.scss        (68 lines)
│           │   ├── StudentCourseDetail.js     (190 lines)
│           │   └── StudentCourseDetail.scss   (127 lines)
│           │
│           └── Teacher/
│               ├── TeacherDashboard.js            (212 lines)
│               ├── TeacherDashboard.scss          (102 lines)
│               ├── TeacherCourseManagement.js     (284 lines)
│               └── TeacherCourseManagement.scss   (41 lines)
│
└── Documentation/
    ├── MVP_FEATURES.md                 (119 lines)
    ├── IMPLEMENTATION_SUMMARY.md       (334 lines)
    └── COMPONENT_STRUCTURE.md          (This file)

Total: 2,517 lines of new code
```

## Testing Strategy

### Unit Testing (Recommended)
```
Backend:
- Test each controller method
- Test DTOs and validation
- Test error handling

Frontend:
- Test component rendering
- Test user interactions
- Test API calls (mocked)
- Test error states
```

### Integration Testing (Recommended)
```
- Test complete user flows
- Test API endpoint to UI interaction
- Test database operations
- Test authentication/authorization
```

### Manual Testing (Required)
```
✓ Student can view dashboard
✓ Student can browse courses
✓ Student can filter by level
✓ Student can view course details
✓ Teacher can view dashboard
✓ Teacher can create course
✓ Teacher can edit course
✓ Teacher can delete course
```

## Performance Optimization

### Current Optimizations
- Include() for eager loading
- Select projections for data transfer
- Component lazy loading potential
- Image lazy loading ready

### Future Optimizations
- Implement pagination
- Add caching layer
- Optimize bundle size
- Add service worker
- Implement virtual scrolling for large lists

## Browser Compatibility

Target browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Features used:
- ES6+ JavaScript
- CSS Grid & Flexbox
- Async/Await
- Bootstrap 5 components
