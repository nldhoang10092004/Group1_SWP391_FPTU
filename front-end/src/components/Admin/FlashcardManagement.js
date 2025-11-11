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
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";

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

  // 🟢 Load danh sách set
  const loadSets = async () => {
    try {
      setLoading(true);
      const data = await getPublicSets();
      if (data) setSets(data);
    } catch (err) {
      Swal.fire("Lỗi tải dữ liệu", `${err?.message || err}`, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSets();
  }, []);

  // 🟡 Chọn 1 set để xem chi tiết
  const handleSelectSet = async (setId) => {
    try {
      const detail = await getFlashcardSet(setId);
      setSelectedSet(detail);
    } catch (err) {
      Swal.fire("Không thể tải chi tiết", err?.message || err, "error");
    }
  };

  // ➕ Mở modal tạo hoặc sửa Set
  const handleOpenSetModal = (set = null) => {
    if (set) setSetForm({ ...set });
    else setSetForm({ title: "", description: "" });
    setShowSetModal(true);
  };

  // 💾 Lưu Set (thêm hoặc sửa)
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

  // 🗑️ Xóa Set
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

  // ➕ Mở modal thêm/sửa Item
  const handleOpenItemModal = (item = null, setID = null) => {
    if (item)
      // backend trả frontText/backText/example/itemID
      setItemForm({
        frontText: item.frontText ?? "",
        backText: item.backText ?? "",
        example: item.example ?? "",
        itemID: item.itemID, // nếu sửa
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

  // 💾 Lưu Item
  const handleSaveItem = async () => {
    if (!itemForm.frontText || !itemForm.backText) {
      Swal.fire("Thiếu dữ liệu", "Vui lòng nhập Thuật ngữ và Nghĩa của nó", "warning");
      return;
    }

    try {
      // payload gửi đúng keys mà backend mong đợi
      const payload = {
        setID: itemForm.setID,
        frontText: itemForm.frontText,
        backText: itemForm.backText,
        example: itemForm.example ?? null,
      };

      if (itemForm.itemID) {
        // update: một số API cập nhật require body giống create; nếu backend cần khác bạn điều chỉnh
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

  // 🗑️ Xóa Item
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

  // 🚨 Xử lý lỗi API (403, 404, 500...)
  const handleApiError = (err) => {
    if (!err?.response) {
      Swal.fire("Lỗi kết nối", err?.message || "Unknown error", "error");
      return;
    }

    const { status, data } = err.response;
    let msg = data?.message || "Đã xảy ra lỗi không xác định.";

    if (status === 403) msg = "Bạn không có quyền truy cập tài nguyên này (403).";
    else if (status === 404) msg = "Không tìm thấy tài nguyên (404).";
    else if (status === 500) msg = "Lỗi máy chủ (500).";

    Swal.fire(`Lỗi ${status}`, msg, "error");
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Button onClick={() => handleOpenSetModal()}>+ Thêm Flashcard Set</Button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      )}

      {/* Danh sách Set */}
      {!loading && (
        <div className="row">
          {sets.length > 0 ? (
            sets.map((set) => (
              <div key={set.setID} className="col-md-4 mb-3">
                <div className="card shadow-sm p-3 h-100">
                  <h5>{set.title}</h5>
                  <p>{set.description}</p>
                  <div className="d-flex gap-2 mt-auto">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleSelectSet(set.setID)}
                    >
                      Xem
                    </Button>
                    <Button size="sm" onClick={() => handleOpenSetModal(set)}>
                      Sửa
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeleteSet(set.setID)}
                    >
                      Xóa
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted py-5">
              Không có Flashcard Set nào.
            </div>
          )}
        </div>
      )}

      {/* Chi tiết Set */}
      {selectedSet && (
        <div className="mt-4">
          <h4>📗 {selectedSet.title}</h4>
          <p>{selectedSet.description}</p>
          <Button onClick={() => handleOpenItemModal(null, selectedSet.setID)}>
            + Thêm Item
          </Button>

          <ul className="list-group mt-3">
            {selectedSet.items?.map((item) => (
              <li
                key={item.itemID}
                className="list-group-item d-flex justify-content-between align-items-start"
              >
                <div>
                  <div>
                    <strong style={{ fontSize: 16 }}>{item.frontText}</strong> —{" "}
                    <span style={{ fontSize: 15 }}>{item.backText}</span>
                  </div>
                  {item.example ? (
                    <div style={{ fontSize: 13, color: "#666", marginTop: 6 }}>
                      Ví dụ: {item.example}
                    </div>
                  ) : null}
                </div>

                <div>
                  <Button
                    size="sm"
                    className="me-2"
                    onClick={() => handleOpenItemModal(item, selectedSet.setID)}
                  >
                    Sửa
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() =>
                      handleDeleteItem(item.itemID, selectedSet.setID)
                    }
                  >
                    Xóa
                  </Button>
                </div>
              </li>
            ))}
            {selectedSet.items?.length === 0 && (
              <li className="list-group-item text-muted">Chưa có Item nào.</li>
            )}
          </ul>
        </div>
      )}

      {/* Modal Set */}
      <Modal show={showSetModal} onHide={() => setShowSetModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {setForm.setID ? "Sửa Flashcard Set" : "Thêm Flashcard Set"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tiêu đề</Form.Label>
              <Form.Control
                value={setForm.title}
                onChange={(e) =>
                  setSetForm({ ...setForm, title: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                value={setForm.description}
                onChange={(e) =>
                  setSetForm({ ...setForm, description: e.target.value })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSetModal(false)}>
            Hủy
          </Button>
          <Button onClick={handleSaveSet}>Lưu</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Item */}
      <Modal show={showItemModal} onHide={() => setShowItemModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {itemForm.itemID ? "Sửa Flashcard Item" : "Thêm Flashcard Item"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Thuật ngữ (Front Text)</Form.Label>
              <Form.Control
                value={itemForm.frontText}
                onChange={(e) =>
                  setItemForm({ ...itemForm, frontText: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Định nghĩa (Back Text)</Form.Label>
              <Form.Control
                value={itemForm.backText}
                onChange={(e) =>
                  setItemForm({ ...itemForm, backText: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Ví dụ (Example)</Form.Label>
              <Form.Control
                value={itemForm.example}
                onChange={(e) =>
                  setItemForm({ ...itemForm, example: e.target.value })
                }
                placeholder="(tùy chọn) Ví dụ minh họa"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowItemModal(false)}>
            Hủy
          </Button>
          <Button onClick={handleSaveItem}>Lưu</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default FlashcardManagement;
