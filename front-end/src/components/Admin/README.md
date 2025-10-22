# 📦 EMT Admin Module - Self-Contained

## ✅ Cài đặt cực kỳ đơn giản!

### **Bước 1: Copy folder này vào project**
```bash
# Copy toàn bộ folder Admin vào /components/
cp -r Admin your-project/src/components/
```

### **Bước 2: Cài packages**
```bash
npm install lucide-react recharts @radix-ui/react-tabs @radix-ui/react-switch clsx tailwind-merge class-variance-authority @radix-ui/react-slot
```

### **Bước 3: Import vào App**
```jsx
import AdminDashboard from './components/Admin/Dashboard';

function App() {
  return (
    <div>
      {/* Header của bạn */}
      <YourHeader />
      
      {/* Admin Dashboard */}
      <AdminDashboard />
      
      {/* Footer của bạn */}
      <YourFooter />
    </div>
  );
}
```

### **Bước 4: Xong!** 🎉

---

## 📂 Cấu trúc folder

```
Admin/
├── ui/                      # UI Components (self-contained)
│   ├── utils.ts            # Helper functions
│   ├── tabs.tsx            # Tabs component
│   ├── button.tsx          # Button component
│   ├── badge.tsx           # Badge component
│   └── switch.tsx          # Switch component
├── Dashboard.jsx           # Main dashboard
├── Statistics.jsx          # Thống kê
├── UserManagement.jsx      # Quản lý người dùng
├── TeacherManagement.jsx   # Quản lý giảng viên
├── CourseManagement.jsx    # Quản lý khóa học
├── ReviewManagement.jsx    # Quản lý đánh giá
├── ExamManagement.jsx      # Quản lý kiểm tra
├── VoucherManagement.jsx   # Quản lý voucher
├── dashboard.css           # Styles
├── index.js                # Export entry
└── README.md               # This file
```

---

## 🎨 Features

### **7 Tabs chức năng:**
1. 📊 **Thống kê** - Charts & Stats
2. 👥 **Người dùng** - CRUD users
3. 👨‍🏫 **Giảng viên** - CRUD teachers + create form
4. 📚 **Khóa học** - CRUD courses + create form
5. ⭐ **Đánh giá** - View & manage reviews
6. 📝 **Kiểm tra** - Create exams với full validation
7. 🎫 **Voucher** - Add vouchers với full validation

### **UI/UX:**
- ✅ Xanh biển pastel - Tabs kiểu viên thuốc
- ✅ Bo tròn toàn bộ (pills & rounded cards)
- ✅ Responsive design
- ✅ Smooth animations
- ✅ Modern gradient colors

---

## 🔧 Không cần thêm gì!

❌ **KHÔNG cần:**
- Tạo thêm file UI components
- Config thêm
- Copy Header/Footer (dùng của bạn)

✅ **CHỈ cần:**
- Copy folder Admin
- Cài packages
- Import vào App

---

## 📝 Notes

- Module này **self-contained** - tất cả dependencies đã có trong folder
- Header và Footer **KHÔNG** bao gồm - dùng Header/Footer có sẵn trong project của bạn
- Tất cả imports đã được cập nhật để dùng `./ui/` (local)
- CSS đã inline trong folder

---

## 🚀 Quick Start

```jsx
// App.jsx
import AdminDashboard from './components/Admin/Dashboard';
import MyHeader from './components/MyHeader';
import MyFooter from './components/MyFooter';

function App() {
  const user = {
    fullName: "Admin Name",
    userType: "admin"
  };

  return (
    <div className="app">
      <MyHeader user={user} />
      <AdminDashboard />
      <MyFooter />
    </div>
  );
}

export default App;
```

---

## 📦 Required Packages

```json
{
  "dependencies": {
    "lucide-react": "latest",
    "recharts": "latest",
    "@radix-ui/react-tabs": "latest",
    "@radix-ui/react-switch": "latest",
    "@radix-ui/react-slot": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest",
    "class-variance-authority": "latest"
  }
}
```

---

## 🎯 Kết luận

**Copy 1 folder → Cài packages → Import → Done!** 🎉

Không cần copy rời rạc, không cần config phức tạp!
