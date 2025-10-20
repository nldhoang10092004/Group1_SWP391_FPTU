import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Plus, Edit, Trash2, Eye, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export default function CourseManagement() {
  const [courses, setCourses] = useState([
    {
      id: 'course1',
      name: 'English Foundation',
      teacherName: 'Lê Văn C',
      level: 'Beginner',
      students: 156,
      lessons: 24,
      status: 'published',
      createdAt: '2024-01-15'
    },
    {
      id: 'course2',
      name: 'Advanced Business English',
      teacherName: 'Nguyễn Thị D',
      level: 'Advanced',
      students: 45,
      lessons: 18,
      status: 'pending_approval',
      createdAt: '2024-12-20'
    },
    {
      id: 'course3',
      name: 'Intermediate Conversation',
      teacherName: 'Lê Văn C',
      level: 'Intermediate',
      students: 89,
      lessons: 20,
      status: 'published',
      createdAt: '2024-03-10'
    }
  ]);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCourse, setNewCourse] = useState({
    name: '',
    description: '',
    level: 'Beginner',
    teacherName: ''
  });

  const handleCreateCourse = () => {
    if (!newCourse.name || !newCourse.description || !newCourse.teacherName) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const course = {
      id: 'course_' + Date.now(),
      name: newCourse.name,
      teacherName: newCourse.teacherName,
      level: newCourse.level,
      students: 0,
      lessons: 0,
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setCourses(prev => [...prev, course]);
    setNewCourse({ name: '', description: '', level: 'Beginner', teacherName: '' });
    setShowCreateDialog(false);
    toast.success("Đã tạo khóa học mới");
  };

  const handleApproveCourse = (courseId) => {
    setCourses(prev => prev.map(course =>
      course.id === courseId ? { ...course, status: 'published' } : course
    ));
    toast.success("Đã phê duyệt khóa học");
  };

  const handleRejectCourse = (courseId) => {
    setCourses(prev => prev.map(course =>
      course.id === courseId ? { ...course, status: 'hidden' } : course
    ));
    toast.success("Đã ẩn khóa học");
  };

  const handleDeleteCourse = (courseId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa khóa học này?")) {
      setCourses(prev => prev.filter(c => c.id !== courseId));
      toast.success("Đã xóa khóa học");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      published: { label: 'Đã xuất bản', className: 'status-published' },
      pending_approval: { label: 'Chờ duyệt', className: 'status-pending' },
      draft: { label: 'Nháp', className: 'status-draft' },
      hidden: { label: 'Đã ẩn', className: 'status-hidden' }
    };
    const config = statusConfig[status] || statusConfig.draft;
    return <Badge className={`status-badge ${config.className}`}>{config.label}</Badge>;
  };

  return (
    <div className="course-management">
      <Card className="management-card">
        <CardHeader>
          <div className="header-with-button">
            <div>
              <CardTitle>Quản lý khóa học</CardTitle>
              <CardDescription>Tạo, sửa, xóa và phê duyệt khóa học</CardDescription>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="create-btn">
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo khóa học mới
                </Button>
              </DialogTrigger>
              <DialogContent className="create-dialog">
                <DialogHeader>
                  <DialogTitle>Tạo khóa học mới</DialogTitle>
                  <DialogDescription>
                    Điền thông tin để tạo khóa học
                  </DialogDescription>
                </DialogHeader>
                <div className="form-fields">
                  <div className="form-field">
                    <Label htmlFor="courseName">Tên khóa học *</Label>
                    <Input
                      id="courseName"
                      placeholder="English for Beginners"
                      value={newCourse.name}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="form-field">
                    <Label htmlFor="description">Mô tả *</Label>
                    <Textarea
                      id="description"
                      placeholder="Mô tả về khóa học..."
                      value={newCourse.description}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                    />
                  </div>
                  <div className="form-field">
                    <Label htmlFor="level">Cấp độ *</Label>
                    <Select value={newCourse.level} onValueChange={(value) => setNewCourse(prev => ({ ...prev, level: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Pre-Intermediate">Pre-Intermediate</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="form-field">
                    <Label htmlFor="teacher">Giảng viên *</Label>
                    <Input
                      id="teacher"
                      placeholder="Tên giảng viên"
                      value={newCourse.teacherName}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, teacherName: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="dialog-actions">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Hủy
                  </Button>
                  <Button onClick={handleCreateCourse}>
                    Tạo khóa học
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
                  <TableHead>Tên khóa học</TableHead>
                  <TableHead>Giảng viên</TableHead>
                  <TableHead>Cấp độ</TableHead>
                  <TableHead>Học viên</TableHead>
                  <TableHead>Bài học</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course, index) => (
                  <TableRow key={course.id} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                    <TableCell className="course-name">{course.name}</TableCell>
                    <TableCell>{course.teacherName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{course.level}</Badge>
                    </TableCell>
                    <TableCell>{course.students} học viên</TableCell>
                    <TableCell>{course.lessons} bài</TableCell>
                    <TableCell>{getStatusBadge(course.status)}</TableCell>
                    <TableCell>{new Date(course.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell>
                      <div className="action-buttons">
                        {course.status === 'pending_approval' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="action-btn"
                              onClick={() => handleApproveCourse(course.id)}
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="action-btn"
                              onClick={() => handleRejectCourse(course.id)}
                            >
                              <XCircle className="h-4 w-4 text-orange-600" />
                            </Button>
                          </>
                        )}
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
                          onClick={() => handleDeleteCourse(course.id)}
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
