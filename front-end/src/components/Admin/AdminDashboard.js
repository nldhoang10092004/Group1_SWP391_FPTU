import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
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
  CreditCard,
  Search,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  User,
  Package,
  Calendar,
} from "lucide-react";
import {
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
  BarChart,
  Bar,
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

import {
  getAllTransactions,
  searchTransactions,
  getTransactionDetail,
  formatCurrency,
  formatDateTime,
  getStatusLabel,
} from "../../middleware/admin/transactionAPI";

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

  // Transactions state
  const [transactions, setTransactions] = useState([]);
  const [transactionStats, setTransactionStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    totalRevenue: 0,
    monthlyRevenue: {},
  });
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

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
    loadTransactions();
  }, []);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);

      const [allUsersData, teachersData, studentsData] = await Promise.all([
        getAllUsers(),
        getTeachers(),
        getStudents(),
      ]);

      const mappedUsers = allUsersData.map((user) => ({
        id: user.name,
        accountID: user.name,
        fullName: user.username,
        email: user.email,
        userType: user.role?.toLowerCase?.() ?? "",
        role: user.role,
        status: user.status,
        isActive: user.status === "ACTIVE",
        joinedDate: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      }));

      const mappedTeachers = teachersData.map((t) => ({
        id: t.accountID,
        accountID: t.accountID,
        fullName: t.username,
        email: t.email,
        role: t.role,
        status: t.status,
        isActive: t.status === "ACTIVE",
      }));

      const mappedStudents = studentsData.map((s) => ({
        id: s.accountID,
        accountID: s.accountID,
        fullName: s.username,
        email: s.email,
        role: s.role,
        status: s.status,
        isActive: s.status === "ACTIVE",
      }));

      const activeUsers = mappedUsers.filter((u) => u.isActive).length;
      const inactiveUsers = mappedUsers.filter((u) => !u.isActive).length;
      const totalAdmins = mappedUsers.filter((u) => u.role === "ADMIN").length;
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
      console.error("Error loading admin data:", error);
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

  const loadTransactions = async () => {
    try {
      const data = await getAllTransactions(); // từ transactionAPI
      setTransactions(data);
      calculateTransactionStats(data);
    } catch (error) {
      console.error("Error loading transactions:", error);
      showPopup("Không thể tải giao dịch", "danger");
    }
  };

  const calculateTransactionStats = (transactionsData) => {
    const total = transactionsData.length;
    const paid = transactionsData.filter((t) => t.status === "PAID").length;
    const pending = transactionsData.filter((t) => t.status === "PENDING").length;
    const totalRevenue = transactionsData
      .filter((t) => t.status === "PAID")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    // Tính doanh thu theo tháng (6 tháng gần nhất)
    const monthlyRevenue = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthlyRevenue[monthKey] = 0;
    }
    transactionsData
      .filter((t) => t.status === "PAID" && t.paidAt)
      .forEach((t) => {
        const paidDate = new Date(t.paidAt);
        const monthKey = `${paidDate.getFullYear()}-${String(paidDate.getMonth() + 1).padStart(2, "0")}`;
        if (monthlyRevenue.hasOwnProperty(monthKey)) {
          monthlyRevenue[monthKey] += t.amount || 0;
        }
      });

    setTransactionStats({
      total,
      paid,
      pending,
      totalRevenue,
      monthlyRevenue,
    });
  };

  const handleSearchTransactions = async () => {
    if (!searchKeyword.trim()) {
      loadTransactions();
      return;
    }
    try {
      const data = await searchTransactions(searchKeyword);
      setTransactions(data);
      calculateTransactionStats(data);
    } catch (error) {
      console.error("Error searching transactions:", error);
      showPopup("Không thể tìm kiếm giao dịch", "danger");
    }
  };

  const handleViewTransactionDetail = async (orderId) => {
    try {
      const detail = await getTransactionDetail(orderId);
      setSelectedTransaction(detail);
      setShowDetailModal(true);
    } catch (error) {
      console.error("Error loading transaction detail:", error);
      showPopup("Không thể tải chi tiết giao dịch", "danger");
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      PAID: { Icon: CheckCircle, cls: "bg-green-500" },
      PENDING: { Icon: Clock, cls: "bg-yellow-500" },
      FAILED: { Icon: XCircle, cls: "bg-red-500" },
      CANCELLED: { Icon: XCircle, cls: "bg-gray-500" },
    };
    const picked = map[status] || map.PENDING;
    const IconCmp = picked.Icon;
    return (
      <Badge className={`${picked.cls} text-white flex items-center gap-1`}>
        <IconCmp size={12} />
        {getStatusLabel(status)}
      </Badge>
    );
  };

  // Data cho biểu đồ doanh thu 6 tháng gần nhất (từ transactions)
  const getRevenueChartData = () => {
    const months = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];
    const now = new Date();
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const monthIndex = date.getMonth();
      data.push({
        month: months[monthIndex],
        revenue: transactionStats.monthlyRevenue[monthKey] || 0,
      });
    }
    return data;
  };

  const menuItems = [
    { id: "analytics", icon: BarChart3, label: "Thống kê" },
    { id: "transactions", icon: CreditCard, label: "Giao dịch" },
    { id: "users", icon: Users, label: "Người dùng" },
    { id: "teachers", icon: GraduationCap, label: "Giảng viên" },
    { id: "courses", icon: BookOpen, label: "Khóa học" },
    { id: "flashcard", icon: BookOpen, label: "Flashcard" },
    { id: "reviews", icon: Star, label: "Đánh giá" },
    { id: "exams", icon: Award, label: "Kiểm tra" },
    { id: "vouchers", icon: Ticket, label: "Subscription Plan" },
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

      const revenueData = getRevenueChartData();

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
                  {stats?.membershipRate ? `${stats.membershipRate.toFixed(2)}%` : "0%"}
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
                <h3 className="admin-stat-title">Tổng doanh thu</h3>
                <div className="admin-stat-icon-wrapper bg-green-100">
                  <DollarSign className="text-green-600" size={20} />
                </div>
              </div>
              <div className="admin-stat-value">{formatCurrency(transactionStats.totalRevenue)}</div>
              <p className="admin-stat-footer">
                Từ {transactionStats.paid} giao dịch thành công
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
                <CardDescription>Doanh thu từ giao dịch 6 tháng gần đây</CardDescription>
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

            <div className="admin-chart-card">
              <CardHeader>
                <CardTitle>Thống kê giao dịch</CardTitle>
                <CardDescription>Phân bố trạng thái giao dịch</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { name: "Tổng GD", value: transactionStats.total, fill: "#667eea" },
                      { name: "Đã thanh toán", value: transactionStats.paid, fill: "#4caf50" },
                      { name: "Chờ thanh toán", value: transactionStats.pending, fill: "#ff9800" },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </div>

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
                  return roleData.some((item) => item.value > 0) ? (
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
                    <div
                      style={{
                        height: 300,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#999",
                      }}
                    >
                      Chưa có dữ liệu
                    </div>
                  );
                })()}
              </CardContent>
            </div>

            <div className="admin-chart-card">
              <CardHeader>
                <CardTitle>Trạng thái tài khoản</CardTitle>
                <CardDescription>Phân bố người dùng theo trạng thái</CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  const statusData = [
                    { name: "Đang hoạt động", value: userStats.activeUsers, color: "#4caf50" },
                    { name: "Không hoạt động", value: userStats.inactiveUsers, color: "#f44336" },
                  ];
                  return statusData.some((item) => item.value > 0) ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.name}: ${entry.value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-status-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div
                      style={{
                        height: 300,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#999",
                      }}
                    >
                      Chưa có dữ liệu
                    </div>
                  );
                })()}
              </CardContent>
            </div>
          </div>
        </div>
      );
    }

    // Transactions page (đã chuyển sang style management-styles.scss)
