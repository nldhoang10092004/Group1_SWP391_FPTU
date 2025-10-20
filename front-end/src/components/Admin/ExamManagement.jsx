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
import { Switch } from '../ui/switch';
import { Plus, Edit, Trash2, Eye, Clock, FileText } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export default function ExamManagement() {
  const [exams, setExams] = useState([
    {
      id: 'exam1',
      title: 'English Proficiency Test',
      description: 'Bài kiểm tra đánh giá trình độ tiếng Anh toàn diện',
      level: 'All',
      duration: 90,
      totalQuestions: 50,
      passingScore: 70,
      isActive: true,
      createdAt: '2024-01-10',
      attempts: 234
    },
    {
      id: 'exam2',
      title: 'Grammar Mastery Quiz',
      description: 'Kiểm tra kiến thức ngữ pháp',
      level: 'Intermediate',
      duration: 60,
      totalQuestions: 30,
      passingScore: 75,
      isActive: true,
      createdAt: '2024-02-15',
      attempts: 156
    },
    {
      id: 'exam3',
      title: 'Vocabulary Challenge',
      description: 'Bài test từ vựng nâng cao',
      level: 'Advanced',
      duration: 45,
      totalQuestions: 40,
      passingScore: 80,
      isActive: false,
      createdAt: '2024-03-20',
      attempts: 89
    }
  ]);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newExam, setNewExam] = useState({
    title: '',
    description: '',
    level: 'All',
    duration: 60,
    totalQuestions: 20,
    passingScore: 70
  });

  const handleCreateExam = () => {
    if (!newExam.title || !newExam.description) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (newExam.duration < 10 || newExam.duration > 180) {
      toast.error("Thời gian làm bài phải từ 10-180 phút");
      return;
    }

    if (newExam.totalQuestions < 5 || newExam.totalQuestions > 100) {
      toast.error("Số câu hỏi phải từ 5-100");
      return;
    }

    if (newExam.passingScore < 50 || newExam.passingScore > 100) {
      toast.error("Điểm đạt phải từ 50-100");
      return;
    }

    const exam = {
      id: 'exam_' + Date.now(),
      title: newExam.title,
      description: newExam.description,
      level: newExam.level,
      duration: parseInt(newExam.duration),
      totalQuestions: parseInt(newExam.totalQuestions),
      passingScore: parseInt(newExam.passingScore),
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
      attempts: 0
    };

    setExams(prev => [...prev, exam]);
    setNewExam({
      title: '',
      description: '',
      level: 'All',
      duration: 60,
      totalQuestions: 20,
      passingScore: 70
    });
    setShowCreateDialog(false);
    toast.success("Đã tạo bài kiểm tra mới");
  };

  const handleToggleExam = (examId) => {
    setExams(prev => prev.map(exam =>
      exam.id === examId ? { ...exam, isActive: !exam.isActive } : exam
    ));
    toast.success("Đã cập nhật trạng thái bài kiểm tra");
  };

  const handleDeleteExam = (examId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài kiểm tra này?")) {
      setExams(prev => prev.filter(e => e.id !== examId));
      toast.success("Đã xóa bài kiểm tra");
    }
  };

  return (
    <div className="exam-management">
      <Card className="management-card">
        <CardHeader>
          <div className="header-with-button">
            <div>
              <CardTitle>Quản lý bài kiểm tra</CardTitle>
              <CardDescription>Tạo, sửa, xóa và quản lý bài kiểm tra</CardDescription>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="create-btn">
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo bài kiểm tra mới
                </Button>
              </DialogTrigger>
              <DialogContent className="create-dialog large">
                <DialogHeader>
                  <DialogTitle>Tạo bài kiểm tra mới</DialogTitle>
                  <DialogDescription>
                    Điền thông tin để tạo bài kiểm tra
                  </DialogDescription>
                </DialogHeader>
                <div className="form-fields">
                  <div className="form-field">
                    <Label htmlFor="examTitle">Tiêu đề *</Label>
                    <Input
                      id="examTitle"
                      placeholder="English Grammar Test"
                      value={newExam.title}
                      onChange={(e) => setNewExam(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div className="form-field">
                    <Label htmlFor="examDescription">Mô tả *</Label>
                    <Textarea
                      id="examDescription"
                      placeholder="Mô tả về bài kiểm tra..."
                      value={newExam.description}
                      onChange={(e) => setNewExam(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-field">
                      <Label htmlFor="examLevel">Cấp độ *</Label>
                      <Select value={newExam.level} onValueChange={(value) => setNewExam(prev => ({ ...prev, level: value }))}>
                        <SelectTrigger>
                          <SelectValue />
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
                    <div className="form-field">
                      <Label htmlFor="examDuration">Thời gian (phút) *</Label>
                      <Input
                        id="examDuration"
                        type="number"
                        min="10"
                        max="180"
                        placeholder="60"
                        value={newExam.duration}
                        onChange={(e) => setNewExam(prev => ({ ...prev, duration: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-field">
                      <Label htmlFor="totalQuestions">Số câu hỏi *</Label>
                      <Input
                        id="totalQuestions"
                        type="number"
                        min="5"
                        max="100"
                        placeholder="20"
                        value={newExam.totalQuestions}
                        onChange={(e) => setNewExam(prev => ({ ...prev, totalQuestions: e.target.value }))}
                      />
                    </div>
                    <div className="form-field">
                      <Label htmlFor="passingScore">Điểm đạt (%) *</Label>
                      <Input
                        id="passingScore"
                        type="number"
                        min="50"
                        max="100"
                        placeholder="70"
                        value={newExam.passingScore}
                        onChange={(e) => setNewExam(prev => ({ ...prev, passingScore: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
                <div className="dialog-actions">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Hủy
                  </Button>
                  <Button onClick={handleCreateExam}>
                    Tạo bài kiểm tra
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
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Cấp độ</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Số câu</TableHead>
                  <TableHead>Điểm đạt</TableHead>
                  <TableHead>Lượt thi</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map((exam, index) => (
                  <TableRow key={exam.id} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                    <TableCell>
                      <div className="exam-title-cell">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <div>
                          <div className="exam-title">{exam.title}</div>
                          <div className="exam-description">{exam.description}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{exam.level}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="time-cell">
                        <Clock className="h-4 w-4" />
                        {exam.duration} phút
                      </div>
                    </TableCell>
                    <TableCell>{exam.totalQuestions} câu</TableCell>
                    <TableCell>{exam.passingScore}%</TableCell>
                    <TableCell>{exam.attempts} lượt</TableCell>
                    <TableCell>
                      <div className="switch-cell">
                        <Switch
                          checked={exam.isActive}
                          onCheckedChange={() => handleToggleExam(exam.id)}
                        />
                        <span className={exam.isActive ? 'text-green-600' : 'text-gray-400'}>
                          {exam.isActive ? 'Kích hoạt' : 'Tắt'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="action-buttons">
                        <Button variant="ghost" size="sm" className="action-btn" title="Xem chi tiết">
                          <Eye className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="sm" className="action-btn" title="Sửa">
                          <Edit className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="action-btn"
                          onClick={() => handleDeleteExam(exam.id)}
                          title="Xóa"
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
