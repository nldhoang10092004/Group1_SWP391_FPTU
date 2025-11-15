import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTeacherCourseDetail } from "../../middleware/teacher/courseTeacherAPI";
import { ChevronLeft, Edit, Plus, ChevronDown } from 'lucide-react';
import "./CourseDetail.scss";

// Custom Accordion Item Component
const AccordionItem = ({ chapter, index }) => {
  const [isOpen, setIsOpen] = useState(index === 0); // Open first chapter by default

  return (
    <div className={`chapter-item ${isOpen ? 'open' : ''}`}>
      <div className="chapter-header" onClick={() => setIsOpen(!isOpen)}>
        <div>
          <span className="chapter-title">{chapter.chapterName}</span>
          <span className="chapter-meta">({chapter.videos?.length || 0} video)</span>
        </div>
        <ChevronDown size={20} className={`chapter-toggle-icon ${isOpen ? 'open' : ''}`} />
      </div>
      <div className={`chapter-content ${isOpen ? 'open' : ''}`}>
        <div className="chapter-content-inner">
          {chapter.videos?.length > 0 ? (
            <div className="video-list">
              {chapter.videos.map((video) => (
                <div key={video.videoID} className="video-item">
                  <div className="video-info">
                    <span className="video-name">{video.videoName}</span>
                    {video.isPreview && <span className="preview-badge">Miễn phí</span>}
                  </div>
                  {video.videoURL ? (
                    <a href={video.videoURL} target="_blank" rel="noreferrer" className="video-link">
                      Xem video
                    </a>
                  ) : (
                    <span className="no-video-badge">Chưa có video</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted py-4">Chưa có video nào</div>
          )}
        </div>
      </div>
    </div>
  );
};

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (courseId) fetchCourseDetail();
  }, [courseId]);

  const fetchCourseDetail = async () => {
    try {
      setIsLoading(true);
      const data = await getTeacherCourseDetail(courseId);
      setCourse(data);
    } catch (err) {
      console.error("❌ Lỗi khi tải chi tiết khóa học:", err);
      setError("Không thể tải thông tin khóa học");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="admin-loading-spinner">
        <div className="admin-spinner"></div>
        <p>Đang tải dữ liệu khóa học...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="management-card text-center">
        <p className="text-danger">{error}</p>
        <button className="primary-button mt-3" onClick={fetchCourseDetail}>Thử lại</button>
      </div>
    );
  }

  return (
    <div className="course-detail-page admin-content-area">
      <a href="#" onClick={(e) => { e.preventDefault(); navigate("/teacher/dashboard"); }} className="back-link">
        <ChevronLeft size={18} />
        Quay lại Dashboard
      </a>

      <header className="page-header text-center">
        <h1 className="page-title">Chi tiết khóa học</h1>
        <p className="page-description">Xem thông tin khóa học và nội dung chương trình.</p>
      </header>

      <div className="course-detail-grid">
        {/* Course Information Column */}
        <div>
          <div className="info-card">
            <h3 className="card-header-title">Thông tin khóa học</h3>
            <div className="info-form-group">
              <label>Tên khóa học</label>
              <div className="form-control-static">{course.courseName}</div>
            </div>
            <div className="info-form-group">
              <label>Mô tả</label>
              <div className="form-control-static textarea">{course.description}</div>
            </div>
            <div className="info-form-group">
              <label>Cấp độ</label>
              <div className="form-control-static">Level {course.courseLevel}</div>
            </div>
          </div>
          
          <div className="card-actions">
            <button className="primary-button" onClick={() => navigate(`/teacher/editcourse/${course.courseID}`)}>
              <Edit size={16} /> Chỉnh sửa
            </button>
            <button className="secondary-button" onClick={() => navigate(`/teacher/createcourse`)}>
              <Plus size={16} /> Tạo khóa học mới
            </button>
          </div>
        </div>

        {/* Course Content Card */}
        <div className="content-card">
           <h3 className="card-header-title">Nội dung khóa học</h3>
           {course?.chapters?.length > 0 ? (
            <div className="course-chapter-accordion">
              {course.chapters.map((chapter, i) => (
                <AccordionItem chapter={chapter} index={i} key={chapter.chapterID} />
              ))}
            </div>
          ) : (
            <div className="text-center text-muted py-5">
              Chưa có chương nào trong khóa học.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
