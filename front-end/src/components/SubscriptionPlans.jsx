import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Check, ArrowLeft } from "lucide-react";

const PLANS = [
  {
    id: "monthly",
    name: "Gói 1 tháng",
    price: 299000,
    duration: "1 tháng",
    features: [
      "Truy cập toàn bộ khóa học",
      "Video HD không giới hạn",
      "Luyện tập với AI",
      "Tải tài liệu học tập",
      "Hỗ trợ 24/7"
    ]
  },
  {
    id: "quarterly",
    name: "Gói 3 tháng",
    price: 799000,
    originalPrice: 897000,
    duration: "3 tháng",
    discount: "Tiết kiệm 11%",
    popular: true,
    features: [
      "Tất cả tính năng gói 1 tháng",
      "Chứng chỉ hoàn thành",
      "Lớp học trực tuyến",
      "Tư vấn lộ trình học",
      "Ưu tiên hỗ trợ"
    ]
  },
  {
    id: "yearly",
    name: "Gói 12 tháng",
    price: 2499000,
    originalPrice: 3588000,
    duration: "12 tháng",
    discount: "Tiết kiệm 30%",
    features: [
      "Tất cả tính năng gói 3 tháng",
      "Học 1-1 với giáo viên",
      "Thi thử không giới hạn",
      "Tài khoản gia đình (3 người)",
      "Quà tặng đặc biệt"
    ]
  }
];

export function SubscriptionPlans({ onBack, onSelectPlan }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-3xl font-bold text-center mb-2">Chọn gói học phù hợp</h1>
          <p className="text-center text-gray-600">Truy cập toàn bộ khóa học và tài liệu học tập</p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map(plan => (
            <Card key={plan.id} className={`relative ${plan.popular ? 'border-2 border-blue-500 shadow-xl' : ''}`}>
              {plan.popular && (
                <div className="absolute top-0 right-0 -mt-3 -mr-3">
                  <Badge className="bg-blue-500">Phổ biến nhất</Badge>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-center">
                  <div className="text-2xl font-bold mb-2">{plan.name}</div>
                  {plan.discount && (
                    <Badge variant="secondary" className="mb-4">{plan.discount}</Badge>
                  )}
                  <div className="mt-4">
                    {plan.originalPrice && (
                      <div className="text-lg text-gray-400 line-through">{plan.originalPrice.toLocaleString('vi-VN')}đ</div>
                    )}
                    <div className="text-3xl font-bold text-blue-600">{plan.price.toLocaleString('vi-VN')}đ</div>
                    <div className="text-sm text-gray-600">{plan.duration}</div>
                  </div>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className="w-full" 
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => onSelectPlan(plan)}
                >
                  Chọn gói này
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Guarantee */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600">
            ✓ Hoàn tiền 100% trong 7 ngày đầu nếu không hài lòng<br />
            ✓ Thanh toán an toàn qua QR Code ngân hàng<br />
            ✓ Hỗ trợ 24/7 qua email và chat
          </p>
        </div>
      </div>
    </div>
  );
}
