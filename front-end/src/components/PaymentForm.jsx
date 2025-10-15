import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ArrowLeft, CreditCard } from "lucide-react";
import { toast } from "sonner@2.0.3";

export function PaymentForm({ plan, onBack, onPaymentSuccess }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.phone) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess(plan, {
        ...formData,
        paymentMethod,
        transactionId: `TXN${Date.now()}`,
        paidAt: new Date().toISOString()
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-3xl font-bold">Thanh toán</h1>
          <p className="text-gray-600">Hoàn tất đăng ký {plan.name}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin thanh toán</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Họ và tên *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      placeholder="Nguyễn Văn A"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="example@email.com"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Số điện thoại *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="0123456789"
                      required
                    />
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-3">
                    <Label>Phương thức thanh toán</Label>
                    <div className="border rounded-lg p-4 bg-blue-50">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="font-medium">Chuyển khoản ngân hàng</p>
                          <p className="text-sm text-gray-600">Quét mã QR để thanh toán</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="border rounded-lg p-6 bg-gray-50 text-center">
                    <div className="w-48 h-48 mx-auto bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center mb-4">
                      <div className="text-4xl">📱</div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Quét mã QR để thanh toán</p>
                    <div className="space-y-1 text-sm">
                      <p>Ngân hàng: <strong>Vietcombank</strong></p>
                      <p>STK: <strong>123456789</strong></p>
                      <p>Chủ TK: <strong>CONG TY EMT</strong></p>
                      <p>Số tiền: <strong className="text-blue-600">{plan.price.toLocaleString('vi-VN')}đ</strong></p>
                      <p>Nội dung: <strong>EMT {formData.phone || "SDT"}</strong></p>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isProcessing}>
                    {isProcessing ? "Đang xử lý..." : "Xác nhận thanh toán"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Tóm tắt đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium">{plan.name}</p>
                  <p className="text-sm text-gray-600">{plan.duration}</p>
                </div>
                
                {plan.originalPrice && plan.originalPrice > plan.price && (
                  <div className="flex justify-between text-sm">
                    <span>Giá gốc:</span>
                    <span className="line-through text-gray-500">{plan.originalPrice.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}

                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng:</span>
                  <span className="text-blue-600">{plan.price.toLocaleString('vi-VN')}đ</span>
                </div>

                <ul className="text-sm space-y-2 pt-4 border-t">
                  {plan.features?.slice(0, 5).map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
