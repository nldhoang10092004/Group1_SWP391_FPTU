import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faRobot, faUser, faSpinner, faTimes } from '@fortawesome/free-solid-svg-icons';
import './AI.scss';

// --- Configuration ---
// IMPORTANT: For security reasons, it is strongly recommended to NOT store your API key directly in the frontend code.
// This key will be visible to anyone inspecting your website's code.
// The best practice is to have a backend server that makes the API call to OpenAI.
// This frontend would then call your backend, keeping the API key safe.
// For development purposes, you can place your key here.
const OPENAI_API_KEY = "YOUR_OPENAI_API_KEY";  // Replace with your actual key, preferably from environment variables  
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// This is the "brain" of your AI Agent.
// It defines its role, personality, and knowledge base.
const SYSTEM_PROMPT = `
You are "EMILY - EMT AI SUPPORT", an expert AI assistant for an English learning website. Your personality is friendly, encouraging, and professional.

Your primary roles are:
1.  **English Language Mentor**: 
    *   Answer any grammar, vocabulary, or usage questions.
    *   Provide examples, explain nuances, and suggest learning strategies.
    *   Correct user's English text if they ask for it.
2.  **Course Advisor**:
    *   Provide information about the courses available on the website. (You will need to be provided with course data to do this effectively).
    *   Help users choose the right course based on their level and goals.
    *   Answer questions about course content and structure.
3.  **AI Dictionary**:
    *   Define English words and provide synonyms, antonyms, and example sentences.
    *   Explain idioms and phrasal verbs.
4.  **General Website Assistant**:
    *   Answer questions about website features like "Flashcards", "Speaking Practice", etc.

Guidelines:
- **Always respond in Vietnamese.** Only use English when the user explicitly asks for it or when it's necessary for the context (e.g., providing an English example sentence).
- Keep your responses concise and easy to understand.
- Use formatting like lists and bold text to improve readability.
- If you don't know the answer, say so honestly. Do not invent information, especially about course details.
- Always be polite and supportive.
`;

const AIChat = ({ isVisible, onClose }) => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hello! I'm EMILY - EMT AI SUPPORT. How can I help you with your English learning today?" }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatBodyRef = useRef(null);

    // Automatically scroll to the latest message
    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!userInput.trim() || isLoading) return;

        const newMessages = [...messages, { role: 'user', content: userInput }];
        setMessages(newMessages);
        setUserInput('');
        setIsLoading(true);

        try {
            const response = await fetch(OPENAI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo', // Or 'gpt-4' if you have access
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        ...newMessages
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API Error: ${errorData.error.message}`);
            }

            const data = await response.json();
            const assistantMessage = data.choices[0].message.content;

            setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
        } catch (error) {
            console.error("Error calling OpenAI API:", error);
            setMessages(prev => [...prev, { role: 'assistant', content: `Sorry, I have encountered an error: ${error.message}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="ai-chat-widget">
            <div className="chat-header">
                <h3>EMILY - EMT AI SUPPORT</h3>
                <button onClick={onClose} className="close-btn">
                    <FontAwesomeIcon icon={faTimes} />
                </button>
            </div>
            <div className="chat-body" ref={chatBodyRef}>
                {messages.map((msg, index) => (
                    <div key={index} className={`chat-message ${msg.role}`}>
                        <div className="message-icon">
                            <FontAwesomeIcon icon={msg.role === 'assistant' ? faRobot : faUser} />
                        </div>
                        <div className="message-content">
                            <p>{msg.content}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="chat-message assistant">
                        <div className="message-icon">
                            <FontAwesomeIcon icon={faRobot} />
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
                    placeholder="Ask me anything about English..."
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