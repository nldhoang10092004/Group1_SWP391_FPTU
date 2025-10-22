# API Middleware - Centralized API Management

## 📁 Structure

```
/utils/api/
├── apiClient.js     - HTTP client with retry logic
├── endpoints.js     - All API endpoints
├── services.js      - Business logic layer
├── index.js         - Main export
└── README.md        - Documentation
```

## 🎯 Purpose

Tách biệt API calls khỏi components để:
- ✅ Dễ bảo trì và mở rộng
- ✅ Tái sử dụng code
- ✅ Xử lý lỗi tập trung
- ✅ Retry logic tự động
- ✅ Dễ test và mock

## 🔧 Usage

### Basic Example

```jsx
import { api } from '../utils/api';

// In your component
const MyComponent = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await api.course.list();
        setData(result);
      } catch (error) {
        console.error('Failed to load courses:', error);
      }
    };
    loadData();
  }, []);

  return <div>{/* render data */}</div>;
};
```

### Available Services

#### Authentication
```jsx
// Sign in
const { user, profile } = await api.auth.signIn(email, password);

// Sign up
await api.auth.signUp({ email, password, fullName, userType });

// Sign out
await api.auth.signOut();

// Reset password
await api.auth.resetPassword(email);
```

#### Profile
```jsx
// Get profile
const profile = await api.profile.get();

// Update profile
await api.profile.update({ fullName: "New Name" });

// Upload avatar
await api.profile.uploadAvatar(file);
```

#### Courses
```jsx
// List all courses
const courses = await api.course.list();

// Get specific course
const course = await api.course.get(courseId);

// Create course (teacher/admin)
await api.course.create({ name, description, level });

// Update course
await api.course.update(courseId, { name: "Updated" });

// Delete course
await api.course.delete(courseId);

// Enroll in course
await api.course.enroll(courseId);
```

#### Lessons
```jsx
// List lessons in course
const lessons = await api.lesson.list(courseId);

// Get specific lesson
const lesson = await api.lesson.get(lessonId);

// Create lesson (teacher)
await api.lesson.create({ title, content, courseId });

// Update lesson
await api.lesson.update(lessonId, { title: "Updated" });

// Delete lesson
await api.lesson.delete(lessonId);
```

#### Progress
```jsx
// Get course progress
const progress = await api.progress.getCourseProgress(courseId);

// Save lesson progress
await api.progress.saveLessonProgress({
  lessonId,
  courseId,
  score: 85,
  timeSpent: 15,
  completed: true
});
```

#### Subscription
```jsx
// Activate subscription
await api.subscription.activate(planId);

// Cancel subscription
await api.subscription.cancel();

// Get subscription status
const status = await api.subscription.getStatus();
```

#### Writing
```jsx
// Submit writing task
const submissionId = await api.writing.submit(taskId, content, wordCount);

// Get feedback
const feedback = await api.writing.getFeedback(submissionId);
```

#### Requests
```jsx
// List my requests
const requests = await api.request.list();

// Create request
await api.request.create({
  type: 'bug_report',
  title: 'Issue title',
  description: 'Details',
  priority: 'medium'
});

// Update request
await api.request.update(requestId, { status: 'resolved' });
```

#### Admin (Admin only)
```jsx
// Get admin stats
const stats = await api.admin.getStats();

// Get all users
const users = await api.admin.getUsers();

// Get all requests
const requests = await api.admin.getRequests();

// Get revenue data
const revenue = await api.admin.getRevenue();
```

#### Teacher (Teacher only)
```jsx
// Get my courses
const courses = await api.teacher.getCourses();

// Get my students
const students = await api.teacher.getStudents();

// Get teaching stats
const stats = await api.teacher.getStats();
```

## 🔐 Authentication

API client tự động gửi token với mọi request:

```jsx
import { apiClient } from '../utils/api/apiClient';

// Set token after login
apiClient.setToken(userToken);

// All subsequent requests will include this token
```

## 🔄 Retry Logic

API client tự động retry khi gặp lỗi network:
- Default: 3 retries
- Retry delay: 1s, 2s, 3s (progressive)
- Không retry với lỗi 4xx (client errors)

## ⚠️ Error Handling

```jsx
try {
  await api.course.create(courseData);
} catch (error) {
  // Error messages are already formatted
  console.error(error.message);
  toast.error(error.message);
}
```

## 📝 Adding New Endpoints

### 1. Add to `endpoints.js`

```js
export const ENDPOINTS = {
  // ... existing endpoints
  
  MY_NEW_API: {
    LIST: '/my-api',
    GET: (id) => `/my-api/${id}`,
    CREATE: '/my-api'
  }
};
```

### 2. Add to `services.js`

```js
export const myNewApi = {
  list: () => apiClient.get(ENDPOINTS.MY_NEW_API.LIST),
  get: (id) => apiClient.get(ENDPOINTS.MY_NEW_API.GET(id)),
  create: (data) => apiClient.post(ENDPOINTS.MY_NEW_API.CREATE, data)
};

// Add to main api export
export const api = {
  // ... existing services
  myNew: myNewApi
};
```

### 3. Use in components

```jsx
import { api } from '../utils/api';

const data = await api.myNew.list();
```

## 🎨 Best Practices

### ✅ DO:
- Always use api services instead of direct fetch
- Handle errors in components with try/catch
- Show loading states during API calls
- Use toast notifications for user feedback

### ❌ DON'T:
- Don't call fetch() directly in components
- Don't hardcode API URLs
- Don't ignore error handling
- Don't expose sensitive data in API calls

## 🧪 Testing

Mock API calls in tests:

```jsx
import { api } from '../utils/api';

jest.mock('../utils/api', () => ({
  api: {
    course: {
      list: jest.fn().mockResolvedValue([{ id: 1, name: 'Test' }])
    }
  }
}));
```

## 🚀 Migration Guide

### Before (Old way):
```jsx
// ❌ Direct fetch in component
const response = await fetch(`${baseUrl}/courses`);
const courses = await response.json();
```

### After (New way):
```jsx
// ✅ Using API service
import { api } from '../utils/api';

const courses = await api.course.list();
```

## 📊 Performance

- Automatic retry reduces failed requests
- Centralized caching can be added easily
- Request deduplication possible
- Progress tracking for uploads

## 🔮 Future Enhancements

- [ ] Request caching
- [ ] Request deduplication
- [ ] Optimistic updates
- [ ] Request cancellation
- [ ] Upload progress tracking
- [ ] WebSocket support
- [ ] GraphQL integration
