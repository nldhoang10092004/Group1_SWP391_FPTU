import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import {
  Users,
  BookOpen,
  Star,
  Award,
  Ticket,
  BarChart3,
  GraduationCap,
  DollarSign,
  X,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { UserManagement } from "./UserManagement";
import { TeacherManagement } from "./TeacherManagement";
import { CourseManagement } from "./CourseManagement";
import { ReviewManagement } from "./ReviewManagement";
import { ExamManagement } from "./ExamManagement";
import { FlashcardManagement } from "./FlashcardManagement";
import { VoucherManagement } from "./VoucherManagement";
import { getDashboardOverview } from "../../middleware/admin/dashboardAdminAPI";
import {
  getAllUsers,
  getStudents,
  getTeachers,
} from "../../middleware/admin/userManagementAPI";
import "./admin-dashboard-styles.scss";

export function AdminDashboard({ onClose }) {
  const [activeMenu, setActiveMenu] = useState("analytics");
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [users, setUsers] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [userStats, setUserStats] = useState({
    totalAdmins: 0,
    totalTeachers: 0,
    totalStudents: 0,
    activeUsers: 0,
    inactiveUsers: 0,
  });

  // Toast state
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showPopup = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  useEffect(() => {
    loadAdminData();
    loadStats();
  }, []);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);

      const [allUsersData, teachersData, studentsData] = await Promise.all([
        getAllUsers(),
        getTeachers(),
        getStudents()
      ]);

      const mappedUsers = allUsersData.map(user => ({
        id: user.name,
        accountID: user.name,
        fullName: user.username,
        email: user.email,
        userType: user.role.toLowerCase(),
        role: user.role,
        status: user.status,
        isActive: user.status === 'ACTIVE',
        joinedDate: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      }));

      const mappedTeachers = teachersData.map(t => ({
        id: t.accountID,
        accountID: t.accountID,
        fullName: t.username,
        email: t.email,
        role: t.role,
        status: t.status,
        isActive: t.status === 'ACTIVE',
      }));

      const mappedStudents = studentsData.map(s => ({
        id: s.accountID,
        accountID: s.accountID,
        fullName: s.username,
        email: s.email,
        role: s.role,
        status: s.status,
        isActive: s.status === 'ACTIVE',
      }));

      // Tính toán thống kê từ dữ liệu users
      const activeUsers = mappedUsers.filter(u => u.isActive).length;
      const inactiveUsers = mappedUsers.filter(u => !u.isActive).length;
      const totalAdmins = mappedUsers.filter(u => u.role === 'ADMIN').length;
      const totalTeachers = mappedTeachers.length;
      const totalStudents = mappedStudents.length;

      setUsers(mappedUsers);
      setTeachers(mappedTeachers);
      setStudents(mappedStudents);
      setUserStats({
        totalAdmins,
        totalTeachers,
        totalStudents,
        activeUsers,
        inactiveUsers,
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
      showPopup("Không thể tải dữ liệu admin", "danger");
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await getDashboardOverview();
      setStats(data);
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
    }
  };

  // Dữ liệu biểu đồ mẫu
  const revenueData = [
    { month: "T1", revenue: 15000000 },
    { month: "T2", revenue: 18000000 },
    { month: "T3", revenue: 16500000 },
    { month: "T4", revenue: 22000000 },
    { month: "T5", revenue: 19500000 },
    { month: "T6", revenue: stats?.currentMonthRevenue || 0 },
  ];

  const userGrowthData = [
    { month: "T1", users: 250 },
    { month: "T2", users: 310 },
    { month: "T3", users: 450 },
    { month: "T4", users: 620 },
    { month: "T5", users: 780 },
    { month: "T6", users: stats?.totalUsers || 850 },
  ];

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);

  const menuItems = [
    { id: "analytics", icon: BarChart3, label: "Thống kê" },
    { id: "users", icon: Users, label: "Người dùng" },
    { id: "teachers", icon: GraduationCap, label: "Giảng viên" },
    { id: "courses", icon: BookOpen, label: "Khóa học" },
    { id: "flashcard", icon: BookOpen, label: "Flashcard" },
    { id: "reviews", icon: Star, label: "Đánh giá" },
    { id: "exams", icon: Award, label: "Kiểm tra" },
    { id: "vouchers", icon: Ticket, label: "Voucher" },
  ];

  const renderContent = () => {
    if (activeMenu === "analytics") {
      if (isLoading) {
        return (
          <div className="admin-loading-spinner">
            <div className="admin-spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        );
      }

      return (
        <div className="admin-analytics-content">
          {/* Stats Cards */}
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <h3 className="admin-stat-title">Tổng người dùng</h3>
                <div className="admin-stat-icon-wrapper bg-blue-100">
                  <Users className="text-blue-600" size={20} />
                </div>
              </div>
              <div className="admin-stat-value">{stats?.totalUsers || 0}</div>
              <p className="admin-stat-footer">
                <Badge className="bg-green-500 mr-1">
                  {stats?.membershipRate
                    ? `${stats.membershipRate.toFixed(2)}%`
                    : "0%"}
                </Badge>
                có gói thành viên
              </p>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <h3 className="admin-stat-title">Thành viên</h3>
                <div className="admin-stat-icon-wrapper bg-orange-100">
                  <GraduationCap className="text-orange-600" size={20} />
                </div>
              </div>
              <div className="admin-stat-value">{stats?.totalMembers || 0}</div>
              <p className="admin-stat-footer">Thành viên có gói thành viên</p>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <h3 className="admin-stat-title">Doanh thu tháng</h3>
                <div className="admin-stat-icon-wrapper bg-green-100">
                  <DollarSign className="text-green-600" size={20} />
                </div>
              </div>
              <div className="admin-stat-value">
                {formatCurrency(stats?.currentMonthRevenue || 0)}
              </div>
              <p className="admin-stat-footer">
                Tổng {formatCurrency(stats?.totalRevenue || 0)}
              </p>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <h3 className="admin-stat-title">Khóa học hoạt động</h3>
                <div className="admin-stat-icon-wrapper bg-cyan-100">
                  <BookOpen className="text-cyan-600" size={20} />
                </div>
              </div>
              <div className="admin-stat-value">{stats?.activeCourses || 0}</div>
              <p className="admin-stat-footer">Đang mở</p>
            </div>
          </div>

          {/* Charts */}
          <div className="admin-charts-grid">
            <div className="admin-chart-card">
              <CardHeader>
                <CardTitle>Doanh thu theo tháng</CardTitle>
                <CardDescription>Xu hướng doanh thu 6 tháng gần đây</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#667eea"
                      fill="#667eea"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </div>

            {/* Biểu đồ tăng trưởng người dùng */}
            <div className="admin-chart-card " >
              <CardHeader>
                <CardTitle>Tăng trưởng người dùng</CardTitle>
                <CardDescription>Số lượng người dùng mới mỗi tháng</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stroke="#4caf50"
                      fill="#4caf50"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </div>

                        {/* Biểu đồ phân bố vai trò */}
            <div className="admin-chart-card">
              <CardHeader>
                <CardTitle>Phân bố vai trò</CardTitle>
                <CardDescription>Phân loại người dùng theo vai trò</CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  const roleData = [
                    { name: "Học viên", value: userStats.totalStudents, color: "#667eea" },
                    { name: "Giảng viên", value: userStats.totalTeachers, color: "#4caf50" },
                    { name: "Admin", value: userStats.totalAdmins, color: "#ff9800" },
                  ];
                  return roleData.some(item => item.value > 0) ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={roleData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.name}: ${entry.value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {roleData.map((entry, index) => (
                            <Cell key={`cell-role-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                      Chưa có dữ liệu
                    </div>
                  );
                })()}
              </CardContent>
            </div>

            {/* Biểu đồ trạng thái tài khoản */}
            <div className="admin-chart-card">
              <CardHeader>
                <CardTitle>Tăng trưởng người dùng</CardTitle>
                <CardDescription>Số lượng người dùng mới mỗi tháng</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stroke="#4caf50"
                      fill="#4caf50"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </div>
          </div>
        </div>
      );
    }
    

    // Các trang quản lý khác
    switch (activeMenu) {
      case "users":
        return <UserManagement />;
      case "teachers":
        return <TeacherManagement />;
      case "courses":
        return <CourseManagement />;
      case "reviews":
        return <ReviewManagement />;
      case "flashcard":
        return <FlashcardManagement />;
      case "exams":
        return <ExamManagement />;
      case "vouchers":
        return <VoucherManagement />;
      default:
        return null;
    }
  };

  return (
    <div className="admin-dashboard-layout">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h5 className="admin-sidebar-title">Admin Panel</h5>
          <p className="admin-sidebar-subtitle">Quản trị hệ thống</p>
        </div>
        <nav className="admin-sidebar-nav">
          <div className="admin-sidebar-menu-items">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={`admin-sidebar-menu-item ${isActive ? "active" : ""
                    }`}
                >
                  <Icon size={20} className="admin-sidebar-menu-icon" />
                  <span className="admin-sidebar-menu-label">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main */}
      <div className="admin-main-content">
        <div className="admin-main-header">
          <div className="admin-main-header-wrapper">
            <div>
              <h2 className="admin-main-header-title">
                {menuItems.find((item) => item.id === activeMenu)?.label ||
                  "Dashboard"}
              </h2>
              <p className="admin-main-header-subtitle">
                Quản lý hệ thống và theo dõi hoạt động
              </p>
            </div>
            <Button variant="outline" onClick={onClose} className="admin-close-button">
              <X size={16} />
              <span>Quay lại</span>
            </Button>
          </div>
        </div>

        <div className="admin-content-area">{renderContent()}</div>
      </div>
    </div>
  );
}

export default AdminDashboard;
