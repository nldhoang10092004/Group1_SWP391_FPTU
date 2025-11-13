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
  Toast,
  ToastContainer,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import {
  getQuizById,
  updateQuizGroup,
  deleteAsset,
  createGroupAsset
} from "../../middleware/teacher/quizTeacherAPI";

import {
  createGroupWithQuestions,
  addQuestionsToGroup,
  updateQuestionWithOptions,
  deleteGroupCompletely,
  deleteQuestionCompletely,
} from "../../middleware/teacher/quizHelper";
import { getQuizById as getUserQuizById } from "../../middleware/QuizAPI";
import { uploadAsset } from "../../middleware/teacher/uploadAPI";
import { 
  generateAIQuiz, 
  parseAIQuizResponse, 
  convertAIQuestionsToImportFormat 
} from "../../middleware/teacher/aiQuizAPI";
import { Trash2, Plus, Check, Edit2, FolderPlus, Sparkles } from "lucide-react";

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
  
  // AI Quiz Generator
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSelectedGroupIndex, setAiSelectedGroupIndex] = useState(null);
  
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

  // Toast notifications
  const [toasts, setToasts] = useState([]);
  
  // Confirmation modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    title: "",
    message: "",
    onConfirm: null,
    variant: "danger"
  });

  const addToast = (message, variant = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const showConfirm = (title, message, onConfirm, variant = "danger") => {
    setConfirmConfig({ title, message, onConfirm, variant });
    setShowConfirmModal(true);
  };

  const handleConfirm = () => {
    if (confirmConfig.onConfirm) {
      confirmConfig.onConfirm();
    }
    setShowConfirmModal(false);
  };

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

  // ==================== AI QUIZ GENERATOR ====================
  const handleGenerateAIQuiz = async () => {
  if (!aiPrompt.trim()) {
    setErrorMessage("❌ Vui lòng nhập prompt cho AI!");
    setShowErrorModal(true);
    return;
  }
  if (aiSelectedGroupIndex === null) {
    setErrorMessage("❌ Vui lòng chọn group để thêm câu hỏi!");
    setShowErrorModal(true);
    return;
  }

  try {
    setAiLoading(true);
    const aiResponse = await generateAIQuiz(aiPrompt);
    
    if (aiResponse.error) throw new Error(aiResponse.error);

    const parsedQuiz = parseAIQuizResponse(aiResponse);
    if (!parsedQuiz.questions?.length) {
      throw new Error("AI không tạo được câu hỏi. Vui lòng thử prompt khác.");
    }

    const convertedQuestions = convertAIQuestionsToImportFormat(parsedQuiz.questions);
    const group = groups[aiSelectedGroupIndex];

    if (!group.groupID) {
      throw new Error("Group ID not found");
    }

    const currentCount = group.questions?.length || 0;

    // Format questions cho API
    const questionsToAdd = convertedQuestions.map((q, i) => ({
      content: q.content,
      questionType: q.questionType || 1,
      questionOrder: currentCount + i + 1,
      scoreWeight: q.scoreWeight,
      metaJson: null,
      options: q.options.map((opt, idx) => ({
        content: opt,
        isCorrect: idx === q.correctIndex,
      })),
      assets: [],
    }));

    // Thêm câu hỏi vào group
    await addQuestionsToGroup(group.groupID, questionsToAdd);

    // Lưu đáp án đúng
    const newAnswersMap = { ...correctAnswersMap };
    convertedQuestions.forEach((q, i) => {
      newAnswersMap[`${aiSelectedGroupIndex}-${currentCount + i}`] = q.correctIndex;
    });
    setCorrectAnswersMap(newAnswersMap);
    localStorage.setItem(`quiz_${quizId}_answers`, JSON.stringify(newAnswersMap));

    await fetchQuiz();
    setShowAIModal(false);
    setAiPrompt("");
    setAiSelectedGroupIndex(null);
    addToast(`AI đã tạo ${convertedQuestions.length} câu hỏi!`, "success");
  } catch (err) {
    setErrorMessage("❌ " + err.message);
    setShowErrorModal(true);
  } finally {
    setAiLoading(false);
  }
};

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

  // ✅ Cập nhật handleSaveGroup - Tạo hoặc cập nhật group
const handleSaveGroup = async () => {
  if (!newGroupInstruction.trim()) {
    addToast("❌ Vui lòng nhập instruction cho group!", "danger");
    return;
  }

  try {
    setUploading(true);
    
    if (editingGroupIndex !== null) {
      // CẬP NHẬT group có sẵn
      const group = groups[editingGroupIndex];
      
      if (!group.groupID) {
        throw new Error("Group ID not found");
      }

      await updateQuizGroup(group.groupID, {
        instruction: newGroupInstruction.trim(),
        groupType: group.groupType || 1,
        groupOrder: group.groupOrder || editingGroupIndex + 1,
      });

      addToast("Đã cập nhật group!", "success");
    } else {
      // TẠO MỚI group
      await createGroupWithQuestions(quizId, {
        instruction: newGroupInstruction.trim(),
        groupType: 1,
        groupOrder: groups.length + 1,
        questions: [],
        assets: [],
      });

      addToast("Đã thêm group mới!", "success");
    }

    await fetchQuiz();
    setShowGroupModal(false);
    setNewGroupInstruction("");
    setEditingGroupIndex(null);
  } catch (err) {
    console.error("❌ Save group error:", err);
    addToast("❌ Lỗi: " + (err.response?.data?.message || err.message), "danger");
  } finally {
    setUploading(false);
  }
};

  // ✅ Cập nhật handleDeleteGroup - Xóa group hoàn toàn
const handleDeleteGroup = async (groupIndex) => {
  const group = groups[groupIndex];
  
  if (!group.groupID) {
    addToast("❌ Group ID không hợp lệ!", "danger");
    return;
  }

  showConfirm(
    "⚠️ Xác nhận xóa Group",
    `Xóa group ${groupIndex + 1}? Tất cả câu hỏi và assets trong group này sẽ bị xóa!`,
    async () => {
      try {
        setUploading(true);
        
        // Xóa group và tất cả dữ liệu liên quan
        await deleteGroupCompletely(group.groupID, group);
        
        await fetchQuiz();
        addToast("Đã xóa group!", "success");
      } catch (err) {
        console.error("❌ Delete group error:", err);
        addToast("❌ Lỗi xóa group: " + (err.response?.data?.message || err.message), "danger");
      } finally {
        setUploading(false);
      }
    }
  );
};

  // ==================== ASSET MANAGEMENT ====================
  const handleAssetUpload = async (e, assetType, groupIndex) => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > 50 * 1024 * 1024) {
    addToast("❌ File quá lớn! Giới hạn 50MB", "danger");
    return;
  }

  let typeString;
  if (assetType === 1) typeString = "audio";
  else if (assetType === 2) typeString = "image";
  else if (assetType === 5) typeString = "video";
  else {
    addToast("❌ Loại asset không hỗ trợ!", "danger");
    return;
  }

  try {
    setUploadingAsset(true);

    // Upload file
    const result = await uploadAsset(file, typeString, quizId, groupType);
    console.log("Upload success:", result);

    const group = groups[groupIndex];
    if (!group.groupID) {
      throw new Error("Group ID not found");
    }

    // Tạo asset mới qua API
    await createGroupAsset(group.groupID, {
      assetType: assetType,
      url: result.url,
      caption: file.name,
      mimeType: file.type,
      contentText: "",
    });

    await fetchQuiz();
    addToast("Upload thành công!", "success");
  } catch (err) {
    console.error("❌ Upload error:", err);
    const errorMsg = err.response?.data?.message || err.message || "Lỗi không xác định";
    addToast(`❌ Lỗi upload: ${errorMsg}`, "danger");
  } finally {
    setUploadingAsset(false);
    e.target.value = "";
  }
};

  const handleAddTextAsset = async () => {
  if (!textAssetContent.trim()) {
    addToast("❌ Vui lòng nhập nội dung text!", "danger");
    return;
  }

  try {
    setUploading(true);
    const group = groups[textAssetGroupIndex];

    if (!group.groupID) {
      throw new Error("Group ID not found");
    }

    if (isEditingAsset && editingAssetIndex !== null) {
      // CẬP NHẬT text asset (cần xóa và tạo mới vì API không có update asset)
      const oldAsset = group.assets[editingAssetIndex];
      if (oldAsset.assetID) {
        await deleteAsset(oldAsset.assetID);
      }
    }

    // Tạo text asset mới
    await createGroupAsset(group.groupID, {
      assetType: 3,
      url: "",
      contentText: textAssetContent.trim(),
      caption: "",
      mimeType: "",
    });

    await fetchQuiz();
    setShowTextAssetModal(false);
    setTextAssetContent("");
    setTextAssetGroupIndex(null);
    setIsEditingAsset(false);
    setEditingAssetIndex(null);
    addToast(isEditingAsset ? "Đã cập nhật text asset!" : "Đã thêm text asset!", "success");
  } catch (err) {
    console.error("❌ Text asset error:", err);
    addToast("❌ Lỗi: " + (err.response?.data?.message || err.message), "danger");
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
      addToast("⚠️ Để sửa file (audio/image/video), vui lòng xóa và upload lại file mới.", "warning");
    }
  };

  const removeAsset = async (groupIndex, assetIndex) => {
  const group = groups[groupIndex];
  const asset = group.assets[assetIndex];

  if (!asset.assetID) {
    addToast("❌ Asset ID không hợp lệ!", "danger");
    return;
  }

  showConfirm(
    "⚠️ Xác nhận xóa Asset",
    "Bạn có chắc chắn muốn xóa asset này?",
    async () => {
      try {
        setUploading(true);
        await deleteAsset(asset.assetID);
        await fetchQuiz();
        addToast("Đã xóa asset", "success");
      } catch (err) {
        console.error("❌ Delete asset error:", err);
        addToast("❌ Lỗi xóa asset: " + (err.response?.data?.message || err.message), "danger");
      } finally {
        setUploading(false);
      }
    }
  );
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
      addToast("Phải có ít nhất 2 đáp án!", "warning");
    }
  };

  const setCorrectAnswer = (qIndex, optIndex) => {
    const updated = [...importQuestions];
    updated[qIndex].correctIndex = optIndex;
    setImportQuestions(updated);
  };

  // ✅ Cập nhật handleImport - Thêm câu hỏi mới vào group
