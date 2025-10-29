import { useState, useEffect } from "react";
import { CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Eye, Trash } from "lucide-react";
import { getAllCourses, deleteCourse } from "../../middleware/admin/courseManagementAPI";

export function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showPopup = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  // 📦 Tải danh sách khóa học
  const loadCourses = async () => {
    try {
      setIsLoading(true);
      const data = await getAllCourses();
      setCourses(data);
    } catch (error) {
      console.error("Error loading courses:", error);
      showPopup("Không thể tải danh sách khóa học", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  // 🗑️ Xóa khóa học
  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Bạn có chắc muốn xóa khóa học này không?")) return;
    try {
      await deleteCourse(courseId);
      showPopup("Đã xóa khóa học thành công", "success");
      setCourses((prev) => prev.filter((c) => c.courseID !== courseId));
    } catch (error) {
      console.error("Error deleting course:", error);
      showPopup("Không thể xóa khóa học", "error");
    }
  };

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
          <div
            className={`p-4 rounded-lg shadow-lg ${
              toast.type === "success" ? "bg-green-500" : "bg-red-500"
            } text-white`}
          >
            <div className="flex justify-between items-center">
              <strong className="mr-2">Thông báo</strong>
              <button
                onClick={() => setToast((prev) => ({ ...prev, show: false }))}
                className="text-white hover:text-gray-200"
              >
                ×
              </button>
            </div>
            <div className="mt-2">{toast.message}</div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <CardHeader>
          <CardTitle>Quản lý khóa học</CardTitle>
          <CardDescription>Tổng số: {courses.length}</CardDescription>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên khóa học</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Giảng viên</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.courseID}>
                  <TableCell className="font-bold">{course.courseName}</TableCell>
                  <TableCell>{course.courseDescription}</TableCell>
                  <TableCell>{course.teacherName}</TableCell>
                  <TableCell>{new Date(course.createAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm">
                        <Eye size={16} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600"
                        onClick={() => handleDeleteCourse(course.courseID)}
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </div>
    </div>
  );
}

export default CourseManagement;
