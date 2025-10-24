import React, { useState, useRef } from "react";
import { generateSpeakingPrompt, submitSpeakingAnswer } from "../../middleware/speakingAPI";
import "./speakingpractice.scss";

const SpeakingPractice = () => {
  const [prompt, setPrompt] = useState(null);
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // 🧠 Lấy đề từ AI
  const handleGeneratePrompt = async () => {
    try {
      const data = await generateSpeakingPrompt();
      setPrompt(data);
      setResult(null);
      setAudioURL(null);
      setAudioBlob(null);
    } catch {
      alert("Lỗi khi tạo đề. Vui lòng thử lại.");
    }
  };

  // 🎙️ Bắt đầu ghi âm
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/mp3" });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        setAudioBlob(blob);
      };

      mediaRecorderRef.current.start();
      setRecording(true);
    } catch {
      alert("Không thể truy cập micro. Vui lòng cấp quyền.");
    }
  };

  // ⏹️ Dừng ghi âm
  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  // 📁 Upload file ghi âm (nếu người học đã có sẵn)
  const handleUploadFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Kiểm tra định dạng
    if (!file.type.startsWith("audio/")) {
      alert("Vui lòng chọn file âm thanh hợp lệ (.mp3, .wav, ...)");
      return;
    }

    const url = URL.createObjectURL(file);
    setAudioURL(url);
    setAudioBlob(file);
  };

  // 📤 Gửi file để chấm điểm
  const handleSubmit = async () => {
    if (!audioBlob || !prompt) return alert("Vui lòng ghi âm hoặc tải file trước khi nộp!");

    setLoading(true);
    try {
      const data = await submitSpeakingAnswer(audioBlob, prompt.content);
      setResult(data);
    } catch {
      alert("Lỗi khi nộp bài. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="speaking-page">
      <h1>Luyện Speaking</h1>

      {/* Đề bài */}
      <div className="prompt-section">
        {prompt ? (
          <>
            <h3>{prompt.title}</h3>
            <p>{prompt.content}</p>
          </>
        ) : (
          <p>Nhấn “Tạo đề mới” để bắt đầu luyện nói 🎤</p>
        )}
        <button onClick={handleGeneratePrompt} disabled={loading}>
          🔄 Tạo đề mới
        </button>
      </div>

      {/* Ghi âm + Upload */}
      {prompt && (
        <div className="record-section">
          <h3>🎙 Ghi âm hoặc tải file lên</h3>
          <div className="record-controls">
            {!recording ? (
              <button onClick={handleStartRecording}>▶️ Bắt đầu ghi âm</button>
            ) : (
              <button onClick={handleStopRecording}>⏹️ Dừng</button>
            )}

            {/* 📁 Nút tải file lên */}
            <label className="upload-btn">
              📁 Tải file lên
              <input
                type="file"
                accept="audio/*"
                onChange={handleUploadFile}
                style={{ display: "none" }}
              />
            </label>

            {audioURL && (
              <audio controls src={audioURL} className="audio-player"></audio>
            )}
          </div>

          <button onClick={handleSubmit} disabled={!audioBlob || loading}>
            {loading ? "⏳ Đang chấm..." : "📤 Nộp bài"}
          </button>
        </div>
      )}

      {/* Kết quả */}
      {result && (
        <div className="result-section">
          <h3>🎯 Kết quả chấm điểm</h3>
          <p><strong>Transcript:</strong> {result.transcript}</p>
          <div className="scores">
            <p>💬 Fluency: {result.fluency}</p>
            <p>🧠 Grammar: {result.grammar}</p>
            <p>🗣 Pronunciation: {result.pronunciation}</p>
            <p>📚 Vocabulary: {result.lexicalResource}</p>
            <p>⭐ Tổng điểm: {result.score}</p>
          </div>
          <p className="feedback">📝 Feedback: {result.feedback}</p>
        </div>
      )}
    </div>
  );
};

export default SpeakingPractice;
