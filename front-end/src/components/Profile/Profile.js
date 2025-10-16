import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form, Modal } from "react-bootstrap";
import { FaCog, FaLock, FaCamera, FaTrash, FaUpload, FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";
import { getUser, updateUser, updateAvatar, changePassword } from "../../middleware/userAPI";
import "./Profile.scss";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("/default-avatar.png"); // avatar chính
  const [selectedFile, setSelectedFile] = useState(null); // file mới chọn
  const [previewImage, setPreviewImage] = useState(null); // preview trước khi upload
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("accessToken");
  let backPath = "/";

  // 🟢 Lấy dữ liệu user và avatar
  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    let avatarObjectUrl = null;

    const fetchUserData = async () => {
      try {
        const data = await getUser(token);

        if (isMounted) {
          setUser({
            fullName: data.fullName || storedUser?.username || "",
            email: storedUser?.email || storedUser?.username || "",
            bio: data.bio || "",
            address: data.address || "",
            dob: data.dob || "",
            gender: data.gender || "",
            phone: data.phone || "",
          });
        }

        // Lấy avatar
        try {
          const res = await fetch(
            `${process.env.REACT_APP_API_URL || "https://localhost:7010"}/api/user/profile/avatar`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (res.ok) {
            const blob = await res.blob();
            avatarObjectUrl = URL.createObjectURL(blob);
            if (isMounted) setAvatarUrl(avatarObjectUrl);
          }
        } catch (err) {
          console.warn("Không lấy được avatar, dùng default");
        }
      } catch (err) {
        console.error("Lỗi khi tải user:", err);
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
      if (avatarObjectUrl) URL.revokeObjectURL(avatarObjectUrl);
    };
  }, [token, storedUser]);

  if (!user) return <p className="text-center mt-5">Đang tải dữ liệu...</p>;

  // 🟢 Chọn ảnh đại diện mới
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);

      if (previewImage) URL.revokeObjectURL(previewImage);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // 🟢 Xóa ảnh preview
  const handleRemoveAvatar = () => {
    if (previewImage) URL.revokeObjectURL(previewImage);
    setSelectedFile(null);
    setPreviewImage(null);
  };

  // 🟢 Cập nhật avatar lên backend
  const handleUpdateAvatar = async () => {
    if (!selectedFile) return alert("Vui lòng chọn ảnh!");
    try {
      await updateAvatar(selectedFile, token);

      if (avatarUrl && avatarUrl !== "/default-avatar.png") URL.revokeObjectURL(avatarUrl);
      const newAvatarUrl = URL.createObjectURL(selectedFile);
      setAvatarUrl(newAvatarUrl);

      setSelectedFile(null);
      setPreviewImage(null);
      setShowAvatarModal(false);
      alert("✅ Cập nhật avatar thành công!");
    } catch (err) {
      alert("❌ Lỗi khi cập nhật avatar!");
    }
  };

  // 🟢 Lưu thông tin profile
  const handleSaveProfile = async () => {
    try {
      const updatedUser = {
        fullName: user.fullName,
        phone: user.phone,
        bio: user.bio,
        dob: user.dob,
        gender: user.gender,
        address: user.address,
      };
      await updateUser(updatedUser, token);
      alert("✅ Cập nhật thông tin thành công!");
    } catch (err) {
      alert("❌ Lỗi khi cập nhật thông tin!");
    }
  };

  // 🟢 Đổi mật khẩu
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("⚠️ Mật khẩu xác nhận không khớp!");
      return;
    }
    try {
      await changePassword(currentPassword, newPassword, confirmPassword, token);
      alert("✅ Đổi mật khẩu thành công!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      alert("❌ Lỗi khi đổi mật khẩu!");
    }
  };

  return (
    <div className="profile-page">
      <Container className="profile-container py-4">
        <div className="mb-3">
          <Link to={backPath} className="back-link d-inline-flex align-items-center">
            <FaArrowLeft className="me-2" /> Quay lại
          </Link>
        </div>

        <Row>
          <Col md={4}>
            <Card className="profile-card mb-4">
              <Card.Body className="text-center">
                <div className="avatar-section mb-3">
                  <div className="avatar-wrapper" onClick={() => setShowAvatarModal(true)}>
                    <img
                      src={previewImage || avatarUrl || "/default-avatar.png"}
                      alt="Avatar"
                      className="profile-avatar"
                    />
                    <div className="avatar-overlay">
                      <FaCamera />
                    </div>
                  </div>
                </div>

                <h4 className="profile-name">{user.fullName}</h4>
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
                      value={user.fullName}
                      onChange={(e) => setUser({ ...user, fullName: e.target.value })}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label><strong>Email</strong></Form.Label>
                    <Form.Control type="text" value={user.email} disabled />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label><strong>Giới tính</strong></Form.Label>
                    <Form.Select
                      value={user.gender}
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
                      value={user.dob}
                      onChange={(e) => setUser({ ...user, dob: e.target.value })}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label><strong>Số điện thoại</strong></Form.Label>
                    <Form.Control
                      type="text"
                      value={user.phone}
                      onChange={(e) => setUser({ ...user, phone: e.target.value })}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label><strong>Địa chỉ</strong></Form.Label>
                    <Form.Control
                      type="text"
                      value={user.address}
                      onChange={(e) => setUser({ ...user, address: e.target.value })}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label><strong>Giới thiệu bản thân</strong></Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={user.bio}
                      onChange={(e) => setUser({ ...user, bio: e.target.value })}
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

      <Modal show={showAvatarModal} onHide={() => setShowAvatarModal(false)} centered className="avatar-modal">
        <Modal.Header closeButton>
          <Modal.Title>Thay đổi ảnh đại diện</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <div className="current-avatar mb-4">
            <img
              src={previewImage || avatarUrl || "/default-avatar.png"}
              alt="Current Avatar"
              className="modal-avatar"
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

            <div className="option-item">
              <button className="remove-option" onClick={handleRemoveAvatar}>
                <FaTrash className="option-icon" /> <span>Xóa avatar hiện tại</span>
              </button>
            </div>
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
          <Button variant="dark" className="btn-black" onClick={handleUpdateAvatar} disabled={!selectedFile}>
            Cập nhật
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Profile;
