import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Alert, AlertDescription } from "../components/ui/alert";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Users, DollarSign, BookOpen, TrendingUp, AlertCircle, MessageSquare, Settings, ArrowLeft, Shield, UserCheck, UserX, Eye, Trash2, Edit, Plus, Download, Upload, Tag, Star, Calendar, Clock } from "lucide-react";
import { authService } from "../utils/supabase/auth";
import { toast } from "sonner@2.0.3";

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
      
      // Mock data for comprehensive admin dashboard
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

      const [statsData, requestsData] = await Promise.all([
        authService.getAdminStats(),
        authService.getAllRequests()
      ]);
      
      setStats(statsData);
      setRequests(requestsData);
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

  const handleDeleteReview = async (reviewId) => {
    if (confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) {
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
      // In real app, call API to create teacher account
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

  // Mock data for charts
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Đang tải dữ liệu admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onClose}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Quản lý hệ thống và theo dõi hoạt động</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-sm">
            Admin Panel
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{stats?.newUsersThisMonth || 0} trong tháng này
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gói đang hoạt động</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeSubscriptions?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.activeSubscriptions && stats?.totalUsers ? 
                  Math.round((stats.activeSubscriptions / stats.totalUsers) * 100) : 0}% tỷ lệ chuyển đổi
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Doanh thu tháng</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats?.monthlyRevenue || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Tổng: {formatCurrency(stats?.totalRevenue || 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nội dung</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalCourses || 0} khóa
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.totalLessons || 0} bài học
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="analytics">Thống kê</TabsTrigger>
            <TabsTrigger value="users">Người dùng</TabsTrigger>
            <TabsTrigger value="teachers">Giảng viên</TabsTrigger>
            <TabsTrigger value="courses">Khóa học</TabsTrigger>
            <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
            <TabsTrigger value="exams">Kiểm tra</TabsTrigger>
            <TabsTrigger value="vouchers">Voucher</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Doanh thu theo tháng</CardTitle>
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
                      <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tăng trưởng người dùng</CardTitle>
                  <CardDescription>Tổng số và người dùng mới</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={userGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} name="Tổng người dùng" />
                      <Line type="monotone" dataKey="new" stroke="#f59e0b" strokeWidth={2} name="Người dùng mới" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quản lý tài khoản người dùng</CardTitle>
                <CardDescription>Xem, khóa/kích hoạt tài khoản người dùng</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
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
                        <TableCell className="font-medium">{user.fullName}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.userType === 'admin' ? 'destructive' : user.userType === 'teacher' ? 'default' : 'secondary'}>
                            {user.userType === 'admin' ? 'Admin' : user.userType === 'teacher' ? 'Giảng viên' : 'Học viên'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.hasActiveSubscription ? 'default' : 'outline'}>
                            {user.hasActiveSubscription ? 'Có' : 'Không'}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(user.joinedDate).toLocaleDateString('vi-VN')}</TableCell>
                        <TableCell>{new Date(user.lastLogin).toLocaleDateString('vi-VN')}</TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? 'default' : 'destructive'}>
                            {user.isActive ? 'Hoạt động' : 'Đã khóa'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleUser(user.id, user.isActive)}
                            >
                              {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teachers" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Quản lý tài khoản giảng viên</h2>
              <Dialog open={showCreateTeacher} onOpenChange={setShowCreateTeacher}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo tài khoản giảng viên
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tạo tài khoản giảng viên mới</DialogTitle>
                    <DialogDescription>
                      Tạo tài khoản cho giảng viên mới
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Họ và tên</label>
                      <Input
                        value={newTeacher.fullName}
                        onChange={(e) => setNewTeacher(prev => ({ ...prev, fullName: e.target.value }))}
                        placeholder="Nhập họ và tên"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <Input
                        type="email"
                        value={newTeacher.email}
                        onChange={(e) => setNewTeacher(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Nhập email"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Mật khẩu</label>
                      <Input
                        type="password"
                        value={newTeacher.password}
                        onChange={(e) => setNewTeacher(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Nhập mật khẩu"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Chuyên môn</label>
                      <Input
                        value={newTeacher.specialization}
                        onChange={(e) => setNewTeacher(prev => ({ ...prev, specialization: e.target.value }))}
                        placeholder="VD: Tiếng Anh giao tiếp"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowCreateTeacher(false)}>
                        Hủy
                      </Button>
                      <Button onClick={handleCreateTeacher}>
                        Tạo tài khoản
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent>
                <Table>
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
                        <TableCell className="font-medium">{teacher.fullName}</TableCell>
                        <TableCell>{teacher.email}</TableCell>
                        <TableCell>{new Date(teacher.joinedDate).toLocaleDateString('vi-VN')}</TableCell>
                        <TableCell>{new Date(teacher.lastLogin).toLocaleDateString('vi-VN')}</TableCell>
                        <TableCell>
                          <Badge variant={teacher.isActive ? 'default' : 'destructive'}>
                            {teacher.isActive ? 'Hoạt động' : 'Đã khóa'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleUser(teacher.id, teacher.isActive)}
                            >
                              {teacher.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quản lý tất cả khóa học</CardTitle>
                <CardDescription>Duyệt khóa học mới, ẩn khóa học vi phạm</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
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
                        <TableCell className="font-medium">{course.name}</TableCell>
                        <TableCell>{course.teacherName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{course.level}</Badge>
                        </TableCell>
                        <TableCell>{course.students}</TableCell>
                        <TableCell>{new Date(course.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                        <TableCell>
                          <Badge variant={
                            course.status === 'published' ? 'default' :
                            course.status === 'pending_approval' ? 'secondary' : 'destructive'
                          }>
                            {course.status === 'published' ? 'Đã xuất bản' :
                             course.status === 'pending_approval' ? 'Chờ duyệt' : 'Đã ẩn'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {course.status === 'pending_approval' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApproveCourse(course.id)}
                              >
                                <UserCheck className="h-4 w-4" />
                              </Button>
                            )}
                            {course.status === 'published' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleHideCourse(course.id)}
                              >
                                <UserX className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Kiểm duyệt đánh giá học viên</CardTitle>
                <CardDescription>Xem và xóa các đánh giá từ học viên</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
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
                        <TableCell className="font-medium">{review.courseName}</TableCell>
                        <TableCell>{review.studentName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
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
                        <TableCell>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                        <TableCell>
                          <Badge variant={
                            review.status === 'approved' ? 'default' :
                            review.status === 'pending' ? 'secondary' : 'destructive'
                          }>
                            {review.status === 'approved' ? 'Đã duyệt' :
                             review.status === 'pending' ? 'Chờ duyệt' : 'Đã ẩn'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {review.status !== 'approved' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleReview(review.id, 'approved')}
                              >
                                <UserCheck className="h-4 w-4" />
                              </Button>
                            )}
                            {review.status !== 'hidden' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleReview(review.id, 'hidden')}
                              >
                                <UserX className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteReview(review.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exams" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Quản lý kiểm tra hệ thống</h2>
              <Dialog open={showCreateExam} onOpenChange={setShowCreateExam}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo bài kiểm tra
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tạo bài kiểm tra hệ thống</DialogTitle>
                    <DialogDescription>
                      Tạo bài kiểm tra áp dụng cho toàn hệ thống
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Tiêu đề</label>
                      <Input
                        value={newExam.title}
                        onChange={(e) => setNewExam(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Nhập tiêu đề bài kiểm tra"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Mô tả</label>
                      <Textarea
                        value={newExam.description}
                        onChange={(e) => setNewExam(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Mô tả về bài kiểm tra"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Cấp độ</label>
                      <Select value={newExam.level} onValueChange={(value) => setNewExam(prev => ({ ...prev, level: value }))}>
                        <SelectTrigger>
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
                        <label className="text-sm font-medium">Thời gian (phút)</label>
                        <Input
                          type="number"
                          value={newExam.duration}
                          onChange={(e) => setNewExam(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                          placeholder="60"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Số câu hỏi</label>
                        <Input
                          type="number"
                          value={newExam.totalQuestions}
                          onChange={(e) => setNewExam(prev => ({ ...prev, totalQuestions: parseInt(e.target.value) }))}
                          placeholder="20"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Điểm đạt (%)</label>
                        <Input
                          type="number"
                          value={newExam.passingScore}
                          onChange={(e) => setNewExam(prev => ({ ...prev, passingScore: parseInt(e.target.value) }))}
                          placeholder="70"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowCreateExam(false)}>
                        Hủy
                      </Button>
                      <Button onClick={handleCreateExam}>
                        Tạo bài kiểm tra
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent>
                <Table>
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
                        <TableCell className="font-medium">{exam.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{exam.level}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {exam.duration} phút
                          </div>
                        </TableCell>
                        <TableCell>{exam.totalQuestions} câu</TableCell>
                        <TableCell>{exam.passingScore}%</TableCell>
                        <TableCell>{new Date(exam.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                        <TableCell>
                          <Badge variant={exam.isActive ? 'default' : 'secondary'}>
                            {exam.isActive ? 'Hoạt động' : 'Tạm dừng'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vouchers" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Quản lý Campaign/Voucher hệ thống</h2>
              <Dialog open={showCreateVoucher} onOpenChange={setShowCreateVoucher}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo voucher
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tạo voucher hệ thống</DialogTitle>
                    <DialogDescription>
                      Tạo voucher giảm giá áp dụng cho toàn hệ thống
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Mã voucher</label>
                      <Input
                        value={newVoucher.code}
                        onChange={(e) => setNewVoucher(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                        placeholder="VD: NEWYEAR2024"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Mô tả</label>
                      <Input
                        value={newVoucher.description}
                        onChange={(e) => setNewVoucher(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Mô tả về voucher"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Loại giảm giá</label>
                        <Select value={newVoucher.discountType} onValueChange={(value) => setNewVoucher(prev => ({ ...prev, discountType: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Phần trăm (%)</SelectItem>
                            <SelectItem value="fixed">Số tiền cố định (VND)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Giá trị giảm</label>
                        <Input
                          type="number"
                          value={newVoucher.discountValue}
                          onChange={(e) => setNewVoucher(prev => ({ ...prev, discountValue: parseInt(e.target.value) }))}
                          placeholder={newVoucher.discountType === 'percentage' ? '30' : '100000'}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Số lần sử dụng tối đa</label>
                        <Input
                          type="number"
                          value={newVoucher.maxUses}
                          onChange={(e) => setNewVoucher(prev => ({ ...prev, maxUses: parseInt(e.target.value) }))}
                          placeholder="100"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Ngày hết hạn</label>
                        <Input
                          type="date"
                          value={newVoucher.expiresAt}
                          onChange={(e) => setNewVoucher(prev => ({ ...prev, expiresAt: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowCreateVoucher(false)}>
                        Hủy
                      </Button>
                      <Button onClick={handleCreateVoucher}>
                        Tạo voucher
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent>
                <Table>
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
                        <TableCell className="font-medium font-mono">{voucher.code}</TableCell>
                        <TableCell>{voucher.description}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Tag className="h-4 w-4" />
                            {voucher.discountType === 'percentage' 
                              ? `${voucher.discountValue}%` 
                              : `${voucher.discountValue.toLocaleString()}đ`}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {voucher.currentUses}/{voucher.maxUses}
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${(voucher.currentUses / voucher.maxUses) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(voucher.expiresAt).toLocaleDateString('vi-VN')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={voucher.isActive ? 'default' : 'secondary'}>
                            {voucher.isActive ? 'Hoạt động' : 'Tạm dừng'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
