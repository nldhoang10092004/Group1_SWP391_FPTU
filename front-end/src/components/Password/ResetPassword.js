import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { resetPasswordApi } from "../../middleware/auth"; 
import "./resetpassword.scss";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      const res = await resetPasswordApi(token, password, confirmPassword);
      console.log("✅ Kết quả đặt lại mật khẩu:", res.data);
      setSuccess(true);
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      console.error("❌ Lỗi đặt lại mật khẩu:", err);
      setError("Không thể đặt lại mật khẩu. Liên hệ hỗ trợ.");
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-box">
        <h1 className="reset-title">Đặt lại mật khẩu</h1>

        {!success ? (
          <form onSubmit={handleReset} className="reset-form">
            <input
              type="password"
              placeholder="Nhập mật khẩu mới"
              className="reset-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Xác nhận mật khẩu mới"
              className="reset-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button type="submit" className="reset-button">
              Cập nhật mật khẩu
            </button>
          </form>
        ) : (
          <p className="reset-success">Mật khẩu đã được cập nhật thành công.</p>
        )}

        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  );
}
