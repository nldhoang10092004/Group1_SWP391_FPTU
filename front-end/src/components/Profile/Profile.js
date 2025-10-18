import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form, Modal, Alert } from "react-bootstrap";
import { FaCog, FaLock, FaCamera, FaTrash, FaUpload, FaArrowLeft } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { getUser, updateUser, updateAvatar, changePassword } from "../../middleware/userAPI";
import "./Profile.scss";

const Profile = () => {
  const navigate = useNavigate();
  
  // ✅ FIX 1: Khởi tạo state với object thay vì null
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
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  
  // ✅ FIX 2: Thêm state loading và error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("accessToken");
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  let backPath = "/home";

  // ✅ FIX 3: Cải thiện useEffect với xử lý lỗi đầy đủ
  useEffect(() => {
    // Kiểm tra token ngay từ đầu
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

        console.log("🔍 Đang tải dữ liệu user...");
        console.log("🔍 Stored User:", storedUser);
        
        const data = await getUser(token);
        console.log("✅ Dữ liệu user từ API:", data);

        if (isMounted) {
          // ✅ FIX: Lấy email từ data.email hoặc storedUser
          const userEmail = data.email || storedUser?.email || storedUser?.username || "";
          
          setUser({
            fullName: data.fullName || storedUser?.fullName || storedUser?.username || "",
            email: userEmail,
            bio: data.bio || "",
            address: data.address || "",
            dob: data.dob ? data.dob.split('T')[0] : "", // ✅ Format ngày từ API
            gender: data.gender || "",
            phone: data.phone || "",
          });
          
          console.log("✅ User state đã set:", {
            fullName: data.fullName,
            email: userEmail,
          });
        }

        // Lấy avatar
        try {
          const res = await fetch(
            `${process.env.REACT_APP_API_URL || "https://localhost:7010"}/api/user/profile/avatar`,
            { 
              headers: { Authorization: `Bearer ${token}` },
              mode: 'cors'
            }
          );
          
          if (res.ok) {
            const blob = await res.blob();
            avatarObjectUrl = URL.createObjectURL(blob);
            if (isMounted) setAvatarUrl(avatarObjectUrl);
            console.log("✅ Avatar đã tải");
          } else if (res.status === 401) {
            throw new Error("Token hết hạn");
          } else {
            console.warn("⚠️ Không lấy được avatar, dùng default");
          }
        } catch (avatarErr) {
          console.warn("⚠️ Lỗi avatar:", avatarErr.message);
          // Không throw error, chỉ dùng avatar mặc định
        }

      } catch (err) {
        console.error("❌ Lỗi khi tải user:", err);
        
        // Xử lý các loại lỗi khác nhau
        if (err.response?.status === 401 || err.message === "Token hết hạn") {
          setError("Phiên đăng nhập đã hết hạn. Đang chuyển về trang đăng nhập...");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          setTimeout(() => navigate("/login"), 2000);
        } else if (err.code === "ERR_NETWORK") {
          setError("Không thể kết nối tới server. Vui lòng kiểm tra kết nối mạng hoặc đảm bảo backend đang chạy.");
        } else if (err.response?.status === 404) {
          setError("Không tìm thấy thông tin người dùng.");
        } else {
          setError(`Không thể tải dữ liệu: ${err.response?.data?.message || err.message || "Lỗi không xác định"}`);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
      if (avatarObjectUrl) URL.revokeObjectURL(avatarObjectUrl);
    };
  }, [token, navigate]); // ✅ Bỏ storedUser khỏi dependency

  // ✅ FIX 4: Hiển thị loading state
  if (loading) {
    return (
      <Container className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Đang tải dữ liệu...</p>
      </Container>
    );
  }

  // ✅ FIX 5: Hiển thị error state
  if (error) {
    return (
      <Container className="text-center mt-5">
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
      </Container>
    );
  }

  // 🟢 Chọn ảnh đại diện mới
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // ✅ Kiểm tra kích thước file
      if (file.size > 5 * 1024 * 1024) {
        alert("⚠️ File quá lớn! Vui lòng chọn ảnh dưới 5MB.");
        return;
      }

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
    if (!selectedFile) {
      alert("Vui lòng chọn ảnh!");
      return;
    }

    try {
      console.log("📤 Đang upload avatar...");
      await updateAvatar(selectedFile, token);

      if (avatarUrl && avatarUrl !== "/default-avatar.png") {
        URL.revokeObjectURL(avatarUrl);
      }
      
      const newAvatarUrl = URL.createObjectURL(selectedFile);
      setAvatarUrl(newAvatarUrl);

      setSelectedFile(null);
      setPreviewImage(null);
      setShowAvatarModal(false);
      alert("✅ Cập nhật avatar thành công!");
      console.log("✅ Avatar đã cập nhật");
    } catch (err) {
      console.error("❌ Lỗi update avatar:", err);
      const errorMsg = err.response?.data?.message || err.message || "Lỗi không xác định";
      alert(`❌ Lỗi khi cập nhật avatar: ${errorMsg}`);
    }
  };

  // 🟢 Lưu thông tin profile
  const handleSaveProfile = async () => {
    try {
      console.log("📤 Đang lưu thông tin profile...");
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
      console.log("✅ Profile đã cập nhật");
    } catch (err) {
      console.error("❌ Lỗi update profile:", err);
      const errorMsg = err.response?.data?.message || err.message || "Lỗi không xác định";
      alert(`❌ Lỗi khi cập nhật thông tin: ${errorMsg}`);
    }
  };

  // 🟢 Đổi mật khẩu
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // ✅ Validate đầu vào
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("⚠️ Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("⚠️ Mật khẩu xác nhận không khớp!");
      return;
    }

    if (newPassword.length < 6) {
      alert("⚠️ Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }

    try {
      console.log("📤 Đang đổi mật khẩu...");
      await changePassword(currentPassword, newPassword, confirmPassword, token);
      alert("✅ Đổi mật khẩu thành công!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      console.log("✅ Mật khẩu đã đổi");
    } catch (err) {
      console.error("❌ Lỗi đổi mật khẩu:", err);
      const errorMsg = err.response?.data?.message || "Mật khẩu hiện tại không đúng";
      alert(`❌ Lỗi khi đổi mật khẩu: ${errorMsg}`);
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
                  <div 
                    className="avatar-wrapper" 
                    onClick={() => setShowAvatarModal(true)}
                    style={{ cursor: 'pointer' }}
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
                      style={{ backgroundColor: '#e9ecef' }}
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