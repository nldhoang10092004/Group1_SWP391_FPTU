import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Button,
  Spinner,
  Alert,
  Form,
  ListGroup,
  Modal,
  Badge,
  Row,
  Col,
  Accordion,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import {
  getQuizById,
  importQuizGroups,
} from "../../middleware/teacher/quizTeacherAPI";
import { getQuizById as getUserQuizById } from "../../middleware/QuizAPI";
import { uploadAsset } from "../../middleware/teacher/uploadAPI";
import { Trash2, Plus, Check, Edit2, FolderPlus } from "lucide-react";

const QuizDetail = () => {
  const { quizId, groupType } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [correctAnswersMap, setCorrectAnswersMap] = useState({});

  // Group management
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingGroupIndex, setEditingGroupIndex] = useState(null);
  const [newGroupInstruction, setNewGroupInstruction] = useState("");
  
  // Import questions to group
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(null);
  const [importQuestions, setImportQuestions] = useState([
    { content: "", options: ["", "", "", ""], correctIndex: 0, scoreWeight: 1.00 },
  ]);
  const [uploading, setUploading] = useState(false);
  
  // Asset management
  const [uploadingAsset, setUploadingAsset] = useState(false);
  const [showTextAssetModal, setShowTextAssetModal] = useState(false);
  const [textAssetContent, setTextAssetContent] = useState("");
  const [textAssetGroupIndex, setTextAssetGroupIndex] = useState(null);
  const [editingAssetIndex, setEditingAssetIndex] = useState(null);
  const [isEditingAsset, setIsEditingAsset] = useState(false);

  // Edit/Delete question
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editingQuestionGroupIndex, setEditingQuestionGroupIndex] = useState(null);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Error modal
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      setError("");

      let data;
      try {
        data = await getQuizById(quizId);
        console.log("✅ Teacher API response:", data);
      } catch (err) {
        console.log("⚠️ Teacher API failed, trying User API...");
        try {
          data = await getUserQuizById(quizId);
          console.log("✅ User API response:", data);
        } catch (err2) {
          throw err;
        }
      }

      setQuiz(data);

      let parsedGroups = [];
      
      if (data.groups && Array.isArray(data.groups) && data.groups.length > 0) {
        parsedGroups = data.groups.map(group => ({
          groupOrder: group.groupOrder || 1,
          groupType: group.groupType || 1,
          instruction: group.instruction || "",
          assets: group.assets || [],
          questions: group.questions || []
        }));
      } else if (data.questionGroups && Array.isArray(data.questionGroups)) {
        parsedGroups = data.questionGroups.map(group => ({
          groupOrder: group.groupOrder || 1,
          groupType: group.groupType || 1,
          instruction: group.instruction || "",
          assets: group.assets || [],
          questions: group.questions || []
        }));
      }

      if (parsedGroups.length === 0 && data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        parsedGroups = [{
          groupOrder: 1,
          groupType: 1,
          instruction: "Trả lời các câu hỏi sau",
          assets: [],
          questions: data.questions
        }];
      }

      if (parsedGroups.length === 0 && data.quizID) {
        console.log("⚠️ No groups found, trying startQuiz...");
        try {
          const { startQuiz } = await import("../../middleware/QuizAPI");
          const attemptData = await startQuiz(data.quizID);
          console.log("✅ StartQuiz response:", attemptData);
          
          if (attemptData.groups && Array.isArray(attemptData.groups)) {
            parsedGroups = attemptData.groups.map(group => ({
              groupOrder: group.groupOrder || 1,
              groupType: group.groupType || 1,
              instruction: group.instruction || "",
              assets: group.assets || [],
              questions: group.questions || []
            }));
          }
        } catch (startErr) {
          console.error("❌ startQuiz failed:", startErr);
        }
      }

      console.log("✅ Total groups:", parsedGroups.length);
      setGroups(parsedGroups);
    } catch (err) {
      console.error("❌ Error loading quiz:", err);
      setError(err.response?.data?.message || err.message || "Không thể tải quiz");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (quizId) {
      fetchQuiz();
      const saved = localStorage.getItem(`quiz_${quizId}_answers`);
      if (saved) {
        try {
          setCorrectAnswersMap(JSON.parse(saved));
        } catch (e) {
          console.error("Error parsing saved answers:", e);
        }
      }
    }
  }, [quizId]);

  // ==================== GROUP MANAGEMENT ====================
  // Helper function để format data theo đúng API schema
  const formatGroupsForAPI = (groupsData) => {
    return {
      groups: groupsData.map(g => ({
        groupOrder: g.groupOrder || 1,
        groupType: g.groupType || 1,
        instruction: g.instruction || "",
        assets: (g.assets || []).map(asset => ({
          assetType: asset.assetType || 0,
          url: asset.url || "",
          contentText: asset.contentText || "",
          caption: asset.caption || "",
          mimeType: asset.mimeType || ""
        })),
        questions: (g.questions || []).map((q, idx) => ({
          content: q.content || "",
          questionType: q.questionType || 1,
          questionOrder: idx + 1,
          scoreWeight: q.scoreWeight || 1.00,
          metaJson: q.metaJson || null,
          options: (q.options || []).map(opt => ({
            content: opt.content || opt || "",
            isCorrect: opt.isCorrect || false
          })),
          assets: (q.assets || []).map(asset => ({
            assetType: asset.assetType || 0,
            url: asset.url || "",
            contentText: asset.contentText || "",
            caption: asset.caption || "",
            mimeType: asset.mimeType || ""
          }))
        }))
      }))
    };
  };

  const handleSaveGroup = async () => {
    if (!newGroupInstruction.trim()) {
      alert("❌ Vui lòng nhập instruction cho group!");
      return;
    }

    try {
      setUploading(true);
      const updatedGroups = [...groups];
      
      if (editingGroupIndex !== null) {
        updatedGroups[editingGroupIndex].instruction = newGroupInstruction.trim();
      } else {
        const newGroup = {
          groupOrder: groups.length + 1,
          groupType: 1,
          instruction: newGroupInstruction.trim(),
          assets: [],
          questions: []
        };
        updatedGroups.push(newGroup);
      }

      // Format data giống code cũ
      const importData = formatGroupsForAPI(updatedGroups);

      console.log("📤 Sending to backend (Save Group):", JSON.stringify(importData, null, 2));

      await importQuizGroups(quizId, importData);
      await fetchQuiz();

      setShowGroupModal(false);
      setNewGroupInstruction("");
      setEditingGroupIndex(null);
      alert(editingGroupIndex !== null ? "✅ Đã cập nhật group!" : "✅ Đã thêm group mới!");
    } catch (err) {
      console.error("❌ Save group error:", err);
      console.error("❌ Error response:", err.response?.data);
      alert("❌ Lỗi: " + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteGroup = async (groupIndex) => {
    if (!window.confirm(`Xóa group ${groupIndex + 1}? Tất cả câu hỏi và assets trong group này sẽ bị xóa!`)) {
      return;
    }

    try {
      setUploading(true);
      const updatedGroups = groups.filter((_, idx) => idx !== groupIndex);
      
      // Re-order groups
      updatedGroups.forEach((g, idx) => { g.groupOrder = idx + 1; });

      // Format data giống code cũ
      const importData = formatGroupsForAPI(updatedGroups);

      console.log("📤 Sending to backend (Delete Group):", JSON.stringify(importData, null, 2));

      await importQuizGroups(quizId, importData);
      await fetchQuiz();
      alert("✅ Đã xóa group!");
    } catch (err) {
      console.error("❌ Delete group error:", err);
      console.error("❌ Error response:", err.response?.data);
      alert("❌ Lỗi xóa group: " + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  // ==================== ASSET MANAGEMENT ====================
  const handleAssetUpload = async (e, assetType, groupIndex) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log("📤 Uploading file:", {
      name: file.name,
      size: file.size,
      type: file.type,
      assetType: assetType,
      groupIndex: groupIndex
    });

    if (file.size > 50 * 1024 * 1024) {
      alert("❌ File quá lớn! Giới hạn 50MB");
      return;
    }

    // Map assetType (number) sang string cho API
    let typeString;
    if (assetType === 1) typeString = "audio";
    else if (assetType === 2) typeString = "image";
    else if (assetType === 5) typeString = "video";
    else {
      alert("❌ Loại asset không hỗ trợ!");
      return;
    }

    try {
      setUploadingAsset(true);

      // Upload file lên server
      const result = await uploadAsset(file, typeString, quizId, groupType);

      console.log("✅ Upload success:", result);

      // Tạo object asset mới
      const newAsset = {
        assetType: assetType,
        url: result.url,
        caption: file.name,
        mimeType: file.type,
      };

      // Cập nhật quiz state trước
      setQuiz((prev) => {
        const updatedGroups = prev?.groups ? [...prev.groups] : [...groups];
        
        // Đảm bảo group tồn tại
        if (updatedGroups[groupIndex]) {
          updatedGroups[groupIndex] = {
            ...updatedGroups[groupIndex],
            assets: [...(updatedGroups[groupIndex].assets || []), newAsset]
          };
        }

        return {
          ...prev,
          groups: updatedGroups
        };
      });

      // Sau đó gọi API để lưu vào backend
      const updatedGroups = [...groups];
      if (!updatedGroups[groupIndex].assets) {
        updatedGroups[groupIndex].assets = [];
      }
      updatedGroups[groupIndex].assets.push(newAsset);

      // Format data giống code cũ
      const importData = formatGroupsForAPI(updatedGroups);

      console.log("📤 Sending to backend (Upload Asset):", JSON.stringify(importData, null, 2));

      await importQuizGroups(quizId, importData);
      await fetchQuiz();

      alert("✅ Upload thành công!");
    } catch (err) {
      console.error("❌ Upload error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Lỗi không xác định";
      alert(`❌ Lỗi upload: ${errorMsg}`);
    } finally {
      setUploadingAsset(false);
      e.target.value = "";
    }
  };

  const handleAddTextAsset = async () => {
    if (!textAssetContent.trim()) {
      alert("❌ Vui lòng nhập nội dung text!");
      return;
    }

    try {
      setUploading(true);
      const updatedGroups = [...groups];
      const targetGroup = updatedGroups[textAssetGroupIndex];

      if (isEditingAsset && editingAssetIndex !== null) {
        targetGroup.assets[editingAssetIndex].contentText = textAssetContent.trim();
      } else {
        targetGroup.assets.push({
          assetType: 3,
          contentText: textAssetContent.trim()
        });
      }

      // Format data giống code cũ
      const importData = formatGroupsForAPI(updatedGroups);

      console.log("📤 Sending to backend (Text Asset):", JSON.stringify(importData, null, 2));

      await importQuizGroups(quizId, importData);
      await fetchQuiz();

      setShowTextAssetModal(false);
      setTextAssetContent("");
      setTextAssetGroupIndex(null);
      setIsEditingAsset(false);
      setEditingAssetIndex(null);
      alert(isEditingAsset ? "✅ Đã cập nhật text asset!" : "✅ Đã thêm text asset!");
    } catch (err) {
      console.error("❌ Text asset error:", err);
      console.error("❌ Error response:", err.response?.data);
      alert("❌ Lỗi: " + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleEditAsset = (groupIndex, assetIndex, asset) => {
    if (asset.assetType === 3) {
      setTextAssetContent(asset.contentText || "");
      setTextAssetGroupIndex(groupIndex);
      setEditingAssetIndex(assetIndex);
      setIsEditingAsset(true);
      setShowTextAssetModal(true);
    } else {
      alert("⚠️ Để sửa file (audio/image/video), vui lòng xóa và upload lại file mới.");
    }
  };

  const removeAsset = async (groupIndex, assetIndex) => {
    if (!window.confirm("Xóa asset này?")) return;

    try {
      setUploading(true);
      const updatedGroups = [...groups];
      updatedGroups[groupIndex].assets.splice(assetIndex, 1);

      // Format data giống code cũ
      const importData = formatGroupsForAPI(updatedGroups);

      console.log("📤 Sending to backend (Remove Asset):", JSON.stringify(importData, null, 2));

      await importQuizGroups(quizId, importData);
      await fetchQuiz();
      alert("✅ Đã xóa asset");
    } catch (err) {
      console.error("❌ Delete asset error:", err);
      console.error("❌ Error response:", err.response?.data);
      alert("❌ Lỗi xóa asset: " + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  // ==================== QUESTION MANAGEMENT ====================
  const addQuestion = () => {
    setImportQuestions(prev => [...prev, {
      content: "",
      options: ["", ""],
      correctIndex: 0,
      scoreWeight: 1.00,
    }]);
  };

  const removeQuestion = (index) => {
    setImportQuestions(importQuestions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...importQuestions];
    updated[index][field] = value;
    setImportQuestions(updated);
  };

  const updateOption = (qIndex, optIndex, value) => {
    const updated = [...importQuestions];
    updated[qIndex].options[optIndex] = value;
    setImportQuestions(updated);
  };

  const addOption = (qIndex) => {
    const updated = [...importQuestions];
    updated[qIndex].options.push("");
    setImportQuestions(updated);
  };

  const removeOption = (qIndex, optIndex) => {
    const updated = [...importQuestions];
    if (updated[qIndex].options.length > 2) {
      updated[qIndex].options.splice(optIndex, 1);
      if (updated[qIndex].correctIndex >= updated[qIndex].options.length) {
        updated[qIndex].correctIndex = updated[qIndex].options.length - 1;
      }
      setImportQuestions(updated);
    } else {
      alert("Phải có ít nhất 2 đáp án!");
    }
  };

  const setCorrectAnswer = (qIndex, optIndex) => {
    const updated = [...importQuestions];
    updated[qIndex].correctIndex = optIndex;
    setImportQuestions(updated);
  };

  const handleImport = async () => {
    for (let i = 0; i < importQuestions.length; i++) {
      const q = importQuestions[i];
      if (!q.content.trim()) {
        setErrorMessage(`Câu hỏi ${i + 1} chưa có nội dung!`);
        setShowErrorModal(true);
        return;
      }
      if (q.options.some(opt => !opt.trim())) {
        setErrorMessage(`Câu hỏi ${i + 1} có đáp án trống!`);
        setShowErrorModal(true);
        return;
      }
    }

    try {
      setUploading(true);
      const updatedGroups = [...groups];
      const targetGroup = updatedGroups[selectedGroupIndex];
      
      const currentQuestionCount = targetGroup.questions?.length || 0;

      const newQuestions = importQuestions.map((q, index) => ({
        questionOrder: currentQuestionCount + index + 1,
        questionType: 1,
        content: q.content.trim(),
        scoreWeight: q.scoreWeight,
        metaJson: null,
        options: q.options.map((opt, optIndex) => ({
          content: opt.trim(),
          isCorrect: optIndex === q.correctIndex,
        })),
        assets: [],
      }));

      targetGroup.questions = [...(targetGroup.questions || []), ...newQuestions];

      const importData = formatGroupsForAPI(updatedGroups);
      console.log("📤 Sending to backend (Import Questions):", JSON.stringify(importData, null, 2));

      await importQuizGroups(quizId, importData);

      const newAnswersMap = { ...correctAnswersMap };
      newQuestions.forEach((q, idx) => {
        const key = `${selectedGroupIndex}-${currentQuestionCount + idx}`;
        newAnswersMap[key] = importQuestions[idx].correctIndex;
      });
      setCorrectAnswersMap(newAnswersMap);
      localStorage.setItem(`quiz_${quizId}_answers`, JSON.stringify(newAnswersMap));

      await fetchQuiz();

      setShowImportModal(false);
      setImportQuestions([{ content: "", options: ["", "", "", ""], correctIndex: 0, scoreWeight: 1.00 }]);
      setSelectedGroupIndex(null);
      alert("✅ Thêm câu hỏi thành công!");
    } catch (err) {
      console.error("❌ Import error:", err);
      setErrorMessage("❌ Lỗi import quiz: " + (err.response?.data?.message || err.message));
      setShowErrorModal(true);
    } finally {
      setUploading(false);
    }
  };

  const handleEditQuestion = (groupIndex, questionIndex, question) => {
    const qOptions = question.options || question.choices || [];
    const correctIndex = qOptions.findIndex(opt => opt.isCorrect || opt.correct);
    
    setEditingQuestion({
      content: question.content || question.questionText || "",
      options: qOptions.map(opt => opt.content || opt.text || opt.optionText || ""),
      correctIndex: correctIndex >= 0 ? correctIndex : 0,
      scoreWeight: question.scoreWeight || question.score || 1.00,
    });
    setEditingQuestionGroupIndex(groupIndex);
    setEditingQuestionIndex(questionIndex);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingQuestion.content.trim()) {
      setErrorMessage("Câu hỏi chưa có nội dung!");
      setShowErrorModal(true);
      return;
    }
    if (editingQuestion.options.some(opt => !opt.trim())) {
      setErrorMessage("Có đáp án trống!");
      setShowErrorModal(true);
      return;
    }

    try {
      setUploading(true);
      const updatedGroups = [...groups];
      const targetGroup = updatedGroups[editingQuestionGroupIndex];

      targetGroup.questions[editingQuestionIndex] = {
        ...targetGroup.questions[editingQuestionIndex],
        content: editingQuestion.content,
        scoreWeight: editingQuestion.scoreWeight,
        options: editingQuestion.options.map((opt, optIndex) => ({
          content: opt,
          isCorrect: optIndex === editingQuestion.correctIndex,
        })),
      };

      const importData = formatGroupsForAPI(updatedGroups);
      console.log("📤 Sending to backend (Edit Question):", JSON.stringify(importData, null, 2));

      await importQuizGroups(quizId, importData);
      
      const newAnswersMap = { ...correctAnswersMap };
      const key = `${editingQuestionGroupIndex}-${editingQuestionIndex}`;
      newAnswersMap[key] = editingQuestion.correctIndex;
      setCorrectAnswersMap(newAnswersMap);
      localStorage.setItem(`quiz_${quizId}_answers`, JSON.stringify(newAnswersMap));
      
      await fetchQuiz();

      setShowEditModal(false);
      setEditingQuestion(null);
      setEditingQuestionGroupIndex(null);
      setEditingQuestionIndex(null);
      alert("✅ Cập nhật câu hỏi thành công!");
    } catch (err) {
      console.error("❌ Edit error:", err);
      setErrorMessage("❌ Lỗi cập nhật: " + (err.response?.data?.message || err.message));
      setShowErrorModal(true);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteQuestion = async () => {
    try {
      setUploading(true);
      const { groupIndex, questionIndex } = deleteTarget;

      const updatedGroups = [...groups];
      updatedGroups[groupIndex].questions.splice(questionIndex, 1);

      // Re-order questions
      updatedGroups[groupIndex].questions.forEach((q, idx) => {
        q.questionOrder = idx + 1;
      });

      const importData = formatGroupsForAPI(updatedGroups);
      console.log("📤 Sending to backend (Delete Question):", JSON.stringify(importData, null, 2));

      await importQuizGroups(quizId, importData);
      
      const newAnswersMap = { ...correctAnswersMap };
      delete newAnswersMap[`${groupIndex}-${questionIndex}`];
      setCorrectAnswersMap(newAnswersMap);
      localStorage.setItem(`quiz_${quizId}_answers`, JSON.stringify(newAnswersMap));

      await fetchQuiz();
      setShowDeleteModal(false);
      setDeleteTarget(null);
      alert("✅ Xóa câu hỏi thành công!");
    } catch (err) {
      console.error("❌ Delete error:", err);
      setErrorMessage("❌ Lỗi xóa: " + (err.response?.data?.message || err.message));
      setShowErrorModal(true);
    } finally {
      setUploading(false);
    }
  };

  // ==================== RENDER HELPERS ====================
  const renderAsset = (asset, idx) => {
    if (!asset) return null;

    const style = { maxWidth: "100%", marginBottom: "10px" };

    switch (asset.assetType) {
      case 1:
        return (
          <div key={idx}>
            <audio controls src={asset.url} style={style} className="w-100" />
          </div>
        );
      case 2:
        return (
          <div key={idx}>
            <img src={asset.url} alt={asset.caption || "Image"} style={style} className="img-fluid" />
          </div>
        );
      case 3:
        return (
          <div key={idx} className="p-3 bg-light rounded">
            <p className="mb-0" style={{ whiteSpace: "pre-wrap" }}>{asset.contentText}</p>
          </div>
        );
      case 5:
        return (
          <div key={idx}>
            <video controls src={asset.url} style={style} className="w-100" />
          </div>
        );
      default:
        return null;
    }
  };

  const getTotalQuestions = () => {
    return groups.reduce((sum, g) => sum + (g.questions?.length || 0), 0);
  };

  // ==================== MAIN RENDER ====================
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Đang tải quiz...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
        <Button variant="link" onClick={() => navigate("/teacher/dashboard")}>
          ← Quay lại Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Button
            variant="link"
            onClick={() => navigate("/teacher/dashboard")}
            className="p-0 mb-2"
          >
            ← Quay lại Dashboard
          </Button>
          <h3 className="text-primary mb-0">{quiz?.title || "Quiz Detail"}</h3>
          {quiz?.description && <p className="text-muted mt-2">{quiz.description}</p>}
          <div className="mt-2">
            <Badge bg="info" className="me-2">{groups.length} groups</Badge>
            <Badge bg="secondary">{getTotalQuestions()} câu hỏi</Badge>
          </div>
        </div>
        <Button 
          variant="success" 
          onClick={() => {
            setEditingGroupIndex(null);
            setNewGroupInstruction("");
            setShowGroupModal(true);
          }}
        >
          <FolderPlus size={18} className="me-2" />
          Thêm Group
        </Button>
      </div>

      {/* Groups List */}
      {groups.length > 0 ? (
        <Accordion defaultActiveKey="0">
          {groups.map((group, groupIdx) => (
            <Accordion.Item eventKey={groupIdx.toString()} key={groupIdx}>
              <Accordion.Header>
                <div className="d-flex justify-content-between align-items-center w-100 pe-3">
                  <div>
                    <strong>Group {groupIdx + 1}:</strong> {group.instruction}
                  </div>
                  <div>
                    <Badge bg="info" className="me-2">{group.assets?.length || 0} assets</Badge>
                    <Badge bg="secondary">{group.questions?.length || 0} câu hỏi</Badge>
                  </div>
                </div>
              </Accordion.Header>
              <Accordion.Body>
                {/* Group Actions */}
                <div className="d-flex gap-2 mb-3">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => {
                      setEditingGroupIndex(groupIdx);
                      setNewGroupInstruction(group.instruction);
                      setShowGroupModal(true);
                    }}
                  >
                    <Edit2 size={14} className="me-1" />
                    Sửa Instruction
                  </Button>
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={() => {
                      setSelectedGroupIndex(groupIdx);
                      setImportQuestions([{ content: "", options: ["", "", "", ""], correctIndex: 0, scoreWeight: 1.00 }]);
                      setShowImportModal(true);
                    }}
                  >
                    <Plus size={14} className="me-1" />
                    Thêm câu hỏi
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDeleteGroup(groupIdx)}
                  >
                    <Trash2 size={14} className="me-1" />
                    Xóa Group
                  </Button>
                </div>

                {/* Assets Section */}
                <Card className="mb-3 border-primary">
                  <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                    <strong>📎 Assets của Group này</strong>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        disabled={uploadingAsset}
                        onClick={() => document.getElementById(`audio-${groupIdx}`).click()}
                      >
                        🎵 Audio
                      </Button>
                      <input
                        id={`audio-${groupIdx}`}
                        type="file"
                        accept="audio/*"
                        hidden
                        onChange={(e) => handleAssetUpload(e, 1, groupIdx)}
                      />

                      <Button
                        variant="outline-success"
                        size="sm"
                        disabled={uploadingAsset}
                        onClick={() => document.getElementById(`image-${groupIdx}`).click()}
                      >
                        🖼️ Image
                      </Button>
                      <input
                        id={`image-${groupIdx}`}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => handleAssetUpload(e, 2, groupIdx)}
                      />

                      <Button
                        variant="outline-info"
                        size="sm"
                        disabled={uploadingAsset}
                        onClick={() => document.getElementById(`video-${groupIdx}`).click()}
                      >
                        🎬 Video
                      </Button>
                      <input
                        id={`video-${groupIdx}`}
                        type="file"
                        accept="video/*"
                        hidden
                        onChange={(e) => handleAssetUpload(e, 5, groupIdx)}
                      />

                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => {
                          setTextAssetGroupIndex(groupIdx);
                          setTextAssetContent("");
                          setIsEditingAsset(false);
                          setShowTextAssetModal(true);
                        }}
                      >
                        📝 Text
                      </Button>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    {group.assets && group.assets.length > 0 ? (
                      group.assets.map((asset, assetIdx) => (
                        <Card key={assetIdx} className="mb-3">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <Badge bg="info" style={{ fontSize: "0.9rem" }}>
                                {asset.assetType === 1 ? '🎵 Audio' : 
                                 asset.assetType === 2 ? '🖼️ Image' : 
                                 asset.assetType === 3 ? '📝 Text' : 
                                 '🎬 Video'}
                              </Badge>
                              <div className="d-flex gap-2">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => handleEditAsset(groupIdx, assetIdx, asset)}
                                >
                                  <Edit2 size={14} className="me-1" />
                                  Sửa
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => removeAsset(groupIdx, assetIdx)}
                                >
                                  <Trash2 size={14} className="me-1" />
                                  Xóa
                                </Button>
                              </div>
                            </div>
                            {renderAsset(asset, assetIdx)}
                            {asset.caption && asset.assetType !== 3 && (
                              <small className="text-muted d-block mt-2">📄 {asset.caption}</small>
                            )}
                          </Card.Body>
                        </Card>
                      ))
                    ) : (
                      <p className="text-muted text-center mb-0">Chưa có assets. Nhấn các nút bên trên để thêm.</p>
                    )}
                  </Card.Body>
                </Card>

                {/* Questions Section */}
                <h6 className="mb-3">Câu hỏi trong Group này</h6>
                {group.questions && group.questions.length > 0 ? (
                  group.questions.map((question, qIdx) => {
                    const qId = question.questionID || question.questionId || question.id;
                    const qContent = question.content || question.questionText || "";
                    const qOrder = question.questionOrder || question.order || qIdx + 1;
                    const qWeight = question.scoreWeight || question.score || 1.00;
                    const qOptions = question.options || question.choices || [];

                    return (
                      <Card key={qId || qIdx} className="mb-3 shadow-sm">
                        <Card.Body>
                          <div className="d-flex justify-content-end gap-2 mb-2">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleEditQuestion(groupIdx, qIdx, question)}
                            >
                              <Edit2 size={14} className="me-1" />
                              Sửa
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => {
                                setDeleteTarget({ groupIndex: groupIdx, questionIndex: qIdx });
                                setShowDeleteModal(true);
                              }}
                            >
                              <Trash2 size={14} className="me-1" />
                              Xóa
                            </Button>
                          </div>

                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <h6 className="mb-1">
                              <Badge bg="primary" className="me-2">
                                Câu {qOrder}
                              </Badge>
                              {qContent}
                            </h6>
                            <Badge bg="info">Điểm: {qWeight}</Badge>
                          </div>

                          {qOptions && qOptions.length > 0 && (
                            <div>
                              <p className="text-muted mb-2"><small>Các đáp án:</small></p>
                              <ListGroup>
                                {qOptions.map((opt, optIdx) => {
                                  const optContent = opt.content || opt.text || opt.optionText || "";
                                  const isCorrectFromAPI = opt.isCorrect === true || 
                                                          opt.correct === true || 
                                                          opt.isCorrect === 1 ||
                                                          opt.correct === 1;
                                  
                                  const key = `${groupIdx}-${qIdx}`;
                                  const isCorrectFromLocal = correctAnswersMap[key] === optIdx;
                                  const isCorrect = isCorrectFromAPI || isCorrectFromLocal;
                                  
                                  return (
                                    <ListGroup.Item
                                      key={opt.optionID || opt.optionId || optIdx}
                                      variant={isCorrect ? "success" : ""}
                                      className="d-flex align-items-center"
                                      style={isCorrect ? { 
                                        backgroundColor: '#d1e7dd', 
                                        borderColor: '#badbcc' 
                                      } : {}}
                                    >
                                      {isCorrect && (
                                        <Check size={18} className="me-2 text-success fw-bold" />
                                      )}
                                      <span className="me-2 fw-bold">
                                        {String.fromCharCode(65 + optIdx)}.
                                      </span>
                                      <span className={isCorrect ? "fw-bold text-success" : ""}>
                                        {optContent}
                                      </span>
                                      {isCorrect && (
                                        <Badge bg="success" className="ms-auto">✓ Đáp án đúng</Badge>
                                      )}
                                    </ListGroup.Item>
                                  );
                                })}
                              </ListGroup>
                            </div>
                          )}
                        </Card.Body>
                      </Card>
                    );
                  })
                ) : (
                  <Alert variant="info" className="text-center">
                    <p className="mb-0">Group này chưa có câu hỏi. Nhấn nút "Thêm câu hỏi" bên trên để thêm.</p>
                  </Alert>
                )}
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      ) : (
        <Card className="text-center py-5">
          <Card.Body>
            <Alert variant="info" className="mb-3">
              <strong>ℹ️ Quiz chưa có group nào</strong>
              <p className="mb-0 mt-2">
                Bạn cần tạo ít nhất 1 group để thêm câu hỏi và assets vào quiz.
              </p>
            </Alert>
            <Button 
              variant="primary" 
              onClick={() => {
                setEditingGroupIndex(null);
                setNewGroupInstruction("");
                setShowGroupModal(true);
              }}
            >
              <FolderPlus size={18} className="me-2" />
              Tạo Group đầu tiên
            </Button>
          </Card.Body>
        </Card>
      )}

      {/* ==================== MODALS ==================== */}
      
      {/* Add/Edit Group Modal */}
      <Modal show={showGroupModal} onHide={() => setShowGroupModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingGroupIndex !== null ? "✏️ Sửa Group" : "📁 Thêm Group Mới"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Instruction (Hướng dẫn cho group)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="VD: Listen to the audio and answer the questions below"
              value={newGroupInstruction}
              onChange={(e) => setNewGroupInstruction(e.target.value)}
            />
            <Form.Text className="text-muted">
              Instruction này sẽ hiển thị cho tất cả câu hỏi trong group
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowGroupModal(false)} disabled={uploading}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSaveGroup} disabled={uploading}>
            {uploading ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Đang lưu...
              </>
            ) : (
              editingGroupIndex !== null ? "Lưu thay đổi" : "Tạo Group"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Import Questions Modal */}
      <Modal
        show={showImportModal}
        onHide={() => setShowImportModal(false)}
        size="xl"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            📝 Thêm câu hỏi vào Group {selectedGroupIndex !== null ? selectedGroupIndex + 1 : ""}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {selectedGroupIndex !== null && groups[selectedGroupIndex] && (
            <Alert variant="info" className="mb-4">
              <strong>📁 Group Instruction:</strong> {groups[selectedGroupIndex].instruction}
            </Alert>
          )}

          <h6 className="mb-3">Câu hỏi</h6>
          {importQuestions.map((q, qIndex) => (
            <Card key={qIndex} className="mb-3">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <strong>Câu {qIndex + 1}</strong>
                {importQuestions.length > 1 && (
                  <Button
                    variant="link"
                    size="sm"
                    className="text-danger p-0"
                    onClick={() => removeQuestion(qIndex)}
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Nội dung câu hỏi</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Nhập câu hỏi..."
                    value={q.content}
                    onChange={(e) => updateQuestion(qIndex, "content", e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Điểm số</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={q.scoreWeight}
                    onChange={(e) =>
                      updateQuestion(qIndex, "scoreWeight", parseInt(e.target.value))
                    }
                    style={{ width: "100px" }}
                  />
                </Form.Group>

                <Form.Label>Các đáp án</Form.Label>
                {q.options.map((opt, optIndex) => (
                  <Row key={optIndex} className="mb-2 align-items-center">
                    <Col xs={1}>
                      <Form.Check
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={q.correctIndex === optIndex}
                        onChange={() => setCorrectAnswer(qIndex, optIndex)}
                        title="Đáp án đúng"
                      />
                    </Col>
                    <Col xs={1} className="text-center">
                      <strong>{String.fromCharCode(65 + optIndex)}.</strong>
                    </Col>
                    <Col xs={9}>
                      <Form.Control
                        type="text"
                        placeholder={`Đáp án ${String.fromCharCode(65 + optIndex)}`}
                        value={opt}
                        onChange={(e) =>
                          updateOption(qIndex, optIndex, e.target.value)
                        }
                      />
                    </Col>
                    <Col xs={1}>
                      {q.options.length > 2 && (
                        <Button
                          variant="link"
                          size="sm"
                          className="text-danger p-0"
                          onClick={() => removeOption(qIndex, optIndex)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </Col>
                  </Row>
                ))}
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => addOption(qIndex)}
                >
                  <Plus size={16} className="me-1" />
                  Thêm đáp án
                </Button>
              </Card.Body>
            </Card>
          ))}

          <Button variant="outline-primary" onClick={addQuestion} className="w-100">
            <Plus size={18} className="me-2" />
            Thêm câu hỏi
          </Button>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowImportModal(false)}
            disabled={uploading}
          >
            Hủy
          </Button>
          <Button variant="primary" onClick={handleImport} disabled={uploading}>
            {uploading ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Đang lưu...
              </>
            ) : (
              <>Lưu {importQuestions.length} câu hỏi</>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Question Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>✏️ Chỉnh sửa câu hỏi</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingQuestion && (
            <div>
              <Form.Group className="mb-3">
                <Form.Label>Nội dung câu hỏi</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Nhập câu hỏi..."
                  value={editingQuestion.content}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, content: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Điểm số</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  value={editingQuestion.scoreWeight}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      scoreWeight: parseInt(e.target.value),
                    })
                  }
                  style={{ width: "100px" }}
                />
              </Form.Group>

              <Form.Label>Các đáp án</Form.Label>
              {editingQuestion.options.map((opt, optIndex) => (
                <Row key={optIndex} className="mb-2 align-items-center">
                  <Col xs={1}>
                    <Form.Check
                      type="radio"
                      name="correct-edit"
                      checked={editingQuestion.correctIndex === optIndex}
                      onChange={() =>
                        setEditingQuestion({
                          ...editingQuestion,
                          correctIndex: optIndex,
                        })
                      }
                      title="Đáp án đúng"
                    />
                  </Col>
                  <Col xs={1} className="text-center">
                    <strong>{String.fromCharCode(65 + optIndex)}.</strong>
                  </Col>
                  <Col xs={9}>
                    <Form.Control
                      type="text"
                      placeholder={`Đáp án ${String.fromCharCode(65 + optIndex)}`}
                      value={opt}
                      onChange={(e) => {
                        const newOptions = [...editingQuestion.options];
                        newOptions[optIndex] = e.target.value;
                        setEditingQuestion({
                          ...editingQuestion,
                          options: newOptions,
                        });
                      }}
                    />
                  </Col>
                  <Col xs={1}>
                    {editingQuestion.options.length > 2 && (
                      <Button
                        variant="link"
                        size="sm"
                        className="text-danger p-0"
                        onClick={() => {
                          if (editingQuestion.options.length > 2) {
                            const newOptions = editingQuestion.options.filter(
                              (_, i) => i !== optIndex
                            );
                            const newCorrectIndex =
                              editingQuestion.correctIndex >= newOptions.length
                                ? newOptions.length - 1
                                : editingQuestion.correctIndex;
                            setEditingQuestion({
                              ...editingQuestion,
                              options: newOptions,
                              correctIndex: newCorrectIndex,
                            });
                          }
                        }}
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </Col>
                </Row>
              ))}
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() =>
                  setEditingQuestion({
                    ...editingQuestion,
                    options: [...editingQuestion.options, ""],
                  })
                }
              >
                <Plus size={16} className="me-1" />
                Thêm đáp án
              </Button>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowEditModal(false)}
            disabled={uploading}
          >
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSaveEdit} disabled={uploading}>
            {uploading ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Đang lưu...
              </>
            ) : (
              "Lưu thay đổi"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Question Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>⚠️ Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            Bạn có chắc chắn muốn xóa câu hỏi này?
            <br />
            <strong>Hành động này không thể hoàn tác!</strong>
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={uploading}
          >
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDeleteQuestion} disabled={uploading}>
            {uploading ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Đang xóa...
              </>
            ) : (
              "Xóa câu hỏi"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Text Asset Modal */}
      <Modal 
        show={showTextAssetModal} 
        onHide={() => {
          setShowTextAssetModal(false);
          setTextAssetContent("");
          setTextAssetGroupIndex(null);
          setIsEditingAsset(false);
          setEditingAssetIndex(null);
        }} 
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditingAsset ? "✏️ Sửa Text Asset" : "📝 Thêm Text Asset"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Nội dung Text (ví dụ: đoạn văn cho bài đọc)</Form.Label>
            <Form.Control
              as="textarea"
              rows={12}
              placeholder="Nhập nội dung text tại đây..."
              value={textAssetContent}
              onChange={(e) => setTextAssetContent(e.target.value)}
              style={{ fontSize: "14px" }}
            />
            <Form.Text className="text-muted">
              Text này sẽ hiển thị cho tất cả câu hỏi trong group
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => {
              setShowTextAssetModal(false);
              setTextAssetContent("");
              setTextAssetGroupIndex(null);
              setIsEditingAsset(false);
              setEditingAssetIndex(null);
            }}
            disabled={uploading}
          >
            Hủy
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAddTextAsset}
            disabled={!textAssetContent.trim() || uploading}
          >
            {uploading ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Đang lưu...
              </>
            ) : (
              isEditingAsset ? "Cập nhật" : "Thêm Text Asset"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Error Modal */}
      <Modal show={showErrorModal} onHide={() => setShowErrorModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>❌ Lỗi</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger" className="mb-0">
            {errorMessage}
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowErrorModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default QuizDetail;