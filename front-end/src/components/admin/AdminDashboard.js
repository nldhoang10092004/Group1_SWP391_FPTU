import { useState, useEffect } from "react";
import { Row, Col, Card} from "react-bootstrap";
import {CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Users, DollarSign, BookOpen, TrendingUp, AlertCircle, MessageSquare, Settings, ArrowLeft, Shield, UserCheck, UserX, Eye, Trash2, Edit, Plus, Download, Upload, Tag, Star, Calendar, Clock } from "lucide-react";
import { authService } from "./utils/supabase/auth"; // Assuming this is needed, though not directly used in the mock
import { toast } from "sonner";
import './admin-dashboard-styles.scss';

export function AdminDashboard({ onClose }) {
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dialog states
  const [showCreateExam, setShowCreateExam] = useState(false);
  const [showCreateVoucher, setShowCreateVoucher] = useState(false);
  const [showCreateTeacher, setShowCreateTeacher] = useState(false);

  // Form states
  const [newExam, setNewExam] = useState({
    title: '',
    description: '',
    level: '',
    duration: 60,
    totalQuestions: 20,
    passingScore: 70
  });

  const [newVoucher, setNewVoucher] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 0,
    maxUses: 100,
    expiresAt: ''
  });

  const [newTeacher, setNewTeacher] = useState({
    fullName: '',
    email: '',
    password: '',
    specialization: ''
  });

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);

      const mockUsers = [
        {
          id: 'user1',
          fullName: 'Nguyễn Văn A',
          email: 'nguyenvana@email.com',
          userType: 'student',
          hasActiveSubscription: true,
          isActive: true,
          joinedDate: '2024-01-15',
          lastLogin: '2024-12-26'
        },
        {
          id: 'user2',
          fullName: 'Trần Thị B',
          email: 'tranthib@email.com',
          userType: 'student',
          hasActiveSubscription: false,
          isActive: true,
          joinedDate: '2024-02-10',
          lastLogin: '2024-12-25'
        },
        {
          id: 'user3',
          fullName: 'Lê Văn C',
          email: 'levanc@email.com',
          userType: 'teacher',
          hasActiveSubscription: true,
          isActive: true,
          joinedDate: '2024-01-01',
          lastLogin: '2024-12-26'
        },
        {
          id: 'user4',
          fullName: 'Nguyễn Thị D',
          email: 'nguyenthid@email.com',
          userType: 'teacher',
          hasActiveSubscription: true,
          isActive: true,
          joinedDate: '2024-03-01',
          lastLogin: '2024-12-24'
        }
      ];

      const mockReviews = [
        {
          id: 'review1',
          courseId: 'course1',
          courseName: 'English Foundation',
          studentName: 'Nguyễn Văn A',
          rating: 5,
          comment: 'Khóa học rất hay và bổ ích!',
          createdAt: '2024-12-20',
          status: 'approved'
        },
        {
          id: 'review2',
          courseId: 'course2',
          courseName: 'Pre-Intermediate English',
          studentName: 'Trần Thị B',
          rating: 4,
          comment: 'Nội dung tốt nhưng cần thêm bài tập.',
          createdAt: '2024-12-22',
          status: 'pending'
        }
      ];

      const mockCourses = [
        {
          id: 'course1',
          name: 'English Foundation',
          teacherName: 'Lê Văn C',
          level: 'Beginner',
          students: 156,
          status: 'published',
          createdAt: '2024-01-15'
        },
        {
          id: 'course2',
          name: 'Advanced Business English',
          teacherName: 'Nguyễn Thị D',
          level: 'Advanced',
          students: 45,
          status: 'pending_approval',
          createdAt: '2024-12-20'
        }
      ];

      const mockExams = [
        {
          id: 'exam1',
          title: 'English Proficiency Test',
          description: 'Comprehensive English test for all levels',
          level: 'All',
          duration: 90,
          totalQuestions: 50,
          passingScore: 70,
          isActive: true,
          createdAt: '2024-01-10'
        }
      ];

      const mockVouchers = [
        {
          id: 'voucher1',
          code: 'NEWYEAR2024',
          description: 'New Year Discount',
          discountType: 'percentage',
          discountValue: 30,
          maxUses: 100,
          currentUses: 45,
          expiresAt: '2024-12-31',
          isActive: true
        }
      ];

      const mockStatsData = {
        totalUsers: 1200,
        newUsersThisMonth: 89,
        activeSubscriptions: 750,
        monthlyRevenue: 24000000,
        totalRevenue: 150000000,
        totalCourses: 15,
        totalLessons: 200,
      };

      const mockRequestsData = [];

      setStats(mockStatsData);
      setRequests(mockRequestsData);
      setUsers(mockUsers);
      setTeachers(mockUsers.filter(u => u.userType === 'teacher'));
      setReviews(mockReviews);
      setCourses(mockCourses);
      setExams(mockExams);
      setVouchers(mockVouchers);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error("Không thể tải dữ liệu admin");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleUser = async (userId, isActive) => {
    setUsers(prev => prev.map(user =>
      user.id === userId ? { ...user, isActive: !isActive } : user
    ));
    toast.success(isActive ? "Đã khóa tài khoản" : "Đã kích hoạt tài khoản");
  };

  const confirmAction = (message) => {
    return window.confirm(message);
  };

  const handleDeleteReview = async (reviewId) => {
    if (confirmAction("Bạn có chắc chắn muốn xóa đánh giá này?")) {
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      toast.success("Đã xóa đánh giá");
    }
  };

  const handleToggleReview = async (reviewId, status) => {
    setReviews(prev => prev.map(review =>
      review.id === reviewId ? { ...review, status } : review
    ));
    toast.success(status === 'approved' ? "Đã phê duyệt đánh giá" : "Đã ẩn đánh giá");
  };

  const handleApproveCourse = async (courseId) => {
    setCourses(prev => prev.map(course =>
      course.id === courseId ? { ...course, status: 'published' } : course
    ));
    toast.success("Đã phê duyệt khóa học");
  };

  const handleHideCourse = async (courseId) => {
    setCourses(prev => prev.map(course =>
      course.id === courseId ? { ...course, status: 'hidden' } : course
    ));
    toast.success("Đã ẩn khóa học");
  };

  const handleCreateExam = async () => {
    if (!newExam.title || !newExam.description || !newExam.level) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const exam = {
      id: 'exam_' + Date.now(),
      ...newExam,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setExams(prev => [...prev, exam]);
    setNewExam({
      title: '',
      description: '',
      level: '',
      duration: 60,
      totalQuestions: 20,
      passingScore: 70
    });
    setShowCreateExam(false);
    toast.success("Đã tạo bài kiểm tra hệ thống");
  };

  const handleCreateVoucher = async () => {
    if (!newVoucher.code || !newVoucher.description || !newVoucher.expiresAt) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const voucher = {
      id: 'voucher_' + Date.now(),
      ...newVoucher,
      currentUses: 0,
      isActive: true
    };

    setVouchers(prev => [...prev, voucher]);
    setNewVoucher({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: 0,
      maxUses: 100,
      expiresAt: ''
    });
    setShowCreateVoucher(false);
    toast.success("Đã tạo voucher hệ thống");
  };

  const handleCreateTeacher = async () => {
    if (!newTeacher.fullName || !newTeacher.email || !newTeacher.password) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      const teacher = {
        id: 'teacher_' + Date.now(),
        fullName: newTeacher.fullName,
        email: newTeacher.email,
        userType: 'teacher',
        hasActiveSubscription: true,
        isActive: true,
        joinedDate: new Date().toISOString().split('T')[0],
        lastLogin: new Date().toISOString().split('T')[0]
      };

      setUsers(prev => [...prev, teacher]);
      setTeachers(prev => [...prev, teacher]);
      setNewTeacher({
        fullName: '',
        email: '',
        password: '',
        specialization: ''
      });
      setShowCreateTeacher(false);
      toast.success("Đã tạo tài khoản giảng viên");
    } catch (error) {
      toast.error("Không thể tạo tài khoản giảng viên");
    }
  };

  const revenueData = [
    { month: 'T1', revenue: 15000000, users: 45 },
    { month: 'T2', revenue: 18000000, users: 67 },
    { month: 'T3', revenue: 16500000, users: 52 },
    { month: 'T4', revenue: 22000000, users: 78 },
    { month: 'T5', revenue: 19500000, users: 63 },
    { month: 'T6', revenue: 24000000, users: 89 },
  ];

  const userGrowthData = [
    { month: 'T1', total: 850, new: 45 },
    { month: 'T2', total: 917, new: 67 },
    { month: 'T3', total: 969, new: 52 },
    { month: 'T4', total: 1047, new: 78 },
    { month: 'T5', total: 1110, new: 63 },
    { month: 'T6', total: 1199, new: 89 },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center admin-dashboard-container">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Đang tải dữ liệu admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 admin-dashboard-header">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onClose} className="btn btn-outline-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="dashboard-title">Admin Dashboard</h1>
            <p className="welcome-message">Quản lý hệ thống và theo dõi hoạt động</p>
          </div>
        </div>
      </div>

        {/* Stats Cards */}
        <Row className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stats-row-admin-dashboard">
          <Col md={3} className="mb-3">
            <Card className="stat-card-admin-dashboard">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="stat-title-admin-dashboard">Tổng người dùng</CardTitle>
                <div className="stat-icon-wrapper-admin bg-eef2ff me-3">
                  <Users className="h-4 w-4 text-muted-foreground text-667eea" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold stat-value-admin-dashboard">{stats?.totalUsers?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">
                  <Badge className="me-1 bg-success">+{stats?.newUsersThisMonth || 0}</Badge> trong tháng này
                </p>
              </CardContent>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="stat-card-admin-dashboard">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="stat-title-admin-dashboard">Gói đang hoạt động</CardTitle>
                <div className="stat-icon-wrapper-admin bg-fef3e7 me-3">
                  <TrendingUp className="h-4 w-4 text-muted-foreground text-ff9800" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold stat-value-admin-dashboard">{stats?.activeSubscriptions?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.activeSubscriptions && stats?.totalUsers ?
                    Math.round((stats.activeSubscriptions / stats.totalUsers) * 100) : 0}% tỷ lệ chuyển đổi
                </p>
              </CardContent>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="stat-card-admin-dashboard">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="stat-title-admin-dashboard">Doanh thu tháng</CardTitle>
                <div className="stat-icon-wrapper-admin bg-e6ffed me-3">
                  <DollarSign className="h-4 w-4 text-muted-foreground text-4caf50" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold stat-value-admin-dashboard">
                  {formatCurrency(stats?.monthlyRevenue || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Tổng: {formatCurrency(stats?.totalRevenue || 0)}
                </p>
              </CardContent>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="stat-card-admin-dashboard">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="stat-title-admin-dashboard">Nội dung</CardTitle>
                <div className="stat-icon-wrapper-admin bg-e0f7fa me-3">
                  <BookOpen className="h-4 w-4 text-muted-foreground text-00bcd4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold stat-value-admin-dashboard">
                  {stats?.totalCourses || 0} khóa
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.totalLessons || 0} bài học
                </p>
              </CardContent>
            </Card>
          </Col>
        </Row>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 tab-navigation-row-admin">
            <TabsTrigger value="analytics" className="nav-link">Thống kê</TabsTrigger>
            <TabsTrigger value="users" className="nav-link">Người dùng</TabsTrigger>
            <TabsTrigger value="teachers" className="nav-link">Giảng viên</TabsTrigger>
            <TabsTrigger value="courses" className="nav-link">Khóa học</TabsTrigger>
            <TabsTrigger value="reviews" className="nav-link">Đánh giá</TabsTrigger>
            <TabsTrigger value="exams" className="nav-link">Kiểm tra</TabsTrigger>
            <TabsTrigger value="vouchers" className="nav-link">Voucher</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-12 tab-content-wrapper">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="stat-card-admin-dashboard">
                <CardHeader>
                  <CardTitle className="section-title">Doanh thu theo tháng</CardTitle>
                  <CardDescription>Xu hướng doanh thu và người dùng mới</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name) => [
                          name === 'revenue' ? formatCurrency(value) : value,
                          name === 'revenue' ? 'Doanh thu' : 'Người dùng mới'
                        ]}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#667eea" fill="#667eea" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="stat-card-admin-dashboard">
                <CardHeader>
                  <CardTitle className="section-title">Tăng trưởng người dùng</CardTitle>
                  <CardDescription>Tổng số và người dùng mới</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={userGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="total" stroke="#4caf50" strokeWidth={2} name="Tổng người dùng" />
                      <Line type="monotone" dataKey="new" stroke="#ff9800" strokeWidth={2} name="Người dùng mới" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-12 tab-content-wrapper">
            <Card className="stat-card-admin-dashboard">
              <CardHeader>
                <CardTitle className="section-title">Quản lý tài khoản người dùng</CardTitle>
                <CardDescription>Xem, khóa/kích hoạt tài khoản người dùng</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="table-responsive custom-table-container">
                  <Table className="custom-table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Họ tên</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Loại tài khoản</TableHead>
                        <TableHead>Membership</TableHead>
                        <TableHead>Ngày tham gia</TableHead>
                        <TableHead>Lần đăng nhập cuối</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium"><strong>{user.fullName}</strong></TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge className={
                              user.userType === 'admin' ? 'bg-danger' :
                                user.userType === 'teacher' ? 'bg-primary' : 'bg-secondary'
                            }>
                              {user.userType === 'admin' ? 'Admin' : user.userType === 'teacher' ? 'Giảng viên' : 'Học viên'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={user.hasActiveSubscription ? 'bg-success' : 'bg-secondary'}>
                              {user.hasActiveSubscription ? 'Có' : 'Không'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted">{new Date(user.joinedDate).toLocaleDateString('vi-VN')}</TableCell>
                          <TableCell className="text-muted">{new Date(user.lastLogin).toLocaleDateString('vi-VN')}</TableCell>
                          <TableCell>
                            <Badge className={user.isActive ? 'bg-success' : 'bg-danger'}>
                              {user.isActive ? 'Hoạt động' : 'Đã khóa'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="action-icon-btn btn-outline-primary"
                                onClick={() => handleToggleUser(user.id, user.isActive)}
                                title={user.isActive ? "Khóa tài khoản" : "Kích hoạt tài khoản"}
                              >
                                {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                              </Button>
                              <Button variant="outline" size="sm" className="action-icon-btn btn-outline-info" title="Xem chi tiết">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teachers" className="space-y-6 tab-content-wrapper">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold section-title">Quản lý tài khoản giảng viên</h2>
              <Dialog open={showCreateTeacher} onOpenChange={setShowCreateTeacher}>
                <DialogTrigger asChild>
                  <Button className="btn btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo tài khoản giảng viên
                  </Button>
                </DialogTrigger>
                <DialogContent className="modal-content">
                  <DialogHeader className="modal-header">
                    <DialogTitle className="modal-title">Tạo tài khoản giảng viên mới</DialogTitle>
                    <DialogDescription className="dialog-description">
                      Tạo tài khoản cho giảng viên mới
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 modal-body">
                    <div>
                      <label className="text-sm font-medium form-label">Họ và tên</label>
                      <Input
                        value={newTeacher.fullName}
                        onChange={(e) => setNewTeacher(prev => ({ ...prev, fullName: e.target.value }))}
                        placeholder="Nhập họ và tên"
                        className="form-control"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium form-label">Email</label>
                      <Input
                        type="email"
                        value={newTeacher.email}
                        onChange={(e) => setNewTeacher(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Nhập email"
                        className="form-control"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium form-label">Mật khẩu</label>
                      <Input
                        type="password"
                        value={newTeacher.password}
                        onChange={(e) => setNewTeacher(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Nhập mật khẩu"
                        className="form-control"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium form-label">Chuyên môn</label>
                      <Input
                        value={newTeacher.specialization}
                        onChange={(e) => setNewTeacher(prev => ({ ...prev, specialization: e.target.value }))}
                        placeholder="VD: Tiếng Anh giao tiếp"
                        className="form-control"
                      />
                    </div>
                    <div className="flex justify-end gap-2 modal-footer">
                      <Button variant="outline" onClick={() => setShowCreateTeacher(false)} className="btn btn-outline-secondary">
                        Hủy
                      </Button>
                      <Button onClick={handleCreateTeacher} className="btn btn-primary">
                        Tạo tài khoản
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="stat-card-admin-dashboard">
              <CardContent>
                <div className="table-responsive custom-table-container">
                  <Table className="custom-table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Họ tên</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Ngày tham gia</TableHead>
                        <TableHead>Lần đăng nhập cuối</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teachers.map((teacher) => (
                        <TableRow key={teacher.id}>
                          <TableCell className="font-medium"><strong>{teacher.fullName}</strong></TableCell>
                          <TableCell>{teacher.email}</TableCell>
                          <TableCell className="text-muted">{new Date(teacher.joinedDate).toLocaleDateString('vi-VN')}</TableCell>
                          <TableCell className="text-muted">{new Date(teacher.lastLogin).toLocaleDateString('vi-VN')}</TableCell>
                          <TableCell>
                            <Badge className={teacher.isActive ? 'bg-success' : 'bg-danger'}>
                              {teacher.isActive ? 'Hoạt động' : 'Đã khóa'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="action-icon-btn btn-outline-primary"
                                onClick={() => handleToggleUser(teacher.id, teacher.isActive)}
                                title={teacher.isActive ? "Khóa tài khoản" : "Kích hoạt tài khoản"}
                              >
                                {teacher.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                              </Button>
                              <Button variant="outline" size="sm" className="action-icon-btn btn-outline-info" title="Xem chi tiết">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6 tab-content-wrapper">
            <Card className="stat-card-admin-dashboard">
              <CardHeader>
                <CardTitle className="section-title">Quản lý tất cả khóa học</CardTitle>
                <CardDescription>Duyệt khóa học mới, ẩn khóa học vi phạm</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="table-responsive custom-table-container">
                  <Table className="custom-table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên khóa học</TableHead>
                        <TableHead>Giảng viên</TableHead>
                        <TableHead>Cấp độ</TableHead>
                        <TableHead>Học viên</TableHead>
                        <TableHead>Ngày tạo</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell className="font-medium"><strong>{course.name}</strong></TableCell>
                          <TableCell className="text-muted">{course.teacherName}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{course.level}</Badge>
                          </TableCell>
                          <TableCell className="text-muted">{course.students}</TableCell>
                          <TableCell className="text-muted">{new Date(course.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                          <TableCell>
                            <Badge className={
                              course.status === 'published' ? 'bg-success' :
                                course.status === 'pending_approval' ? 'bg-warning text-dark' : 'bg-danger'
                            }>
                              {course.status === 'published' ? 'Đã xuất bản' :
                                course.status === 'pending_approval' ? 'Chờ duyệt' : 'Đã ẩn'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {course.status === 'pending_approval' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="action-icon-btn btn-outline-success"
                                  onClick={() => handleApproveCourse(course.id)}
                                  title="Phê duyệt khóa học"
                                >
                                  <UserCheck className="h-4 w-4" />
                                </Button>
                              )}
                              {(course.status === 'published' || course.status === 'pending_approval') && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="action-icon-btn btn-outline-danger"
                                  onClick={() => handleHideCourse(course.id)}
                                  title="Ẩn khóa học"
                                >
                                  <UserX className="h-4 w-4" />
                                </Button>
                              )}
                              <Button variant="outline" size="sm" className="action-icon-btn btn-outline-info" title="Xem chi tiết">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6 tab-content-wrapper">
            <Card className="stat-card-admin-dashboard">
              <CardHeader>
                <CardTitle className="section-title">Kiểm duyệt đánh giá học viên</CardTitle>
                <CardDescription>Xem và xóa các đánh giá từ học viên</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="table-responsive custom-table-container">
                  <Table className="custom-table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Khóa học</TableHead>
                        <TableHead>Học viên</TableHead>
                        <TableHead>Đánh giá</TableHead>
                        <TableHead>Bình luận</TableHead>
                        <TableHead>Ngày đánh giá</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reviews.map((review) => (
                        <TableRow key={review.id}>
                          <TableCell className="font-medium"><strong>{review.courseName}</strong></TableCell>
                          <TableCell>{review.studentName}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 review-rating-stars-admin">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                />
                              ))}
                              <span className="ml-1 text-sm">{review.rating}/5</span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{review.comment}</TableCell>
                          <TableCell className="text-muted">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                          <TableCell>
                            <Badge className={
                              review.status === 'approved' ? 'bg-success' :
                                review.status === 'pending' ? 'bg-warning text-dark' : 'bg-danger'
                            }>
                              {review.status === 'approved' ? 'Đã duyệt' :
                                review.status === 'pending' ? 'Chờ duyệt' : 'Đã ẩn'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {review.status !== 'approved' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="action-icon-btn btn-outline-success"
                                  onClick={() => handleToggleReview(review.id, 'approved')}
                                  title="Phê duyệt đánh giá"
                                >
                                  <UserCheck className="h-4 w-4" />
                                </Button>
                              )}
                              {review.status !== 'hidden' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="action-icon-btn btn-outline-warning"
                                  onClick={() => handleToggleReview(review.id, 'hidden')}
                                  title="Ẩn đánh giá"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                className="action-icon-btn btn-outline-danger"
                                onClick={() => handleDeleteReview(review.id)}
                                title="Xóa đánh giá"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exams" className="space-y-6 tab-content-wrapper">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold section-title">Quản lý kiểm tra hệ thống</h2>
              <Dialog open={showCreateExam} onOpenChange={setShowCreateExam}>
                <DialogTrigger asChild>
                  <Button className="btn btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo bài kiểm tra
                  </Button>
                </DialogTrigger>
                <DialogContent className="modal-content">
                  <DialogHeader className="modal-header">
                    <DialogTitle className="modal-title">Tạo bài kiểm tra hệ thống</DialogTitle>
                    <DialogDescription className="dialog-description">
                      Tạo bài kiểm tra áp dụng cho toàn hệ thống
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 modal-body">
                    <div>
                      <label className="text-sm font-medium form-label">Tiêu đề</label>
                      <Input
                        value={newExam.title}
                        onChange={(e) => setNewExam(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Nhập tiêu đề bài kiểm tra"
                        className="form-control"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium form-label">Mô tả</label>
                      <Textarea
                        value={newExam.description}
                        onChange={(e) => setNewExam(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Mô tả về bài kiểm tra"
                        rows={3}
                        className="form-control"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium form-label">Cấp độ</label>
                      <Select value={newExam.level} onValueChange={(value) => setNewExam(prev => ({ ...prev, level: value }))}>
                        <SelectTrigger className="form-control select-trigger">
                          <SelectValue placeholder="Chọn cấp độ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">Tất cả cấp độ</SelectItem>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Pre-Intermediate">Pre-Intermediate</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium form-label">Thời gian (phút)</label>
                        <Input
                          type="number"
                          value={newExam.duration}
                          onChange={(e) => setNewExam(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                          placeholder="60"
                          className="form-control"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium form-label">Số câu hỏi</label>
                        <Input
                          type="number"
                          value={newExam.totalQuestions}
                          onChange={(e) => setNewExam(prev => ({ ...prev, totalQuestions: parseInt(e.target.value) }))}
                          placeholder="20"
                          className="form-control"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium form-label">Điểm đạt (%)</label>
                        <Input
                          type="number"
                          value={newExam.passingScore}
                          onChange={(e) => setNewExam(prev => ({ ...prev, passingScore: parseInt(e.target.value) }))}
                          placeholder="70"
                          className="form-control"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 modal-footer">
                      <Button variant="outline" onClick={() => setShowCreateExam(false)} className="btn btn-outline-secondary">
                        Hủy
                      </Button>
                      <Button onClick={handleCreateExam} className="btn btn-primary">
                        Tạo bài kiểm tra
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="stat-card-admin-dashboard">
              <CardContent>
                <div className="table-responsive custom-table-container">
                  <Table className="custom-table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tiêu đề</TableHead>
                        <TableHead>Cấp độ</TableHead>
                        <TableHead>Thời gian</TableHead>
                        <TableHead>Số câu hỏi</TableHead>
                        <TableHead>Điểm đạt</TableHead>
                        <TableHead>Ngày tạo</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {exams.map((exam) => (
                        <TableRow key={exam.id}>
                          <TableCell className="font-medium"><strong>{exam.title}</strong></TableCell>
                          <TableCell>
                            <Badge variant="outline">{exam.level}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-muted">
                              <Clock className="h-4 w-4" />
                              {exam.duration} phút
                            </div>
                          </TableCell>
                          <TableCell className="text-muted">{exam.totalQuestions} câu</TableCell>
                          <TableCell className="text-muted">{exam.passingScore}%</TableCell>
                          <TableCell className="text-muted">{new Date(exam.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                          <TableCell>
                            <Badge className={exam.isActive ? 'bg-success' : 'bg-secondary'}>
                              {exam.isActive ? 'Hoạt động' : 'Tạm dừng'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="outline" size="sm" className="action-icon-btn btn-outline-primary" title="Chỉnh sửa">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="action-icon-btn btn-outline-info" title="Tải xuống tài liệu">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="action-icon-btn btn-outline-danger" title="Xóa">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vouchers" className="space-y-6 tab-content-wrapper">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold section-title">Quản lý Campaign/Voucher hệ thống</h2>
              <Dialog open={showCreateVoucher} onOpenChange={setShowCreateVoucher}>
                <DialogTrigger asChild>
                  <Button className="btn btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo voucher
                  </Button>
                </DialogTrigger>
                <DialogContent className="modal-content">
                  <DialogHeader className="modal-header">
                    <DialogTitle className="modal-title">Tạo voucher hệ thống</DialogTitle>
                    <DialogDescription className="dialog-description">
                      Tạo voucher giảm giá áp dụng cho toàn hệ thống
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 modal-body">
                    <div>
                      <label className="text-sm font-medium form-label">Mã voucher</label>
                      <Input
                        value={newVoucher.code}
                        onChange={(e) => setNewVoucher(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                        placeholder="VD: NEWYEAR2024"
                        className="form-control"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium form-label">Mô tả</label>
                      <Input
                        value={newVoucher.description}
                        onChange={(e) => setNewVoucher(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Mô tả về voucher"
                        className="form-control"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium form-label">Loại giảm giá</label>
                        <Select value={newVoucher.discountType} onValueChange={(value) => setNewVoucher(prev => ({ ...prev, discountType: value }))}>
                          <SelectTrigger className="form-control select-trigger">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Phần trăm (%)</SelectItem>
                            <SelectItem value="fixed">Số tiền cố định (VND)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium form-label">Giá trị giảm</label>
                        <Input
                          type="number"
                          value={newVoucher.discountValue}
                          onChange={(e) => setNewVoucher(prev => ({ ...prev, discountValue: parseInt(e.target.value) }))}
                          placeholder={newVoucher.discountType === 'percentage' ? '30' : '100000'}
                          className="form-control"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium form-label">Số lần sử dụng tối đa</label>
                        <Input
                          type="number"
                          value={newVoucher.maxUses}
                          onChange={(e) => setNewVoucher(prev => ({ ...prev, maxUses: parseInt(e.target.value) }))}
                          placeholder="100"
                          className="form-control"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium form-label">Ngày hết hạn</label>
                        <Input
                          type="date"
                          value={newVoucher.expiresAt}
                          onChange={(e) => setNewVoucher(prev => ({ ...prev, expiresAt: e.target.value }))}
                          className="form-control"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 modal-footer">
                      <Button variant="outline" onClick={() => setShowCreateVoucher(false)} className="btn btn-outline-secondary">
                        Hủy
                      </Button>
                      <Button onClick={handleCreateVoucher} className="btn btn-primary">
                        Tạo voucher
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="stat-card-admin-dashboard">
              <CardContent>
                <div className="table-responsive custom-table-container">
                  <Table className="custom-table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mã voucher</TableHead>
                        <TableHead>Mô tả</TableHead>
                        <TableHead>Giảm giá</TableHead>
                        <TableHead>Sử dụng</TableHead>
                        <TableHead>Hết hạn</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vouchers.map((voucher) => (
                        <TableRow key={voucher.id}>
                          <TableCell className="font-medium font-mono"><strong>{voucher.code}</strong></TableCell>
                          <TableCell>{voucher.description}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-muted">
                              <Tag className="h-4 w-4" />
                              {voucher.discountType === 'percentage'
                                ? `${voucher.discountValue}%`
                                : `${voucher.discountValue.toLocaleString()}đ`}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {voucher.currentUses}/{voucher.maxUses}
                              <div className="w-full voucher-progress-bar mt-1">
                                <div
                                  className="progress-fill"
                                  style={{ width: `${(voucher.currentUses / voucher.maxUses) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-muted">
                              <Calendar className="h-4 w-4" />
                              {new Date(voucher.expiresAt).toLocaleDateString('vi-VN')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={voucher.isActive ? 'bg-success' : 'bg-secondary'}>
                              {voucher.isActive ? 'Hoạt động' : 'Tạm dừng'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="outline" size="sm" className="action-icon-btn btn-outline-primary" title="Chỉnh sửa">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="action-icon-btn btn-outline-danger" title="Xóa">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default AdminDashboard;