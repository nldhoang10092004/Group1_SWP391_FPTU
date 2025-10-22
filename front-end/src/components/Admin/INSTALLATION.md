# 🚀 HƯỚNG DẪN CÀI ĐẶT - ADMIN MODULE

## ⚡ QUAN TRỌNG - ĐỌC KỸ!

Folder Admin này đã được **tối ưu hóa** để dễ dàng copy vào project khác.

---

## 📦 **CÁCH 1: CÀI ĐẶT ĐƠN GIẢN (RECOMMENDED)**

### **Bước 1: Copy folder Admin**
```bash
# Copy toàn bộ folder Admin vào project của bạn
cp -r components/Admin your-project/src/components/
```

### **Bước 2: Đảm bảo bạn đã có ShadCN UI**

Admin module SỬ DỤNG các components từ `/components/ui/` (ShadCN UI).

**Nếu project của bạn CHƯA có ShadCN UI:**
```bash
# Init ShadCN
npx shadcn@latest init

# Add các components cần thiết
npx shadcn@latest add tabs button badge card dialog input label select switch table textarea
```

**Nếu project của bạn ĐÃ CÓ ShadCN UI:**
- ✅ Bạn đã sẵn sàng! Chỉ cần import và dùng.

### **Bước 3: Cài thêm packages**
```bash
npm install lucide-react recharts
```

### **Bước 4: Import vào App**
```jsx
import AdminDashboard from './components/Admin/Dashboard';
import YourHeader from './components/YourHeader';
import YourFooter from './components/YourFooter';

function App() {
  return (
    <>
      <YourHeader user={{fullName: "Admin", userType: "admin"}} />
      <AdminDashboard />
      <YourFooter />
    </>
  );
}
```

---

## 📦 **CÁCH 2: CÀI ĐẶT SELF-CONTAINED (Nếu muốn tách biệt)**

### **Bước 1: Copy folder Admin**
```bash
cp -r components/Admin your-project/src/components/
```

### **Bước 2: Copy UI components từ ShadCN**
```bash
# Copy các UI components cần thiết
cp -r components/ui your-project/src/components/
```

### **Bước 3: Cài packages**
```bash
npm install lucide-react recharts @radix-ui/react-tabs @radix-ui/react-switch @radix-ui/react-dialog clsx tailwind-merge class-variance-authority @radix-ui/react-slot @radix-ui/react-select
```

### **Bước 4: Import vào App**
```jsx
import AdminDashboard from './components/Admin/Dashboard';

function App() {
  return (
    <>
      <YourHeader />
      <AdminDashboard />
      <YourFooter />
    </>
  );
}
```

---

## 🎯 **TÓM TẮT**

### **Cách 1 (Đơn giản - RECOMMENDED):**
1. Copy folder `Admin/`
2. Đảm bảo có ShadCN UI trong project
3. Cài `lucide-react` và `recharts`
4. Import và dùng

### **Cách 2 (Self-contained):**
1. Copy folder `Admin/`
2. Copy folder `ui/` (ShadCN)
3. Cài tất cả packages
4. Import và dùng

---

## 📂 **Folder Admin chứa:**

```
Admin/
├── ui/                    ← Mini UI (tabs, button, badge, switch)
│   ├── tabs.tsx          ← Đã có
│   ├── button.tsx        ← Đã có
│   ├── badge.tsx         ← Đã có
│   ├── switch.tsx        ← Đã có
│   └── utils.ts          ← Đã có
├── Dashboard.jsx          ← Import từ ./ui/
├── Statistics.jsx         ← Import từ ../ui/ (ShadCN)
├── UserManagement.jsx     ← Import từ ../ui/ (ShadCN)
├── TeacherManagement.jsx  ← Import từ ../ui/ (ShadCN)
├── CourseManagement.jsx   ← Import từ ../ui/ (ShadCN)
├── ReviewManagement.jsx   ← Import từ ../ui/ (ShadCN)
├── ExamManagement.jsx     ← Import từ ../ui/ (ShadCN)
├── VoucherManagement.jsx  ← Import từ ../ui/ (ShadCN)
├── dashboard.css
├── index.js
├── README.md
├── COPY_ME.md
└── INSTALLATION.md       ← File này
```

---

## ⚠️ **LƯU Ý**

### **Dashboard.jsx:**
- ✅ Import từ `./ui/` (tabs, button, badge)
- ✅ Không phụ thuộc vào `/components/ui/`

### **Các components khác:**
- ⚠️ Import từ `../ui/` (card, dialog, table, input...)
- ⚠️ CẦN có ShadCN UI trong project

### **Header & Footer:**
- ❌ KHÔNG bao gồm
- ✅ Dùng Header/Footer có sẵn trong project của bạn

---

## 🚀 **Required Packages**

### **Minimum (Cách 1):**
```json
{
  "lucide-react": "latest",
  "recharts": "latest"
}
```
+ ShadCN UI đã được setup

### **Full (Cách 2):**
```json
{
  "lucide-react": "latest",
  "recharts": "latest",
  "@radix-ui/react-tabs": "latest",
  "@radix-ui/react-switch": "latest",
  "@radix-ui/react-dialog": "latest",
  "@radix-ui/react-select": "latest",
  "@radix-ui/react-slot": "latest",
  "clsx": "latest",
  "tailwind-merge": "latest",
  "class-variance-authority": "latest"
}
```

---

## ✅ **KẾT LUẬN**

**TRẢ LỜI CÂU HỎI:**
> "T copy folder admin vô là n tự gắn cái header và footer có trong prj của t vô à?"

**❌ KHÔNG TỰ ĐỘNG gắn!**

**✅ BẠN CẦN:**
1. Copy folder Admin
2. **Tự import** AdminDashboard vào App.jsx
3. **Tự gắn** Header và Footer của bạn xung quanh AdminDashboard

**VÍ DỤ:**
```jsx
// App.jsx của BẠN
import AdminDashboard from './components/Admin/Dashboard';
import MyHeader from './components/MyHeader';  // Header CÓ SẴN của bạn
import MyFooter from './components/MyFooter';  // Footer CÓ SẴN của bạn

function App() {
  return (
    <div>
      <MyHeader />           ← Header của bạn
      <AdminDashboard />     ← Admin module
      <MyFooter />           ← Footer của bạn
    </div>
  );
}
```

**Module Admin KHÔNG TỰ ĐỘNG gắn Header/Footer, bạn phải tự làm điều đó!** 🎯
