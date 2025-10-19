import React, { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Modal, Button, Form, Dropdown } from "react-bootstrap";
// Xóa bỏ các import Material-UI Search
import { useNavigate } from "react-router-dom";
import { loginApi, registerApi } from "../../middleware/auth";
import { sendOtpApi } from "../../middleware/auth";
import "./Header.scss"; // Đảm bảo đường dẫn đúng

const Header = () => {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const [loginErrorMessage, setLoginErrorMessage] = useState("");

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [accountType, setAccountType] = useState("student"); // Giữ nguyên nếu có ý định dùng sau này
  const [registerMessage, setRegisterMessage] = useState("");
  const [registerErrorMessage, setRegisterErrorMessage] = useState("");
  const [otpMessage, setOtpMessage] = useState("");
  const [otpError, setOtpError] = useState("");
  const [registerOtp, setRegisterOtp] = useState("");
  const [isOtpValid, setIsOtpValid] = useState(false); // Giữ nguyên
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      if (!savedUser || savedUser === "undefined" || savedUser === "null")
        return null;
      return JSON.parse(savedUser);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const openAuthModal = (e) => {
      const tab = e.detail?.tab || "login";
      setActiveTab(tab);
      setShowAuthModal(true);
    };

    window.addEventListener("openAuthModal", openAuthModal);
    return () => {
      window.removeEventListener("openAuthModal", openAuthModal);
    };
  }, []);

  const resetLoginForm = () => {
    setEmail("");
    setPassword("");
    setLoginMessage("");
    setLoginErrorMessage("");
  };

  const resetRegisterForm = () => {
    setRegisterName("");
    setRegisterEmail("");
    setRegisterPassword("");
    setRegisterConfirmPassword("");
    setRegisterMessage("");
    setRegisterErrorMessage("");
    setAccountType("student");
    setOtpMessage("");
    setOtpError("");
    setRegisterOtp("");
  };

  const handleAuthClick = () => setShowAuthModal(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken"); 
    setUser(null);
    navigate("/"); 
    window.location.reload(); 
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginApi(email, password);
      console.log("Login API response:", response.data);

      const { accountID, accessToken, expiresIn } = response.data;

      if (!accessToken) {
        throw new Error("AccessToken missing in response");
      }

      const loggedUser = { accountID, accessToken, expiresIn, email: email }; 
      localStorage.setItem("user", JSON.stringify(loggedUser));
      localStorage.setItem("accessToken", accessToken);

      setUser(loggedUser);
      setLoginMessage("Đăng nhập thành công!");

      setTimeout(() => {
        resetLoginForm();
        setShowAuthModal(false);
        navigate("/home"); // Chuyển hướng sau khi đăng nhập
      }, 1500);
    } catch (error) {
      console.error("Login error:", error);
      setLoginErrorMessage(
        error.response?.data?.message || error.message || "Đăng nhập thất bại"
      );
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (!registerOtp) {
      setRegisterErrorMessage("Vui lòng nhập OTP");
      return;
    }

    try {
      const response = await registerApi({
        email: registerEmail,
        username: registerName,
        password: registerPassword,
        confirmPassword: registerConfirmPassword,
        otp: registerOtp,
      });

      const { accountID, accessToken, expiresIn } = response.data;

      const registeredUser = {
        accountID,
        accessToken,
        expiresIn
      }; // Thêm email
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(registeredUser));

      setUser(registeredUser);
      setRegisterMessage("Đăng ký thành công!");

      setTimeout(() => {
        resetRegisterForm();
        setShowAuthModal(false);
        navigate("/home"); // Chuyển hướng sau khi đăng ký
      }, 1500);
    } catch (error) {
      setRegisterErrorMessage(
        error.response?.data?.message || "Đăng ký thất bại"
      );
    }
  };

  const handleSendOtp = async () => {
    if (!registerEmail) {
      setOtpError("Vui lòng nhập email trước khi gửi OTP");
      return;
    }
    try {
      setOtpError(""); // Clear previous errors
      setOtpMessage("Đang gửi OTP...");
      const res = await sendOtpApi(registerEmail);
      setOtpMessage("OTP đã được gửi đến email của bạn!");
      console.log("OTP:", res.data.otp); // debug OTP
    } catch (error) {
      setOtpError(error.response?.data?.message || "Gửi OTP thất bại");
      setOtpMessage("");
    }
  };

  const handleDemoStudent = () => {
    setEmail("students@gmail.com");
    setPassword("1234567890");
  };

  const handleDemoTeacher = () => {
    setEmail("teacher@emt.com");
    setPassword("password123");
  };

  return (
    <>
      <Navbar expand="lg" className="main-header">
        <Container>
          <Navbar.Brand href="/" className="logo">
            <span className="logo-icon">📖</span> EnglishMaster
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            {/* Custom Search Bar */}
            <div className="search-bar ms-auto me-auto">
              <input
                type="text"
                placeholder="Tìm kiếm bài học, giảng viên, lớp học..."
              />
            </div>

            <Nav className="header-actions">
              <span className="notification-icon">🔔</span>
              {!user ? (
                <div>
                <Button
                  className="login-btn"
                  onClick={() => {
                    handleAuthClick();
                    setActiveTab("login");
                    resetRegisterForm(); 
                  }}
                >
                  Đăng nhập
                </Button>
                <Button
                  className="login-btn"
                  onClick={() => {
                    handleAuthClick();
                    setActiveTab("register");
                    resetRegisterForm(); 
                  }}
                >
                  Đăng kí
                </Button>
              </div>
              ) : (
                // User dropdown
                <Dropdown align="end">
                  <Dropdown.Toggle
                    variant="link" // Use link variant for custom styling
                    id="dropdown-user"
                    className="user-dropdown-toggle d-flex align-items-center"
                  >
                    <img
                      src={user.avatar || "/default-avatar.png"} // Sử dụng ảnh avatar nếu có
                      alt="avatar"
                      className="user-avatar"
                    />
                    <span className="user-name">
                      {user.name || user.email || "Người dùng"}
                    </span>
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => navigate("/profile")}>
                      Xem Hồ sơ
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => navigate("/settings")}>
                      Cài đặt
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item className="text-danger" onClick={handleLogout}>
                      Đăng xuất
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Auth Modal */}
      <Modal
        show={showAuthModal}
        onHide={() => setShowAuthModal(false)}
        centered
        className="auth-modal"
        size="md"
      >
        <Modal.Header closeButton className="px-3 py-2">
          <Modal.Title className="fs-6">English Master Hub</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-3">
          <p className="text-center mb-3 small">
            Đăng nhập hoặc tạo tài khoản để bắt đầu hành trình học tiếng Anh
          </p>

          <div className="auth-tabs-nav mb-3">
            <button
              className={`tab-nav-btn ${
                activeTab === "login" ? "active" : ""
              }`}
              onClick={() => {
                setActiveTab("login");
                resetRegisterForm(); // Reset register form when switching to login
              }}
            >
              Đăng nhập
            </button>
            <button
              className={`tab-nav-btn ${
                activeTab === "register" ? "active" : ""
              }`}
              onClick={() => {
                setActiveTab("register");
                resetLoginForm(); // Reset login form when switching to register
              }}
            >
              Đăng ký
            </button>
          </div>

          <div className="auth-tab-content">
            {activeTab === "login" ? (
              // LOGIN FORM
              <Form onSubmit={handleLoginSubmit}>
                <Form.Group className="mb-2">
                  <Form.Label className="small mb-1">Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    size="sm"
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label className="small mb-1">Mật khẩu</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    size="sm"
                  />
                </Form.Group>

                <div className="mb-2 text-end">
                  <a href="/forgotpassword" className="text-muted small">
                    Quên mật khẩu?
                  </a>
                </div>

                <div className="demo-accounts mb-3 py-2">
                  <p className="text-center mb-1 small">Tài khoản demo:</p>
                  <div className="d-flex justify-content-center gap-2">
                    <Button
                      variant="outline-dark"
                      size="sm"
                      onClick={handleDemoStudent}
                    >
                      Học viên
                    </Button>
                    <Button
                      variant="outline-dark"
                      size="sm"
                      onClick={handleDemoTeacher}
                    >
                      Giảng viên
                    </Button>
                  </div>
                </div>

                <Button variant="dark" type="submit" className="w-100 mb-2 py-1">
                  Đăng nhập
                </Button>

                <div className="text-center mb-2">
                  <Button
                    variant="outline-danger"
                    className="w-100 py-1"
                    size="sm"
                  >
                    Đăng nhập bằng Google
                  </Button>
                </div>

                {loginMessage && (
                  <div className="alert alert-success py-1 small mb-2">
                    {loginMessage}
                  </div>
                )}
                {loginErrorMessage && (
                  <div className="alert alert-danger py-1 small mb-2">
                    {loginErrorMessage}
                  </div>
                )}
              </Form>
            ) : (
              // REGISTER FORM
              <Form onSubmit={handleRegisterSubmit}>
                <Form.Group className="mb-2">
                  <Form.Label className="small mb-1">Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                    size="sm"
                  />
                </Form.Group>

                <Form.Group className="mb-2 d-flex align-items-center gap-2">
                  <div className="flex-grow-1">
                    <Form.Label className="small mb-1">Mã Xác Nhận</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Nhập mã xác nhận"
                      value={registerOtp}
                      onChange={(e) => setRegisterOtp(e.target.value)}
                      required
                      size="sm"
                    />
                  </div>
                  <div style={{ marginTop: "22px" }}>
                    <Button
                      variant="outline-dark"
                      size="sm"
                      type="button"
                      className="px-2 py-1"
                      onClick={handleSendOtp}
                    >
                      Gửi mã xác nhận
                    </Button>
                  </div>
                </Form.Group>
                {otpMessage && <div className="text-success small mb-2">{otpMessage}</div>}
                {otpError && <div className="text-danger small mb-2">{otpError}</div>}

                <Form.Group className="mb-2">
                  <Form.Label className="small mb-1">Username</Form.Label>
                  <Form.Control
                    type="text"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    required
                    size="sm"
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label className="small mb-1">Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                    size="sm"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="small mb-1">
                    Xác nhận mật khẩu
                  </Form.Label>
                  <Form.Control
                    type="password"
                    value={registerConfirmPassword}
                    onChange={(e) =>
                      setRegisterConfirmPassword(e.target.value)
                    }
                    required
                    size="sm"
                  />
                </Form.Group>

                <Button variant="dark" type="submit" className="w-100 mb-2 py-1">
                  Đăng ký
                </Button>

                {registerMessage && (
                  <div className="alert alert-success py-1 small mb-2">
                    {registerMessage}
                  </div>
                )}
                {registerErrorMessage && (
                  <div className="alert alert-danger py-1 small mb-2">
                    {registerErrorMessage}
                  </div>
                )}
              </Form>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Header;
