# Admin Dashboard - Hệ thống quản trị

## 📁 Files trong folder `/admin/`

### AdminDashboard.jsx
Dashboard quản lý hệ thống dành cho Admin với các tính năng:

#### Tính năng chính:
1. **Thống kê tổng quan**
   - Tổng số người dùng và người dùng mới
   - Gói membership đang hoạt động
   - Doanh thu tháng và tổng doanh thu
   - Tổng số khóa học và bài học

2. **Biểu đồ phân tích**
   - Doanh thu theo tháng (Area Chart)
   - Tăng trưởng người dùng (Line Chart)

3. **Quản lý người dùng**
   - Xem danh sách tất cả người dùng
   - Khóa/kích hoạt tài khoản
   - Xem thông tin chi tiết
   - Lọc theo loại tài khoản (student/teacher/admin)

4. **Quản lý giảng viên**
   - Tạo tài khoản giảng viên mới
   - Quản lý danh sách giảng viên
   - Khóa/kích hoạt tài khoản giảng viên

5. **Quản lý khóa học**
   - Duyệt khóa học mới từ giảng viên
   - Ẩn khóa học vi phạm
   - Xem thống kê học viên theo khóa học

6. **Kiểm duyệt đánh giá**
   - Duyệt đánh giá từ học viên
   - Ẩn hoặc xóa đánh giá không phù hợp
   - Xem rating và feedback

7. **Quản lý kiểm tra hệ thống**
   - Tạo bài kiểm tra cho toàn hệ thống
   - Cấu hình thời gian, số câu hỏi, điểm đạt
   - Xuất/nhập câu hỏi
   - Xóa hoặc tạm dừng bài kiểm tra

8. **Quản lý Campaign/Voucher**
   - Tạo voucher giảm giá
   - Theo dõi số lần sử dụng
   - Kích hoạt/tạm dừng voucher
   - Cấu hình phần trăm hoặc giá trị cố định

## 🔌 Dependencies

### UI Components (từ `/components/ui/`)
- Card, CardContent, CardDescription, CardHeader, CardTitle
- Tabs, TabsContent, TabsList, TabsTrigger
- Button, Badge, Table
- Dialog, Input, Textarea, Select, Switch, Alert

### External Libraries
- **recharts** - Biểu đồ (LineChart, AreaChart, BarChart)
- **lucide-react** - Icons
- **sonner** - Toast notifications

### Internal Services
- **authService** từ `/utils/supabase/auth.jsx`
  - `getAdminStats()` - Lấy thống kê admin
  - `getAllRequests()` - Lấy tất cả requests (admin only)

## 📝 Cách sử dụng

### Import trong App.jsx:
```jsx
import { AdminDashboard } from "./admin/AdminDashboard";
```

### Sử dụng:
```jsx
{currentView === "admin-dashboard" && userProfile?.userType === 'admin' && (
  <AdminDashboard onClose={() => setCurrentView("home")} />
)}
```

### Props:
- `onClose: () => void` - Callback khi đóng dashboard

## 🔐 Phân quyền

Chỉ user với `userType === 'admin'` mới có thể truy cập AdminDashboard.

### Demo Account:
```
Email: admin@emt.com
Password: admin123
```

## 📊 Mock Data

AdminDashboard sử dụng mock data cho:
- Danh sách người dùng mẫu
- Đánh giá khóa học mẫu
- Khóa học mẫu
- Bài kiểm tra hệ thống mẫu
- Voucher mẫu

Trong production, data sẽ được lấy từ API thông qua `authService`.

## 🎨 UI Features

1. **Responsive Design** - Tự động điều chỉnh cho mobile, tablet, desktop
2. **Loading States** - Hiển thị loading spinner khi tải dữ liệu
3. **Toast Notifications** - Thông báo thành công/lỗi
4. **Modal Dialogs** - Tạo mới giảng viên, voucher, bài kiểm tra
5. **Charts** - Biểu đồ tương tác với recharts
6. **Tables** - Bảng dữ liệu với sorting và filtering

## 🚀 Roadmap

- [ ] Xuất báo cáo Excel/PDF
- [ ] Gửi email thông báo cho user
- [ ] Tích hợp analytics chi tiết hơn
- [ ] Quản lý permissions chi tiết
- [ ] Backup/Restore database
- [ ] Audit logs
