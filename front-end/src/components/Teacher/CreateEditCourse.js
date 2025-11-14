import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getTeacherCourseDetail as getCourseById,
  createTeacherCourse as createCourse,
  updateTeacherCourse as updateCourse,
  createChapter,
  updateChapter,
  deleteChapter,
  createVideo,
  updateVideo,
  deleteVideo,
} from "../../middleware/teacher/courseTeacherAPI";
import { uploadAsset } from "../../middleware/teacher/uploadAPI";
import { ChevronLeft, Edit, Trash2, Plus, ChevronDown, X, UploadCloud, Film } from 'lucide-react';
import "./EditCourse.scss";

// Reusable Modal Component
const CustomModal = ({ show, onClose, title, children, footer }) => {
  if (!show) return null;
  return (
    <div className="management-modal-overlay">
      <div className="management-modal-content">
        <div className="modal-header">
          <h4 className="modal-title">{title}</h4>
          <button onClick={onClose} className="action-button close-button">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-footer">{footer}</div>
      </div>
    </div>
  );
};

// Custom Accordion for Chapters
const ChapterAccordionItem = ({ chapter, onEditChapter, onDeleteChapter, onAddVideo, onEditVideo, onDeleteVideo, loadCourseData }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`chapter-item ${isOpen ? 'open' : ''}`}>
      <div className="chapter-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="chapter-title-section">
            <ChevronDown size={20} className={`chapter-toggle-icon ${isOpen ? 'open' : ''}`} />
            <span className="chapter-title">{chapter.chapterName}</span>
            <span className="chapter-meta">({chapter.videos?.length || 0} video)</span>
        </div>
        <div className="chapter-actions" onClick={(e) => e.stopPropagation()}>
          <button className="action-button" title="Sửa chương" onClick={() => onEditChapter(chapter)}>
            <Edit size={16} />
          </button>
          <button className="action-button delete-button" title="Xóa chương" onClick={() => onDeleteChapter(chapter.chapterID)}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <div className={`chapter-content ${isOpen ? 'open' : ''}`}>
        <div className="chapter-content-inner">
          <button className="add-video-button" onClick={() => onAddVideo(chapter.chapterID)}>
            <Plus size={16} /> Thêm video mới
          </button>
          <div className="video-list">
            {chapter.videos?.length > 0 ? (
              chapter.videos.map((video) => (
                <div key={video.videoID} className="video-item">
                  <div className="video-info">
                    <Film size={18} className="text-muted" />
                    <div>
                        <p className="video-name">{video.videoName}</p>
                        {video.videoURL ? (
                             <a href={video.videoURL} target="_blank" rel="noreferrer" className="video-link">Xem video</a>
                        ) : (
                            <span className="no-url-badge">Chưa có video</span>
                        )}
                    </div>
                    {video.isPreview && <span className="preview-badge">Xem trước</span>}
                  </div>
                  <div className="video-actions">
                    <button className="action-button" title="Sửa video" onClick={() => onEditVideo(video, chapter.chapterID)}>
                      <Edit size={16} />
                    </button>
                    <button className="action-button delete-button" title="Xóa video" onClick={() => onDeleteVideo(video.videoID)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted mt-3">Chưa có video nào trong chương này.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


const CreateEditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form state
  const [courseName, setCourseName] = useState("");
  const [description, setDescription] = useState("");
  const [courseLevel, setCourseLevel] = useState(1);

  // Modal states
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [chapterName, setChapterName] = useState("");

  const [showVideoModal, setShowVideoModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [selectedChapterId, setSelectedChapterId] = useState(null);
  const [videoName, setVideoName] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [isPreview, setIsPreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const showSuccessToast = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  const showErrorToast = (message) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  const loadCourseData = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await getCourseById(id);
      setCourse(data);
      setCourseName(data.courseName);
      setDescription(data.description);
      setCourseLevel(data.courseLevel);
    } catch (err) {
      console.error("❌ Lỗi tải khóa học:", err);
      showErrorToast("Không thể tải thông tin khóa học. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isEditMode) {
      loadCourseData();
    } else {
      setCourse({ chapters: [] }); // Initialize for create mode
    }
  }, [isEditMode, loadCourseData]);

  const handleSaveCourse = async () => {
    if (!courseName.trim()) {
      showErrorToast("Tên khóa học không được để trống.");
      return;
    }
    const payload = { courseName, description, courseLevel: parseInt(courseLevel) };
    try {
      if (isEditMode) {
        await updateCourse(id, payload);
        showSuccessToast("Cập nhật khóa học thành công!");
      } else {
        const newCourse = await createCourse(payload);
        showSuccessToast("Tạo khóa học mới thành công!");
        navigate(`/teacher/editcourse/${newCourse.courseID}`);
      }
    } catch (err) {
      console.error("❌ Lỗi khi lưu khóa học:", err);
      showErrorToast("Không thể lưu khóa học.");
    }
  };

  // Chapter Handlers
  const handleAddChapterClick = () => {
    setEditingChapter(null);
    setChapterName("");
    setShowChapterModal(true);
  };

  const handleEditChapterClick = (chapter) => {
    setEditingChapter(chapter);
    setChapterName(chapter.chapterName);
    setShowChapterModal(true);
  };

  const handleSaveChapter = async () => {
    if (!chapterName.trim()) {
      showErrorToast("Tên chương không được để trống.");
      return;
    }
    try {
      if (editingChapter) {
        await updateChapter(editingChapter.chapterID, { chapterName });
        showSuccessToast("Cập nhật chương thành công!");
      } else {
        await createChapter(id, { chapterName });
        showSuccessToast("Tạo chương mới thành công!");
      }
      setShowChapterModal(false);
      loadCourseData();
    } catch (err) {
      console.error("❌ Lỗi khi lưu chương:", err);
      showErrorToast("Không thể lưu chương.");
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa chương này? Tất cả video bên trong cũng sẽ bị xóa.")) {
      try {
        await deleteChapter(chapterId);
        showSuccessToast("Xóa chương thành công!");
        loadCourseData();
      } catch (err) {
        console.error("❌ Lỗi khi xóa chương:", err);
        showErrorToast("Không thể xóa chương.");
      }
    }
  };

  // Video Handlers
  const resetVideoForm = () => {
    setVideoName("");
    setVideoFile(null);
    setIsPreview(false);
    setEditingVideo(null);
    setSelectedChapterId(null);
  };

  const handleAddVideoClick = (chapterId) => {
    resetVideoForm();
    setSelectedChapterId(chapterId);
    setShowVideoModal(true);
  };

  const handleEditVideoClick = (video, chapterId) => {
    resetVideoForm();
    setEditingVideo(video);
    setSelectedChapterId(chapterId);
    setVideoName(video.videoName);
    setIsPreview(video.isPreview);
    setShowVideoModal(true);
  };

  const handleSaveVideo = async () => {
    if (!videoName.trim()) {
      showErrorToast("Tên video không được để trống.");
      return;
    }
    setIsUploading(true);
    try {
      let uploadedVideoURL = editingVideo?.videoURL;
      if (videoFile) {
        const uploadResult = await uploadAsset(videoFile, "video");
        uploadedVideoURL = uploadResult.url;
      }
      const payload = { videoName, videoURL: uploadedVideoURL || null, isPreview };
      if (editingVideo) {
        await updateVideo(editingVideo.videoID, payload);
        showSuccessToast("Cập nhật video thành công!");
      } else {
        await createVideo(selectedChapterId, payload);
        showSuccessToast("Tạo video mới thành công!");
      }
      setShowVideoModal(false);
      loadCourseData();
    } catch (err) {
      console.error("❌ Lỗi khi lưu video:", err);
      showErrorToast("Không thể lưu video.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa video này?")) {
      try {
        await deleteVideo(videoId);
        showSuccessToast("Xóa video thành công!");
        loadCourseData();
      } catch (err) {
        console.error("❌ Lỗi khi xóa video:", err);
        showErrorToast("Không thể xóa video.");
      }
    }
  };

  if (isLoading && isEditMode) {
    return (
      <div className="admin-loading-spinner">
        <div className="admin-spinner"></div>
        <p>Đang tải dữ liệu khóa học...</p>
      </div>
    );
  }

  return (
    <div className="edit-course-page">
      {success && <div className="toast-notification success">{success}</div>}
      {error && <div className="toast-notification error">{error}</div>}

      <a href="#" onClick={(e) => { e.preventDefault(); navigate("/teacher/dashboard"); }} className="back-link">
        <ChevronLeft size={18} />
        Quay lại Dashboard
      </a>

      <header className="page-header">
        <h1 className="page-title">{isEditMode ? "Chỉnh sửa khóa học" : "Tạo khóa học mới"}</h1>
        <p className="page-description">{isEditMode ? "Cập nhật thông tin, chương và video cho khóa học của bạn." : "Điền thông tin cơ bản để tạo khóa học mới."}</p>
      </header>

      <div className="edit-course-grid">
        {/* Course Information Form */}
        <div className="info-card">
          <h3 className="card-header-title">Thông tin khóa học</h3>
          <div className="form-content-wrapper">
            <div className="form-group">
              <label htmlFor="courseName">Tên khóa học</label>
              <input id="courseName" type="text" className="form-input" value={courseName} onChange={(e) => setCourseName(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="description">Mô tả</label>
              <textarea id="description" className="form-textarea" rows="4" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="courseLevel">Cấp độ</label>
              <select id="courseLevel" className="form-select" value={courseLevel} onChange={(e) => setCourseLevel(e.target.value)}>
                {[1, 2, 3, 4, 5].map(lv => <option key={lv} value={lv}>Level {lv}</option>)}
              </select>
            </div>
            <div className="form-actions">
              <button className="primary-button" onClick={handleSaveCourse}>
                {isEditMode ? "Lưu thay đổi" : "Tạo khóa học & Tiếp tục"}
              </button>
            </div>
          </div>
        </div>

        {/* Course Content Management */}
        {isEditMode && course && (
          <div className="content-card">
            <div className="card-header-title">
              <h3>Nội dung khóa học</h3>
              <button className="primary-button" onClick={handleAddChapterClick}>
                <Plus size={16} /> Thêm chương
              </button>
            </div>
            <div className="chapter-accordion">
              {course.chapters?.length > 0 ? (
                course.chapters.map((chapter) => (
                  <ChapterAccordionItem
                    key={chapter.chapterID}
                    chapter={chapter}
                    onEditChapter={handleEditChapterClick}
                    onDeleteChapter={handleDeleteChapter}
                    onAddVideo={handleAddVideoClick}
                    onEditVideo={handleEditVideoClick}
                    onDeleteVideo={handleDeleteVideo}
                  />
                ))
              ) : (
                <p className="text-center text-muted py-5">Khóa học này chưa có chương nào. Hãy thêm một chương để bắt đầu!</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Chapter Modal */}
      <CustomModal
        show={showChapterModal}
        onClose={() => setShowChapterModal(false)}
        title={editingChapter ? "Chỉnh sửa chương" : "Thêm chương mới"}
        footer={
          <>
            <button className="secondary-button" onClick={() => setShowChapterModal(false)}>Hủy</button>
            <button className="primary-button" onClick={handleSaveChapter}>
              {editingChapter ? "Cập nhật" : "Tạo mới"}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label htmlFor="chapterName">Tên chương</label>
          <input id="chapterName" type="text" className="form-input" value={chapterName} onChange={(e) => setChapterName(e.target.value)} />
        </div>
      </CustomModal>

      {/* Video Modal */}
      <CustomModal
        show={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        title={editingVideo ? "Chỉnh sửa video" : "Thêm video mới"}
        footer={
          <>
            <button className="secondary-button" onClick={() => setShowVideoModal(false)} disabled={isUploading}>Hủy</button>
            <button className="primary-button" onClick={handleSaveVideo} disabled={isUploading}>
              {isUploading ? "Đang xử lý..." : (editingVideo ? "Cập nhật" : "Thêm video")}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label htmlFor="videoName">Tên video</label>
          <input id="videoName" type="text" className="form-input" value={videoName} onChange={(e) => setVideoName(e.target.value)} />
        </div>
        <div className="form-group file-upload-input">
            <label>Upload video</label>
            <div className="file-drop-zone" onClick={() => document.getElementById('video-file-input').click()}>
                <input 
                    type="file" 
                    id="video-file-input"
                    accept="video/*" 
                    style={{ display: 'none' }}
                    onChange={(e) => setVideoFile(e.target.files[0])}
                />
                <UploadCloud size={40} className="upload-icon" />
                {videoFile ? (
                    <p className="file-upload-text">{videoFile.name}</p>
                ) : (
                    <>
                        <p className="file-upload-text"><span>Nhấn để chọn</span> hoặc kéo thả file vào đây</p>
                        <p className="file-upload-hint">Hỗ trợ MP4, AVI, MOV...</p>
                    </>
                )}
            </div>
            {editingVideo && editingVideo.videoURL && !videoFile && (
                <div className="file-preview">
                    <p className="text-muted">Video hiện tại: <a href={editingVideo.videoURL} target="_blank" rel="noreferrer">{editingVideo.videoURL.split('/').pop()}</a></p>
                </div>
            )}
        </div>
        <div className="form-group">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="form-checkbox" checked={isPreview} onChange={(e) => setIsPreview(e.target.checked)} />
            Cho phép xem trước miễn phí
          </label>
        </div>
      </CustomModal>
    </div>
  );
};

export default CreateEditCourse;