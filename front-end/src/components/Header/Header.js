import React, { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Modal, Button, Form, Dropdown, Toast, ToastContainer } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { loginApi, registerApi, sendOtpApi } from "../../middleware/auth";
import "./Header.scss"; 
import api from "../../middleware/axiosInstance";

// 🔑 Hàm decode JWT để lấy username
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("❌ Lỗi decode JWT:", error);
    return null;
  }
};

const Header = () => {
  const navigate = useNavigate();

  // 🟢 Toast Notification States
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("danger");

  // 🟢 Modal & Auth Tabs
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  // 🟢 Login states
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const [loginErrorMessage, setLoginErrorMessage] = useState("");

  // 🟢 Register states
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [registerOtp, setRegisterOtp] = useState("");
  const [registerMessage, setRegisterMessage] = useState("");
  const [registerErrorMessage, setRegisterErrorMessage] = useState("");
  const [otpMessage, setOtpMessage] = useState("");
  const [otpError, setOtpError] = useState("");

  // 🟢 User info
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser && savedUser !== "undefined" && savedUser !== "null"
      ? JSON.parse(savedUser)
      : null;
  });

  const [avatarUrl, setAvatarUrl] = useState(
    localStorage.getItem("avatarUrl") || "/default-avatar.png"
  );
  
  const [username, setUsername] = useState(() => {
    const savedUserName = localStorage.getItem("userName");
    if (savedUserName) return savedUserName;
    
    const savedUser = localStorage.getItem("user");
    if (savedUser && savedUser !== "undefined" && savedUser !== "null") {
      const parsedUser = JSON.parse(savedUser);
      return parsedUser.username || parsedUser.email?.split("@")[0] || "";
    }
    return "";
  });

  // 🟢 Hàm hiển thị Toast
  const showToastNotification = (message, type = "danger") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // 🟢 Đồng bộ dữ liệu từ localStorage
  useEffect(() => {
    const syncUserData = () => {
      const savedAvatar = localStorage.getItem("avatarUrl");
      const savedUserName = localStorage.getItem("userName");
      const savedUser = localStorage.getItem("user");
      
      if (savedAvatar) setAvatarUrl(savedAvatar);
      
      if (savedUserName) {
        setUsername(savedUserName);
      } else if (savedUser && savedUser !== "undefined") {
        const parsedUser = JSON.parse(savedUser);
        setUsername(parsedUser.username || parsedUser.email?.split("@")[0] || "");
      }
    };

    syncUserData();
    
    window.addEventListener("storage", syncUserData);
    window.addEventListener("avatarUpdated", syncUserData);

    return () => {
      window.removeEventListener("storage", syncUserData);
      window.removeEventListener("avatarUpdated", syncUserData);
    };
  }, []);

  // 🟢 Reset form
  const resetLoginForm = () => {
    setEmailOrUsername("");
    setPassword("");
    setLoginMessage("");
    setLoginErrorMessage("");
  };

  const resetRegisterForm = () => {
    setRegisterName("");
    setRegisterEmail("");
    setRegisterPassword("");
    setRegisterConfirmPassword("");
    setRegisterOtp("");
    setRegisterMessage("");
    setRegisterErrorMessage("");
    setOtpMessage("");
    setOtpError("");
  };

  // 🟢 Đăng nhập - ✅ FIX: Decode JWT để lấy username
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    setLoginMessage("");
    setLoginErrorMessage("");
    
    try {
      console.log("🔐 Đang đăng nhập với:", { emailOrUsername, password: "***" });
      
      const response = await loginApi(emailOrUsername, password);
      
      console.log("✅ Response từ API:", response.data);
      
      const { accountID, accessToken, expiresIn, role, redirectUrl } = response.data;

      // ✅ Decode JWT để lấy username
      const decodedToken = decodeJWT(accessToken);
      console.log("🔓 Decoded JWT:", decodedToken);
      
      // Lấy username từ JWT claim
      const usernameFromToken = decodedToken?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
      const roleFromToken = decodedToken?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      
      console.log("✅ Username từ JWT:", usernameFromToken);
      console.log("✅ Role từ JWT:", roleFromToken);
      
      const loggedUser = { 
        accountID, 
        accessToken, 
        expiresIn,
        role: role || roleFromToken,
        username: usernameFromToken || emailOrUsername,
        email: emailOrUsername.includes("@") ? emailOrUsername : ""
      };
      
      localStorage.setItem("user", JSON.stringify(loggedUser));
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("userName", usernameFromToken || emailOrUsername);

      setUser(loggedUser);
      setUsername(usernameFromToken || emailOrUsername);
      setLoginMessage("Đăng nhập thành công!");
      showToastNotification("🎉 Đăng nhập thành công! Chào mừng bạn quay lại.", "success");

      setTimeout(() => {
        setShowAuthModal(false);
        resetLoginForm();
        
        const targetUrl = redirectUrl || "/home";
        navigate(targetUrl);
        window.location.href = targetUrl;
      }, 1500);

    } catch (err) {
      console.error("❌ Lỗi đăng nhập:", err);
      console.error("❌ Response data:", err.response?.data);
      console.error("❌ Status:", err.response?.status);
      
      const errorMsg = err.response?.data?.message || 
                      err.response?.data?.error ||
                      err.response?.data ||
                      err.message ||
                      "Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin.";
      
      setLoginErrorMessage(errorMsg);
      showToastNotification(`❌ ${errorMsg}`, "danger");
    }
  };

  // 🟢 Đăng ký
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (!registerOtp) {
      const msg = "Vui lòng nhập mã OTP";
      setRegisterErrorMessage(msg);
      showToastNotification(msg, "warning");
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      const msg = "Mật khẩu xác nhận không khớp!";
      setRegisterErrorMessage(msg);
      showToastNotification(msg, "warning");
      return;
    }
    
    setRegisterMessage("");
    setRegisterErrorMessage("");

    try {
      console.log("📝 Đang đăng ký với:", { 
        email: registerEmail, 
        username: registerName,
        otp: registerOtp 
      });

      const response = await registerApi({
        email: registerEmail,
        username: registerName,
        password: registerPassword,
        confirmPassword: registerConfirmPassword,
        otp: registerOtp,
      });

      console.log("✅ Đăng ký thành công:", response.data);

      const { accountID, accessToken, expiresIn } = response.data;

      // Decode JWT để lấy username từ token
      const decodedToken = decodeJWT(accessToken);
      const usernameFromToken = decodedToken?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];

      const newUser = { 
        accountID, 
        accessToken, 
        expiresIn, 
        email: registerEmail,
        username: usernameFromToken || registerName
      };
      
      localStorage.setItem("user", JSON.stringify(newUser));
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("userName", usernameFromToken || registerName);

      setUser(newUser);
      setUsername(usernameFromToken || registerName);
      setRegisterMessage("Đăng ký thành công!");
      showToastNotification("🎉 Đăng ký thành công! Chào mừng bạn đến với EnglishMaster.", "success");

      setTimeout(() => {
        setShowAuthModal(false);
        resetRegisterForm();
        navigate("/home");
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error("❌ Lỗi đăng ký:", err);
      console.error("❌ Response data:", err.response?.data);
      
      const errorMsg = err.response?.data?.message || 
                      err.response?.data?.error ||
                      err.response?.data ||
                      err.message ||
                      "Đăng ký thất bại!";
      
      setRegisterErrorMessage(errorMsg);
      showToastNotification(`❌ ${errorMsg}`, "danger");
    }
  };

  // 🟢 Gửi OTP
  const handleSendOtp = async () => {
    if (!registerEmail) {
      const msg = "Vui lòng nhập email trước khi gửi OTP!";
      setOtpError(msg);
      showToastNotification(msg, "warning");
      return;
    }

    try {
      setOtpMessage("Đang gửi OTP...");
      setOtpError("");
      
      console.log("📧 Đang gửi OTP đến:", registerEmail);
      
      await sendOtpApi(registerEmail);
      
      const successMsg = "✅ OTP đã được gửi đến email của bạn!";
      setOtpMessage(successMsg);
      showToastNotification(successMsg, "success");
    } catch (err) {
      console.error("❌ Lỗi gửi OTP:", err);
      
      const errorMsg = err.response?.data?.message || 
                      err.response?.data?.error ||
                      "Gửi OTP thất bại!";
      
      setOtpError(errorMsg);
      setOtpMessage("");
      showToastNotification(`❌ ${errorMsg}`, "danger");
    }
  };

  // 🟢 Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("avatarUrl");
    localStorage.removeItem("userName");
    setUser(null);
    setAvatarUrl("/default-avatar.png");
    setUsername("");
    showToastNotification("👋 Đã đăng xuất thành công!", "success");
    setTimeout(() => {
      navigate("/");
      window.location.reload();
    }, 1000);
  };

  return (
    <>
      {/* 🔔 Toast Notification */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
        <Toast 
          show={showToast} 
          onClose={() => setShowToast(false)} 
          delay={4000} 
          autohide
          bg={toastType}
        >
          <Toast.Header>
            <strong className="me-auto">
              {toastType === "success" ? "Thành công" : 
               toastType === "danger" ? "Lỗi" : 
               toastType === "warning" ? "Cảnh báo" : "Thông báo"}
            </strong>
          </Toast.Header>
          <Toast.Body className={toastType === "danger" || toastType === "success" ? "text-white" : ""}>
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>

      <Navbar expand="lg" className="main-header">
        <Container>
          <Navbar.Brand href="/" className="logo">
            <span className="logo-icon">📖</span> EnglishMaster
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <div className="search-bar ms-auto">
              <input type="text" placeholder="Tìm kiếm giảng viên, khóa ..." />
            </div>

            <Nav className="header-actions">
              {!user ? (
                <div className="auth-buttons"> 
                  <Button
                    className="login-btn"
                    onClick={() => {
                      setShowAuthModal(true);
                      setActiveTab("login");
                      resetLoginForm();
                    }}
                  >
                    Đăng nhập
                  </Button>
                  
                  <Button
                    className="register-btn" 
                    onClick={() => {
                      setShowAuthModal(true);
                      setActiveTab("register");
                      resetRegisterForm();
                    }}
                  >
                    Đăng ký
                  </Button>
                </div>
              ) : (
                <Dropdown align="end">
                  <Dropdown.Toggle
                    variant="link"
                    id="dropdown-user"
                    className="user-dropdown-toggle d-flex align-items-center"
                  >
                    <img
                      src={avatarUrl}
                      alt="avatar"
                      className="user-avatar"
                      onError={(e) => (e.target.src = "/default-avatar.png")}
                    />
                    <span className="user-name ms-2">
                      {username || user.username || "Người dùng"}
                    </span>
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => navigate("/profile")}>
                      Hồ sơ cá nhân
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => navigate("/profile")}>
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

      {/* 🟢 Modal đăng nhập / đăng ký */}
      <Modal
        show={showAuthModal}
        onHide={() => {
          setShowAuthModal(false);
          resetLoginForm();
          resetRegisterForm();
        }}
        centered
        className="auth-modal"
        size="md"
      >
        <Modal.Header closeButton>
          <Modal.Title>English Master Hub</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-center mb-3 small">
            Đăng nhập hoặc tạo tài khoản để bắt đầu hành trình học tiếng Anh
          </p>

          <div className="auth-tabs-nav mb-3">
            <button
              className={`tab-nav-btn ${activeTab === "login" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("login");
                resetRegisterForm();
              }}
            >
              Đăng nhập
            </button>
            <button
              className={`tab-nav-btn ${activeTab === "register" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("register");
                resetLoginForm();
              }}
            >
              Đăng ký
            </button>
          </div>

          {activeTab === "login" ? (
            <Form onSubmit={handleLoginSubmit}>
              <Form.Group className="mb-2">
                <Form.Label>Email hoặc Username</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nhập email hoặc username"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  required
                  size="sm"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Mật khẩu</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control
                    type="password"
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    size="sm"
                  />
                </div>
              </Form.Group>

              <Button type="submit" className="w-100" variant="dark">
                Đăng nhập
              </Button>

              <div className="text-center mt-2">
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={() => {
                    setShowAuthModal(false);
                    navigate("/forgotpassword");
                  }}
                >
                  Quên mật khẩu?
                </Button>
              </div>

              {loginMessage && <div className="alert alert-success mt-2 mb-0 py-2">{loginMessage}</div>}
              {loginErrorMessage && <div className="alert alert-danger mt-2 mb-0 py-2">{loginErrorMessage}</div>}
            </Form>
          ) : (
            <Form onSubmit={handleRegisterSubmit}>
              <Form.Group className="mb-2">
                <Form.Label>Email</Form.Label>
                <Form.Control 
                  type="email"
                  placeholder="Nhập email"
                  value={registerEmail} 
                  onChange={(e) => setRegisterEmail(e.target.value)} 
                  required 
                  size="sm" 
                />
              </Form.Group>
              
              <Form.Group className="mb-2">
                <Form.Label>Mã Xác Nhận (OTP)</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control
                    type="text"
                    placeholder="Nhập mã OTP"
                    value={registerOtp}
                    onChange={(e) => setRegisterOtp(e.target.value)}
                    required
                    size="sm"
                  />
                  <Button 
                    variant="outline-dark" 
                    onClick={handleSendOtp}
                    size="sm"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    Gửi OTP
                  </Button>
                </div>
                {otpMessage && <div className="text-success small mt-1">{otpMessage}</div>}
                {otpError && <div className="text-danger small mt-1">{otpError}</div>}
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Username</Form.Label>
                <Form.Control 
                  type="text"
                  placeholder="Nhập username"
                  value={registerName} 
                  onChange={(e) => setRegisterName(e.target.value)} 
                  required 
                  size="sm" 
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Mật khẩu</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control
                    type="password" 
                    placeholder="Nhập mật khẩu"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                    size="sm"
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Xác nhận mật khẩu</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control 
                    type="password"
                    placeholder="Nhập lại mật khẩu"
                    value={registerConfirmPassword} 
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)} 
                    required 
                    size="sm" 
                  />
                </div>
              </Form.Group>

              <Button type="submit" className="w-100" variant="dark">
                Đăng ký
              </Button>

              {registerMessage && <div className="alert alert-success mt-2 mb-0 py-2">{registerMessage}</div>}
              {registerErrorMessage && <div className="alert alert-danger mt-2 mb-0 py-2">{registerErrorMessage}</div>}
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Header;