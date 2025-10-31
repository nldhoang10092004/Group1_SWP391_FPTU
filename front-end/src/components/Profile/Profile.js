import React, { useState, useEffect } from "react";
import {
  Container,Row,Col,Card,Button,Form,Modal,Alert,} from "react-bootstrap";
import {FaCog,FaLock,FaCamera,FaTrash,FaUpload,FaArrowLeft,} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import {getUser,updateUser,updateAvatar,changePassword,} from "../../middleware/userAPI";
import "./Profile.scss";

const Profile = () => {
  const navigate = useNavigate();

  // ---------- STATE DECLARATIONS ----------
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
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const token = localStorage.getItem("accessToken");
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const backPath = "/home";

  // ---------- TOAST FUNCTION ----------
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 5000);
  };

  // ---------- FETCH USER DATA ----------
  useEffect(() => {
    if (!token) {
      setError("Vui lòng đăng nhập để xem trang này");
      setLoading(false);
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    let isMounted = true;
    let avatarObjectUrl = null;

    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getUser(token);

        if (isMounted) {
          const userEmail =
            data.email ||
            storedUser?.email ||
            storedUser?.username ||
            "";

          setUser({
            fullName:
              data.fullName ||
              storedUser?.fullName ||
              storedUser?.username ||
              "",
            email: userEmail,
            bio: data.bio || "",
            address: data.address || "",
            dob: data.dob ? data.dob.split("T")[0] : "",
            gender: data.gender || "",
            phone: data.phone || "",
          });
        }

        // Load avatar
        try {
          const res = await fetch(
            `${process.env.REACT_APP_API_URL || "https://localhost:7010"}/api/user/profile/avatar`,
            {
              headers: { Authorization: `Bearer ${token}` },
              mode: "cors",
            }
          );

          if (res.ok) {
            const blob = await res.blob();
            avatarObjectUrl = URL.createObjectURL(blob);
            if (isMounted) setAvatarUrl(avatarObjectUrl);
          }
        } catch (avatarErr) {
          console.warn("⚠️ Lỗi avatar:", avatarErr.message);
        }

        showToast("Tải dữ liệu thành công!", "success");
      } catch (err) {
        console.error("❌ Lỗi khi tải user:", err);

        if (err.response?.status === 401 || err.message === "Token hết hạn") {
          setError("Phiên đăng nhập đã hết hạn. Đang chuyển về trang đăng nhập...");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          setTimeout(() => navigate("/login"), 2000);
        } else if (err.code === "ERR_NETWORK") {
          setError(
            "Không thể kết nối tới server. Vui lòng kiểm tra kết nối mạng hoặc đảm bảo backend đang chạy."
          );
        } else if (err.response?.status === 404) {
          setError("Không tìm thấy thông tin người dùng.");
        } else {
          setError(
            `Không thể tải dữ liệu: ${
              err.response?.data?.message || err.message || "Lỗi không xác định"
            }`
          );
        }

        showToast("Không thể tải dữ liệu người dùng", "error");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
      if (avatarObjectUrl) URL.revokeObjectURL(avatarObjectUrl);
    };
  }, [token, navigate]);

  // ---------- FILE HANDLERS ----------
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast("File quá lớn! Vui lòng chọn ảnh dưới 5MB.", "warning");
        return;
      }

      setSelectedFile(file);
      if (previewImage) URL.revokeObjectURL(previewImage);
      setPreviewImage(URL.createObjectURL(file));
      showToast("Đã chọn ảnh mới", "success");
    }
  };

  const handleRemoveAvatar = () => {
    if (previewImage) URL.revokeObjectURL(previewImage);
    setSelectedFile(null);
    setPreviewImage(null);
    showToast("Đã xóa ảnh đã chọn", "info");
  };

  const handleUpdateAvatar = async () => {
    if (!selectedFile) {
      showToast("Vui lòng chọn ảnh!", "warning");
      return;
    }

    try {
      showToast("Đang upload avatar...", "info");

      const response = await updateAvatar(selectedFile, token);

      if (response && response.avatarUrl) {
        const newAvatarUrl = response.avatarUrl;

        localStorage.setItem("avatarUrl", newAvatarUrl);

        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        userData.avatarUrl = newAvatarUrl;
        localStorage.setItem("user", JSON.stringify(userData));

        window.dispatchEvent(new Event("avatarUpdated"));

        setAvatarUrl(newAvatarUrl);
        setSelectedFile(null);
        setPreviewImage(null);
        setShowAvatarModal(false);

        showToast("Cập nhật avatar thành công!", "success");
      } else {
        showToast("API không trả về avatarUrl, vui lòng kiểm tra server.", "error");
      }
    } catch (err) {
      console.error("❌ Lỗi update avatar:", err);
      showToast("Lỗi khi cập nhật avatar!", "error");
    }
  };

  // ---------- PROFILE SAVE ----------
  const handleSaveProfile = async () => {
    try {
      showToast("Đang lưu thông tin profile...", "info");

      const updatedUser = {
        fullName: user.fullName,
        phone: user.phone,
        bio: user.bio,
        dob: user.dob,
        gender: user.gender,
        address: user.address,
      };

      await updateUser(updatedUser, token);
      showToast("Cập nhật thông tin thành công!", "success");
    } catch (err) {
      console.error("❌ Lỗi update profile:", err);
      const errorMsg =
        err.response?.data?.message || err.message || "Lỗi không xác định";
      showToast(`Lỗi khi cập nhật thông tin: ${errorMsg}`, "error");
    }
  };

  // ---------- PASSWORD CHANGE ----------
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast("Vui lòng điền đầy đủ thông tin!", "warning");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("Mật khẩu xác nhận không khớp!", "warning");
      return;
    }

    if (newPassword.length < 6) {
      showToast("Mật khẩu mới phải có ít nhất 6 ký tự!", "warning");
      return;
    }

    try {
      showToast("Đang đổi mật khẩu...", "info");

      await changePassword(currentPassword, newPassword, confirmPassword, token);
      showToast("Đổi mật khẩu thành công!", "success");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("❌ Lỗi đổi mật khẩu:", err);
      const errorMsg = err.response?.data?.message || "Mật khẩu hiện tại không đúng";
      showToast(`Lỗi khi đổi mật khẩu: ${errorMsg}`, "error");
    }
  };

  // ---------- LOADING / ERROR UI ----------
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
                <Button
                  variant="outline-danger"
                  onClick={() => window.location.reload()}
                >
                  Thử lại
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={() => navigate("/home")}
                >
                  Về trang chủ
                </Button>
              </div>
            </Alert>
          </div>
        </Container>
      </div>
    );
  }

  // ---------- MAIN UI ----------
  return (
    <div className="profile-page">
      {/* Toast Notification */}
      {toast.show && (
        <div className="toast-notification">
          <div className={`toast ${toast.type}`}>
            <div className="toast-header">
              <strong className="toast-title me-auto">
                {toast.type === "success"
                  ? "✅ Thành công"
                  : toast.type === "error"
                  ? "❌ Lỗi"
                  : toast.type === "warning"
                  ? "⚠️ Cảnh báo"
                  : "ℹ️ Thông báo"}
              </strong>
              <button
                className="btn-close"
                onClick={() =>
                  setToast({ show: false, message: "", type: "" })
                }
              >
                ×
              </button>
            </div>
            <div className="toast-body">{toast.message}</div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <Container className="profile-container py-4">
        <div className="mb-3">
          <Link to={backPath} className="back-link">
            <FaArrowLeft className="me-2" /> Quay lại
          </Link>
        </div>

        <Row>
          <Col md={4}>
            <Card className="profile-card mb-4">
              <Card.Body className="text-center">
                <div className="avatar-section mb-3">
                  <div 
                    className="avatar-wrapper" 
                    onClick={() => setShowAvatarModal(true)}
                  >
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
                      value={user.email || ""} 
                      disabled 
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