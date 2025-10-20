import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowLeft } from 'lucide-react';
import Statistics from './Statistics';
import UserManagement from './UserManagement';
import TeacherManagement from './TeacherManagement';
import CourseManagement from './CourseManagement';
import ReviewManagement from './ReviewManagement';
import ExamManagement from './ExamManagement';
import VoucherManagement from './VoucherManagement';
import './dashboard.css';

export default function AdminDashboard({ onClose }) {
  const [activeTab, setActiveTab] = useState('statistics');

  return (
    <div className="admin-dashboard">
      {/* Dashboard Header */}
      <div className="admin-header">
        <div className="header-left">
          <div className="header-title">
            <h1 className="gradient-text">Admin Dashboard</h1>
            <p className="subtitle">Quản lý hệ thống và theo dõi hoạt động</p>
          </div>
        </div>
        <Badge className="admin-badge">
          Admin Panel
        </Badge>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="admin-tabs">
        <TabsList className="tabs-list">
          <TabsTrigger value="statistics" className="tab-trigger">
            Thống kê
          </TabsTrigger>
          <TabsTrigger value="users" className="tab-trigger">
            Người dùng
          </TabsTrigger>
          <TabsTrigger value="teachers" className="tab-trigger">
            Giảng viên
          </TabsTrigger>
          <TabsTrigger value="courses" className="tab-trigger">
            Khóa học
          </TabsTrigger>
          <TabsTrigger value="reviews" className="tab-trigger">
            Đánh giá
          </TabsTrigger>
          <TabsTrigger value="exams" className="tab-trigger">
            Kiểm tra
          </TabsTrigger>
          <TabsTrigger value="vouchers" className="tab-trigger">
            Voucher
          </TabsTrigger>
        </TabsList>

        {/* Tab Contents */}
        <TabsContent value="statistics" className="tab-content">
          <Statistics />
        </TabsContent>

        <TabsContent value="users" className="tab-content">
          <UserManagement />
        </TabsContent>

        <TabsContent value="teachers" className="tab-content">
          <TeacherManagement />
        </TabsContent>

        <TabsContent value="courses" className="tab-content">
          <CourseManagement />
        </TabsContent>

        <TabsContent value="reviews" className="tab-content">
          <ReviewManagement />
        </TabsContent>

        <TabsContent value="exams" className="tab-content">
          <ExamManagement />
        </TabsContent>

        <TabsContent value="vouchers" className="tab-content">
          <VoucherManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
