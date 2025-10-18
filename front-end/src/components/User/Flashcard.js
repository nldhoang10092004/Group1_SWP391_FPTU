import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import "./Flashcard.scss"; 

const words = [
  {
    word: "Adventure",
    phonetic: "/ədˈven.tʃər/",
    meaning: "Cuộc phiêu lưu",
    level: "Trung bình"
  },
  {
    word: "Brilliant",
    phonetic: "/ˈbrɪl.jənt/",
    meaning: "Xuất sắc, rực rỡ",
    level: "Khó"
  },
  {
    word: "Challenge",
    phonetic: "/ˈtʃæl.ɪndʒ/",
    meaning: "Thử thách",
    level: "Trung bình"
  },
  {
    word: "Curiosity",
    phonetic: "/ˌkjʊə.riˈɒs.ɪ.ti/",
    meaning: "Sự tò mò",
    level: "Dễ"
  },
  {
    word: "Determination",
    phonetic: "/dɪˌtɜː.mɪˈneɪ.ʃən/",
    meaning: "Sự quyết tâm",
    level: "Khó"
  }
];

const Flashcard = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const navigate = useNavigate();

  const currentWord = words[currentIndex];
  const totalWords = words.length;

  const handleNext = () => {
    setShowMeaning(false);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalWords);
  };

  const handlePrev = () => {
    setShowMeaning(false);
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? totalWords - 1 : prevIndex - 1
    );
  };

  const speakWord = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };

    const handleClose = () => {
    navigate("/home");
  };

  const progressPercentage = ((currentIndex + 1) / totalWords) * 100;

  return (
    <div className="flashcard-container">
      <div className="flashcard-header">
        <h1>Luyện từ vựng</h1>
        <button className="close-button"onClick={handleClose}>×</button>
      </div>

      <div className="progress-section">
        <p>Thẻ {currentIndex + 1} / {totalWords}</p>
        <div className="progress-bar-background">
          <div
            className="progress-bar-fill"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="completion-info">
          <span>Đã hoàn thành {currentIndex + 1} / {totalWords}</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
      </div>

      <div className="flashcard-content">
        <div className="word-card" onClick={() => setShowMeaning(!showMeaning)}>
          <span className="word-level">{currentWord.level}</span>
          <h2 className="word-text">{currentWord.word}</h2>
          <p className="word-phonetic">{currentWord.phonetic}</p>
          {showMeaning && <p className="word-meaning">{currentWord.meaning}</p>}
          <button
            className="pronounce-button"
            onClick={(e) => {
              e.stopPropagation();
              speakWord(currentWord.word);
            }}
          >
            Phát âm
          </button>
        </div>

        <div className="navigation-buttons">
          <button className="nav-button secondary" onClick={handlePrev}>
            ⬅ Trước
          </button>
          <button className="nav-button primary" onClick={handleNext}>
            Tiếp ➡
          </button>
        </div>
      </div>
      <button className="chat-icon">💬</button>
    </div>
  );
};

export default Flashcard;