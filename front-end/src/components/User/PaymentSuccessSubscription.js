import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { CheckCircle, Home, BookOpen } from "lucide-react";
import "./PaymentSuccessSubscription.scss"; 
import Footer from "../Footer/footer";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
const Button = React.forwardRef(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants = {
      default: "btn-default",
      outline: "btn-outline",
      ghost: "btn-ghost",
    };

    const sizes = {
      default: "btn-md",
      sm: "btn-sm",
      lg: "btn-lg",
      icon: "btn-icon",
    };

    return (
      <button
        ref={ref}
        className={cn("btn-base", variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

function Card({ className, ...props }) {
  return <div className={cn("cards", className)} {...props} />;
}

function CardContent({ className, ...props }) {
  return <div className={cn("cards-content", className)} {...props} />;
}

function PaymentSuccessSubscription({ plan, paymentInfo, onStartLearning, onGoHome }) {
  const navigate = useNavigate();
  return (
    <div className="payment-success-page">
      <Card className="card-main">
        <CardContent>
          {/* Success Icon */}
          <div className="success-header">
            <div className="icon-circle">
              <CheckCircle className="icon-success" />
            </div>
            <h1>Thanh toán thành công!</h1>
            <p>Membership của bạn đã được kích hoạt</p>
          </div>

          {/* Payment Details */}
          <div className="details-box">
            <div className="detail-row">
              <span>Gói đăng ký:</span>
              <strong>{plan?.name}</strong>
            </div>
            <div className="detail-row">
              <span>Thời hạn:</span>
              <strong>{plan?.duration}</strong>
            </div>
            <div className="detail-row">
              <span>Số tiền:</span>
              <strong className="price">
                {plan?.price?.toLocaleString("vi-VN")}đ
              </strong>
            </div>
            <div className="detail-row">
              <span>Mã giao dịch:</span>
              <strong>{paymentInfo?.transactionId}</strong>
            </div>
            <div className="detail-row">
              <span>Email:</span>
              <strong>{paymentInfo?.email}</strong>
            </div>
          </div>

          {/* Next Actions */}
          <div className="next-actions">
            <h3>Bạn có thể làm gì tiếp theo:</h3>
            <ul>
              <li>
                <CheckCircle className="li-icon" /> Truy cập toàn bộ khóa học và bài học
              </li>
              <li>
                <CheckCircle className="li-icon" /> Luyện tập với AI không giới hạn
              </li>
              <li>
                <CheckCircle className="li-icon" /> Tải tài liệu học tập miễn phí
              </li>
              <li>
                <CheckCircle className="li-icon" /> Nhận chứng chỉ sau khi hoàn thành
              </li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="action-buttons">
            <Button onClick={onStartLearning}>
              <BookOpen className="mr-2" onClick={() => navigate("/home")}/> Bắt đầu học ngay
            </Button>
            <Button onClick={onGoHome} variant="outline">
              <Home className="mr-2" onClick={() => navigate("/home")}/> Về trang chủ
            </Button>
          </div>

          {/* Email confirmation */}
          <p className="confirmation-text">
            Email xác nhận đã được gửi đến <strong>{paymentInfo?.email}</strong>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default PaymentSuccessSubscription;
