import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import { FaCog, FaLock } from "react-icons/fa";
import { getUser, updateUser, changePassword } from "../../api/userAPI";
import "./Profile.scss";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
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

  return (
    <div className="profile-page">
      <Container className="profile-container py-4">
        <Row>
          {/* Cột trái */}
          <Col md={4}>
            <Card className="profile-card mb-4">
              <Card.Body className="text-center">
                <div className="avatar-section mb-3">
                  <div className="avatar-wrapper">
                    <img
                      src={selectedImage || user.avatar}
                      alt="Avatar"
                      className="profile-avatar"
                    />
                    <label htmlFor="avatar-upload" className="avatar-overlay">
                      <span>Thay đổi</span>
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                    />
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
    </div>
  );
};

export default Profile;