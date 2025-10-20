import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Footer from "../Footer/footer";
import { forgotPasswordApi } from "../../middleware/auth"; 
import "./forgotpass.scss";

export default function ForgotPass() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await forgotPasswordApi(email);
      console.log("✅ Kết quả gửi OTP:", res.data);
      setSent(true);
      // Nếu backend gửi token qua email thật, bạn không cần navigate ngay
      // navigate("/resetpassword?token=fakeToken123"); // nếu cần test nhanh thì bỏ comment dòng này
    } catch (err) {
      console.error("❌ Lỗi khi gửi OTP:", err);
      setError("Gửi OTP thất bại. Vui lòng kiểm tra lại email.");
    }
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
            <button type="submit">Gửi Link Khôi Phục</button>
          </form>
        ) : (
          <p className="sent-msg">
            Nếu email tồn tại, link đặt lại mật khẩu đã được gửi.
          </p>
        )}

        {error && <p className="error-text">{error}</p>}

        <Link to="/" className="back-link">
          Quay lại trang chủ
        </Link>
      </div>
      <Footer />
    </div>
  );
}
