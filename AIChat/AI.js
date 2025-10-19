/**
 * ============================================
 * EMT AI CHATBOT - VANILLA JAVASCRIPT
 * ============================================
 * File: /components/AIChat/AI.js
 * Description: Standalone AI Chatbot - Có thể gắn vào bất kỳ website nào
 * Usage: import './components/AIChat/AI.js' trong App
 * ============================================
 */

(function() {
  'use strict';

  // ============================================
  // 🔧 CẤU HÌNH API - PASTE KEYS VÀO ĐÂY
  // ============================================
  
  const AI_CONFIG = {
    // Google Gemini API
    GOOGLE_API_KEY: '',
    GOOGLE_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    
    // OpenAI GPT API (Alternative)
    OPENAI_API_KEY: '',
    OPENAI_API_URL: 'https://api.openai.com/v1/chat/completions',
    
    // Chọn provider: 'google' hoặc 'openai'
    PROVIDER: 'google',
  };

  // ============================================
  // 📝 SYSTEM PROMPTS - TÙY CHỈNH Ở ĐÂY
  // ============================================
  
  const SYSTEM_PROMPTS = {
    greeting: "Xin chào! Tôi là trợ lý AI của EMT - English Master. Tôi có thể giúp bạn:",
    capabilities: [
      "🎓 Tư vấn khóa học phù hợp với trình độ",
      "📚 Giải đáp về nội dung và cấu trúc khóa học",
      "💰 Thông tin về giá cả và membership",
      "💬 Hỗ trợ học tiếng Anh (ngữ pháp, từ vựng, phát âm)",
      "❓ Trả lời các câu hỏi về EMT platform"
    ],
    
    systemContext: `Bạn là trợ lý AI thông minh của EMT - English Master, một nền tảng học tiếng Anh trực tuyến chuyên nghiệp tại Việt Nam.

🎯 THÔNG TIN VỀ EMT:
- 4 cấp độ khóa học: Beginner, Pre-Intermediate, Intermediate, Advanced
- Membership: Học viên mua membership để truy cập toàn bộ khóa học
- Video demo miễn phí cho người chưa có membership
- Tính năng: Video lessons, luyện tập, AI feedback, bài kiểm tra
- Giáo viên chuyên nghiệp, phương pháp giảng dạy hiện đại

🎓 CÁC KHÓA HỌC:
1. Beginner (A1-A2): Cơ bản, phát âm, ngữ pháp nền tảng
2. Pre-Intermediate (A2-B1): Giao tiếp cơ bản, từ vựng mở rộng
3. Intermediate (B1-B2): Giao tiếp tự tin, đọc hiểu nâng cao
4. Advanced (C1-C2): Chuyên sâu, IELTS/TOEFL, Business English

💡 NHIỆM VỤ:
- Tư vấn khóa học phù hợp dựa trên trình độ và mục tiêu
- Giải đáp thắc mắc về học tiếng Anh (ngữ pháp, từ vựng, kỹ năng)
- Hỗ trợ nhiệt tình, thân thiện, chuyên nghiệp
- Trả lời bằng tiếng Việt, giải thích dễ hiểu
- Khuyến khích học viên đăng ký membership

📌 LƯU Ý:
- Không đưa ra thông tin giá cả cụ thể (chỉ nói "liên hệ để biết chi tiết")
- Luôn giữ thái độ tích cực, động viên học viên
- Nếu không chắc chắn, gợi ý liên hệ support team`,
  };

  // ============================================
  // 🎨 LUCIDE ICONS (SVG)
  // ============================================
  
  const ICONS = {
    messageCircle: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
    x: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
    send: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>',
    bot: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>',
    sparkles: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>',
  };

  // ============================================
  // 💾 STATE MANAGEMENT
  // ============================================
  
  let state = {
    isOpen: false,
    messages: [
      {
        role: 'assistant',
        content: SYSTEM_PROMPTS.greeting,
        timestamp: new Date(),
      },
      {
        role: 'assistant',
        content: SYSTEM_PROMPTS.capabilities.join('\n'),
        timestamp: new Date(),
      }
    ],
    isTyping: false,
  };

  // ============================================
  // 🌐 API FUNCTIONS
  // ============================================
  
  async function callGoogleGeminiAPI(userMessage) {
    const response = await fetch(
      `${AI_CONFIG.GOOGLE_API_URL}?key=${AI_CONFIG.GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${SYSTEM_PROMPTS.systemContext}\n\nUser: ${userMessage}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    const data = await response.json();
    
    if (data.candidates && data.candidates[0]) {
      return data.candidates[0].content.parts[0].text;
    }
    
    throw new Error('Invalid response from Google Gemini API');
  }

  async function callOpenAIAPI(userMessage) {
    const response = await fetch(AI_CONFIG.OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPTS.systemContext
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    const data = await response.json();
    
    if (data.choices && data.choices[0]) {
      return data.choices[0].message.content;
    }
    
    throw new Error('Invalid response from OpenAI API');
  }

  async function getMockResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    if (message.includes('khóa học') || message.includes('course')) {
      return `EMT cung cấp 4 cấp độ khóa học:

🌟 **Beginner (A1-A2)**: Dành cho người mới bắt đầu
- Phát âm chuẩn, ngữ pháp nền tảng
- 50+ video bài giảng
- Thời lượng: 3-4 tháng

📚 **Pre-Intermediate (A2-B1)**: Giao tiếp cơ bản
- Mở rộng từ vựng, luyện nghe-nói
- 60+ video bài giảng
- Thời lượng: 4-5 tháng

🎯 **Intermediate (B1-B2)**: Tự tin giao tiếp
- Đọc hiểu nâng cao, viết essay
- 70+ video bài giảng
- Thời lượng: 5-6 tháng

🏆 **Advanced (C1-C2)**: Chuyên sâu
- IELTS/TOEFL, Business English
- 80+ video bài giảng
- Thời lượng: 6-8 tháng

Bạn đang ở trình độ nào để tôi tư vấn chi tiết hơn? 😊`;
    }
    
    if (message.includes('giá') || message.includes('price') || message.includes('phí')) {
      return `💰 **Về chi phí học tập:**

EMT cung cấp gói Membership để bạn truy cập TOÀN BỘ khóa học:
- ✅ Học không giới hạn tất cả 4 cấp độ
- ✅ Tải tài liệu, bài tập
- ✅ AI feedback cá nhân hóa
- ✅ Certificate sau khi hoàn thành

🎁 **Ưu đãi đặc biệt:**
- Học thử MIỄN PHÍ với video demo
- Voucher giảm giá cho học viên mới

Để biết chi tiết về gói Membership và ưu đãi hiện tại, vui lòng liên hệ:
📧 contact@emt.edu.vn
📞 1900 xxxx

Hoặc bạn có thể đăng ký tài khoản để xem các video demo miễn phí nhé! 😊`;
    }
    
    if (message.includes('hello') || message.includes('hi') || message.includes('xin chào') || message.includes('chào')) {
      return `Xin chào! 👋 Tôi là trợ lý AI của EMT - English Master.

Tôi có thể giúp bạn:
🎓 Tư vấn khóa học
💬 Hỏi đáp tiếng Anh
📚 Giải thích ngữ pháp, từ vựng
💰 Thông tin về membership
❓ Các câu hỏi khác

Bạn cần hỗ trợ gì nhé? 😊`;
    }

    return `Cảm ơn câu hỏi của bạn! 😊

Tôi có thể giúp bạn về:
- 🎓 **Khóa học**: Tư vấn chương trình phù hợp
- 💬 **Tiếng Anh**: Ngữ pháp, từ vựng, kỹ năng
- 💰 **Membership**: Gói học và ưu đãi
- 📝 **Lộ trình**: Kế hoạch học tập cá nhân

Bạn muốn biết về chủ đề nào cụ thể? Hỏi tôi bất cứ điều gì nhé! 🌟`;
  }

  // ============================================
  // 📨 SEND MESSAGE
  // ============================================
  
  async function sendMessage(inputValue) {
    if (!inputValue.trim()) return;

    const userMessage = {
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    state.messages.push(userMessage);
    state.isTyping = true;
    render();

    try {
      let aiResponse;

      const hasGoogleKey = AI_CONFIG.GOOGLE_API_KEY !== '';
      const hasOpenAIKey = AI_CONFIG.OPENAI_API_KEY !== '';

      if (AI_CONFIG.PROVIDER === 'google' && hasGoogleKey) {
        aiResponse = await callGoogleGeminiAPI(inputValue);
      } else if (AI_CONFIG.PROVIDER === 'openai' && hasOpenAIKey) {
        aiResponse = await callOpenAIAPI(inputValue);
      } else {
        aiResponse = await getMockResponse(inputValue);
      }

      const assistantMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };

      state.messages.push(assistantMessage);
    } catch (error) {
      console.error('AI Error:', error);
      
      const errorMessage = {
        role: 'assistant',
        content: '😔 Xin lỗi, tôi gặp sự cố kỹ thuật. Vui lòng thử lại sau hoặc liên hệ support team:\n📧 contact@emt.edu.vn\n📞 1900 xxxx',
        timestamp: new Date(),
      };

      state.messages.push(errorMessage);
    } finally {
      state.isTyping = false;
      render();
    }
  }

  // ============================================
  // 🎨 RENDER FUNCTIONS
  // ============================================
  
  function formatTime(date) {
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  function createMessageHTML(message, index) {
    const isUser = message.role === 'user';
    const lines = message.content.split('\n').map(line => `<p>${line || '&nbsp;'}</p>`).join('');
    
    return `
      <div class="emt-chatbox-message ${isUser ? 'emt-chatbox-message-user' : 'emt-chatbox-message-assistant'}">
        ${!isUser ? `<div class="emt-chatbox-message-avatar">${ICONS.bot}</div>` : ''}
        <div class="emt-chatbox-message-content">
          <div class="emt-chatbox-message-bubble">
            ${lines}
          </div>
          <span class="emt-chatbox-message-time">${formatTime(message.timestamp)}</span>
        </div>
      </div>
    `;
  }

  function render() {
    const container = document.getElementById('emt-ai-chatbot-root');
    if (!container) return;

    const messagesHTML = state.messages.map((msg, idx) => createMessageHTML(msg, idx)).join('');
    
    const typingHTML = state.isTyping ? `
      <div class="emt-chatbox-message emt-chatbox-message-assistant">
        <div class="emt-chatbox-message-avatar">${ICONS.bot}</div>
        <div class="emt-chatbox-typing">
          <span></span><span></span><span></span>
        </div>
      </div>
    ` : '';

    const quickQuestionsHTML = state.messages.length <= 2 && !state.isTyping ? `
      <div class="emt-chatbox-quick-questions">
        <p class="emt-chatbox-quick-title">💡 Câu hỏi gợi ý:</p>
        <button class="emt-chatbox-quick-btn" onclick="window.EMTChatbot.askQuestion('Các khóa học có gì?')">Các khóa học có gì?</button>
        <button class="emt-chatbox-quick-btn" onclick="window.EMTChatbot.askQuestion('Giá membership bao nhiêu?')">Giá membership bao nhiêu?</button>
        <button class="emt-chatbox-quick-btn" onclick="window.EMTChatbot.askQuestion('Làm sao biết trình độ?')">Làm sao biết trình độ?</button>
      </div>
    ` : '';

    container.innerHTML = `
      ${!state.isOpen ? `
        <button class="emt-chatbox-float-button" onclick="window.EMTChatbot.toggle()">
          ${ICONS.messageCircle}
          <span class="emt-chatbox-pulse"></span>
        </button>
      ` : `
        <div class="emt-chatbox-container">
          <!-- Header -->
          <div class="emt-chatbox-header">
            <div class="emt-chatbox-header-left">
              <div class="emt-chatbox-avatar">
                ${ICONS.bot}
                <span class="emt-chatbox-status-dot"></span>
              </div>
              <div>
                <h3 class="emt-chatbox-title">EMT AI Assistant</h3>
                <p class="emt-chatbox-subtitle">
                  ${ICONS.sparkles}
                  Tư vấn tiếng Anh & Khóa học
                </p>
              </div>
            </div>
            <button class="emt-chatbox-close-btn" onclick="window.EMTChatbot.toggle()">
              ${ICONS.x}
            </button>
          </div>

          <!-- Messages -->
          <div class="emt-chatbox-messages" id="emt-chatbox-messages">
            ${messagesHTML}
            ${typingHTML}
            ${quickQuestionsHTML}
          </div>

          <!-- Input -->
          <div class="emt-chatbox-input-container">
            <textarea 
              id="emt-chatbox-input"
              placeholder="Nhập câu hỏi của bạn..."
              class="emt-chatbox-input"
              rows="1"
            ></textarea>
            <button 
              class="emt-chatbox-send-btn" 
              onclick="window.EMTChatbot.send()"
              id="emt-chatbox-send-btn"
            >
              ${ICONS.send}
            </button>
          </div>

          <!-- Footer -->
          <div class="emt-chatbox-footer">
            Powered by AI • EMT - English Master
          </div>
        </div>
      `}
    `;

    // Auto scroll
    if (state.isOpen) {
      setTimeout(() => {
        const messagesContainer = document.getElementById('emt-chatbox-messages');
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }, 100);
    }

    // Setup input events
    if (state.isOpen) {
      const input = document.getElementById('emt-chatbox-input');
      if (input) {
        input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            window.EMTChatbot.send();
          }
        });
        input.focus();
      }
    }
  }

  // ============================================
  // 🌍 GLOBAL API
  // ============================================
  
  window.EMTChatbot = {
    toggle: function() {
      state.isOpen = !state.isOpen;
      render();
    },
    send: function() {
      const input = document.getElementById('emt-chatbox-input');
      if (input && input.value.trim()) {
        sendMessage(input.value);
        input.value = '';
      }
    },
    askQuestion: function(question) {
      sendMessage(question);
    }
  };

  // ============================================
  // 🎨 INJECT CSS
  // ============================================
  
  function injectCSS() {
    const style = document.createElement('style');
    style.textContent = `
      /* ============================================ */
      /* EMT AI CHATBOT STYLES */
      /* ============================================ */
      
      /* Float Button */
      .emt-chatbox-float-button {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        width: 4rem;
        height: 4rem;
        background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
        border: none;
        border-radius: 9999px;
        box-shadow: 0 8px 24px rgba(14, 165, 233, 0.4);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
        transition: all 0.3s ease;
        animation: emtChatboxFloat 3s ease-in-out infinite;
        color: white;
      }

      .emt-chatbox-float-button:hover {
        transform: scale(1.1);
        box-shadow: 0 12px 32px rgba(14, 165, 233, 0.5);
      }

      .emt-chatbox-pulse {
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 9999px;
        background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
        animation: emtChatboxPulse 2s ease-out infinite;
        pointer-events: none;
      }

      @keyframes emtChatboxFloat {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }

      @keyframes emtChatboxPulse {
        0% {
          transform: scale(1);
          opacity: 1;
        }
        100% {
          transform: scale(1.5);
          opacity: 0;
        }
      }

      /* Container */
      .emt-chatbox-container {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        width: 420px;
        height: 600px;
        background: white;
        border-radius: 1.5rem;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        display: flex;
        flex-direction: column;
        z-index: 99999;
        animation: emtChatboxSlideIn 0.3s ease-out;
        overflow: hidden;
      }

      @keyframes emtChatboxSlideIn {
        from {
          transform: translateY(20px) scale(0.95);
          opacity: 0;
        }
        to {
          transform: translateY(0) scale(1);
          opacity: 1;
        }
      }

      /* Header */
      .emt-chatbox-header {
        background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
        padding: 1.25rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid rgba(255, 255, 255, 0.2);
      }

      .emt-chatbox-header-left {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .emt-chatbox-avatar {
        position: relative;
        width: 2.5rem;
        height: 2.5rem;
        background: white;
        border-radius: 9999px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #0ea5e9;
      }

      .emt-chatbox-status-dot {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 0.625rem;
        height: 0.625rem;
        background: #10b981;
        border: 2px solid white;
        border-radius: 9999px;
      }

      .emt-chatbox-title {
        color: white;
        font-size: 1rem;
        font-weight: 700;
        margin: 0;
      }

      .emt-chatbox-subtitle {
        color: rgba(255, 255, 255, 0.9);
        font-size: 0.75rem;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      .emt-chatbox-close-btn {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        width: 2rem;
        height: 2rem;
        border-radius: 9999px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
        color: white;
      }

      .emt-chatbox-close-btn:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: rotate(90deg);
      }

      /* Messages */
      .emt-chatbox-messages {
        flex: 1;
        overflow-y: auto;
        padding: 1.25rem;
        background: linear-gradient(to bottom, #f0f9ff 0%, #ffffff 100%);
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .emt-chatbox-messages::-webkit-scrollbar {
        width: 6px;
      }

      .emt-chatbox-messages::-webkit-scrollbar-track {
        background: transparent;
      }

      .emt-chatbox-messages::-webkit-scrollbar-thumb {
        background: #bae6fd;
        border-radius: 9999px;
      }

      .emt-chatbox-message {
        display: flex;
        gap: 0.5rem;
        animation: emtChatboxMessageIn 0.3s ease-out;
      }

      @keyframes emtChatboxMessageIn {
        from {
          transform: translateY(10px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      .emt-chatbox-message-user {
        flex-direction: row-reverse;
      }

      .emt-chatbox-message-assistant {
        flex-direction: row;
      }

      .emt-chatbox-message-avatar {
        width: 1.75rem;
        height: 1.75rem;
        background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
        border-radius: 9999px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        color: white;
      }

      .emt-chatbox-message-content {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        max-width: 75%;
      }

      .emt-chatbox-message-bubble {
        padding: 0.875rem 1rem;
        border-radius: 1.25rem;
        line-height: 1.5;
        font-size: 0.9375rem;
      }

      .emt-chatbox-message-user .emt-chatbox-message-bubble {
        background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
        color: white;
        border-bottom-right-radius: 0.25rem;
      }

      .emt-chatbox-message-assistant .emt-chatbox-message-bubble {
        background: white;
        color: #0f172a;
        border: 1px solid #e0f2fe;
        border-bottom-left-radius: 0.25rem;
      }

      .emt-chatbox-message-bubble p {
        margin: 0.125rem 0;
      }

      .emt-chatbox-message-time {
        font-size: 0.6875rem;
        color: #94a3b8;
        padding: 0 0.5rem;
      }

      .emt-chatbox-message-user .emt-chatbox-message-time {
        text-align: right;
      }

      /* Typing */
      .emt-chatbox-typing {
        padding: 0.875rem 1rem;
        background: white;
        border: 1px solid #e0f2fe;
        border-radius: 1.25rem;
        border-bottom-left-radius: 0.25rem;
        display: flex;
        gap: 0.375rem;
        align-items: center;
        width: fit-content;
      }

      .emt-chatbox-typing span {
        width: 0.5rem;
        height: 0.5rem;
        background: #0ea5e9;
        border-radius: 9999px;
        animation: emtChatboxTyping 1.4s ease-in-out infinite;
      }

      .emt-chatbox-typing span:nth-child(2) {
        animation-delay: 0.2s;
      }

      .emt-chatbox-typing span:nth-child(3) {
        animation-delay: 0.4s;
      }

      @keyframes emtChatboxTyping {
        0%, 60%, 100% {
          transform: translateY(0);
          opacity: 0.7;
        }
        30% {
          transform: translateY(-10px);
          opacity: 1;
        }
      }

      /* Quick Questions */
      .emt-chatbox-quick-questions {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-top: 0.5rem;
      }

      .emt-chatbox-quick-title {
        font-size: 0.8125rem;
        color: #64748b;
        margin: 0 0 0.25rem 0;
        font-weight: 600;
      }

      .emt-chatbox-quick-btn {
        background: white;
        border: 2px solid #bae6fd;
        padding: 0.625rem 0.875rem;
        border-radius: 9999px;
        font-size: 0.8125rem;
        color: #0369a1;
        cursor: pointer;
        transition: all 0.2s;
        text-align: left;
        font-weight: 500;
      }

      .emt-chatbox-quick-btn:hover {
        background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
        color: white;
        border-color: transparent;
        transform: translateX(4px);
      }

      /* Input */
      .emt-chatbox-input-container {
        padding: 1rem;
        background: white;
        border-top: 2px solid #e0f2fe;
        display: flex;
        gap: 0.75rem;
        align-items: flex-end;
      }

      .emt-chatbox-input {
        flex: 1;
        padding: 0.875rem 1rem;
        border: 2px solid #e0f2fe;
        border-radius: 9999px;
        font-size: 0.9375rem;
        resize: none;
        max-height: 100px;
        transition: all 0.2s;
        font-family: inherit;
      }

      .emt-chatbox-input:focus {
        outline: none;
        border-color: #0ea5e9;
        box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
      }

      .emt-chatbox-send-btn {
        width: 2.75rem;
        height: 2.75rem;
        background: #e0f2fe;
        border: none;
        border-radius: 9999px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
        flex-shrink: 0;
        color: #0369a1;
      }

      .emt-chatbox-send-btn:hover {
        background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
        color: white;
        transform: scale(1.05);
      }

      /* Footer */
      .emt-chatbox-footer {
        padding: 0.625rem;
        background: #f8fafc;
        text-align: center;
        font-size: 0.6875rem;
        color: #94a3b8;
        border-top: 1px solid #e0f2fe;
      }

      /* Responsive */
      @media (max-width: 640px) {
        .emt-chatbox-container {
          width: calc(100vw - 2rem);
          height: calc(100vh - 4rem);
          bottom: 1rem;
          right: 1rem;
        }

        .emt-chatbox-float-button {
          bottom: 1.5rem;
          right: 1.5rem;
          width: 3.5rem;
          height: 3.5rem;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // ============================================
  // 🚀 INIT
  // ============================================
  
  function init() {
    // Create root element
    const root = document.createElement('div');
    root.id = 'emt-ai-chatbot-root';
    document.body.appendChild(root);

    // Inject CSS
    injectCSS();

    // Initial render
    render();

    console.log('✅ EMT AI Chatbot initialized successfully!');
  }

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
