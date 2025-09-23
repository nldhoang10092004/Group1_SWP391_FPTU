import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form, Modal } from "react-bootstrap";
import { FaCog, FaLock, FaCamera, FaTrash, FaUpload } from "react-icons/fa";
import { getUser, updateUser, changePassword } from "../../api/userAPI";
import "./Profile.scss";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showAvatarModal, setShowAvatarModal] = useState(false);
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
      reader.onload = (event) => {
        setSelectedImage(event.target.result);
        setShowAvatarModal(false);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleRemoveAvatar = () => {
    setSelectedImage(null);
    setUser({...user, avatar: "/default-avatar.png"});
    setShowAvatarModal(false);
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

  return (
    <div className="profile-page">
      <Container className="profile-container py-4">
        <Row>
          {/* Cột trái */}
          <Col md={4}>
            <Card className="profile-card mb-4">
              <Card.Body className="text-center">
                <div className="avatar-section mb-3">
                  <div 
                    className="avatar-wrapper"
                    onClick={() => setShowAvatarModal(true)}
                  >
                    <img
                      src={selectedImage || user.avatar}
                      alt="Avatar"
                      className="profile-avatar"
                    />
                    <div className="avatar-overlay">
                      <FaCamera />
                    </div>
                  </div>
                </div>

                <h4 className="profile-name">{user.name}</h4>
                <p className="profile-email text-muted">{user.email}</p>
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
                      value={user.name}
                      onChange={(e) => setUser({ ...user, name: e.target.value })}
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
                    <Form.Label><strong>Địa chỉ</strong></Form.Label>
                    <Form.Control
                      type="text"
                      value={user.address || ""}
                      onChange={(e) => setUser({ ...user, address: e.target.value })}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label><strong>Ngày sinh</strong></Form.Label>
                    <Form.Control
                      type="date"
                      value={user.birthday || ""}
                      onChange={(e) => setUser({ ...user, birthday: e.target.value })}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label><strong>Số điện thoại</strong></Form.Label>
                    <Form.Control
                      type="text"
                      value={user.phone || ""}
                      onChange={(e) => setUser({ ...user, phone: e.target.value })}
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
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Mật khẩu mới</Form.Label>
                    <Form.Control
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Xác nhận mật khẩu mới</Form.Label>
                    <Form.Control
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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

      {/* Avatar Modal */}
      <Modal show={showAvatarModal} onHide={() => setShowAvatarModal(false)} centered className="avatar-modal">
        <Modal.Header closeButton>
          <Modal.Title>Thay đổi ảnh đại diện</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <div className="current-avatar mb-4">
            <img
              src={selectedImage || user.avatar}
              alt="Current Avatar"
              className="modal-avatar"
            />
          </div>
          
          <p className="text-muted mb-4">
            Chọn một ảnh mới để cập nhật ảnh đại diện của bạn. Ảnh sẽ được tự động cắt và lưu như hình.
          </p>

          <div className="avatar-options">
            <div className="option-item">
              <label htmlFor="avatar-upload" className="upload-option">
                <FaUpload className="option-icon" />
                <span>Chọn ảnh từ thiết bị</span>
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
            </div>

            <div className="option-item">
              <button 
                className="remove-option"
                onClick={handleRemoveAvatar}
              >
                <FaTrash className="option-icon" />
                <span>Xóa avatar hiện tại</span>
              </button>
            </div>
          </div>

          <div className="upload-info mt-4">
            <small className="text-muted">
              • Định dạng hỗ trợ: JPG, PNG, GIF<br/>
              • Kích thước tối đa: 5MB<br/>
              • Khuyến nghị: Ảnh vuông, tỷ lệ thích 200x200 pixel
            </small>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAvatarModal(false)}>
            Hủy
          </Button>
          <Button variant="dark" className="btn-black">
            Cập nhật
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Profile;