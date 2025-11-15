import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faRobot, faUser, faSpinner, faTimes, faComments, faBookOpen } from '@fortawesome/free-solid-svg-icons';
import './AI.scss';


// --- Gemini API Config ---
// Để sử dụng Gemini API, hãy cấu hình API key qua biến môi trường hoặc import từ file cấu hình bảo mật (KHÔNG để key trực tiếp trong code public)
// Ví dụ: const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY; // Thêm key vào biến môi trường hoặc backend, không commit key thật lên repo!
console.log(GEMINI_API_KEY)
// Sử dụng Gemini 2.5 Flash - model mới nhất, stable, miễn phí
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.REACT_APP_GEMINI_API_KEY}`;



const SYSTEM_PROMPT_QA = `Bạn là EMILY - EMT AI SUPPORT, trợ lý AI thân thiện, chuyên trả lời các câu hỏi về tiếng Anh, giải thích ngữ pháp, từ vựng, sửa lỗi, và tư vấn học tập. Luôn trả lời bằng tiếng Việt, chỉ dùng tiếng Anh khi cần ví dụ.`;
const SYSTEM_PROMPT_DICT = `Bạn là một từ điển tiếng Anh thông minh. Khi người dùng nhập một từ hoặc cụm từ, hãy giải thích nghĩa, từ loại, ví dụ, đồng nghĩa, trái nghĩa, và dịch sang tiếng Việt. Luôn trả lời ngắn gọn, dễ hiểu.`;


const AIChat = ({ isVisible, onClose }) => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Xin chào! Mình là EMILY - EMT AI SUPPORT. Bạn muốn hỏi gì về tiếng Anh hoặc tra từ điển?" }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState('qa'); // 'qa' | 'dict'
    const chatBodyRef = useRef(null);

    // Tự động cuộn xuống cuối khi có tin nhắn mới
    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages]);

    // Gửi tin nhắn tới Gemini API
    // Hàm loại bỏ markdown và format text
    const formatResponse = (text) => {
        return text
            // Loại bỏ bold **text** hoặc __text__
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/__(.*?)__/g, '$1')

            // Loại bỏ italic *text* hoặc _text_
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/_(.*?)_/g, '$1')

            // Loại bỏ strikethrough ~~text~~
            .replace(/~~(.*?)~~/g, '$1')

            // Loại bỏ code `text`
            .replace(/`(.*?)`/g, '$1')

            // Loại bỏ headers ### text
            .replace(/^#{1,6}\s+/gm, '')

            // Loại bỏ horizontal rules --- hoặc ***
            .replace(/^[-*_]{3,}$/gm, '')

            // Loại bỏ bullets - hoặc *
            .replace(/^[\-\*]\s+/gm, '')

            // Trim whitespace
            .trim();
    };

    // Cập nhật handleSendMessage
    const handleSendMessage = async () => {
        if (!userInput.trim() || isLoading) return;

        const newMessages = [...messages, { role: 'user', content: userInput }];
        setMessages(newMessages);
        setUserInput('');
        setIsLoading(true);

        try {
            const prompt = mode === 'qa' ? SYSTEM_PROMPT_QA : SYSTEM_PROMPT_DICT;

            const response = await fetch(GEMINI_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: `${prompt}\n\nUser: ${userInput}` }]
                    }]
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('API Error:', response.status, errorData);
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            let assistantMessage = data.candidates?.[0]?.content?.parts?.[0]?.text
                || 'Không nhận được phản hồi từ AI.';

            // ✅ Format response - loại bỏ markdown
            assistantMessage = formatResponse(assistantMessage);

            setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Xin lỗi, đã có lỗi. Vui lòng thử lại sau.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="ai-chat-widget">
            <div className="chat-header">
                <h3>EMILY - EMT AI SUPPORT</h3>
                <button onClick={onClose} className="close-btn" title="Đóng chat">
                    <FontAwesomeIcon icon={faTimes} />
                </button>
            </div>
            <div className="chat-mode-toggle">
                <button
                    className={mode === 'qa' ? 'active' : ''}
                    onClick={() => setMode('qa')}
                    disabled={isLoading}
                >
                    <FontAwesomeIcon icon={faComments} /> Hỏi đáp
                </button>
                <button
                    className={mode === 'dict' ? 'active' : ''}
                    onClick={() => setMode('dict')}
                    disabled={isLoading}
                >
                    <FontAwesomeIcon icon={faBookOpen} /> Tra từ điển
                </button>
            </div>
            <div className="chat-body" ref={chatBodyRef}>
                {messages.map((msg, index) => (
                    <div key={index} className={`chat-message ${msg.role}`}>
                        <div className="message-icon">
                            {msg.role === 'assistant' ? (
                                <span role="img" aria-label="EMILY AI" style={{ fontSize: '1.5rem', lineHeight: 1 }}>👩‍💼</span>
                            ) : (
                                <FontAwesomeIcon icon={faUser} />
                            )}
                        </div>
                        <div className="message-content">
                            <p>{msg.content}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="chat-message assistant">
                        <div className="message-icon">
                            <span role="img" aria-label="EMILY AI" style={{ fontSize: '1.5rem', lineHeight: 1 }}>👩‍💼</span>
                        </div>
                        <div className="message-content">
                            <FontAwesomeIcon icon={faSpinner} spin />
                        </div>
                    </div>
                )}
            </div>
            <div className="chat-input-area">
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={mode === 'qa' ? "Nhập câu hỏi về tiếng Anh..." : "Nhập từ/cụm từ cần tra..."}
                    disabled={isLoading}
                />
                <button onClick={handleSendMessage} disabled={isLoading}>
                    <FontAwesomeIcon icon={faPaperPlane} />
                </button>
            </div>
        </div>
    );
};

export default AIChat;
