import { useState, useEffect } from "react";
import { UserPlus, Trash, Power, PowerOff } from "lucide-react";
import { getTeachers, searchUsers, lockUser, unlockUser, createUser } from "../../middleware/admin/userManagementAPI";
import "./management-styles.scss";

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
        setTimeout(() => setToast({ show: false, message: "" }), 3000);
    };

    useEffect(() => {
        loadTeachers();
    }, []);

    const loadTeachers = async () => {
        try {
            setIsLoading(true);
            const data = await getTeachers();
            const mapped = data.map(t => ({ ...t, isActive: t.status === 'ACTIVE' }));
            setTeachers(mapped);
        } catch (error) {
            showPopup("Không thể tải danh sách giảng viên", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleTeacher = async (accountID, isActive) => {
        if (!window.confirm(`Bạn có chắc muốn ${isActive ? 'hủy kích hoạt' : 'kích hoạt'} giảng viên này?`)) return;
        try {
            if (isActive) {
                await lockUser(accountID);
            } else {
                await unlockUser(accountID);
            }
            showPopup("Cập nhật trạng thái thành công", "success");
            setTeachers(teachers.map(t => t.accountID === accountID ? { ...t, isActive: !isActive } : t));
        } catch (error) {
            showPopup("Không thể cập nhật trạng thái", "error");
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            loadTeachers();
            return;
        }
        try {
            setIsLoading(true);
            const data = await searchUsers(searchQuery, 'TEACHER');
            const mapped = data.map(t => ({ ...t, isActive: t.status === 'ACTIVE' }));
            setTeachers(mapped);
        } catch (error) {
            showPopup("Không tìm thấy kết quả", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateTeacher = async () => {
        if (!newTeacher.email || !newTeacher.username || !newTeacher.password) {
            showPopup("Vui lòng điền đầy đủ thông tin", "error");
            return;
        }
        try {
            await createUser(newTeacher);
            showPopup("Tạo giảng viên thành công!", "success");
            setShowCreateModal(false);
            loadTeachers();
            setNewTeacher({ email: "", username: "", password: "", role: "TEACHER", description: "" });
        } catch (error) {
            showPopup(error.response?.data?.message || "Không thể tạo giảng viên", "error");
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTeacher(prev => ({ ...prev, [name]: value }));
    };

    const filteredTeachers = teachers.filter(teacher =>
        (teacher.username && teacher.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (teacher.email && teacher.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (isLoading && teachers.length === 0) {
        return (
            <div className="admin-loading-spinner">
                <div className="admin-spinner"></div>
                <p>Đang tải dữ liệu giảng viên...</p>
            </div>
        );
    }

    return (
        <div className="management-page-container">
            {showCreateModal && (
                <div className="management-modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="management-modal-content" onClick={e => e.stopPropagation()}>
                        <h3 className="card-title mb-6">Tạo giảng viên mới</h3>
                        <div className="flex flex-col gap-4">
                            <input type="text" placeholder="Tên đăng nhập" name="username" value={newTeacher.username} onChange={handleInputChange} className="form-input" />
                            <input type="email" placeholder="Email" name="email" value={newTeacher.email} onChange={handleInputChange} className="form-input" />
                            <input type="password" placeholder="Mật khẩu" name="password" value={newTeacher.password} onChange={handleInputChange} className="form-input" />
                            <textarea placeholder="Mô tả ngắn..." name="description" value={newTeacher.description} onChange={handleInputChange} className="form-input" rows="3"></textarea>
                            <div className="flex justify-end gap-4 mt-6">
                                <button onClick={() => setShowCreateModal(false)} className="secondary-button">Hủy</button>
                                <button onClick={handleCreateTeacher} className="primary-button">Tạo</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="management-card">
                <div className="management-card-header flex justify-between items-center">
                    <div>
                        <h2 className="card-title">Quản lý giảng viên</h2>
                        <p className="card-description">Tổng số: {filteredTeachers.length} giảng viên</p>
                    </div>
                    <button onClick={() => setShowCreateModal(true)} className="primary-button flex items-center gap-2">
                        <UserPlus size={18} />
                        Thêm giảng viên
                    </button>
                </div>

                <div className="flex flex-wrap gap-4 items-center my-6">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên, email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="form-input flex-grow"
                    />
                </div>

                <div className="management-card-content">
                    <table className="management-table">
                        <thead>
                            <tr>
                                <th>Giảng viên</th>
                                <th>Mô tả</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTeachers.map((teacher) => (
                                <tr key={teacher.accountID}>
                                    <td>
                                        <div className="font-bold">{teacher.username}</div>
                                        <div className="text-sm text-gray-500">{teacher.email}</div>
                                    </td>
                                    <td>{teacher.description}</td>
                                    <td>
                                        <span className={`status-badge ${teacher.isActive ? 'active' : 'inactive'}`}>
                                            {teacher.isActive ? 'Hoạt động' : 'Khóa'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button className="action-button" onClick={() => handleToggleTeacher(teacher.accountID, teacher.isActive)}>
                                                {teacher.isActive ? <PowerOff size={16} /> : <Power size={16} />}
                                            </button>
                                            <button className="action-button delete-button">
                                                <Trash size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default TeacherManagement;