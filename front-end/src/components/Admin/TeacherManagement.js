import { useState, useEffect } from "react";
import { CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Input } from "./ui/input";
import { UserX, UserCheck, Eye, Plus, Search } from "lucide-react";

import {
  getTeachers,
  lockUser,
  unlockUser,
  createUser,
  searchUsers
} from "../../middleware/userManagementAPI";

export function TeacherManagement() {
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const [newTeacher, setNewTeacher] = useState({
    email: "",
    username: "",
    password: "",
    role: "TEACHER",
    description: "",
  });

  const showPopup = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      setIsLoading(true);
      const teachersData = await getTeachers();
      
      const mappedTeachers = teachersData.map(t => ({
        id: t.accountID,
        accountID: t.accountID,
        fullName: t.username,
        email: t.email,
        role: t.role,
        status: t.status,
        isActive: t.status === 'ACTIVE',
      }));

      setTeachers(mappedTeachers);
    } catch (error) {
      console.error('Error loading teachers:', error);
      showPopup("Không thể tải dữ liệu giảng viên", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchTeacher = async () => {
    try {
      setIsLoading(true);
      const results = await searchUsers(searchQuery, "TEACHER", null);
      const mappedResults = results.map((t) => ({
        id: t.accountID,
        accountID: t.accountID,
        fullName: t.username,
        email: t.email,
        role: t.role,
        status: t.status,
        isActive: t.status === "ACTIVE",
      }));
      setTeachers(mappedResults);
      showPopup(`Tìm thấy ${mappedResults.length} giảng viên`, "success");
    } catch (error) {
      showPopup("Lỗi khi tìm kiếm giảng viên", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTeacher = async (accountID, isActive) => {
    try {
      if (isActive) {
        await lockUser(accountID);
        showPopup("Đã khóa tài khoản giảng viên", "success");
      } else {
        await unlockUser(accountID);
        showPopup("Đã kích hoạt tài khoản giảng viên", "success");
      }
      await loadTeachers();
    } catch (error) {
      showPopup("Không thể thay đổi trạng thái tài khoản", "error");
    }
  };

  const handleCreateTeacher = async () => {
    try {
      await createUser(newTeacher);
      showPopup("Tạo giảng viên thành công!", "success");
      setShowCreateModal(false);
      setNewTeacher({ email: "", username: "", password: "", role: "TEACHER", description: "" });
      await loadTeachers();
    } catch (err) {
      showPopup("Lỗi khi tạo giảng viên!", "error");
    }
  };

  const activeTeachers = teachers.filter(t => t.isActive).length;
  const inactiveTeachers = teachers.filter(t => !t.isActive).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className={`p-4 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
            <div className="flex justify-between items-center">
              <strong className="mr-2">Thông báo</strong>
              <button onClick={() => setToast(prev => ({ ...prev, show: false }))} className="text-white hover:text-gray-200">
                ×
              </button>
            </div>
            <div className="mt-2">{toast.message}</div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <CardHeader>
          <div className="flex justify-between items-start mb-4">
            <div>
              <CardTitle>Quản lý giảng viên</CardTitle>
              <CardDescription>
                Tổng: {teachers.length} | Hoạt động: {activeTeachers} | Đã khóa: {inactiveTeachers}
              </CardDescription>
            </div>

            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Tìm giảng viên..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearchTeacher()}
                  className="pl-10 min-w-[250px]"
                />
              </div>

              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="mr-2" size={16} />
                Tạo giảng viên
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Họ tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell className="text-gray-500">#{teacher.accountID}</TableCell>
                  <TableCell className="font-bold">{teacher.fullName}</TableCell>
                  <TableCell>{teacher.email}</TableCell>
                  <TableCell>
                    <Badge className={teacher.isActive ? "bg-green-500" : "bg-red-500"}>
                      {teacher.isActive ? "Hoạt động" : "Đã khóa"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleTeacher(teacher.accountID, teacher.isActive)}
                      >
                        {teacher.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </div>

      {/* Create Teacher Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Tạo tài khoản giảng viên</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700">
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <Input
                  type="email"
                  placeholder="teacher@email.com"
                  value={newTeacher.email}
                  onChange={(e) => setNewTeacher((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Username *</label>
                <Input
                  placeholder="Tên đăng nhập"
                  value={newTeacher.username}
                  onChange={(e) => setNewTeacher((prev) => ({ ...prev, username: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Mật khẩu *</label>
                <Input
                  type="password"
                  placeholder="Mật khẩu"
                  value={newTeacher.password}
                  onChange={(e) => setNewTeacher((prev) => ({ ...prev, password: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Mô tả</label>
                <textarea
                  className="w-full border rounded-md p-2"
                  rows={3}
                  placeholder="Thông tin thêm về giảng viên"
                  value={newTeacher.description}
                  onChange={(e) => setNewTeacher((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Hủy
              </Button>
              <Button onClick={handleCreateTeacher}>Tạo giảng viên</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherManagement;