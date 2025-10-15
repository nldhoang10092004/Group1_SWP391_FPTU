import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { CheckCircle, Home, BookOpen } from "lucide-react";

export function PaymentSuccessSubscription({ plan, paymentInfo, onStartLearning, onGoHome }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="p-8">
          {/* Success Icon */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Thanh toán thành công!</h1>
            <p className="text-gray-600">Membership của bạn đã được kích hoạt</p>
          </div>

          {/* Payment Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Gói đăng ký:</span>
              <span className="font-medium">{plan.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Thời hạn:</span>
              <span className="font-medium">{plan.duration}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Số tiền:</span>
              <span className="font-medium text-blue-600">{plan.price.toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Mã giao dịch:</span>
              <span className="font-medium">{paymentInfo.transactionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{paymentInfo.email}</span>
            </div>
          </div>

          {/* What's Next */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Bạn có thể làm gì tiếp theo:</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Truy cập toàn bộ khóa học và bài học</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Luyện tập với AI không giới hạn</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Tải tài liệu học tập miễn phí</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Nhận chứng chỉ sau khi hoàn thành</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={onStartLearning} className="flex-1">
              <BookOpen className="h-4 w-4 mr-2" />
              Bắt đầu học ngay
            </Button>
            <Button onClick={onGoHome} variant="outline" className="flex-1">
              <Home className="h-4 w-4 mr-2" />
              Về trang chủ
            </Button>
          </div>

          {/* Email Confirmation */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Email xác nhận đã được gửi đến <strong>{paymentInfo.email}</strong>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
