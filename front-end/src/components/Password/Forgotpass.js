import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./forgotpass.scss";

export default function ForgotPass() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Fake API gọi forgot-password với email:", email);
    setSent(true);

    setTimeout(() => {
      navigate("/resetpassword?token=fakeToken123");
    }, 1500);
  };

  return (
    <div className="forgotpass-page">
      <div className="forgotpass-card">
        <h1 className="title">Quên mật khẩu?</h1>
        <p className="subtitle">
          Điền email gắn với tài khoản của bạn để nhận đường dẫn thay đổi mật khẩu
        </p>

        {!sent ? (
          <form onSubmit={handleSubmit}>
            <label>Email</label>
            <input
              type="email"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">Tiếp tục</button>
          </form>
        ) : (
          <p className="sent-msg">
            Nếu email tồn tại, link đặt lại mật khẩu đã được gửi.
          </p>
        )}

        <Link to="/" className="back-link">
          Quay lại trang chủ
        </Link>
      </div>
    </div>
  );
}
