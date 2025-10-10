import React, { useState } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Modal, Button, Form, Dropdown } from "react-bootstrap";
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from "react-router-dom";
import { loginApi, registerApi } from "../../api/auth";
import './Header.scss';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

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
  const [accountType, setAccountType] = useState("student");
  const [registerMessage, setRegisterMessage] = useState("");
  const [registerErrorMessage, setRegisterErrorMessage] = useState("");

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

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
  };

  const handleAuthClick = () => setShowAuthModal(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const handleLoginSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await loginApi(email, password);
    const userData = response.data;

    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);

    setLoginMessage("Đăng nhập thành công!");
    setTimeout(() => {
      resetLoginForm();
      setShowAuthModal(false);
      if (userData.role === "student") navigate("/student/dashboard");
      else if (userData.role === "teacher") navigate("/teacher/dashboard");
      else if (userData.role === "admin") navigate("/dashboard");
      else navigate("/");
    }, 1500);
  } catch (error) {
    setLoginErrorMessage(error.response?.data || "Đăng nhập thất bại");
  }
};


const handleRegisterSubmit = async (e) => {
  e.preventDefault();

  if (registerPassword !== registerConfirmPassword) {
    setRegisterErrorMessage("Mật khẩu xác nhận không khớp");
    return;
  }

  try {
    await registerApi(registerName, registerEmail, registerPassword);
    setRegisterMessage("Đăng ký thành công! Vui lòng đăng nhập.");
    setTimeout(() => {
      resetRegisterForm();
      setActiveTab("login");
    }, 2000);
  } catch (error) {
    setRegisterErrorMessage(error.response?.data || "Đăng ký thất bại");
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
      <Navbar expand="lg" className="bg-body-tertiary">
        <Container>
          <Navbar.Brand href="/">EnglishMaster</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase placeholder="Search…" inputProps={{ 'aria-label': 'search' }} />
            </Search>

            <Nav className="ms-auto">
              {!user ? (
                <>
                  <button className='btn-login me-2' onClick={() => { handleAuthClick(); setActiveTab("login"); resetRegisterForm(); }}>Login</button>
                  <button className='btn-signup' onClick={() => { handleAuthClick(); setActiveTab("register"); resetLoginForm(); }}>Sign Up</button>
                </>
              ) : (
                <>
                  {/* Navigation links based on role */}
                  {user.role === "student" && (
                    <>
                      <Nav.Link onClick={() => navigate("/student/dashboard")}>Dashboard</Nav.Link>
                      <Nav.Link onClick={() => navigate("/student/courses")}>Khóa học</Nav.Link>
                    </>
                  )}
                  {user.role === "teacher" && (
                    <>
                      <Nav.Link onClick={() => navigate("/teacher/dashboard")}>Dashboard</Nav.Link>
                      <Nav.Link onClick={() => navigate("/teacher/courses/manage")}>Quản lý khóa học</Nav.Link>
                    </>
                  )}
                  
                  <Dropdown align="end">
                    <Dropdown.Toggle
                      variant="light"
                      id="dropdown-user"
                      className="d-flex align-items-center"
                      style={{ border: 'none', background: 'transparent', padding: 0 }}
                    >
                      <img
                        src={user.avatar || "/default-avatar.png"}
                        alt="avatar"
                        style={{ width: "40px", height: "40px", borderRadius: "50%", marginRight: "8px" }}
                      />
                      <span>{user.name || user.email}</span>
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => navigate("/profile")}>View Profile</Dropdown.Item>
                      <Dropdown.Item onClick={() => navigate("/settings")}>Settings</Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item className="text-danger" onClick={handleLogout}>Logout</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Modal show={showAuthModal} onHide={() => setShowAuthModal(false)} centered className="auth-modal" size="md">
        <Modal.Header closeButton className="px-3 py-2">
          <Modal.Title className="fs-6">English Master Hub</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-3">
          <p className="text-center mb-3 small">Đăng nhập hoặc tạo tài khoản để bắt đầu hành trình học tiếng Anh</p>

          <div className="auth-tabs-nav mb-3">
            <button className={`tab-nav-btn ${activeTab === 'login' ? 'active' : ''}`} onClick={() => setActiveTab('login')}>
              Đăng nhập
            </button>
            <button className={`tab-nav-btn ${activeTab === 'register' ? 'active' : ''}`} onClick={() => setActiveTab('register')}>
              Đăng ký
            </button>
          </div>

          <div className="auth-tab-content">
            {activeTab === 'login' ? (
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
                  <a href="/forgotpassword" className="text-muted small">Quên mật khẩu?</a>
                </div>

                <div className="demo-accounts mb-3 py-2">
                  <p className="text-center mb-1 small">Tài khoản demo:</p>
                  <div className="d-flex justify-content-center gap-2">
                    <Button variant="outline-dark" size="sm" onClick={handleDemoStudent}>Học viên</Button>
                    <Button variant="outline-dark" size="sm" onClick={handleDemoTeacher}>Giảng viên</Button>
                  </div>
                </div>

                <Button variant="dark" type="submit" className="w-100 mb-2 py-1">Đăng nhập</Button>

                <div className="text-center mb-2">
                  <Button variant="outline-danger" className="w-100 py-1" size="sm">
                    Đăng nhập bằng Google
                  </Button>
                </div>

                {loginMessage && <div className="alert alert-success py-1 small mb-2">{loginMessage}</div>}
                {loginErrorMessage && <div className="alert alert-danger py-1 small mb-2">{loginErrorMessage}</div>}
              </Form>
            ) : (
              <Form onSubmit={handleRegisterSubmit}>
                <Form.Group className="mb-2">
                  <Form.Label className="small mb-1">Họ và tên</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={registerName} 
                    onChange={(e) => setRegisterName(e.target.value)} 
                    required 
                    size="sm"
                  />
                </Form.Group>

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

                <Form.Group className="mb-2">
                  <Form.Label className="small mb-1">Mật khẩu</Form.Label>
                  <Form.Control 
                    type="password" 
                    value={registerPassword} 
                    onChange={(e) => setRegisterPassword(e.target.value)} 
                    required 
                    size="sm"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="small mb-1">Xác nhận mật khẩu</Form.Label>
                  <Form.Control 
                    type="password" 
                    value={registerConfirmPassword} 
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)} 
                    required 
                    size="sm"
                  />
                </Form.Group>

                <Button variant="dark" type="submit" className="w-100 mb-2 py-1">Tạo tài khoản</Button>
                {registerMessage && <div className="alert alert-success py-1 small mb-2">{registerMessage}</div>}
                {registerErrorMessage && <div className="alert alert-danger py-1 small mb-2">{registerErrorMessage}</div>}
              </Form>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Header;
