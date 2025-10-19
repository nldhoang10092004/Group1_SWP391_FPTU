import React, { useState, useEffect, forwardRef } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import "./PaymentForm.scss";
import { getPlans } from "../../middleware/planAPI";
import { createPayment } from "../../middleware/paymentAPI";
import Footer from "../Footer/footer";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Card({ className, ...props }) {
  return <div className={cn("card", className)} {...props} />;
}
function CardHeader({ className, ...props }) {
  return <div className={cn("card-header", className)} {...props} />;
}
function CardTitle({ className, ...props }) {
  return <h4 className={cn("card-title", className)} {...props} />;
}
function CardContent({ className, ...props }) {
  return <div className={cn("card-content", className)} {...props} />;
}
const Button = forwardRef(({ className, variant = "default", ...props }, ref) => {
  return <button ref={ref} className={cn("bu-btn", variant, className)} {...props} />;
});
Button.displayName = "Button";
const Input = forwardRef(({ className, type = "text", ...props }, ref) => {
  return <input ref={ref} type={type} className={cn("input", className)} {...props} />;
});
Input.displayName = "Input";
function Label({ className, ...props }) {
  return <label className={cn("label", className)} {...props} />;
}

function PaymentForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    const loadPlan = async () => {
      try {
        const data = await getPlans();
        const selected = data.find((p) => p.planID === parseInt(id));
        setPlan(selected);
      } catch (error) {
        console.error("Lỗi khi lấy plan:", error);
      }
    };
    loadPlan();
  }, [id]);

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.fullName || !formData.email || !formData.phone) {
    toast.error("Vui lòng điền đầy đủ thông tin");
    return;
  }

  setIsProcessing(true);
  try {
    const res = await createPayment(plan.planID);

   
    if (res?.status === 401 || res?.message?.includes("Unauthorized")) {
      toast.error("Bạn cần đăng nhập để thực hiện thanh toán.");
      return;
    }

    toast.success("Thanh toán thành công!");
    navigate("/paymentsuccess"); 
  } catch (err) {
    console.error("Lỗi khi tạo thanh toán:", err);
    toast.error("Lỗi khi tạo thanh toán. Vui lòng thử lại.");
  } finally {
    setIsProcessing(false);
  }
};


  if (!plan) return <div className="loading">Đang tải gói...</div>;

  return (
    <div className="payment-container">
      <div className="payment-wrapper">
        <div className="payment-header">
          <Button variant="ghost" onClick={() => navigate("/membership")} className="back-btn">
            <ArrowLeft className="icon" />
            Quay lại
          </Button>
          <h1 className="title">Thanh toán</h1>
          <p className="subtitle">Hoàn tất đăng ký {plan.name}</p>
        </div>

        <div className="payment-grid">
          {/* FORM */}
          <div className="payment-form">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin thanh toán</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="form">
                  <Label>Họ và tên *</Label>
                  <Input
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Nguyễn Văn A"
                    required
                  />

                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="example@email.com"
                    required
                  />

                  <Label>Số điện thoại *</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0123456789"
                    required
                  />

                  <div className="qr-box">
                    <div className="qr-placeholder">📱</div>
                    <p>Quét mã QR để thanh toán</p>
                    <p>Số tiền: <strong>{plan.price.toLocaleString("vi-VN")}đ</strong></p>
                  </div>

                  <Button type="submit" disabled={isProcessing} className="submit-btn">
                    {isProcessing ? "Đang xử lý..." : "Xác nhận thanh toán"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="order-summary">
            <Card>
              <CardHeader>
                <CardTitle>Tóm tắt đơn hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="plan-name">{plan.name}</p>
                <p className="plan-duration">{plan.durationDays} ngày</p>
                <p className="price-total">
                  Tổng cộng: <strong>{plan.price.toLocaleString("vi-VN")}đ</strong>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default PaymentForm;
