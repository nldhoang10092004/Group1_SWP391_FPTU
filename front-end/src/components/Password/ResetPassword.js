import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./resetpassword.scss";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleReset = (e) => {
    e.preventDefault();
    console.log("Fake API reset-password với token:", token, "new password:", password);
    setSuccess(true);

    setTimeout(() => {
      navigate("/login");
    }, 2000);
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
            <button type="submit" className="reset-button">
              Cập nhật mật khẩu
            </button>
          </form>
        ) : (
          <p className="reset-success">
            Mật khẩu đã được cập nhật thành công.
          </p>
        )}
      </div>
    </div>
  );
}
