import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form, Modal, Alert } from "react-bootstrap";
import { FaCog, FaLock, FaCamera, FaTrash, FaUpload, FaArrowLeft } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { getUser, updateUser, updateAvatar, changePassword } from "../../middleware/userAPI";
import { Container, Row, Col, Card, Button, Form, Modal, Alert } from "react-bootstrap";
import { FaCog, FaLock, FaCamera, FaTrash, FaUpload, FaArrowLeft } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { getUser, updateUser, updateAvatar, changePassword } from "../../middleware/userAPI";
import "./Profile.scss";

const Profile = () => {
  const navigate = useNavigate();
  
  const [user, setUser] = useState({
    fullName: "",
    email: "",
    bio: "",
    address: "",
    dob: "",
    gender: "",
    phone: "",
  });
  
  const [avatarUrl, setAvatarUrl] = useState("/default-avatar.png"); 
  const [selectedFile, setSelectedFile] = useState(null); 
  const [previewImage, setPreviewImage] = useState(null); 
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const userId = 123;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getUser(userId);
        setUser(userData);
      } catch (error) {
        console.error("Không thể tải dữ liệu người dùng");
      }
    };
    fetchData();
  }, []);

  useEffect(() => { 
    // Khi có backend thật: fetch("/api/user").then(res => res.json()).then(data => setUser(data)); 
    setUser({ 
      name: "Demo Student", 
      email: "students@gmail.com", 
      avatar: "/default-avatar.png", 
      bio: "", 
      address: "Hà Nội", 
      birthday: "2000-01-01", 
      phone: "0987654321" 
    }); 
  }, []);

  if (!user) return <p className="text-center mt-5">Đang tải dữ liệu...</p>;

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => setSelectedImage(event.target.result);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const updatedUser = { ...user, avatar: selectedImage || user.avatar };
      await updateUser(userId, updatedUser);
      alert("Cập nhật thông tin thành công!");
    } catch (error) {
      alert("Lỗi khi cập nhật thông tin!");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      await changePassword(userId, currentPassword, newPassword);
      alert("Đổi mật khẩu thành công!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      alert("Lỗi khi đổi mật khẩu!");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="profile-page">
        <Container>
          <div className="loading-container">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p>Đang tải dữ liệu...</p>
          </div>
        </Container>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="profile-page">
        <Container>
          <div className="error-container">
            <Alert variant="danger">
              <Alert.Heading>Có lỗi xảy ra</Alert.Heading>
              <p>{error}</p>
              <hr />
              <div className="d-flex justify-content-center gap-2">
                <Button variant="outline-danger" onClick={() => window.location.reload()}>
                  Thử lại
                </Button>
                <Button variant="outline-secondary" onClick={() => navigate("/home")}>
                  Về trang chủ
                </Button>
              </div>
            </Alert>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Toast Notification */}
      {toast.show && (
        <div className="toast-notification">
          <div className={`toast ${toast.type}`}>
            <div className="toast-header">
              <strong className="toast-title me-auto">
                {toast.type === "success" ? "✅ Thành công" : 
                 toast.type === "error" ? "❌ Lỗi" : 
                 toast.type === "warning" ? "⚠️ Cảnh báo" : "ℹ️ Thông báo"}
              </strong>
              <button 
                className="btn-close"
                onClick={() => setToast({ show: false, message: "", type: "" })}
              >
                ×
              </button>
            </div>
            <div className="toast-body">
              {toast.message}
            </div>
          </div>
        </div>
      )}

      <Container className="profile-container py-4">
        <Row>
          <Col md={4}>
            <Card className="profile-card mb-4">
              <Card.Body className="text-center">
                <div className="avatar-section mb-3">
                  <div className="avatar-wrapper">
                    <img
                      src={previewImage || avatarUrl}
                      alt="Avatar"
                      className="profile-avatar"
                      onError={(e) => {
                        e.target.src = "/default-avatar.png";
                      }}
                    />
                    <div className="avatar-overlay">
                      <FaCamera />
                    </div>
                  </div>
                </div>

                <h4 className="profile-name">{user.fullName || "Chưa cập nhật"}</h4>
                <p className="profile-email text-muted">{user.email || "Chưa có email"}</p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={8}>
            <Card className="settings-card">
              <Card.Body>
                <h4 className="mb-4 d-flex align-items-center">
                  <FaCog className="me-2" /> Cài đặt tài khoản
                </h4>

                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label><strong>Họ và tên</strong></Form.Label>
                    <Form.Control
                      type="text"
                      value={user.fullName || ""}
                      onChange={(e) => setUser({ ...user, fullName: e.target.value })}
                      placeholder="Nhập họ và tên"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label><strong>Email</strong></Form.Label>
                    <Form.Control
                      type="text"
                      value={user.email}
                      onChange={(e) => setUser({ ...user, email: e.target.value })}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label><strong>Giới tính</strong></Form.Label>
                    <Form.Select
                      value={user.gender || ""}
                      onChange={(e) => setUser({ ...user, gender: e.target.value })}
                    >
                      <option value="">-- Chọn giới tính --</option>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label><strong>Ngày sinh</strong></Form.Label>
                    <Form.Control
                      type="date"
                      value={user.dob || ""}
                      onChange={(e) => setUser({ ...user, dob: e.target.value })}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label><strong>Số điện thoại</strong></Form.Label>
                    <Form.Control
                      type="text"
                      value={user.phone || ""}
                      onChange={(e) => setUser({ ...user, phone: e.target.value })}
                      placeholder="Nhập số điện thoại"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label><strong>Địa chỉ</strong></Form.Label>
                    <Form.Control
                      type="text"
                      value={user.address || ""}
                      onChange={(e) => setUser({ ...user, address: e.target.value })}
                      placeholder="Nhập địa chỉ"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label><strong>Giới thiệu bản thân</strong></Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={user.bio || ""}
                      onChange={(e) => setUser({ ...user, bio: e.target.value })}
                      placeholder="Viết vài dòng về bản thân..."
                    />
                  </Form.Group>

                  <Button variant="dark" className="btn-black" onClick={handleSaveProfile}>
                    Lưu thay đổi
                  </Button>
                </Form>

                <hr className="my-4" />

                <h5 className="mb-3 d-flex align-items-center">
                  <FaLock className="me-2" /> Đổi mật khẩu
                </h5>
                <Form onSubmit={handlePasswordChange}>
                  <Form.Group className="mb-3">
                    <Form.Label>Mật khẩu hiện tại</Form.Label>
                    <Form.Control
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Nhập mật khẩu hiện tại"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Mật khẩu mới</Form.Label>
                    <Form.Control
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Xác nhận mật khẩu mới</Form.Label>
                    <Form.Control
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
                    />
                  </Form.Group>

                  <Button variant="dark" className="btn-black" type="submit">
                    Đổi mật khẩu
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal show={showAvatarModal} onHide={() => setShowAvatarModal(false)} centered className="avatar-modal">
        <Modal.Header closeButton>
          <Modal.Title>Thay đổi ảnh đại diện</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <div className="current-avatar mb-4">
            <img
              src={previewImage || avatarUrl}
              alt="Current Avatar"
              className="modal-avatar"
              onError={(e) => {
                e.target.src = "/default-avatar.png";
              }}
            />
          </div>

          <p className="text-muted mb-4">
            Chọn ảnh mới để cập nhật. Ảnh sẽ được tự động cắt và lưu.
          </p>

          <div className="avatar-options">
            <div className="option-item">
              <label htmlFor="avatar-upload" className="upload-option">
                <FaUpload className="option-icon" /> <span>Chọn ảnh từ thiết bị</span>
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </div>

            {(selectedFile || previewImage) && (
              <div className="option-item">
                <button className="remove-option" onClick={handleRemoveAvatar}>
                  <FaTrash className="option-icon" /> <span>Xóa ảnh đã chọn</span>
                </button>
              </div>
            )}
          </div>

          <div className="upload-info mt-4">
            <small className="text-muted">
              • Định dạng: JPG, PNG, GIF<br />
              • Kích thước tối đa: 5MB<br />
              • Khuyến nghị: Ảnh vuông 200x200px
            </small>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowAvatarModal(false);
              handleRemoveAvatar();
            }}
          >
            Hủy
          </Button>
          <Button 
            variant="dark" 
            className="btn-black" 
            onClick={handleUpdateAvatar} 
            disabled={!selectedFile}
          >
            Cập nhật
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Profile;
