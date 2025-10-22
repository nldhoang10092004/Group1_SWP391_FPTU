import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export default function TeacherManagement() {
  const [teachers, setTeachers] = useState([
    {
      id: 'teacher1',
      fullName: 'Lê Văn C',
      email: 'levanc@email.com',
      specialization: 'Grammar & Speaking',
      coursesCount: 3,
      studentsCount: 156,
      joinedDate: '2024-01-01',
      isActive: true
    },
    {
      id: 'teacher2',
      fullName: 'Nguyễn Thị D',
      email: 'nguyenthid@email.com',
      specialization: 'Business English',
      coursesCount: 2,
      studentsCount: 89,
      joinedDate: '2024-02-15',
      isActive: true
    }
  ]);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    fullName: '',
    email: '',
    password: '',
    specialization: ''
  });

  const handleCreateTeacher = () => {
    if (!newTeacher.fullName || !newTeacher.email || !newTeacher.password) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const teacher = {
      id: 'teacher_' + Date.now(),
      fullName: newTeacher.fullName,
      email: newTeacher.email,
      specialization: newTeacher.specialization || 'Chưa xác định',
      coursesCount: 0,
      studentsCount: 0,
      joinedDate: new Date().toISOString().split('T')[0],
      isActive: true
    };

    setTeachers(prev => [...prev, teacher]);
    setNewTeacher({ fullName: '', email: '', password: '', specialization: '' });
    setShowCreateDialog(false);
    toast.success("Đã tạo tài khoản giảng viên mới");
  };

  const handleDeleteTeacher = (teacherId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa giảng viên này?")) {
      setTeachers(prev => prev.filter(t => t.id !== teacherId));
      toast.success("Đã xóa giảng viên");
    }
  };

  return (
    <div className="teacher-management">
      <Card className="management-card">
        <CardHeader>
          <div className="header-with-button">
            <div>
              <CardTitle>Quản lý giảng viên</CardTitle>
              <CardDescription>Tạo, sửa, xóa tài khoản giảng viên</CardDescription>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="create-btn">
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo giảng viên mới
                </Button>
              </DialogTrigger>
              <DialogContent className="create-dialog">
                <DialogHeader>
                  <DialogTitle>Tạo tài khoản giảng viên mới</DialogTitle>
                  <DialogDescription>
                    Điền thông tin để tạo tài khoản giảng viên
                  </DialogDescription>
                </DialogHeader>
                <div className="form-fields">
                  <div className="form-field">
                    <Label htmlFor="fullName">Họ và tên *</Label>
                    <Input
                      id="fullName"
                      placeholder="Nguyễn Văn A"
                      value={newTeacher.fullName}
                      onChange={(e) => setNewTeacher(prev => ({ ...prev, fullName: e.target.value }))}
                    />
                  </div>
                  <div className="form-field">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      value={newTeacher.email}
                      onChange={(e) => setNewTeacher(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="form-field">
                    <Label htmlFor="password">Mật khẩu *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={newTeacher.password}
                      onChange={(e) => setNewTeacher(prev => ({ ...prev, password: e.target.value }))}
                    />
                  </div>
                  <div className="form-field">
                    <Label htmlFor="specialization">Chuyên môn</Label>
                    <Input
                      id="specialization"
                      placeholder="Grammar, Speaking, Writing..."
                      value={newTeacher.specialization}
                      onChange={(e) => setNewTeacher(prev => ({ ...prev, specialization: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="dialog-actions">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Hủy
                  </Button>
                  <Button onClick={handleCreateTeacher}>
                    Tạo tài khoản
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="table-container">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Chuyên môn</TableHead>
                  <TableHead>Số khóa học</TableHead>
                  <TableHead>Số học viên</TableHead>
                  <TableHead>Ngày tham gia</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.map((teacher, index) => (
                  <TableRow key={teacher.id} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                    <TableCell className="teacher-name">{teacher.fullName}</TableCell>
                    <TableCell>{teacher.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{teacher.specialization}</Badge>
                    </TableCell>
                    <TableCell>{teacher.coursesCount} khóa</TableCell>
                    <TableCell>{teacher.studentsCount} học viên</TableCell>
                    <TableCell>{new Date(teacher.joinedDate).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell>
                      <Badge className={`status-badge ${teacher.isActive ? 'active' : 'inactive'}`}>
                        {teacher.isActive ? '✓ Hoạt động' : '✕ Ngưng'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="action-buttons">
                        <Button variant="ghost" size="sm" className="action-btn">
                          <Eye className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="sm" className="action-btn">
                          <Edit className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="action-btn"
                          onClick={() => handleDeleteTeacher(teacher.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
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
    </div>
  );
}
