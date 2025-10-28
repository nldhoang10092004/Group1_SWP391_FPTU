import { useState } from "react";
import { CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Input } from "./ui/input";
import { Ticket, Plus, Tag, Calendar, Edit, Trash2 } from "lucide-react";

export function VoucherManagement() {
  const [vouchers, setVouchers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const [newVoucher, setNewVoucher] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 0,
    maxUses: 100,
    expiresAt: ''
  });

  const showPopup = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  const handleCreateVoucher = async () => {
    if (!newVoucher.code || !newVoucher.description || !newVoucher.expiresAt) {
      showPopup("Vui lòng điền đầy đủ thông tin", "error");
      return;
    }

    const voucher = {
      id: 'voucher_' + Date.now(),
      ...newVoucher,
      currentUses: 0,
      isActive: true
    };

    setVouchers(prev => [...prev, voucher]);
    showPopup("Đã tạo voucher hệ thống", "success");
    setShowCreateModal(false);
    setNewVoucher({ code: '', description: '', discountType: 'percentage', discountValue: 0, maxUses: 100, expiresAt: '' });
  };

  const handleDeleteVoucher = (voucherId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa voucher này?")) {
      setVouchers(prev => prev.filter(v => v.id !== voucherId));
      showPopup("Đã xóa voucher", "success");
    }
  };

  return (
    <div className="p-4">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className={`p-4 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
            <div className="flex justify-between items-center">
              <strong className="mr-2">Thông báo</strong>
              <button onClick={() => setToast(prev => ({ ...prev, show: false }))} className="text-white hover:text-gray-200">
                ×
              </button>
            </div>
            <div className="mt-2">{toast.message}</div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Quản lý Voucher</CardTitle>
              <CardDescription>Tạo và quản lý voucher giảm giá</CardDescription>
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="mr-2" size={16} />
              Tạo voucher
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {vouchers.length === 0 ? (
            <div className="text-center py-12">
              <Ticket size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Chưa có voucher nào</p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus size={16} className="mr-2" />
                Tạo voucher đầu tiên
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã voucher</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Giảm giá</TableHead>
                  <TableHead>Sử dụng</TableHead>
                  <TableHead>Hết hạn</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vouchers.map((voucher) => (
                  <TableRow key={voucher.id}>
                    <TableCell className="font-bold font-mono">{voucher.code}</TableCell>
                    <TableCell>{voucher.description}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Tag size={14} />
                        {voucher.discountType === 'percentage'
                          ? `${voucher.discountValue}%`
                          : `${voucher.discountValue.toLocaleString()}đ`}
                      </div>
                    </TableCell>
                    <TableCell>
                      {voucher.currentUses}/{voucher.maxUses}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(voucher.expiresAt).toLocaleDateString('vi-VN')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={voucher.isActive ? 'bg-green-500' : 'bg-gray-500'}>
                        {voucher.isActive ? 'Hoạt động' : 'Tạm dừng'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm">
                          <Edit size={16} />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteVoucher(voucher.id)}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </div>

      {/* Create Voucher Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Tạo voucher hệ thống</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700">
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Mã voucher *</label>
                <Input
                  value={newVoucher.code}
                  onChange={(e) => setNewVoucher(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="VD: NEWYEAR2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Mô tả *</label>
                <Input
                  value={newVoucher.description}
                  onChange={(e) => setNewVoucher(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Mô tả về voucher"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Loại giảm giá</label>
                  <select
                    className="w-full border rounded-md p-2"
                    value={newVoucher.discountType}
                    onChange={(e) => setNewVoucher(prev => ({ ...prev, discountType: e.target.value }))}
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed">Số tiền (VND)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Giá trị giảm</label>
                  <Input
                    type="number"
                    value={newVoucher.discountValue}
                    onChange={(e) => setNewVoucher(prev => ({ ...prev, discountValue: parseInt(e.target.value) }))}
                    placeholder={newVoucher.discountType === 'percentage' ? '30' : '100000'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Số lần sử dụng tối đa</label>
                  <Input
                    type="number"
                    value={newVoucher.maxUses}
                    onChange={(e) => setNewVoucher(prev => ({ ...prev, maxUses: parseInt(e.target.value) }))}
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ngày hết hạn *</label>
                  <Input
                    type="date"
                    value={newVoucher.expiresAt}
                    onChange={(e) => setNewVoucher(prev => ({ ...prev, expiresAt: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Hủy
              </Button>
              <Button onClick={handleCreateVoucher}>Tạo voucher</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VoucherManagement;