const handleImport = async () => {
  // Validate
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
    const group = groups[selectedGroupIndex];

    if (!group.groupID) {
      throw new Error("Group ID not found");
    }

    const currentQuestionCount = group.questions?.length || 0;

    // Format questions cho API
    const questionsToAdd = importQuestions.map((q, index) => ({
      content: q.content.trim(),
      questionType: 1,
      questionOrder: currentQuestionCount + index + 1,
      scoreWeight: q.scoreWeight || 1.0,
      metaJson: null,
      options: q.options.map((opt, optIndex) => ({
        content: opt.trim(),
        isCorrect: optIndex === q.correctIndex,
      })),
      assets: [],
    }));

    // Gọi helper để thêm câu hỏi
    await addQuestionsToGroup(group.groupID, questionsToAdd);

    // Lưu đáp án đúng vào localStorage
    const newAnswersMap = { ...correctAnswersMap };
    questionsToAdd.forEach((q, idx) => {
      const key = `${selectedGroupIndex}-${currentQuestionCount + idx}`;
      newAnswersMap[key] = importQuestions[idx].correctIndex;
    });
    setCorrectAnswersMap(newAnswersMap);
    localStorage.setItem(`quiz_${quizId}_answers`, JSON.stringify(newAnswersMap));

    await fetchQuiz();
    setShowImportModal(false);
    setImportQuestions([{ content: "", options: ["", ""], correctIndex: 0, scoreWeight: 1.00 }]);
    setSelectedGroupIndex(null);
    addToast("Thêm câu hỏi thành công!", "success");
  } catch (err) {
    console.error("❌ Import error:", err);
    setErrorMessage("❌ Lỗi thêm câu hỏi: " + (err.response?.data?.message || err.message));
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

  // ✅ Cập nhật handleSaveEdit - Cập nhật câu hỏi
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
    const group = groups[editingQuestionGroupIndex];
    const question = group.questions[editingQuestionIndex];

    if (!question.questionID) {
      throw new Error("Question ID not found");
    }

    // Format options với ID nếu có
    const formattedOptions = editingQuestion.options.map((opt, optIndex) => ({
      optionID: question.options?.[optIndex]?.optionID || null,
      content: opt,
      isCorrect: optIndex === editingQuestion.correctIndex,
    }));

    // Cập nhật câu hỏi và options
    await updateQuestionWithOptions(
      question.questionID,
      {
        content: editingQuestion.content,
        questionType: 1,
        questionOrder: question.questionOrder,
        scoreWeight: editingQuestion.scoreWeight,
        metaJson: null,
        options: formattedOptions,
      },
      question.options || []
    );

    // Lưu đáp án đúng
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
    addToast("Cập nhật câu hỏi thành công!", "success");
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
    const group = groups[groupIndex];
    const question = group.questions[questionIndex];

    if (!question.questionID) {
      throw new Error("Question ID not found");
    }

    // Xóa câu hỏi hoàn toàn
    await deleteQuestionCompletely(question.questionID, question);

    // Xóa đáp án đúng khỏi localStorage
    const newAnswersMap = { ...correctAnswersMap };
    delete newAnswersMap[`${groupIndex}-${questionIndex}`];
    setCorrectAnswersMap(newAnswersMap);
    localStorage.setItem(`quiz_${quizId}_answers`, JSON.stringify(newAnswersMap));

    await fetchQuiz();
    setShowDeleteModal(false);
    setDeleteTarget(null);
    addToast("Xóa câu hỏi thành công!", "success");
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
            className="p-0 mb-2">
            ← Quay lại Dashboard
          </Button>
          <h3 className="text-primary mb-0">{quiz?.title || "Quiz Detail"}</h3>
          {quiz?.description && <p className="text-muted mt-2">{quiz.description}</p>}
          <div className="mt-2">
            <Badge bg="info" className="me-2">{groups.length} groups</Badge>
            <Badge bg="secondary">{getTotalQuestions()} câu hỏi</Badge>
          </div>
        </div>
        <div className="d-flex gap-2">
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
          {/* AI BUTTON */}
          <Button 
            variant="gradient" 
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              color: "white"
            }}
            onClick={() => {
              if (groups.length === 0) {
                addToast("⚠️ Vui lòng tạo ít nhất 1 group trước khi dùng AI!", "warning");
                return;
              }
              setAiSelectedGroupIndex(0);
              setAiPrompt("");
              setShowAIModal(true);
            }}
          >
            Tạo đề bằng AI
          </Button>
        </div>
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
                      setImportQuestions([{ content: "", options: ["", ""], correctIndex: 0, scoreWeight: 1.00 }]);
                      setShowImportModal(true);
                    }}
                  >
                    <Plus size={14} className="me-1" />
                    Thêm câu hỏi
                  </Button>
                  <Button
                    variant="outline-info"
                    size="sm"
                    onClick={() => {
                      setAiSelectedGroupIndex(groupIdx);
                      setAiPrompt("");
                      setShowAIModal(true);
                    }}
                  >
                    AI
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
                        Audio
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
                        Image
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
                        Video
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
                        Text
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
                                {asset.assetType === 1 ? 'Audio' : 
                                 asset.assetType === 2 ? 'Image' : 
                                 asset.assetType === 3 ? 'Text' : 
                                 'Video'}
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
            {editingGroupIndex !== null ? "Sửa Group" : "Thêm Group Mới"}
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

      {/* AI Modal */}
      <Modal show={showAIModal} onHide={() => setShowAIModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Tạo đề bằng AI
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info" className="mb-3">
            <strong>Hướng dẫn:</strong>
            <ul className="mb-0 mt-2">
              <li>Mô tả chi tiết nội dung bạn muốn tạo đề</li>
              <li>Ví dụ: "Create 10 questions about Present Continuous Tense for intermediate level"</li>
              <li>Ví dụ: "Tạo 5 câu hỏi về thì hiện tại hoàn thành, level trung bình"</li>
            </ul>
          </Alert>

          {groups.length > 0 && (
            <Form.Group className="mb-3">
              <Form.Label>Chọn Group để thêm câu hỏi</Form.Label>
              <Form.Select value={aiSelectedGroupIndex || 0} onChange={(e) => setAiSelectedGroupIndex(parseInt(e.target.value))}>
                {groups.map((g, i) => (
                  <option key={i} value={i}>Group {i + 1}: {g.instruction}</option>
                ))}
              </Form.Select>
            </Form.Group>
          )}

          <Form.Group>
            <Form.Label>Prompt cho AI</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={5} 
              placeholder="Ví dụ: Create 10 multiple choice questions about English grammar, focusing on present perfect tense..."
              value={aiPrompt} 
              onChange={(e) => setAiPrompt(e.target.value)}
              disabled={aiLoading}
            />
            <Form.Text className="text-muted">
              Mô tả càng chi tiết, AI sẽ tạo đề càng chính xác
            </Form.Text>
          </Form.Group>

          {aiLoading && (
            <Alert variant="warning" className="mt-3 mb-0">
              <div className="d-flex align-items-center">
                <Spinner animation="border" size="sm" className="me-2" />
                <span>AI đang tạo đề... Vui lòng đợi (có thể mất 30-60 giây)</span>
              </div>
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAIModal(false)} disabled={aiLoading}>Hủy</Button>
          <Button 
            variant="primary" 
            onClick={handleGenerateAIQuiz} 
            disabled={!aiPrompt.trim() || aiLoading}
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none"
            }}
          >
            {aiLoading ? (
              <><Spinner as="span" animation="border" size="sm" className="me-2" />Đang tạo...</>
            ) : (
              <>Tạo bằng AI</>
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
            Thêm câu hỏi vào Group {selectedGroupIndex !== null ? selectedGroupIndex + 1 : ""}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {selectedGroupIndex !== null && groups[selectedGroupIndex] && (
            <Alert variant="info" className="mb-4">
              <strong>Group Instruction:</strong> {groups[selectedGroupIndex].instruction}
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
                    step="0.01"
                    value={q.scoreWeight}
                    onChange={(e) =>
                      updateQuestion(qIndex, "scoreWeight", parseFloat(e.target.value) || 1)
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
                  step="0.01"
                  value={editingQuestion.scoreWeight}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      scoreWeight: parseFloat(e.target.value) || 1,
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
            {isEditingAsset ? "Sửa Text Asset" : "Thêm Text Asset"}
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

      {/* Confirmation Modal */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{confirmConfig.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant={confirmConfig.variant === "danger" ? "warning" : confirmConfig.variant}>
            {confirmConfig.message}
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Hủy
          </Button>
          <Button variant={confirmConfig.variant} onClick={handleConfirm}>
            Xác nhận
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast Notifications */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
            bg={toast.variant}
            autohide
            delay={4000}
          >
            <Toast.Header closeButton={true}>
              <strong className="me-auto">
                {toast.variant === "success" ? "Thành công" : 
                 toast.variant === "danger" ? "❌ Lỗi" : 
                 toast.variant === "warning" ? "⚠️ Cảnh báo" : "ℹ️ Thông báo"}
              </strong>
            </Toast.Header>
            <Toast.Body className={toast.variant === "success" || toast.variant === "danger" ? "text-white" : ""}>
              {toast.message}
            </Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </Container>
  );
};

export default QuizDetail;