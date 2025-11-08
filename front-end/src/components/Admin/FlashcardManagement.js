import { useState, useEffect } from "react";
import { Plus, Trash, Edit, ChevronRight, BookOpen } from "lucide-react";
import {
  getFlashcardSets,
  createFlashcardSet,
  updateFlashcardSet,
  deleteFlashcardSet,
  getFlashcardSetById,
  createFlashcardItem,
  updateFlashcardItem,
  deleteFlashcardItem,
} from "../../middleware/flashcardAPI";
import "./management-styles.scss";

export function FlashcardManagement() {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSet, setSelectedSet] = useState(null);

  const [showSetModal, setShowSetModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);

  const [setForm, setSetForm] = useState({
    id: null,
    title: "",
    description: "",
  });
  const [itemForm, setItemForm] = useState({
    id: null,
    frontText: "",
    backText: "",
    example: "",
    setID: null,
  });

  // 🟢 Load danh sách set
  const loadSets = async () => {
    try {
      setLoading(true);
      const data = await getFlashcardSets();
      setSets(data);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSets();
  }, []);

  // 🟡 Chọn 1 set để xem chi tiết
  const handleSelectSet = async (setId) => {
    if (selectedSet && selectedSet.id === setId) {
      setSelectedSet(null); // Toggle off if already selected
      return;
    }
    try {
      const setData = await getFlashcardSetById(setId);
      setSelectedSet(setData);
    } catch (err) {
      handleApiError(err);
    }
  };

  // ➕ Mở modal tạo hoặc sửa Set
  const handleOpenSetModal = (set = null) => {
    setSetForm(
      set
        ? { id: set.id, title: set.title, description: set.description }
        : { id: null, title: "", description: "" }
    );
    setShowSetModal(true);
  };

  // 💾 Lưu Set (thêm hoặc sửa)
  const handleSaveSet = async () => {
    try {
      if (setForm.id) {
        await updateFlashcardSet(setForm.id, {
          title: setForm.title,
          description: setForm.description,
        });
      } else {
        await createFlashcardSet({ title: setForm.title, description: setForm.description });
      }
      setShowSetModal(false);
      loadSets();
    } catch (err) {
      handleApiError(err);
    }
  };

  // 🗑️ Xóa Set
  const handleDeleteSet = async (setId) => {
    if (
      window.confirm(
        "Bạn có chắc muốn xóa bộ flashcard này? Mọi thẻ trong bộ cũng sẽ bị xóa."
      )
    ) {
      try {
        await deleteFlashcardSet(setId);
        setSets(sets.filter((s) => s.id !== setId));
        if (selectedSet && selectedSet.id === setId) {
          setSelectedSet(null);
        }
      } catch (err) {
        handleApiError(err);
      }
    }
  };

  // ➕ Mở modal thêm/sửa Item
  const handleOpenItemModal = (item = null, setID) => {
    setItemForm(item ? { ...item } : { id: null, frontText: "", backText: "", example: "", setID });
    setShowItemModal(true);
  };

  // 💾 Lưu Item
  const handleSaveItem = async () => {
    try {
      const payload = { ...itemForm };
      if (itemForm.id) {
        await updateFlashcardItem(itemForm.id, payload);
      } else {
        await createFlashcardItem(payload);
      }
      setShowItemModal(false);
      if (selectedSet) {
        handleSelectSet(selectedSet.id);
      }
    } catch (err) {
      handleApiError(err);
    }
  };

  // 🗑️ Xóa Item
  const handleDeleteItem = async (itemId) => {
    if (window.confirm("Bạn có chắc muốn xóa thẻ này?")) {
      try {
        await deleteFlashcardItem(itemId);
        if (selectedSet) {
          handleSelectSet(selectedSet.id); // Refresh set
        }
      } catch (err) {
        handleApiError(err);
      }
    }
  };

  // 🚨 Xử lý lỗi API (403, 404, 500...)
  const handleApiError = (err) => {
    console.error("API Error:", err);
    alert("Đã xảy ra lỗi. Vui lòng thử lại.");
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Button onClick={() => handleOpenSetModal()}>+ Thêm Flashcard Set</Button>
      </div>
    );
  }

  return (
    <div className="management-page-container">
      {/* Set Modal */}
      {showSetModal && (
        <div
          className="management-modal-overlay"
          onClick={() => setShowSetModal(false)}
        >
          <div
            className="management-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="card-title mb-6">
              {setForm.id ? "Chỉnh sửa bộ" : "Tạo bộ flashcard mới"}
            </h3>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Tiêu đề bộ"
                value={setForm.title}
                onChange={(e) =>
                  setSetForm({ ...setForm, title: e.target.value })
                }
                className="form-input"
              />
              <textarea
                placeholder="Mô tả"
                value={setForm.description}
                onChange={(e) =>
                  setSetForm({ ...setForm, description: e.target.value })
                }
                className="form-input"
                rows="3"
              ></textarea>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setShowSetModal(false)}
                  className="secondary-button"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveSet}
                  className="primary-button"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Item Modal */}
      {showItemModal && (
        <div
          className="management-modal-overlay"
          onClick={() => setShowItemModal(false)}
        >
          <div
            className="management-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="card-title mb-6">
              {itemForm.id ? "Chỉnh sửa thẻ" : "Tạo thẻ mới"}
            </h3>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Mặt trước"
                value={itemForm.frontText}
                onChange={(e) =>
                  setItemForm({ ...itemForm, frontText: e.target.value })
                }
                className="form-input"
              />
              <input
                type="text"
                placeholder="Mặt sau"
                value={itemForm.backText}
                onChange={(e) =>
                  setItemForm({ ...itemForm, backText: e.target.value })
                }
                className="form-input"
              />
              <textarea
                placeholder="Ví dụ (không bắt buộc)"
                value={itemForm.example}
                onChange={(e) =>
                  setItemForm({ ...itemForm, example: e.target.value })
                }
                className="form-input"
                rows="2"
              ></textarea>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setShowItemModal(false)}
                  className="secondary-button"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveItem}
                  className="primary-button"
                >
                  Lưu thẻ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Sets List */}
        <div className="lg:col-span-1 management-card">
          <div className="management-card-header flex justify-between items-center">
            <div>
              <h2 className="card-title">Bộ Flashcard</h2>
              <p className="card-description">Tổng số: {sets.length} bộ</p>
            </div>
            <button
              onClick={() => handleOpenSetModal()}
              className="primary-button flex items-center gap-2"
            >
              <Plus size={18} />
              Tạo bộ
            </button>
          </div>
          <ul className="space-y-2">
            {sets.map((set) => (
              <li
                key={set.id}
                onClick={() => handleSelectSet(set.id)}
                className={`p-4 rounded-lg cursor-pointer transition-all duration-200 flex justify-between items-center
                  ${
                    selectedSet?.id === set.id
                      ? "bg-blue-100 shadow-md"
                      : "hover:bg-gray-100"
                  }`}
              >
                <div>
                  <h4 className="font-bold text-gray-800">{set.title}</h4>
                  <p className="text-sm text-gray-500">{set.description}</p>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </li>
            ))}
          </ul>
        </div>

        {/* Right Column: Items List */}
        <div className="lg:col-span-2 management-card">
          <div className="management-card-header">
            {selectedSet ? (
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="card-title">{selectedSet.title}</h2>
                  <p className="card-description">
                    Tổng số: {selectedSet.items?.length || 0} thẻ
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenItemModal(null, selectedSet.id)}
                    className="primary-button flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Thêm thẻ
                  </button>
                  <button
                    onClick={() => handleOpenSetModal(selectedSet)}
                    className="action-button"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteSet(selectedSet.id)}
                    className="action-button delete-button"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen size={48} className="mx-auto text-gray-300" />
                <h3 className="mt-4 text-lg font-semibold text-gray-600">
                  Chọn một bộ để xem chi tiết
                </h3>
                <p className="text-gray-400">
                  Các thẻ trong bộ sẽ được hiển thị tại đây.
                </p>
              </div>
            )}
          </div>
          {selectedSet && (
            <table className="management-table">
              <thead>
                <tr>
                  <th>Mặt trước</th>
                  <th>Mặt sau</th>
                  <th>Ví dụ</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {(selectedSet.items || []).map((item) => (
                  <tr key={item.id}>
                    <td className="font-semibold">{item.frontText}</td>
                    <td>{item.backText}</td>
                    <td className="italic text-gray-500">{item.example}</td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenItemModal(item, selectedSet.id)}
                          className="action-button"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="action-button delete-button"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default FlashcardManagement;
