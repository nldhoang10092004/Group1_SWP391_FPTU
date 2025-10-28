import { useState, useEffect } from "react";
import { Row, Col, Card, Form, Toast, ToastContainer, Modal } from "react-bootstrap";
import { CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { UserX, UserCheck, Eye, Edit, Plus, Search, Filter } from "lucide-react";

import {
  getAllUsers,
  lockUser,
  unlockUser,
  createUser,
  assignRole,
  searchUsers
} from "../../middleware/userManagementAPI";

export function UserManagement() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showAssignRole, setShowAssignRole] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [roleAssignment, setRoleAssignment] = useState({
    userId: undefined,
    role: 'STUDENT'
  });

  const [newUser, setNewUser] = useState({
    email: '',
    username: '',
    password: '',
    role: 'STUDENT',
    description: '',
  });

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
      const allUsersData = await getAllUsers();
      
      const mappedUsers = allUsersData.map(user => ({
        id: user.name,
        accountID: user.name,
        fullName: user.username,
        email: user.email,
        userType: user.role.toLowerCase(),
        role: user.role,
        status: user.status,
        isActive: user.status === 'ACTIVE',
        joinedDate: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      }));

      setUsers(mappedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      showPopup("Không thể tải dữ liệu người dùng", "danger");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery && (!filterRole || filterRole === 'all') && (!filterStatus || filterStatus === 'all')) {
      await loadUsers();
      return;
    }

    try {
      setIsLoading(true);
      const roleParam = filterRole === 'all' ? null : filterRole;
      const statusParam = filterStatus === 'all' ? null : filterStatus;
      const results = await searchUsers(searchQuery, roleParam, statusParam);

      const mappedResults = results.map(user => ({
        id: user.accountID,
        accountID: user.accountID,
        fullName: user.username,
        email: user.email,
        userType: user.role.toLowerCase(),
        role: user.role,
        status: user.status,
        isActive: user.status === 'ACTIVE',
        joinedDate: user.createAt || new Date().toISOString(),
        lastLogin: user.lastLoginAt || new Date().toISOString()
      }));

      setUsers(mappedResults);
      showPopup(`Tìm thấy ${mappedResults.length} kết quả`, "success");
    } catch (error) {
      showPopup("Lỗi khi tìm kiếm", "danger");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleUser = async (accountID, isActive) => {
    try {
      if (isActive) {
        await lockUser(accountID);
        showPopup("Đã khóa tài khoản", "success");
      } else {
        await unlockUser(accountID);
        showPopup("Đã kích hoạt tài khoản", "success");
      }
      await loadUsers();
    } catch (error) {
      showPopup("Không thể thay đổi trạng thái tài khoản", "danger");
    }
  };

  const handleCreateUser = async () => {
    try {
      await createUser(newUser);
      showPopup("Tạo tài khoản thành công!", "success");
      setShowCreateUser(false);
      setNewUser({ email: '', username: '', password: '', role: 'STUDENT', description: '' });
      await loadUsers();
    } catch (err) {
      showPopup("Lỗi khi tạo tài khoản!", "danger");
    }
  };

  const handleAssignRole = async () => {
    try {
      await assignRole(roleAssignment.userId, roleAssignment.role);
      showPopup("Cập nhật role thành công!", "success");
      setShowAssignRole(false);
      await loadUsers();
    } catch (err) {
      showPopup("Lỗi khi cập nhật role!", "danger");
    }
  };

  const activeUsers = users.filter(u => u.isActive).length;
  const inactiveUsers = users.filter(u => !u.isActive).length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <CardTitle>Quản lý người dùng</CardTitle>
              <CardDescription>Tổng: {users.length} | Hoạt động: {activeUsers} | Đã khóa: {inactiveUsers}</CardDescription>
            </div>
            <div className="d-flex gap-2">
              <Button onClick={() => setShowAssignRole(true)}>
                <Edit className="me-2" size={16} />
                Gán vai trò
              </Button>
              <Button onClick={() => setShowCreateUser(true)}>
                <Plus className="me-2" size={16} />
                Tạo tài khoản
              </Button>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="mb-3">
            <Row className="g-2">
              <Col md={5}>
                <div className="position-relative">
                  <Search className="position-absolute" size={18} style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d' }} />
                  <Input
                    placeholder="Tìm theo username hoặc email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </Col>
              <Col md={2}>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="STUDENT">Học viên</SelectItem>
                    <SelectItem value="TEACHER">Giảng viên</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </Col>
              <Col md={2}>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                    <SelectItem value="LOCKED">Đã khóa</SelectItem>
                  </SelectContent>
                </Select>
              </Col>
              <Col md={3} className="d-flex gap-2">
                <Button onClick={handleSearch} className="flex-grow-1">
                  <Search size={16} className="me-2" />
                  Tìm kiếm
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterRole('all');
                    setFilterStatus('all');
                    loadUsers();
                  }}
                >
                  <Filter size={16} />
                </Button>
              </Col>
            </Row>
          </div>
        </CardHeader>
        
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Tên người dùng</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="text-muted">#{user.accountID}</TableCell>
                  <TableCell className="fw-bold">{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge className={
                      user.role === 'ADMIN' ? 'bg-danger' :
                        user.role === 'TEACHER' ? 'bg-primary' : 'bg-secondary'
                    }>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={user.isActive ? 'bg-success' : 'bg-danger'}>
                      {user.isActive ? 'Hoạt động' : 'Đã khóa'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="d-flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleUser(user.accountID, user.isActive)}
                        title={user.isActive ? "Khóa tài khoản" : "Kích hoạt"}
                      >
                        {user.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setRoleAssignment({ userId: user.accountID, role: user.role });
                          setShowAssignRole(true);
                        }}
                        title="Gán vai trò"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button variant="outline" size="sm" title="Xem chi tiết">
                        <Eye size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Toast Notification */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
        <Toast
          bg={toast.type}
          show={toast.show}
          onClose={() => setToast((prev) => ({ ...prev, show: false }))}
          delay={3000}
          autohide
        >
          <Toast.Header>
            <strong className="me-auto">Thông báo</strong>
          </Toast.Header>
          <Toast.Body className="text-white">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Modal Gán vai trò */}
      <Modal show={showAssignRole} onHide={() => setShowAssignRole(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Gán vai trò cho người dùng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label className="form-label">Chọn người dùng</label>
            <Form.Select
              value={roleAssignment.userId}
              onChange={(e) =>
                setRoleAssignment((prev) => ({
                  ...prev,
                  userId: parseInt(e.target.value),
                }))
              }
            >
              <option value="">-- Chọn người dùng --</option>
              {users.map((user) => (
                <option key={user.accountID} value={user.accountID}>
                  {user.fullName} ({user.email})
                </option>
              ))}
            </Form.Select>
          </div>

          <div className="mb-3">
            <label className="form-label">Vai trò mới</label>
            <Form.Select
              value={roleAssignment.role}
              onChange={(e) =>
                setRoleAssignment((prev) => ({ ...prev, role: e.target.value }))
              }
            >
              <option value="STUDENT">Học viên</option>
              <option value="TEACHER">Giảng viên</option>
              <option value="ADMIN">Admin</option>
            </Form.Select>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAssignRole(false)}>
            Hủy
          </Button>
          <Button onClick={handleAssignRole}>Cập nhật</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Tạo tài khoản */}
      <Modal show={showCreateUser} onHide={() => setShowCreateUser(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Tạo tài khoản mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Email *</Form.Label>
              <Form.Control
                type="email"
                placeholder="example@email.com"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Username *</Form.Label>
              <Form.Control
                placeholder="Tên đăng nhập"
                value={newUser.username}
                onChange={(e) =>
                  setNewUser((prev) => ({ ...prev, username: e.target.value }))
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mật khẩu *</Form.Label>
              <Form.Control
                type="password"
                placeholder="Mật khẩu"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser((prev) => ({ ...prev, password: e.target.value }))
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Vai trò *</Form.Label>
              <Form.Select
                value={newUser.role}
                onChange={(e) =>
                  setNewUser((prev) => ({ ...prev, role: e.target.value }))
                }
              >
                <option value="STUDENT">Học viên</option>
                <option value="TEACHER">Giảng viên</option>
                <option value="ADMIN">Admin</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Thông tin thêm về người dùng"
                value={newUser.description}
                onChange={(e) =>
                  setNewUser((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateUser(false)}>
            Hủy
          </Button>
          <Button onClick={handleCreateUser}>Tạo tài khoản</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default UserManagement;