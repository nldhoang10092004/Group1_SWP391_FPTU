import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./writingpractice.scss";

const TOPICS = [
  {
    id: 1,
    title: "Describe Your Hometown",
    minWords: 150,
    maxWords: 250,
    level: "Beginner",
    type: "essay",
    time: "20 phút",
    task: `Write about your hometown. Describe the place where you grew up,
    including the geography, weather, people, and what makes it special to you.
    Include specific details and personal experiences.`,
  },
  {
    id: 2,
    title: "Formal Email to a Manager",
    minWords: 120,
    maxWords: 180,
    level: "Intermediate",
    type: "email",
    time: "15 phút",
    task: `Write a formal email to your manager to request a day off for personal reasons. 
    Use polite language and proper formatting.`,
  },
  {
    id: 3,
    title: "Opinion Essay on Technology",
    minWords: 250,
    maxWords: 350,
    level: "Advanced",
    type: "essay",
    time: "25 phút",
    task: `Some people believe that technology makes life easier, while others think it makes life more complicated. 
    Write an essay giving your opinion and supporting it with examples.`,
  },
];

const WritingPractice = () => {
  const [selected, setSelected] = useState(null);
  const [writing, setWriting] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [message, setMessage] = useState(null);
  const [completedTopics, setCompletedTopics] = useState([]);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const text = e.target.value;
    setWriting(text);
    setWordCount(text.trim().split(/\s+/).filter(Boolean).length);
  };

  const handleSubmit = () => {
    if (wordCount < selected.minWords) {
      setMessage({
        type: "error",
        text: `❌ Cần ít nhất ${selected.minWords} từ để hoàn thành bài viết.`,
      });
      return;
    }

    setMessage({
      type: "success",
      text: "✅ Đã gửi bài viết! AI sẽ đánh giá trong vài phút.",
    });

    setCompletedTopics((prev) =>
      prev.includes(selected.id) ? prev : [...prev, selected.id]
    );
    setWriting("");
    setWordCount(0);
  };

  const handleClose = () => {
    navigate("/home");
  };

  return (
    <div className="writing-page">
      <div className="writing-header">
        <div className="header-left">
          <h1>Luyện Writing</h1>
          <p>
            {selected
              ? `${selected.title} (${selected.minWords}-${selected.maxWords} từ)`
              : "Chọn chủ đề để bắt đầu"}
          </p>
        </div>
        <div className="header-right">
          <button className="ielts-btn">Thi thử IELTS</button>
          <button className="close-btn" onClick={handleClose}>✕</button>
        </div>
      </div>

      {message && (
        <div
          className={`alert ${
            message.type === "error" ? "alert-error" : "alert-success"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Main layout */}
      <div className="writing-main">
        {/* Left Section */}
        <div className="left-section">
          {selected ? (
            <div className="info-box">
              <h3>Thông tin bài viết</h3>
              <h4>{selected.title}</h4>
              <p className="desc">{selected.task}</p>

              <div className="tags">
                <span className="tag easy">{selected.level}</span>
                <span className="tag small">{selected.type}</span>
              </div>

              <div className="info-stats">
                <p>🎯 {selected.minWords}-{selected.maxWords} từ</p>
                <p>⏱ {selected.time}</p>
              </div>

              <div className="tips-box">
                <h3>💡 Tips hữu ích</h3>
                <ul>
                  <li>Dùng tính từ miêu tả để bài viết sinh động hơn</li>
                  <li>Đưa ví dụ và trải nghiệm cá nhân</li>
                  <li>Chia đoạn hợp lý, đảm bảo mạch lạc</li>
                  <li>Dùng thì hiện tại để mô tả đặc điểm hiện nay</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="info-box placeholder">
              <h3>📝 Hãy chọn một chủ đề bên phải để bắt đầu luyện viết</h3>
            </div>
          )}
        </div>

        {/* Center Section */}
        <div className="center-section">
          {selected ? (
            <div className="writing-area">
              <div className="writing-title">
                <h3>Khu vực viết bài</h3>
                <span className="word-limit">
                  {wordCount} / {selected.minWords}-{selected.maxWords} từ
                </span>
              </div>
              <textarea
                placeholder="Bắt đầu viết bài của bạn ở đây..."
                value={writing}
                onChange={handleChange}
              />
              <div className="writing-actions">
                <button
                  className="btn-outline"
                  onClick={() => setSelected(null)}
                >
                  ← Chọn chủ đề khác
                </button>
                <button
                  className="btn-primary"
                  onClick={handleSubmit}
                  disabled={wordCount < selected.minWords}
                >
                  📤 Nộp bài
                </button>
              </div>
            </div>
          ) : (
            <div className="writing-placeholder">
              <p>🖋 Hãy chọn một chủ đề ở cột bên phải để bắt đầu bài viết.</p>
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="right-section">
          {/* ✅ Thêm phần Tiêu chí chấm điểm */}
          <div className="criteria-box">
            <h3>Tiêu chí chấm điểm</h3>
            <ul>
              <li>
                <strong>Phản hồi đề bài</strong>
                <p>Trả lời đầy đủ các phần của đề, có ví dụ minh họa rõ ràng.</p>
              </li>
              <li>
                <strong>Mạch lạc & liên kết</strong>
                <p>
                  Bố cục rõ ràng, các ý được sắp xếp hợp lý giữa các đoạn.
                </p>
              </li>
              <li>
                <strong>Từ vựng</strong>
                <p>
                  Sử dụng từ vựng phù hợp, có dùng một số từ ít phổ biến.
                </p>
              </li>
              <li>
                <strong>Ngữ pháp & cấu trúc</strong>
                <p>
                  Kết hợp câu đơn và câu phức, đảm bảo chính xác ngữ pháp.
                </p>
              </li>
            </ul>
          </div>

          {/* Tiến độ */}
          <div className="progress-box">
            <h3>Tiến độ luyện viết</h3>
            <ul>
              {TOPICS.map((topic) => (
                <li
                  key={topic.id}
                  className={`
                    ${completedTopics.includes(topic.id) ? "completed" : ""}
                    ${selected?.id === topic.id ? "active" : ""}
                  `}
                  onClick={() => setSelected(topic)}
                >
                  {completedTopics.includes(topic.id) ? "✅ " : "✏️ "}
                  {topic.title} ({topic.minWords}-{topic.maxWords} từ)
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WritingPractice;
