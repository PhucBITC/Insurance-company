import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Trash2, 
  Sparkles, 
  RefreshCw,
  Layout,
  Terminal,
  Activity
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import apiClient from '../../api/apiClient';

const SystemAiAnalyst = () => {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('admin_ai_messages');
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
        text: 'Xin chào Quản trị viên! Tôi là Trợ lý phân tích hệ thống AI của bảo hiểm Bảo An.\n\nTôi có quyền truy cập thời gian thực tới cơ sở dữ liệu hệ thống (bao gồm các chỉ số người dùng, trạng thái hợp đồng, yêu cầu bồi thường sự cố) và 15 lịch sử hoạt động (System logs) gần nhất.\n\nTôi có thể giúp bạn kiểm tra các bất thường hệ thống, tóm tắt các cảnh báo gần đây, hoặc lập báo cáo nhanh số liệu thống kê. Bạn muốn kiểm tra nội dung gì hôm nay?',
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        isAi: false
      }
    ];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickReplies = [
    "Kiểm tra tính bất thường trong logs",
    "Tóm tắt trạng thái hệ thống",
    "Thống kê tài khoản người dùng",
    "Tóm tắt các yêu cầu sự cố gần đây"
  ];

  useEffect(() => {
    localStorage.setItem('admin_ai_messages', JSON.stringify(messages));
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
      const response = await apiClient.post('/api/admin/ai/query-system', {
        query: text.trim()
      });

      const botTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const botMsg = {
        id: 'msg-' + Date.now() + '-bot',
        text: response.data.reply || 'Xin lỗi, tôi gặp khó khăn khi truy xuất báo cáo hệ thống.',
        time: botTime,
        isAi: response.data.isAi
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      const botTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const botMsg = {
        id: 'msg-' + Date.now() + '-bot',
        text: 'Rất tiếc, hệ thống AI đang gặp sự cố kết nối. Vui lòng thử lại sau ít phút!',
        time: botTime,
        isAi: false,
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

  const clearChat = () => {
    if (window.confirm('Bạn có muốn xóa lịch sử phân tích AI này không?')) {
      const initialMsg = [
        {
          id: 'welcome',
          sender: 'bot',
          text: 'Xin chào Quản trị viên! Tôi là Trợ lý phân tích hệ thống AI của bảo hiểm Bảo An.\n\nTôi có quyền truy cập thời gian thực tới cơ sở dữ liệu hệ thống (bao gồm các chỉ số người dùng, trạng thái hợp đồng, yêu cầu bồi thường sự cố) và 15 lịch sử hoạt động (System logs) gần nhất.\n\nTôi có thể giúp bạn kiểm tra các bất thường hệ thống, tóm tắt các cảnh báo gần đây, hoặc lập báo cáo nhanh số liệu thống kê. Bạn muốn kiểm tra nội dung gì hôm nay?',
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          isAi: false
        }
      ];
      setMessages(initialMsg);
    }
  };

  const formatMessageText = (text) => {
    if (!text) return '';
    return text.split('\n').map((line, idx) => {
      let content = line;
      let isBullet = false;
      
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        isBullet = true;
        content = line.trim().substring(2);
      } else if (line.trim().match(/^\d+\.\s/)) {
        const match = line.trim().match(/^(\d+\.)\s(.*)/);
        if (match) {
          isBullet = true;
          content = <strong>{match[1]} </strong>;
          return (
            <li key={idx} style={{ marginLeft: '20px', listStyleType: 'decimal', marginBottom: '6px', fontSize: '0.875rem', lineHeight: '1.5' }}>
              {match[2].split('**').map((part, i) => {
                if (i % 2 === 1) {
                  return <strong key={i} style={{ color: 'var(--text-main)', fontWeight: '600' }}>{part}</strong>;
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
          return <strong key={i} style={{ color: 'var(--text-main)', fontWeight: '700' }}>{part}</strong>;
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)', gap: '20px' }} className="saas-fade-in">
      
      <PageHeader 
        title="Trợ Lý AI Phân Tích Hệ Thống" 
        description="Phân tích tình trạng cơ sở dữ liệu hệ thống, cảnh báo bất thường trong nhật ký hoạt động gần đây bằng mô hình AI Groq."
        actions={
          <button 
            onClick={clearChat} 
            className="btn btn-secondary" 
            style={{ height: '38px', gap: '6px', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
          >
            <Trash2 size={14} />
            Xóa lịch sử phân tích
          </button>
        }
      />

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
              backgroundColor: 'var(--primary)', 
              boxShadow: '0 0 8px var(--primary)'
            }} />
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={14} /> Admin AI Analyst
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="badge badge-info" style={{ fontSize: '0.75rem', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Terminal size={12} /> Groq Realtime
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
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--border)'
                  }}>
                    <Bot size={18} />
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
                      ? 'var(--background)' 
                      : 'var(--primary)',
                    color: isBot ? 'var(--text-main)' : '#ffffff',
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
                        color: msg.isAi ? 'var(--primary)' : 'var(--text-muted)',
                        fontWeight: msg.isAi ? '600' : 'normal'
                      }}>
                        {msg.isAi ? '• Trực tuyến AI' : '• Trích xuất Metrics'}
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
                    backgroundColor: 'var(--border)',
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
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border)'
              }}>
                <Bot size={18} />
              </div>
              <div style={{
                backgroundColor: 'var(--background)',
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
                e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.05)';
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.color = 'var(--primary)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--background)';
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text-main)';
              }}
            >
              <Sparkles size={10} style={{ color: '#eab308' }} />
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
            placeholder="Nhập câu hỏi phân tích hệ thống tại đây..."
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

export default SystemAiAnalyst;
