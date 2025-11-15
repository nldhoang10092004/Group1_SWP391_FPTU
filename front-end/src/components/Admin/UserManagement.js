import { useState, useEffect } from "react";
import { Eye, Trash, UserPlus, Power, PowerOff, Search } from "lucide-react";
import {
  getAllUsers,
  searchUsers,
  lockUser,
  unlockUser,
  createUser,
  assignRole,
} from "../../middleware/admin/userManagementAPI";
import "./management-styles.scss"; // Ensure this is imported for base styles

export function UserManagement() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    username: "",
    password: "",
    role: "STUDENT",
  });

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showPopup = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await getAllUsers();
      const mapped = data.map((u) => ({
        ...u,
        accountID: u.name,
        username: u.username,
        email: u.email,
        role: u.role,
        isActive: u.status === "ACTIVE",
        joinedDate: u.joinedDate || new Date().toISOString(),
      }));
      setUsers(mapped);
    } catch (error) {
      showPopup("Không thể tải danh sách người dùng", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (userId, isActive) => {
    if (window.confirm(`Bạn có chắc muốn ${isActive ? "khóa" : "mở khóa"} tài khoản này?`)) {
      try {
        if (isActive) {
          await lockUser(userId);
        } else {
          await unlockUser(userId);
        }
        showPopup("Cập nhật trạng thái thành công!", "success");
        loadUsers();
      } catch (error) {
        showPopup(error.response?.data?.message || "Không thể cập nhật trạng thái", "error");
      }
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadUsers();
      return;
    }
    try {
      setIsLoading(true);
      const results = await searchUsers(searchQuery);
      const mapped = results.map((u) => ({
        ...u,
        accountID: u.name,
        username: u.username,
        email: u.email,
        role: u.role,
        isActive: u.status === "ACTIVE",
        joinedDate: u.joinedDate || new Date().toISOString(),
      }));
      setUsers(mapped);
    } catch (error) {
      showPopup("Không thể tìm kiếm người dùng", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.username || !newUser.password) {
      showPopup("Vui lòng điền đầy đủ thông tin.", "error");
      return;
    }
    try {
      await createUser(newUser);
      showPopup("Tạo người dùng thành công!", "success");
      setShowCreateUser(false);
      setNewUser({ email: "", username: "", password: "", role: "STUDENT" });
      loadUsers();
    } catch (error) {
      showPopup(error.message || "Lỗi khi tạo người dùng", "error");
    }
  };

  const filteredUsers = users.filter((user) => {
    const roleMatch = filterRole === "all" || (user.role && user.role.toLowerCase() === filterRole);
    const statusMatch =
      filterStatus === "all" ||
      (user.isActive && filterStatus === "active") ||
      (!user.isActive && filterStatus === "inactive");
    // Search is now handled by API, so we only filter by role and status on the client
    return roleMatch && statusMatch;
  });

  if (isLoading && users.length === 0) {
    return (
      <div className="admin-loading-spinner">
        <div className="admin-spinner"></div>
        <p>Đang tải dữ liệu người dùng...</p>
      </div>
    );
  }

  return (
    <div className="management-card">
      {showCreateUser && (
        <div className="management-modal-overlay" onClick={() => setShowCreateUser(false)}>
          <div className="management-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="card-title mb-6">Tạo người dùng mới</h3>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Tên đăng nhập"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                className="form-input"
              />
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="form-input"
              />
              <input
                type="password"
                placeholder="Mật khẩu"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="form-input"
              />
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="form-input"
              >
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
                <option value="ADMIN">Admin</option>
              </select>
              <div className="flex justify-end gap-4 mt-6">
                <button onClick={() => setShowCreateUser(false)} className="secondary-button">
                  Hủy
                </button>
                <button onClick={handleCreateUser} className="primary-button">
                  Tạo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="management-card-header flex justify-between items-center">
        <div>
          <h2 className="card-title">Quản lý người dùng</h2>
          <p className="card-description">
            Hiển thị {filteredUsers.length} trên tổng số {users.length} người dùng
          </p>
        </div>
        <button onClick={() => setShowCreateUser(true)} className="primary-button">
          <UserPlus size={18} />
          <span>Tạo mới</span>
        </button>
      </div>

      <div className="management-header" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div className="search-bar" style={{ flexGrow: 1 }}>
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, email..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="form-input"
        >
          <option value="all">Tất cả vai trò</option>
          <option value="admin">Admin</option>
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="form-input"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="inactive">Không hoạt động</option>
        </select>
      </div>

      <div className="management-table-wrapper">
        <table className="management-table">
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Ngày tham gia</th>
              <th className="text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.accountID}>
                <td>
                  <div className="font-semibold">{user.username}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td>{user.role}</td>
                <td>
                  <span className={`status-badge ${user.isActive ? "active" : "inactive"}`}>
                    {user.isActive ? "Hoạt động" : "Khóa"}
                  </span>
                </td>
                <td>{new Date(user.joinedDate).toLocaleDateString()}</td>
                <td className="management-table-actions">
                  <button
                    className="action-button"
                    title={user.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                    onClick={() => handleToggleStatus(user.accountID, user.isActive)}
                  >
                    {user.isActive ? <PowerOff size={16} /> : <Power size={16} />}
                  </button>
                  <button className="action-button delete-button" title="Xóa người dùng">
                    <Trash size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserManagement;