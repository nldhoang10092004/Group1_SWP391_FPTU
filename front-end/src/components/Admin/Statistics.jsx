import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, DollarSign, BookOpen, TrendingUp } from 'lucide-react';
import { authService } from '../../utils/supabase/auth';

export default function Statistics() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await authService.getAdminStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const revenueData = [
    { month: 'T1', revenue: 18500000, users: 45 },
    { month: 'T2', revenue: 21000000, users: 67 },
    { month: 'T3', revenue: 19000000, users: 52 },
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

  const courseActivityData = [
    { name: 'Beginner', students: 450 },
    { name: 'Pre-Int', students: 320 },
    { name: 'Intermediate', students: 280 },
    { name: 'Advanced', students: 150 },
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
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Đang tải thống kê...</p>
      </div>
    );
  }

  return (
    <div className="statistics-container">
      {/* Stats Cards */}
      <div className="stats-grid">
        <Card className="stat-card blue">
          <div className="stat-icon blue">
            <Users className="h-6 w-6" />
          </div>
          <CardHeader>
            <CardTitle className="stat-label">Tổng người dùng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-value">{stats?.totalUsers?.toLocaleString() || 0}</div>
            <p className="stat-change positive">+{stats?.newUsersThisMonth || 0} trong tháng này</p>
          </CardContent>
        </Card>

        <Card className="stat-card purple">
          <div className="stat-icon purple">
            <TrendingUp className="h-6 w-6" />
          </div>
          <CardHeader>
            <CardTitle className="stat-label">Gói đang hoạt động</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-value">{stats?.activeSubscriptions?.toLocaleString() || 0}</div>
            <p className="stat-change">
              {stats?.activeSubscriptions && stats?.totalUsers 
                ? Math.round((stats.activeSubscriptions / stats.totalUsers) * 100) 
                : 0}% tỷ lệ chuyển đổi
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card green">
          <div className="stat-icon green">
            <DollarSign className="h-6 w-6" />
          </div>
          <CardHeader>
            <CardTitle className="stat-label">Doanh thu tháng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-value">{formatCurrency(stats?.monthlyRevenue || 0)}</div>
            <p className="stat-change">Tổng: {formatCurrency(stats?.totalRevenue || 0)}</p>
          </CardContent>
        </Card>

        <Card className="stat-card orange">
          <div className="stat-icon orange">
            <BookOpen className="h-6 w-6" />
          </div>
          <CardHeader>
            <CardTitle className="stat-label">Nội dung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-value">{stats?.totalCourses || 0} khóa</div>
            <p className="stat-change">{stats?.totalLessons || 0} bài học</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Revenue Chart */}
        <Card className="chart-card">
          <CardHeader>
            <CardTitle>Doanh thu theo tháng</CardTitle>
            <CardDescription>Xu hướng doanh thu và người dùng mới</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? formatCurrency(value) : value,
                    name === 'revenue' ? 'Doanh thu' : 'Người dùng mới'
                  ]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Growth Chart */}
        <Card className="chart-card">
          <CardHeader>
            <CardTitle>Tăng trưởng người dùng</CardTitle>
            <CardDescription>Tổng số và người dùng mới</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={3} name="Tổng" dot={{ fill: '#10b981', r: 5 }} />
                <Line type="monotone" dataKey="new" stroke="#f59e0b" strokeWidth={3} name="Mới" dot={{ fill: '#f59e0b', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Course Activity Chart */}
        <Card className="chart-card full-width">
          <CardHeader>
            <CardTitle>Hoạt động khóa học</CardTitle>
            <CardDescription>Số lượng học viên theo cấp độ</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={courseActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Bar dataKey="students" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
