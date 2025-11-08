import React, { useState, useEffect } from "react";
import "./HomePage.scss";
import { getAllCoursesWithDetails } from '../../middleware/courseAPI';
import { useNavigate } from "react-router-dom";
import { Play, Star, Users, BookOpen, Lock, Zap, Target, Award, MessageCircle, Film, Bot, BrainCircuit, LayoutDashboard } from 'lucide-react';

const HomePage = ({ onShowAuthModal }) => {
  const [freeVideos, setFreeVideos] = useState([]);
  const [premiumCourses, setPremiumCourses] = useState([]);
  const navigate = useNavigate();

  const handleAuthAction = (tab = "register") => {
    if (onShowAuthModal) {
      onShowAuthModal(tab);
    } else {
      window.dispatchEvent(new CustomEvent("openAuthModal", { detail: { tab } }));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courses = await getAllCoursesWithDetails();
        
        // Process free videos
        const previews = [];
        courses.forEach(course => {
          course.chapters?.forEach(chapter => {
            chapter.videos?.forEach(video => {
              if (video.isPreview === 1 || video.isPreview === true) {
                // Extract YouTube video ID for thumbnail
                let thumbnailUrl = 'https://via.placeholder.com/300x170.png?text=No+Image';
                try {
                    const url = new URL(video.videoURL);
                    const videoId = url.searchParams.get('v');
                    if (videoId) {
                        thumbnailUrl = `https://i3.ytimg.com/vi/${videoId}/hqdefault.jpg`;
                    }
                } catch (e) {
                    console.error("Invalid video URL for thumbnail:", video.videoURL);
                }

                previews.push({
                  id: video.videoID,
                  title: video.videoName,
                  description: "Chào hỏi cơ bản trong tiếng Anh", // Placeholder description
                  duration: "5:30", // Placeholder
                  views: "1.2K",   // Placeholder
                  rating: 4.8,     // Placeholder
                  level: getCourseLevelText(course.courseLevel),
                  thumbnailUrl: thumbnailUrl,
                });
              }
            });
          });
        });
        setFreeVideos(previews.slice(0, 3));

        // Process premium courses
        const premium = courses.map(course => {
          let totalVideos = 0;
          course.chapters?.forEach(chapter => {
            totalVideos += chapter.videos?.length || 0;
          });
          return {
            id: course.courseID,
            title: course.courseName,
            description: course.description || "Khóa học tiếng Anh chất lượng cao.",
            lessons: totalVideos,
            students: "5.2K", // Placeholder
            level: getCourseLevelText(course.courseLevel),
          };
        });
        setPremiumCourses(premium.slice(0, 3));

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const getCourseLevelText = (level) => {
    const levelMap = { 0: "Beginner", 1: "Pre-Intermediate", 2: "Intermediate", 3: "Advanced" };
    return levelMap[level] || "Beginner";
  };

  return (
    <div className="new-homepage">
      <main className="main-content-new">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-left">
              <div className="hero-tag">
                <BrainCircuit size={16} /> Học thông minh với AI - Tiết kiệm 60% thời gian
              </div>
              <h1>
                Chinh phục tiếng Anh
                <span>không giới hạn</span>
              </h1>
              <p className="hero-subtitle">
                Phương pháp học tương tác với AI, feedback real-time và lộ trình được cá
                nhân hóa 100%. Từ zero tới hero chỉ trong 6 tháng.
              </p>
              <button className="cta-button-main" onClick={() => handleAuthAction('register')}>
                <Play size={18} /> Bắt đầu miễn phí
              </button>

              <div className="hero-stats-cards">
                <div className="stat-card">
                  <div className="icon-container orange">
                    <Star size={20} />
                  </div>
                  <p>4.9</p>
                  <span>Đánh giá</span>
                </div>
                <div className="stat-card">
                  <div className="icon-container purple">
                    <Users size={20} />
                  </div>
                  <p>2M+</p>
                  <span>Học viên</span>
                </div>
                <div className="stat-card">
                  <div className="icon-container green">
                    <BookOpen size={20} />
                  </div>
                  <p>1K+</p>
                  <span>Bài học</span>
                </div>
              </div>
            </div>
            <div className="hero-right">
              <div className="feature-card-large">
                <div className="icon-container purple-gradient">
                  <Zap size={24} />
                </div>
                <h3>AI Feedback</h3>
                <p>Nhận phản hồi chi tiết từ AI trong vài giây. Sửa lỗi ngay lập tức, tiến bộ nhanh gấp 3 lần.</p>
              </div>
              <div className="feature-card-large">
                <div className="icon-container blue-gradient">
                  <Target size={24} />
                </div>
                <h3>Lộ trình cá nhân</h3>
                <p>AI phân tích điểm mạnh/yếu của bạn, tạo lộ trình học riêng biệt. Học đúng cái bạn cần.</p>
              </div>
            </div>
          </div>
        </section>

        {/* General Features Section */}
        <section className="general-features">
           <div className="feature-item">
              <div className="icon-container green-gradient">
                <Award size={22}/>
              </div>
              <div>
                <h4>Chứng chỉ quốc tế</h4>
                <p>Được công nhận toàn cầu</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="icon-container orange-gradient">
                <BrainCircuit size={22}/>
              </div>
              <div>
                <h4>100% tương tác</h4>
                <p>Không học thụ động nhàm chán</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="icon-container pink-gradient">
                <MessageCircle size={22}/>
              </div>
              <div>
                <h4>Cộng đồng sôi động</h4>
                <p>Kết nối & học cùng nhau</p>
              </div>
            </div>
        </section>

        {/* Video Demo Section */}
        <section className="content-section">
          <div className="section-header">
            <h2>Video demo miễn phí</h2>
            <span className="section-tag free">Miễn phí</span>
          </div>
          <div className="card-grid">
            {freeVideos.map(video => (
              <div key={video.id} className="video-card-new" onClick={() => navigate(`/course/${video.id}`)}>
                <div className="video-thumbnail">
                  <img src={video.thumbnailUrl} alt={video.title} />
                  <div className="play-overlay">
                    <Play size={48} />
                  </div>
                  <span className={`level-tag ${video.level.toLowerCase().replace(' ', '-')}`}>{video.level}</span>
                </div>
                <div className="card-content">
                  <h4>{video.title}</h4>
                  <p>{video.description}</p>
                  <div className="card-meta">
                    <span><Play size={14} /> {video.duration}</span>
                    <span><Users size={14} /> {video.views}</span>
                    <span><Star size={14} /> {video.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Premium Content Section */}
        <section className="content-section">
          <div className="section-header">
            <h2>Nội dung premium</h2>
            <span className="section-tag premium">Membership required</span>
          </div>
          <div className="card-grid">
            {premiumCourses.map(course => (
              <div key={course.id} className="course-card-new">
                <div className="card-content">
                  <h4>{course.title}</h4>
                  <p>{course.description}</p>
                  <div className="card-meta">
                    <span><BookOpen size={14} /> {course.lessons} bài học</span>
                    <span><Users size={14} /> {course.students} học viên</span>
                  </div>
                  <span className={`level-tag ${course.level.toLowerCase().replace(' ', '-')}`}>{course.level}</span>
                </div>
                <button className="unlock-button" onClick={() => handleAuthAction('register')}>
                  <Lock size={16} /> Mở khóa với membership
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Membership Features Section */}
        <section className="membership-features">
          <h2>Tính năng nổi bật khi có membership</h2>
          <div className="features-grid">
            <div className="feature-card-small">
              <div className="feature-icon-small blue">
                <Film size={24} />
              </div>
              <h4>Video HD chất lượng cao</h4>
              <p>Hàng trăm video bài giảng được sản xuất chuyên nghiệp</p>
            </div>
            <div className="feature-card-small">
              <div className="feature-icon-small purple">
                <Bot size={24} />
              </div>
              <h4>AI chấm bài viết</h4>
              <p>Hệ thống AI chấm điểm và góp ý chi tiết cho bài viết</p>
            </div>
            <div className="feature-card-small">
              <div className="feature-icon-small green">
                <BrainCircuit size={24} />
              </div>
              <h4>Luyện tập tương tác</h4>
              <p>Flashcard, quiz và game học tập thú vị</p>
            </div>
            <div className="feature-card-small">
              <div className="feature-icon-small yellow">
                <LayoutDashboard size={24} />
              </div>
              <h4>Theo dõi tiến độ</h4>
              <p>Dashboard cá nhân theo dõi quá trình học tập</p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="final-cta">
          <button className="cta-button-large" onClick={() => handleAuthAction('register')}>
            Bắt đầu học ngay - Chỉ từ 199k/tháng
          </button>
        </section>
      </main>
    </div>
  );
};

export default HomePage;