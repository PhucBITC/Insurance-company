import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Trash2, 
  Sparkles, 
  ShieldAlert,
  RefreshCw
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import apiClient from '../../api/apiClient';
import { useUI } from '../../context/UIContext';

const EmployeeAiAssistant = () => {
  const { language, showConfirm } = useUI();
  
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('employee_ai_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: 'welcome',
        sender: 'bot',
        text: language === 'vi' 
          ? 'Xin chào! Tôi là Trợ lý AI Nghiệp vụ của bảo hiểm Bảo An.\n\nTôi có thể hỗ trợ bạn tra cứu nhanh quy trình xử lý hợp đồng bảo hiểm, điều khoản bồi thường sự cố, chính sách bảo hiểm của các gói sản phẩm và giải đáp các câu hỏi nghiệp vụ dựa trên tài liệu Wiki nội bộ.\n\nBạn cần hỗ trợ giải đáp nghiệp vụ nào hôm nay?'
          : 'Welcome! I am your Operational AI Assistant at Bao An Insurance.\n\nI can help you quickly look up contract processing guidelines, claim audit policies, product package terms, and answer insurance operations queries based on our internal Wiki documentation.\n\nWhat operational questions do you have today?',
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        isAiModel: false
      }
    ];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickReplies = language === 'vi' ? [
    "Quy trình duyệt hợp đồng bảo hiểm",
    "Quy trình thẩm định bồi thường sự cố",
    "Tài liệu Wiki nội bộ hướng dẫn những gì?",
    "Cách tiếp nhận lịch hẹn của khách hàng"
  ] : [
    "Insurance contract approval workflow",
    "Incident claim auditing process",
    "What guidelines does the Wiki document provide?",
    "How to manage customer appointments"
  ];

  // Save messages to local storage
  useEffect(() => {
    const welcomeMsg = messages.find(m => m.id === 'welcome');
    let messagesToSave = messages;
    
    if (messages.length > 50) {
      const recentMessages = messages.slice(-50);
      if (welcomeMsg && !recentMessages.some(m => m.id === 'welcome')) {
        messagesToSave = [welcomeMsg, ...recentMessages];
      } else {
        messagesToSave = recentMessages;
      }
    }
    
    localStorage.setItem('employee_ai_messages', JSON.stringify(messagesToSave));
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [loading]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    if (!textToSend) {
      setInput('');
    }

    const userTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      id: 'msg-' + Date.now() + '-user',
      sender: 'user',
      text: text.trim(),
      time: userTime
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await apiClient.post('/api/employee/ai/chat', {
        message: text.trim()
      });

      const botTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const botMsg = {
        id: 'msg-' + Date.now() + '-bot',
        sender: 'bot',
        text: response.data.reply || (language === 'vi' ? 'Xin lỗi, tôi gặp khó khăn khi phản hồi câu hỏi này.' : 'Sorry, I encountered an issue responding to this query.'),
        time: botTime,
        isAiModel: response.data.isAi
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      const botTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const botMsg = {
        id: 'msg-' + Date.now() + '-bot',
        sender: 'bot',
        text: language === 'vi' 
          ? 'Rất tiếc, hệ thống đang gặp lỗi kết nối. Vui lòng thử lại sau ít phút!' 
          : 'Sorry, the connection failed. Please try again in a few moments!',
        time: botTime,
        isAiModel: false,
        isError: true
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const clearChat = async () => {
    if (await showConfirm(language === 'vi' ? 'Bạn có muốn xóa toàn bộ lịch sử trò chuyện này không?' : 'Do you want to clear all chat history?')) {
      const initialMsg = [
        {
          id: 'welcome',
          sender: 'bot',
          text: language === 'vi'
            ? 'Xin chào! Tôi là Trợ lý AI Nghiệp vụ của bảo hiểm Bảo An.\n\nTôi có thể hỗ trợ bạn tra cứu nhanh quy trình xử lý hợp đồng bảo hiểm, điều khoản bồi thường sự cố, chính sách bảo hiểm của các gói sản phẩm và giải đáp các câu hỏi nghiệp vụ dựa trên tài liệu Wiki nội bộ.\n\nBạn cần hỗ trợ giải đáp nghiệp vụ nào hôm nay?'
            : 'Welcome! I am your Operational AI Assistant at Bao An Insurance.\n\nI can help you quickly look up contract processing guidelines, claim audit policies, product package terms, and answer insurance operations queries based on our internal Wiki documentation.\n\nWhat operational questions do you have today?',
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          isAiModel: false
        }
      ];
      setMessages(initialMsg);
    }
  };

  // Helper formatter to render simple markdown bullet points and bold text
  const formatMessageText = (text) => {
    if (!text) return '';
    
    return text.split('\n').map((line, idx) => {
      let content = line;
      let isBullet = false;
      
      // Parse bullet points
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        isBullet = true;
        content = line.trim().substring(2);
      } else if (line.trim().match(/^\d+\.\s/)) {
        // Parse numbered list items e.g., "1. "
        const match = line.trim().match(/^(\d+\.)\s(.*)/);
        if (match) {
          isBullet = true;
          content = <strong>{match[1]} </strong>;
          return (
            <li key={idx} style={{ marginLeft: '20px', listStyleType: 'decimal', marginBottom: '6px', fontSize: '0.875rem', lineHeight: '1.5' }}>
              {match[2].split('**').map((part, i) => {
                if (i % 2 === 1) {
                  return <strong key={i} style={{ color: 'var(--text-main, #0f172a)', fontWeight: '600' }}>{part}</strong>;
                }
                return part;
              })}
            </li>
          );
        }
      }

      const parts = typeof content === 'string' ? content.split('**') : [content];
      const formattedParts = parts.map((part, i) => {
        if (typeof part === 'string' && i % 2 === 1) {
          return <strong key={i} style={{ color: 'var(--text-main, #0f172a)', fontWeight: '700' }}>{part}</strong>;
        }
        return part;
      });

      if (isBullet) {
        return (
          <li key={idx} style={{ marginLeft: '20px', listStyleType: 'disc', marginBottom: '6px', fontSize: '0.875rem', lineHeight: '1.5' }}>
            {formattedParts}
          </li>
        );
      }

      return (
        <p key={idx} style={{ margin: '0 0 8px 0', minHeight: line.trim() === '' ? '12px' : 'auto', fontSize: '0.875rem', lineHeight: '1.5' }}>
          {formattedParts}
        </p>
      );
    });
  };

  const actionButtons = (
    <button 
      onClick={clearChat} 
      className="btn btn-secondary" 
      style={{ height: '38px', gap: '6px', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
    >
      <Trash2 size={14} />
      {language === 'vi' ? 'Xóa hội thoại' : 'Clear Chat'}
    </button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)', gap: '20px' }} className="saas-fade-in">
      
      {/* Page Header */}
      <PageHeader 
        title={language === 'vi' ? "Trợ lý AI nghiệp vụ" : "Operational AI Assistant"} 
        description={language === 'vi' 
          ? "Giải đáp mọi vấn đề nghiệp vụ bảo hiểm, đối soát hồ sơ và quy trình phê duyệt khách hàng."
          : "Get instant answers on insurance processing guidelines, claims auditing, and customer workflows."}
        actions={actionButtons}
      />

      {/* Main Chat Container */}
      <div className="saas-card" style={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        padding: 0, 
        overflow: 'hidden',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-lg)',
        backgroundColor: 'var(--card)',
        borderRadius: 'var(--radius-md)'
      }}>
        
        {/* Chat Header Info */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.01)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#10b981', // green dot
              boxShadow: '0 0 8px #10b981'
            }} />
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)' }}>AI Assistant (Llama 3.3)</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="badge badge-info" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
              Groq Cloud
            </span>
          </div>
        </div>

        {/* Scrollable Messages Container */}
        <div style={{
          flexGrow: 1,
          overflowY: 'auto',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          backgroundColor: 'rgba(255,255,255,0.01)'
        }}>
          {messages.map((msg) => {
            const isBot = msg.sender === 'bot';
            return (
              <div 
                key={msg.id} 
                style={{
                  display: 'flex',
                  justifyContent: isBot ? 'flex-start' : 'flex-end',
                  width: '100%',
                  gap: '12px'
                }}
              >
                {/* Bot Avatar */}
                {isBot && (
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: msg.isError ? 'var(--danger-light, rgba(239, 68, 68, 0.1))' : 'var(--primary-light, rgba(79, 70, 229, 0.1))',
                    color: msg.isError ? 'var(--danger)' : 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--border)'
                  }}>
                    {msg.isError ? <ShieldAlert size={18} /> : <Bot size={18} />}
                  </div>
                )}

                {/* Message Bubble */}
                <div style={{
                  maxWidth: '75%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <div style={{
                    backgroundColor: isBot 
                      ? 'var(--background, #f8fafc)' 
                      : 'var(--primary, #4f46e5)',
                    color: isBot ? 'var(--text-main, #334155)' : '#ffffff',
                    padding: '12px 16px',
                    borderRadius: isBot 
                      ? '0 16px 16px 16px' 
                      : '16px 0 16px 16px',
                    border: isBot ? '1px solid var(--border)' : 'none',
                    boxShadow: 'var(--shadow-sm)',
                    wordBreak: 'break-word'
                  }}>
                    {isBot ? (
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {formatMessageText(msg.text)}
                      </div>
                    ) : (
                      <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.5' }}>{msg.text}</p>
                    )}
                  </div>
                  
                  {/* Meta (Time and AI tags) */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isBot ? 'flex-start' : 'flex-end',
                    gap: '8px',
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)'
                  }}>
                    <span>{msg.time}</span>
                    {isBot && (
                      <span style={{ 
                        color: msg.isAiModel ? 'var(--primary)' : 'var(--text-muted)',
                        fontWeight: msg.isAiModel ? '600' : 'normal'
                      }}>
                        {msg.isAiModel ? (language === 'vi' ? '• Trực tuyến Llama' : '• Llama Online') : (language === 'vi' ? '• Trích xuất Offline' : '• Offline Retrieval')}
                      </span>
                    )}
                  </div>
                </div>

                {/* User Avatar */}
                {!isBot && (
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--border, #e2e8f0)',
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--border)'
                  }}>
                    <User size={18} />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%', gap: '12px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-light, rgba(79, 70, 229, 0.1))',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border)'
              }}>
                <Bot size={18} />
              </div>
              <div style={{
                backgroundColor: 'var(--background, #f8fafc)',
                padding: '12px 18px',
                borderRadius: '0 16px 16px 16px',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span className="dot-blink" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--text-muted)' }} />
                <span className="dot-blink" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--text-muted)', animationDelay: '0.2s' }} />
                <span className="dot-blink" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--text-muted)', animationDelay: '0.4s' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          backgroundColor: 'rgba(0,0,0,0.005)'
        }}>
          {quickReplies.map((reply, index) => (
            <button
              key={index}
              disabled={loading}
              onClick={() => handleSend(reply)}
              className="btn"
              style={{
                fontSize: '0.75rem',
                padding: '6px 12px',
                borderRadius: '20px',
                height: 'auto',
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                color: 'var(--text-main)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary-light, rgba(79, 70, 229, 0.05))';
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.color = 'var(--primary)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--background)';
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text-main)';
              }}
            >
              <Sparkles size={10} style={{ color: 'var(--warning, #eab308)' }} />
              {reply}
            </button>
          ))}
        </div>

        {/* Input Text Box */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          gap: '12px',
          backgroundColor: 'var(--card)'
        }}>
          <input
            type="text"
            className="form-input"
            placeholder={language === 'vi' ? "Nhập câu hỏi nghiệp vụ của bạn..." : "Ask operational question here..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            style={{
              flexGrow: 1,
              height: '42px',
              borderRadius: 'var(--radius-sm)'
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="btn btn-primary"
            style={{
              width: '42px',
              height: '42px',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
      
      {/* Styles for typing blinking effect */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        .dot-blink {
          animation: blink 1.2s infinite both;
        }
      `}</style>
    </div>
  );
};

export default EmployeeAiAssistant;