if (activeMenu === "transactions") {
  return (
    <div className="management-page-container">
      {/* Toast */}
      {toast.show && <div className={`toast ${toast.type}`}>{toast.message}</div>}

      <div className="management-card">
        <div className="management-card-header">
          <h2 className="card-title">Quản lý giao dịch</h2>
          <p className="card-description">Tổng số: {transactionStats.total} giao dịch</p>
        </div>

        {/* Thanh tìm kiếm */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Tìm theo Order ID, email, username..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearchTransactions()}
          />
          <button className="btn-primary" onClick={handleSearchTransactions}>Tìm kiếm</button>
          <button className="btn-secondary" onClick={loadTransactions}>Làm mới</button>
        </div>

        <div className="management-card-content">
          <table className="management-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Người mua</th>
                <th>Gói</th>
                <th>Số tiền</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.orderID}>
                  <td className="font-bold">#{t.orderID}</td>
                  <td>
                    <div className="user-info">
                      <p className="font-medium">{t.buyerUsername}</p>
                      <p className="text-muted">{t.buyerEmail}</p>
                    </div>
                  </td>
                  <td>{t.planName}</td>
                  <td>{formatCurrency(t.amount || 0)}</td>
                  <td>
                    <span className={`status-badge ${t.status.toLowerCase()}`}>
                      {getStatusLabel(t.status)}
                    </span>
                  </td>
                  <td>{formatDateTime(t.createdAt)}</td>
                  <td>
                    <button
                      className="action-button view-button"
                      title="Xem chi tiết"
                      onClick={() => handleViewTransactionDetail(t.orderID)}
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {transactions.length === 0 && (
            <div className="empty-state">
              <p>Không có giao dịch nào</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal chi tiết giao dịch */}
      {showDetailModal && selectedTransaction && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết giao dịch</h3>
              <button className="modal-close" onClick={() => setShowDetailModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              {/* Buyer */}
              <div className="detail-section">
                <h6 className="section-title">Thông tin người mua</h6>
                <div className="detail-row">
                  <span className="detail-label">Username: </span>
                  <span className="detail-value">{selectedTransaction.buyer?.username}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email: </span>
                  <span className="detail-value">{selectedTransaction.buyer?.email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Buyer ID: </span>
                  <span className="detail-value">#{selectedTransaction.buyer?.buyerID}</span>
                </div>
              </div>

              {/* Plan */}
              <div className="detail-section">
                <h6 className="section-title">Thông tin gói</h6>
                <div className="detail-row">
                  <span className="detail-label">Tên gói: </span>
                  <span className="detail-value">{selectedTransaction.plan?.name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Mã gói: </span>
                  <span className="detail-value">{selectedTransaction.plan?.planCode}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Giá gốc: </span>
                  <span className="detail-value">
                    {formatCurrency(selectedTransaction.plan?.price || 0)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Thời hạn: </span>
                  <span className="detail-value">{selectedTransaction.plan?.durationDays} ngày</span>
                </div>
              </div>

              {/* Transaction */}
              <div className="detail-section">
                <h6 className="section-title">Thông tin giao dịch</h6>
                <div className="detail-row">
                  <span className="detail-label">Order ID: </span>
                  <span className="detail-value">#{selectedTransaction.orderID}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Trạng thái: </span>
                  <span className="detail-value">
                    <span className={`status-badge ${selectedTransaction.status.toLowerCase()}`}>
                      {getStatusLabel(selectedTransaction.status)}
                    </span>
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Số tiền: </span>
                  <span className="detail-value">
                    {formatCurrency(selectedTransaction.amount || 0)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Ngày tạo: </span>
                  <span className="detail-value">{formatDateTime(selectedTransaction.createdAt)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Ngày thanh toán: </span>
                  <span className="detail-value">
                    {selectedTransaction.paidAt ? formatDateTime(selectedTransaction.paidAt) : "-"}
                  </span>
                </div>
              </div>

              {/* Webhook events (nếu có) */}
              <div className="detail-section">
                <h6 className="section-title">Webhook events</h6>
                {!selectedTransaction.webhookEvents ||
                selectedTransaction.webhookEvents.length === 0 ? (
                  <div className="text-muted">Chưa ghi nhận webhook nào.</div>
                ) : (
                  <div className="webhook-list">
                    {selectedTransaction.webhookEvents.map((wh, idx) => {
                      let prettyPayload = wh.payload;
                      try {
                        const parsed = JSON.parse(wh.payload);
                        prettyPayload = JSON.stringify(parsed, null, 2);
                      } catch (_) {}
                      return (
                        <div key={wh.webhookID ?? idx} className="webhook-item">
                          <div className="detail-row">
                            <span className="detail-label">Webhook ID:</span>
                            <span className="detail-value">#{wh.webhookID ?? "-"}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Unique Key:</span>
                            <span className="detail-value break-all">{wh.uniqueKey ?? "-"}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Signature:</span>
                            <span className="detail-value break-all">{wh.signature ?? "(none)"}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Received At:</span>
                            <span className="detail-value">{formatDateTime(wh.receivedAt)}</span>
                          </div>
                          <div className="payload-block">
                            <span className="detail-label">Payload:</span>
                            <pre className="payload-pre">{prettyPayload}</pre>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDetailModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
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
                  className={`admin-sidebar-menu-item ${isActive ? "active" : ""}`}
                >
                  <Icon size={20} className="admin-sidebar-menu-icon" />
                  <span className="admin-sidebar-menu-label">{item.label}</span>
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
                {menuItems.find((item) => item.id === activeMenu)?.label || "Dashboard"}
              </h2>
              <p className="admin-main-header-subtitle">Quản lý hệ thống và theo dõi hoạt động</p>
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
