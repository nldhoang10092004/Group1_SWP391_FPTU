import { useState, useEffect } from "react";
import { Plus, Trash, Edit } from "lucide-react";
import { getAllPlans, createPlan, updatePlan, deletePlan } from "../../middleware/admin/planAdminAPI";
import "./management-styles.scss";

export function VoucherManagement() {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const [newPlan, setNewPlan] = useState({
    planCode: '',
    name: '',
    price: 0,
    durationDays: 30,
    isActive: true
  });

  const showPopup = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setIsLoading(true);
      const data = await getAllPlans();
      setPlans(data);
    } catch (error) {
      showPopup("Không thể tải danh sách gói đăng ký", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    try {
      await createPlan(newPlan);
      showPopup("Tạo gói đăng ký thành công!", "success");
      setShowCreateModal(false);
      setNewPlan({ planCode: '', name: '', price: 0, durationDays: 30, isActive: true });
      loadPlans();
    } catch (error) {
      showPopup(error.response?.data?.message || error.message || "Lỗi khi tạo gói đăng ký", "error");
    }
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setNewPlan({
      planCode: plan.planCode,
      name: plan.name,
      price: plan.price,
      durationDays: plan.durationDays,
      isActive: plan.isActive
    });
    setShowEditModal(true);
  };

  const handleUpdatePlan = async () => {
    try {
      await updatePlan(editingPlan.planID, newPlan);
      showPopup("Cập nhật gói đăng ký thành công!", "success");
      setShowEditModal(false);
      setEditingPlan(null);
      setNewPlan({ planCode: '', name: '', price: 0, durationDays: 30, isActive: true });
      loadPlans();
    } catch (error) {
      showPopup(error.response?.data?.message || error.message || "Lỗi khi cập nhật gói đăng ký", "error");
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm("Bạn có chắc muốn xóa gói đăng ký này không?")) return;
    try {
      await deletePlan(planId, false);
      showPopup("Đã xóa gói đăng ký thành công", "success");
      setPlans(plans.filter(p => p.planID !== planId));
    } catch (error) {
      showPopup("Không thể xóa gói đăng ký", "error");
    }
  };

  const formatDuration = (days) => {
    if (days >= 9999) return "Trọn đời";
    if (days >= 365) return `${Math.floor(days / 365)} năm`;
    if (days >= 30) return `${Math.floor(days / 30)} tháng`;
    return `${days} ngày`;
  };

  if (isLoading) {
    return (
      <div className="admin-loading-spinner">
        <div className="admin-spinner"></div>
        <p>Đang tải dữ liệu gói đăng ký...</p>
      </div>
    );
  }

  return (
    <div className="management-page-container">
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.message}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="management-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="management-modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="card-title mb-6">Tạo gói đăng ký mới</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                type="text" 
                placeholder="Mã gói (ví dụ: MONTHLY)" 
                value={newPlan.planCode} 
                onChange={e => setNewPlan({ ...newPlan, planCode: e.target.value.toUpperCase() })} 
                className="form-input"
              />
              <input 
                type="text" 
                placeholder="Tên gói" 
                value={newPlan.name} 
                onChange={e => setNewPlan({ ...newPlan, name: e.target.value })} 
                className="form-input"
              />
              <input 
                type="number" 
                placeholder="Giá (VNĐ)" 
                value={newPlan.price} 
                onChange={e => setNewPlan({ ...newPlan, price: Number(e.target.value) })} 
                className="form-input"
              />
              <input 
                type="number" 
                placeholder="Thời hạn (ngày)" 
                value={newPlan.durationDays} 
                onChange={e => setNewPlan({ ...newPlan, durationDays: Number(e.target.value) })} 
                className="form-input"
              />
              <div className="flex items-center gap-2 md:col-span-2">
                <input 
                  type="checkbox" 
                  id="isActive" 
                  checked={newPlan.isActive} 
                  onChange={e => setNewPlan({ ...newPlan, isActive: e.target.checked })} 
                  className="form-checkbox"
                />
                <label htmlFor="isActive">Kích hoạt gói</label>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button onClick={() => setShowCreateModal(false)} className="secondary-button">Hủy</button>
              <button onClick={handleCreatePlan} className="primary-button">Tạo gói</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="management-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="management-modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="card-title mb-6">Chỉnh sửa gói đăng ký</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                type="text" 
                placeholder="Mã gói" 
                value={newPlan.planCode} 
                onChange={e => setNewPlan({ ...newPlan, planCode: e.target.value.toUpperCase() })} 
                className="form-input"
              />
              <input 
                type="text" 
                placeholder="Tên gói" 
                value={newPlan.name} 
                onChange={e => setNewPlan({ ...newPlan, name: e.target.value })} 
                className="form-input"
              />
              <input 
                type="number" 
                placeholder="Giá (VNĐ)" 
                value={newPlan.price} 
                onChange={e => setNewPlan({ ...newPlan, price: Number(e.target.value) })} 
                className="form-input"
              />
              <input 
                type="number" 
                placeholder="Thời hạn (ngày)" 
                value={newPlan.durationDays} 
                onChange={e => setNewPlan({ ...newPlan, durationDays: Number(e.target.value) })} 
                className="form-input"
              />
              <div className="flex items-center gap-2 md:col-span-2">
                <input 
                  type="checkbox" 
                  id="isActiveEdit" 
                  checked={newPlan.isActive} 
                  onChange={e => setNewPlan({ ...newPlan, isActive: e.target.checked })} 
                  className="form-checkbox"
                />
                <label htmlFor="isActiveEdit">Kích hoạt gói</label>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button onClick={() => setShowEditModal(false)} className="secondary-button">Hủy</button>
              <button onClick={handleUpdatePlan} className="primary-button">Cập nhật</button>
            </div>
          </div>
        </div>
      )}

      <div className="management-card">
        <div className="management-card-header flex justify-between items-center">
          <div>
            <h2 className="card-title">Quản lý Gói đăng ký</h2>
            <p className="card-description">Tổng số: {plans.length} gói</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="primary-button flex items-center gap-2">
            <Plus size={18} />
            Tạo gói mới
          </button>
        </div>

        <div className="management-card-content">
          <table className="management-table">
            <thead>
              <tr>
                <th>Mã gói</th>
                <th>Tên gói</th>
                <th>Giá</th>
                <th>Thời hạn</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.planID}>
                  <td className="font-mono font-bold text-blue-600">{plan.planCode}</td>
                  <td>{plan.name}</td>
                  <td>{plan.price.toLocaleString()} VNĐ</td>
                  <td>{formatDuration(plan.durationDays)}</td>
                  <td>
                    <span className={`status-badge ${plan.isActive ? 'active' : 'inactive'}`}>
                      {plan.isActive ? 'Hoạt động' : 'Tạm dừng'}
                    </span>
                  </td>
                  <td>{new Date(plan.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditPlan(plan)} 
                        className="action-button edit-button"
                        title="Chỉnh sửa"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeletePlan(plan.planID)} 
                        className="action-button delete-button"
                        title="Xóa"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
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