import React, { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Modal, Button, Form, Dropdown, Toast, ToastContainer } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { loginApi, registerApi, sendOtpApi } from "../../middleware/auth";
import api from "../../middleware/axiosInstance";
import "./Header.scss"; 

// 🔑 Hàm decode JWT để lấy thông tin user
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

  const [avatarUrl, setAvatarUrl] = useState("/default-avatar.png");
  const [username, setUsername] = useState("");

  // 🟢 Google Identity Services
  const [gisReady, setGisReady] = useState(false);
  const GOOGLE_CLIENT_ID =
    process.env.REACT_APP_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";

  // ✅ Hàm lấy thông tin user profile (bao gồm avatar)
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const response = await api.get("/api/account/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const profile = response.data;
      
      // ✅ Lấy avatar URL từ backend
      if (profile.avatarUrl || profile.AvatarUrl) {
        const avatar = profile.avatarUrl || profile.AvatarUrl;
        setAvatarUrl(avatar);
        localStorage.setItem("avatarUrl", avatar);
      }

      // ✅ Lấy username
      if (profile.username || profile.Username) {
        const name = profile.username || profile.Username;
        setUsername(name);
        localStorage.setItem("userName", name);
      }

      console.log("✅ User profile loaded:", profile);
    } catch (error) {
      console.error("❌ Lỗi tải profile:", error);
      // Nếu API trả về 401/403, có thể token đã hết hạn
      if (error.response?.status === 401 || error.response?.status === 403) {
        handleLogout();
      }
    }
  };

  // ✅ Load user data khi component mount
  useEffect(() => {
    const loadUserData = async () => {
      const savedUser = localStorage.getItem("user");
      const savedAvatar = localStorage.getItem("avatarUrl");
      const savedUserName = localStorage.getItem("userName");

      if (savedUser && savedUser !== "undefined" && savedUser !== "null") {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);

        // Lấy username từ localStorage hoặc token
        const nameToUse = savedUserName || parsedUser.username || parsedUser.email?.split("@")[0] || "";
        setUsername(nameToUse);

        // Lấy avatar từ localStorage hoặc fetch từ API
        if (savedAvatar && savedAvatar !== "/default-avatar.png") {
          setAvatarUrl(savedAvatar);
        } else {
          // ✅ Fetch avatar từ backend nếu chưa có
          await fetchUserProfile();
        }
      }
    };

    loadUserData();
  }, []);

  // ✅ Listen cho sự kiện cập nhật avatar từ component khác (Profile page)
  useEffect(() => {
    const handleAvatarUpdate = () => {
      const savedAvatar = localStorage.getItem("avatarUrl");
      if (savedAvatar) {
        setAvatarUrl(savedAvatar);
      }
    };

    const handleStorageChange = () => {
      const savedAvatar = localStorage.getItem("avatarUrl");
      const savedUserName = localStorage.getItem("userName");
      
      if (savedAvatar) setAvatarUrl(savedAvatar);
      if (savedUserName) setUsername(savedUserName);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("avatarUpdated", handleAvatarUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("avatarUpdated", handleAvatarUpdate);
    };
  }, []);

  // nạp script GIS 1 lần
  useEffect(() => {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      setGisReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setGisReady(true);
    script.onerror = () => {
      setGisReady(false);
      console.error("❌ Không tải được Google Identity Services script");
    };
    document.body.appendChild(script);
  }, []);

  const onGoogleCredential = async (response) => {
    try {
      const idToken = response?.credential;
      if (!idToken) {
        showToastNotification("Không nhận được Google ID token.", "danger");
        return;
      }

      const res = await api.post("/api/auth/login/google", { idToken });
      const { accountID, accessToken, expiresIn, role, redirectUrl } = res.data || {};

      const decodedToken = decodeJWT(accessToken);
      const usernameFromToken =
        decodedToken?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
      const roleFromToken =
        decodedToken?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

      const loggedUser = {
        accountID,
        accessToken,
        expiresIn,
        role: role || roleFromToken,
        username: usernameFromToken || "google_user",
        email: decodedToken?.email || "",
      };

      localStorage.setItem("user", JSON.stringify(loggedUser));
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("userName", loggedUser.username);

      setUser(loggedUser);
      setUsername(loggedUser.username);

      // ✅ Fetch avatar sau khi login
      await fetchUserProfile();

      showToastNotification("🎉 Đăng nhập Google thành công!", "success");

      setTimeout(() => {
        setShowAuthModal(false);
        const targetUrl = redirectUrl || "/home";
        navigate(targetUrl);
        window.location.href = targetUrl;
      }, 800);
    } catch (err) {
      console.error("❌ Google login error:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Đăng nhập Google thất bại!";
      showToastNotification(`❌ ${errorMsg}`, "danger");
    }
  };

  const handleGoogleLoginClick = () => {
    if (!gisReady) {
      showToastNotification("Google chưa sẵn sàng. Vui lòng thử lại sau.", "warning");
      return;
    }
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID") {
      showToastNotification("Thiếu GOOGLE_CLIENT_ID. Hãy cấu hình REACT_APP_GOOGLE_CLIENT_ID.", "warning");
      return;
    }
    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: onGoogleCredential,
        ux_mode: "popup",
        auto_select: false,
      });
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()) {
          window.google.accounts.id.renderButton(
            document.getElementById("google-btn-fallback"),
            { theme: "outline", size: "large", width: 320 }
          );
          const fb = document.getElementById("google-btn-fallback-wrap");
          if (fb) fb.style.display = "block";
        }
      });
    } catch (e) {
      console.error("❌ Lỗi khởi tạo Google:", e);
      showToastNotification("Không khởi tạo được Google Login.", "danger");
    }
  };

  const showToastNotification = (message, type = "danger") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

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

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    setLoginMessage("");
    setLoginErrorMessage("");
    
    try {
      const response = await loginApi(emailOrUsername, password);
      const { accountID, accessToken, expiresIn, role, redirectUrl } = response.data;

      const decodedToken = decodeJWT(accessToken);
      const usernameFromToken = decodedToken?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
      const roleFromToken = decodedToken?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

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

      // ✅ Fetch avatar sau khi login
      await fetchUserProfile();

      setLoginMessage("Đăng nhập thành công!");
      showToastNotification("🎉 Đăng nhập thành công! Chào mừng bạn quay lại.", "success");

      setTimeout(() => {
        setShowAuthModal(false);
        resetLoginForm();
        const targetUrl = redirectUrl || "/home";
        navigate(targetUrl);
        window.location.href = targetUrl;
      }, 1000);

    } catch (err) {
      const errorMsg = err.response?.data?.message || 
                      err.response?.data?.error ||
                      err.message ||
                      "Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin.";
      setLoginErrorMessage(errorMsg);
      showToastNotification(`❌ ${errorMsg}`, "danger");
    }
  };

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
      const response = await registerApi({
        email: registerEmail,
        username: registerName,
        password: registerPassword,
        confirmPassword: registerConfirmPassword,
        otp: registerOtp,
      });

      const { accountID, accessToken, expiresIn } = response.data;

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

      // ✅ Fetch avatar sau khi register
      await fetchUserProfile();

      setRegisterMessage("Đăng ký thành công!");
      showToastNotification("🎉 Đăng ký thành công! Chào mừng bạn đến với EnglishMaster.", "success");

      setTimeout(() => {
        setShowAuthModal(false);
        resetRegisterForm();
        navigate("/home");
        window.location.reload();
      }, 1000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 
                      err.response?.data?.error ||
                      err.message ||
                      "Đăng ký thất bại!";
      setRegisterErrorMessage(errorMsg);
      showToastNotification(`❌ ${errorMsg}`, "danger");
    }
  };

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
      await sendOtpApi(registerEmail);
      const successMsg = "✅ OTP đã được gửi đến email của bạn!";
      setOtpMessage(successMsg);
      showToastNotification(successMsg, "success");
    } catch (err) {
      const errorMsg = err.response?.data?.message || 
                      err.response?.data?.error ||
                      "Gửi OTP thất bại!";
      setOtpError(errorMsg);
      setOtpMessage("");
      showToastNotification(`❌ ${errorMsg}`, "danger");
    }
  };

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
    }, 800);
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
                      onError={(e) => {
                        console.log("❌ Avatar load failed, using default");
                        e.target.src = "/default-avatar.png";
                      }}
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        objectFit: "cover"
                      }}
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

              <Button type="submit" className="w-100 mb-2" variant="dark">
                Đăng nhập
              </Button>

              <Button
                type="button"
                className="w-100 mb-2"
                variant="outline-secondary"
                onClick={handleGoogleLoginClick}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <svg width="18" height="18" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303C33.602,32.91,29.197,36,24,36c-6.627,0-12-5.373-12-12 c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.949,3.051l5.657-5.657C34.676,6.053,29.63,4,24,4C12.955,4,4,12.955,4,24 s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.297,16.702,18.834,14,24,14c3.059,0,5.842,1.154,7.949,3.051l5.657-5.657 C34.676,6.053,29.63,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                    <path fill="#4CAF50" d="M24,44c5.138,0,9.801-1.969,13.305-5.181l-6.147-5.195C29.127,35.091,26.715,36,24,36 c-5.176,0-9.573-3.072-11.292-7.435l-6.53,5.034C9.488,39.556,16.227,44,24,44z"/>
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-1.33,3.08-3.879,5.456-7.003,6.541 c0.001-0.001,0.002-0.001,0.003-0.002l6.147,5.195C33.985,40.184,44,36,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                  </svg>
                  Đăng nhập với Google
                </span>
              </Button>

              <div id="google-btn-fallback-wrap" style={{ display: "none" }} className="d-grid">
                <div id="google-btn-fallback" className="w-100" />
              </div>

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