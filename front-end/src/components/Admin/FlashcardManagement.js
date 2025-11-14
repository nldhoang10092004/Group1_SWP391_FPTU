import React, { useEffect, useState } from "react";
import {
  getPublicSets,
  getFlashcardSet,
  createFlashcardSet,
  updateFlashcardSet,
  deleteFlashcardSet,
  createFlashcardItem,
  updateFlashcardItem,
  deleteFlashcardItem,
} from "../../middleware/admin/adminFlashcardAPI";
import { Plus, Edit, Trash, Eye, X, ArrowLeft } from "lucide-react";
import Swal from "sweetalert2";
import "./management-styles.scss";

export function FlashcardManagement() {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSet, setSelectedSet] = useState(null);

  const [showSetModal, setShowSetModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);

  const [setForm, setSetForm] = useState({ title: "", description: "" });
  const [itemForm, setItemForm] = useState({
    frontText: "",
    backText: "",
    example: "",
    setID: null,
  });

  const loadSets = async () => {
    try {
      setLoading(true);
      const data = await getPublicSets();
      if (data) setSets(data);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSets();
  }, []);

  const handleSelectSet = async (setId) => {
    try {
      const detail = await getFlashcardSet(setId);
      setSelectedSet(detail);
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleOpenSetModal = (set = null) => {
    if (set) setSetForm({ ...set });
    else setSetForm({ title: "", description: "" });
    setShowSetModal(true);
  };

  const handleSaveSet = async () => {
    if (!setForm.title) {
      Swal.fire("Thiếu dữ liệu", "Vui lòng nhập tiêu đề Flashcard Set", "warning");
      return;
    }

    try {
      if (setForm.setID) await updateFlashcardSet(setForm.setID, setForm);
      else await createFlashcardSet(setForm);

      Swal.fire("Thành công", "Đã lưu Flashcard Set!", "success");
      setShowSetModal(false);
      loadSets();
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleDeleteSet = (setId) => {
    Swal.fire({
      title: "Xác nhận xóa?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await deleteFlashcardSet(setId);
          Swal.fire("Đã xóa!", "Flashcard Set đã bị xóa.", "success");
          setSelectedSet(null);
          loadSets();
        } catch (err) {
          handleApiError(err);
        }
      }
    });
  };

  const handleOpenItemModal = (item = null, setID = null) => {
    if (item)
      setItemForm({
        frontText: item.frontText ?? "",
        backText: item.backText ?? "",
        example: item.example ?? "",
        itemID: item.itemID,
        setID,
      });
    else
      setItemForm({
        frontText: "",
        backText: "",
        example: "",
        setID,
      });

    setShowItemModal(true);
  };

  const handleSaveItem = async () => {
    if (!itemForm.frontText || !itemForm.backText) {
      Swal.fire("Thiếu dữ liệu", "Vui lòng nhập Thuật ngữ và Nghĩa của nó", "warning");
      return;
    }

    try {
      const payload = {
        setID: itemForm.setID,
        frontText: itemForm.frontText,
        backText: itemForm.backText,
        example: itemForm.example ?? null,
      };

      if (itemForm.itemID) {
        await updateFlashcardItem(itemForm.itemID, payload);
      } else {
        await createFlashcardItem(payload);
      }

      Swal.fire("Thành công", "Đã lưu Flashcard Item!", "success");
      setShowItemModal(false);
      const detail = await getFlashcardSet(itemForm.setID);
      setSelectedSet(detail);
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleDeleteItem = (itemId, setID) => {
    Swal.fire({
      title: "Xác nhận xóa?",
      text: "Bạn có chắc chắn muốn xóa Flashcard Item này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await deleteFlashcardItem(itemId);
          Swal.fire("Đã xóa!", "Flashcard Item đã bị xóa.", "success");
          const detail = await getFlashcardSet(setID);
          setSelectedSet(detail);
        } catch (err) {
          handleApiError(err);
        }
      }
    });
  };

  const handleApiError = (err) => {
    const msg = err?.response?.data?.message || err?.message || "Đã xảy ra lỗi không xác định.";
    Swal.fire(`Lỗi ${err?.response?.status || ''}`, msg, "error");
  };

  const renderSetList = () => (
    <>
      <div className="management-card-header flex justify-between items-center">
        <div>
          <h2 className="card-title">Quản lý Flashcard</h2>
          <p className="card-description">Tạo và quản lý các bộ flashcard công khai.</p>
        </div>
        <button onClick={() => handleOpenSetModal()} className="primary-button">
          <Plus size={18} />
          <span>Thêm bộ mới</span>
        </button>
      </div>

      {loading ? (
        <div className="admin-loading-spinner">
          <div className="admin-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="flashcard-grid">
          {sets.length > 0 ? (
            sets.map((set) => (
              <div key={set.setID} className="management-card p-4 flex flex-col">
                <h5 className="font-bold text-lg">{set.title}</h5>
                <p className="text-gray-600 text-sm flex-grow">{set.description}</p>
                <div className="flex gap-2 mt-4">
                  <button
                    className="action-button"
                    title="Xem chi tiết"
                    onClick={() => handleSelectSet(set.setID)}
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    className="action-button"
                    title="Chỉnh sửa"
                    onClick={() => handleOpenSetModal(set)}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="action-button delete-button"
                    title="Xóa"
                    onClick={() => handleDeleteSet(set.setID)}
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 py-12">
              Không có Flashcard Set nào.
            </div>
          )}
        </div>
      )}
    </>
  );

  const renderSetDetails = () => (
    <>
      <div className="w-full flex justify-between items-center mb-4">
        <button onClick={() => setSelectedSet(null)} className="secondary-button">
            <ArrowLeft size={18} />
            <span>Quay lại</span>
        </button>
        <button onClick={() => handleOpenItemModal(null, selectedSet.setID)} className="primary-button">
            <Plus size={18} />
            <span>Thêm thẻ</span>
        </button>
      </div>
      <div className="management-card-header">
        <h3 className="card-title">Chi tiết bộ: {selectedSet.title}</h3>
        <p className="card-description">{selectedSet.description}</p>
      </div>
      <div className="management-table-wrapper mt-4">
        <table className="management-table">
          <thead>
            <tr>
              <th>Thuật ngữ (Front)</th>
              <th>Định nghĩa (Back)</th>
              <th>Ví dụ</th>
              <th className="text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {selectedSet.items?.length > 0 ? (
              selectedSet.items.map((item) => (
                <tr key={item.itemID}>
                  <td className="font-semibold">{item.frontText}</td>
                  <td>{item.backText}</td>
                  <td className="text-gray-500 italic">{item.example || "N/A"}</td>
                  <td className="management-table-actions">
                    <button
                      className="action-button"
                      onClick={() => handleOpenItemModal(item, selectedSet.setID)}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="action-button delete-button"
                      onClick={() => handleDeleteItem(item.itemID, selectedSet.setID)}
                    >
                      <Trash size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center text-gray-500 py-8">
                  Chưa có thẻ nào trong bộ này.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );

  return (
    <div className="management-card">
      {selectedSet ? renderSetDetails() : renderSetList()}

      {/* Modal Set */}
      {showSetModal && (
        <div className="management-modal-overlay" onClick={() => setShowSetModal(false)}>
          <div className="management-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-4 border-b">
              <h3 className="text-xl font-bold">
                {setForm.setID ? "Sửa Flashcard Set" : "Thêm Flashcard Set"}
              </h3>
              <button className="action-button" onClick={() => setShowSetModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="my-6">
              <label className="form-label">Tiêu đề</label>
              <input
                type="text"
                className="form-input"
                value={setForm.title}
                onChange={(e) => setSetForm({ ...setForm, title: e.target.value })}
              />
              <label className="form-label mt-4">Mô tả</label>
              <textarea
                className="form-input"
                rows="3"
                value={setForm.description}
                onChange={(e) => setSetForm({ ...setForm, description: e.target.value })}
              ></textarea>
            </div>
            <div className="flex justify-end gap-4 pt-4 border-t">
              <button className="secondary-button" onClick={() => setShowSetModal(false)}>
                Hủy
              </button>
              <button className="primary-button" onClick={handleSaveSet}>
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Item */}
      {showItemModal && (
        <div className="management-modal-overlay" onClick={() => setShowItemModal(false)}>
          <div className="management-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-4 border-b">
              <h3 className="text-xl font-bold">
                {itemForm.itemID ? "Sửa Flashcard Item" : "Thêm Flashcard Item"}
              </h3>
              <button className="action-button" onClick={() => setShowItemModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="my-6">
              <label className="form-label">Thuật ngữ (Front Text)</label>
              <input
                type="text"
                className="form-input"
                value={itemForm.frontText}
                onChange={(e) => setItemForm({ ...itemForm, frontText: e.target.value })}
              />
              <label className="form-label mt-4">Định nghĩa (Back Text)</label>
              <input
                type="text"
                className="form-input"
                value={itemForm.backText}
                onChange={(e) => setItemForm({ ...itemForm, backText: e.target.value })}
              />
              <label className="form-label mt-4">Ví dụ (Tùy chọn)</label>
              <textarea
                className="form-input"
                rows="2"
                value={itemForm.example}
                onChange={(e) => setItemForm({ ...itemForm, example: e.target.value })}
              ></textarea>
            </div>
            <div className="flex justify-end gap-4 pt-4 border-t">
              <button className="secondary-button" onClick={() => setShowItemModal(false)}>
                Hủy
              </button>
              <button className="primary-button" onClick={handleSaveItem}>
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FlashcardManagement;