import { useState, useEffect } from "react";
import { Plus, Trash } from "lucide-react";
import { getAllVouchers, createVoucher, deleteVoucher } from "../../middleware/admin/voucherManagementAPI";
import "./management-styles.scss";

export function VoucherManagement() {
  const [vouchers, setVouchers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

  useEffect(() => {
    loadVouchers();
  }, []);

  const loadVouchers = async () => {
    try {
      setIsLoading(true);
      const data = await getAllVouchers();
      setVouchers(data);
    } catch (error) {
      showPopup("Không thể tải danh sách voucher", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateVoucher = async () => {
    try {
      // Convert expiresAt to ISO string if it's not empty
      const voucherData = {
        ...newVoucher,
        expiresAt: newVoucher.expiresAt ? new Date(newVoucher.expiresAt).toISOString() : null,
      };
      await createVoucher(voucherData);
      showPopup("Tạo voucher thành công!", "success");
      setShowCreateModal(false);
      setNewVoucher({ code: '', description: '', discountType: 'percentage', discountValue: 0, maxUses: 100, expiresAt: '' });
      loadVouchers();
    } catch (error) {
      showPopup(error.response?.data?.message || error.message || "Lỗi khi tạo voucher", "error");
    }
  };

  const handleDeleteVoucher = async (voucherId) => {
    if (!window.confirm("Bạn có chắc muốn xóa voucher này không?")) return;
    try {
      await deleteVoucher(voucherId);
      showPopup("Đã xóa voucher thành công", "success");
      setVouchers(vouchers.filter(v => v.id !== voucherId));
    } catch (error) {
      showPopup("Không thể xóa voucher", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="admin-loading-spinner">
        <div className="admin-spinner"></div>
        <p>Đang tải dữ liệu voucher...</p>
      </div>
    );
  }

  return (
    <div className="management-page-container">
      {showCreateModal && (
        <div className="management-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="management-modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="card-title mb-6">Tạo voucher mới</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Mã voucher (ví dụ: SALE50)" value={newVoucher.code} onChange={e => setNewVoucher({ ...newVoucher, code: e.target.value.toUpperCase() })} className="form-input md:col-span-2" />
              <textarea placeholder="Mô tả" value={newVoucher.description} onChange={e => setNewVoucher({ ...newVoucher, description: e.target.value })} className="form-input md:col-span-2" rows="2"></textarea>
              <select value={newVoucher.discountType} onChange={e => setNewVoucher({ ...newVoucher, discountType: e.target.value })} className="form-input">
                <option value="percentage">Phần trăm (%)</option>
                <option value="fixed_amount">Số tiền cố định</option>
              </select>
              <input type="number" placeholder="Giá trị giảm" value={newVoucher.discountValue} onChange={e => setNewVoucher({ ...newVoucher, discountValue: Number(e.target.value) })} className="form-input" />
              <input type="number" placeholder="Số lần sử dụng tối đa" value={newVoucher.maxUses} onChange={e => setNewVoucher({ ...newVoucher, maxUses: Number(e.target.value) })} className="form-input" />
              <input type="date" placeholder="Ngày hết hạn" value={newVoucher.expiresAt} onChange={e => setNewVoucher({ ...newVoucher, expiresAt: e.target.value })} className="form-input" />
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button onClick={() => setShowCreateModal(false)} className="secondary-button">Hủy</button>
              <button onClick={handleCreateVoucher} className="primary-button">Tạo voucher</button>
            </div>
          </div>
        </div>
      )}

      <div className="management-card">
        <div className="management-card-header flex justify-between items-center">
          <div>
            <h2 className="card-title">Quản lý Voucher</h2>
            <p className="card-description">Tổng số: {vouchers.length} voucher</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="primary-button flex items-center gap-2">
            <Plus size={18} />
            Tạo voucher
          </button>
        </div>

        <div className="management-card-content">
          <table className="management-table">
            <thead>
              <tr>
                <th>Mã Voucher</th>
                <th>Mô tả</th>
                <th>Giá trị</th>
                <th>Đã dùng / Tối đa</th>
                <th>Ngày hết hạn</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map((voucher) => (
                <tr key={voucher.id}>
                  <td className="font-mono font-bold text-blue-600">{voucher.code}</td>
                  <td>{voucher.description}</td>
                  <td>
                    {voucher.discountType === 'percentage'
                      ? `${voucher.discountValue}%`
                      : `${voucher.discountValue.toLocaleString()} VNĐ`}
                  </td>
                  <td>{`${voucher.usesCount} / ${voucher.maxUses}`}</td>
                  <td>{new Date(voucher.expiresAt).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => handleDeleteVoucher(voucher.id)} className="action-button delete-button">
                      <Trash size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default VoucherManagement;