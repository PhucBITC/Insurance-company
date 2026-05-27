import React, { useState, useEffect, useRef } from 'react';
import { Send, User, MessageSquare, AlertCircle, RefreshCw, Phone, Mail } from 'lucide-react';
import apiClient from '../../api/apiClient';
import PageHeader from '../../components/PageHeader';
import { useUI } from '../../context/UIContext';

const LiveSupportChat = () => {
  const { language } = useUI();
  
  // State
  const [contact, setContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [connected, setConnected] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 1. Fetch contact (assigned employee)
  const fetchContactAndHistory = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const contactsRes = await apiClient.get('/api/chat/contacts');
      const contacts = contactsRes.data || [];
      
      if (contacts.length > 0) {
        const assignedEmployee = contacts[0];
        setContact(assignedEmployee);
        
        // Fetch chat history
        const historyRes = await apiClient.get('/api/chat/history', {
          params: { contactId: assignedEmployee.userId }
        });
        setMessages(historyRes.data || []);

        // Mark as read via HTTP
        apiClient.post(`/api/chat/read?contactId=${assignedEmployee.userId}`).catch(err => console.error(err));
        
        // 2. Connect WebSocket
        connectWebSocket(assignedEmployee.userId);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(language === 'vi' ? 'Không thể kết nối đến máy chủ hỗ trợ.' : 'Failed to connect to support server.');
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = (targetUserId) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Use ws protocol
    const wsUrl = `ws://localhost:8080/ws/chat?token=${token}`;
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      console.log('WebSocket connected');
      // Notify other user we are active in chat
      ws.send(JSON.stringify({ type: 'READ', recipientId: targetUserId }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'READ_RECEIPT') {
          // Target user read our messages, set all our sent messages to read
          setMessages(prev => prev.map(m => {
            if (m.senderId === 'ME' || m.senderId !== targetUserId) {
              return { ...m, isRead: true };
            }
            return m;
          }));
        } else if (msg.type === 'SENT_CONFIRMATION') {
          setMessages(prev => prev.map(m => {
            if (m.id === msg.tempId) {
              return { 
                ...m, 
                id: msg.id, 
                timestamp: msg.timestamp,
                isRead: msg.isRead,
                isRecalled: false,
                isEdited: false,
                reaction: null
              };
            }
            return m;
          }));
        } else if (msg.type === 'RECALL') {
          setMessages(prev => prev.map(m => {
            if (m.id === msg.messageId) {
              return { ...m, isRecalled: true, content: 'Tin nhắn đã được thu hồi' };
            }
            return m;
          }));
        } else if (msg.type === 'EDIT') {
          setMessages(prev => prev.map(m => {
            if (m.id === msg.messageId) {
              return { ...m, content: msg.content, isEdited: true };
            }
            return m;
          }));
        } else if (msg.type === 'REACT') {
          setMessages(prev => prev.map(m => {
            if (m.id === msg.messageId) {
              return { ...m, reaction: msg.reaction };
            }
            return m;
          }));
        } else if (msg.senderId === targetUserId) {
          setMessages(prev => [...prev, {
            id: msg.id,
            senderId: msg.senderId,
            recipientId: msg.recipientId,
            content: msg.content,
            timestamp: msg.timestamp,
            isRead: true,
            isRecalled: msg.isRecalled || false,
            isEdited: msg.isEdited || false,
            reaction: msg.reaction || null
          }]);
          // Automatically mark it as read immediately since we are in the active chat window
          ws.send(JSON.stringify({ type: 'READ', recipientId: targetUserId }));
          apiClient.post(`/api/chat/read?contactId=${targetUserId}`).catch(err => console.error(err));
        }
      } catch (e) {
        console.error(e);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      console.log('WebSocket disconnected');
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
    };
  };

  useEffect(() => {
    fetchContactAndHistory();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !contact || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    const content = input.trim();
    const tempId = 'temp-' + Date.now();
    const payload = {
      recipientId: contact.userId,
      content: content,
      tempId: tempId
    };

    // Send via socket
    socketRef.current.send(JSON.stringify(payload));

    // Optimistically add to messages
    const tempMsg = {
      id: tempId,
      senderId: 'ME', // Identifies current user as sender
      recipientId: contact.userId,
      content: content,
      timestamp: new Date().toISOString(),
      isRead: false,
      isRecalled: false,
      isEdited: false,
      reaction: null
    };
    
    setMessages(prev => [...prev, tempMsg]);
    setInput('');
  };

  const handleRecall = (msg) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;

    socketRef.current.send(JSON.stringify({
      type: 'RECALL',
      messageId: msg.id,
      recipientId: contact.userId
    }));

    setMessages(prev => prev.map(m => {
      if (m.id === msg.id) {
        return { ...m, isRecalled: true, content: 'Tin nhắn đã được thu hồi' };
      }
      return m;
    }));
    setActiveDropdownId(null);
  };

  const startEdit = (msg) => {
    setEditingMessageId(msg.id);
    setEditingContent(msg.content);
    setActiveDropdownId(null);
  };

  const submitEdit = (msg) => {
    if (!editingContent.trim() || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;

    socketRef.current.send(JSON.stringify({
      type: 'EDIT',
      messageId: msg.id,
      content: editingContent.trim(),
      recipientId: contact.userId
    }));

    setMessages(prev => prev.map(m => {
      if (m.id === msg.id) {
        return { ...m, content: editingContent.trim(), isEdited: true };
      }
      return m;
    }));

    setEditingMessageId(null);
    setEditingContent('');
  };

  const handleReact = (msg, emoji) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;

    const newReaction = msg.reaction === emoji ? null : emoji;

    socketRef.current.send(JSON.stringify({
      type: 'REACT',
      messageId: msg.id,
      reaction: newReaction,
      recipientId: contact.userId
    }));

    setMessages(prev => prev.map(m => {
      if (m.id === msg.id) {
        return { ...m, reaction: newReaction };
      }
      return m;
    }));
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)', gap: '20px' }} className="animate-fade-in">
      <PageHeader 
        title={language === 'vi' ? "Trò chuyện với Tư vấn viên" : "Chat with Consultant"} 
        description={language === 'vi' ? "Kết nối trực tiếp thời gian thực với Nhân viên tư vấn phụ trách chăm sóc riêng của bạn." : "Connect in real-time with your assigned insurance consultant."}
      />

      {loading ? (
        <div className="saas-card" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw className="animate-spin" size={32} style={{ marginBottom: '12px' }} />
          <div>{language === 'vi' ? 'Đang kết nối máy chủ...' : 'Connecting to server...'}</div>
        </div>
      ) : contact ? (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', flexGrow: 1, height: '80%' }}>
          {/* Chat Window */}
          <div className="saas-card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255, 255, 255, 0.01)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {contact.fullName.charAt(0)}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-main)' }}>{contact.fullName}</h4>
                  <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', color: connected ? 'var(--success)' : 'var(--text-muted)' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: connected ? 'var(--success)' : 'var(--text-muted)', display: 'inline-block' }}></span>
                    {connected ? (language === 'vi' ? 'Đã kết nối' : 'Connected') : (language === 'vi' ? 'Đang kết nối lại...' : 'Reconnecting...')}
                  </span>
                </div>
              </div>
            </div>

            {/* Message Area */}
            <div style={{ flexGrow: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: 'rgba(0,0,0,0.02)' }}>
              {messages.map((msg) => {
                const isMe = msg.senderId === 'ME' || msg.senderId !== contact.userId;
                return (
                  <div 
                    key={msg.id} 
                    onMouseEnter={() => setHoveredMessageId(msg.id)}
                    onMouseLeave={() => { setHoveredMessageId(null); setActiveDropdownId(null); }}
                    style={{ 
                      alignSelf: isMe ? 'flex-end' : 'flex-start', 
                      maxWidth: '85%', 
                      display: 'flex', 
                      flexDirection: isMe ? 'row-reverse' : 'row',
                      alignItems: 'center',
                      gap: '8px',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                      <div 
                        style={{ 
                          padding: '10px 14px', 
                          borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                          backgroundColor: msg.isRecalled 
                            ? 'rgba(0, 0, 0, 0.05)' 
                            : (isMe ? 'var(--primary)' : 'var(--card)'),
                          color: msg.isRecalled 
                            ? 'var(--text-muted)' 
                            : (isMe ? 'white' : 'var(--text-main)'),
                          fontSize: '0.9rem',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                          border: isMe && !msg.isRecalled ? 'none' : '1px solid var(--glass-border)',
                          whiteSpace: 'pre-wrap',
                          fontStyle: msg.isRecalled ? 'italic' : 'normal',
                          position: 'relative'
                        }}
                      >
                        {editingMessageId === msg.id ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '220px' }}>
                            <textarea
                              value={editingContent}
                              onChange={(e) => setEditingContent(e.target.value)}
                              style={{
                                width: '100%',
                                padding: '6px 10px',
                                borderRadius: '8px',
                                border: '1px solid var(--glass-border)',
                                backgroundColor: 'var(--card)',
                                color: 'var(--text-main)',
                                fontSize: '0.9rem',
                                resize: 'vertical',
                                minHeight: '60px',
                                outline: 'none'
                              }}
                            />
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                onClick={() => setEditingMessageId(null)}
                                style={{
                                  padding: '4px 10px',
                                  fontSize: '0.75rem',
                                  borderRadius: '4px',
                                  border: '1px solid var(--glass-border)',
                                  backgroundColor: 'transparent',
                                  color: isMe ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)',
                                  cursor: 'pointer'
                                }}
                              >
                                {language === 'vi' ? 'Hủy' : 'Cancel'}
                              </button>
                              <button
                                type="button"
                                onClick={() => submitEdit(msg)}
                                style={{
                                  padding: '4px 10px',
                                  fontSize: '0.75rem',
                                  borderRadius: '4px',
                                  border: 'none',
                                  backgroundColor: 'white',
                                  color: 'var(--primary)',
                                  fontWeight: '600',
                                  cursor: 'pointer'
                                }}
                              >
                                {language === 'vi' ? 'Lưu' : 'Save'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {msg.isRecalled 
                              ? (language === 'vi' ? 'Tin nhắn đã được thu hồi' : 'Message recalled')
                              : msg.content
                            }
                            {msg.isEdited && !msg.isRecalled && (
                              <span style={{ fontSize: '0.7rem', opacity: 0.7, marginLeft: '6px', fontStyle: 'italic' }}>
                                ({language === 'vi' ? 'đã chỉnh sửa' : 'edited'})
                              </span>
                            )}
                          </>
                        )}

                        {/* Reaction badge */}
                        {msg.reaction && (
                          <div 
                            style={{ 
                              position: 'absolute', 
                              bottom: '-12px', 
                              right: isMe ? 'auto' : '10px', 
                              left: isMe ? '10px' : 'auto', 
                              backgroundColor: 'var(--card)', 
                              border: '1px solid var(--glass-border)', 
                              borderRadius: '12px', 
                              padding: '1px 6px', 
                              fontSize: '0.8rem', 
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              zIndex: 2
                            }}
                          >
                            {msg.reaction}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: msg.reaction ? '14px' : '4px', padding: '0 4px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {formatTime(msg.timestamp)}
                        </span>
                        {isMe && msg.isRead && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '600' }}>
                            • {language === 'vi' ? 'Đã xem' : 'Seen'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Tools (Hover Emojis & Dropdown Menu) */}
                    {hoveredMessageId === msg.id && !msg.isRecalled && !editingMessageId && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        backgroundColor: 'var(--card)', 
                        border: '1px solid var(--glass-border)', 
                        borderRadius: '20px', 
                        padding: '4px 8px', 
                        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                        zIndex: 5
                      }}>
                        {['👍', '❤️', '😂', '😮', '😢', '😡'].map(emoji => (
                          <button 
                            key={emoji}
                            type="button"
                            onClick={() => handleReact(msg, emoji)}
                            style={{ 
                              border: 'none', 
                              background: 'none', 
                              cursor: 'pointer', 
                              fontSize: '1rem', 
                              padding: '2px',
                              transition: 'transform 0.1s ease',
                              display: 'inline-flex',
                              alignItems: 'center'
                            }}
                            title={emoji}
                            onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                          >
                            {emoji}
                          </button>
                        ))}

                        {isMe && !msg.id.toString().startsWith('temp-') && (
                          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <button
                              type="button"
                              onClick={() => setActiveDropdownId(prev => prev === msg.id ? null : msg.id)}
                              style={{
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                color: 'var(--text-muted)',
                                fontSize: '1rem',
                                padding: '2px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                fontWeight: 'bold'
                              }}
                            >
                              ⋮
                            </button>
                            {activeDropdownId === msg.id && (
                              <div style={{
                                position: 'absolute',
                                bottom: '100%',
                                right: isMe ? '0' : 'auto',
                                left: isMe ? 'auto' : '0',
                                backgroundColor: 'var(--card)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                padding: '4px 0',
                                zIndex: 15,
                                minWidth: '110px',
                                display: 'flex',
                                flexDirection: 'column',
                                marginBottom: '6px'
                              }}>
                                <button
                                  type="button"
                                  onClick={() => startEdit(msg)}
                                  style={{
                                    padding: '6px 12px',
                                    border: 'none',
                                    background: 'none',
                                    textAlign: 'left',
                                    color: 'var(--text-main)',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    width: '100%',
                                    display: 'block'
                                  }}
                                  onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.05)'}
                                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                >
                                  {language === 'vi' ? 'Sửa tin nhắn' : 'Edit message'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(language === 'vi' ? 'Bạn có chắc chắn muốn thu hồi tin nhắn này?' : 'Are you sure you want to recall this message?')) {
                                      handleRecall(msg);
                                    }
                                  }}
                                  style={{
                                    padding: '6px 12px',
                                    border: 'none',
                                    background: 'none',
                                    textAlign: 'left',
                                    color: 'var(--danger)',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    width: '100%',
                                    display: 'block'
                                  }}
                                  onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.05)'}
                                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                >
                                  {language === 'vi' ? 'Thu hồi' : 'Recall'}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} style={{ padding: '16px 20px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '12px' }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={language === 'vi' ? "Nhập tin nhắn..." : "Type a message..."}
                style={{ flexGrow: 1, height: '40px', padding: '0 16px', borderRadius: '20px', border: '1px solid var(--glass-border)', outline: 'none', backgroundColor: 'var(--card)', color: 'var(--text-main)' }}
                disabled={!connected}
              />
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0, minWidth: 'auto', justifyContent: 'center' }}
                disabled={!input.trim() || !connected}
              >
                <Send size={16} />
              </button>
            </form>
          </div>

          {/* Consultant Detail Box */}
          <div className="saas-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', height: 'fit-content' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px', margin: 0, color: 'var(--text-main)' }}>
              {language === 'vi' ? 'Thông tin nhân viên phụ trách' : 'Assigned Consultant'}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '12px 0' }}>
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 'bold' }}>
                {contact.fullName.charAt(0)}
              </div>
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)' }}>{contact.fullName}</h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{language === 'vi' ? 'Tư vấn viên chuyên nghiệp' : 'Professional Consultant'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Phone size={16} style={{ color: 'var(--primary)' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{language === 'vi' ? 'Số điện thoại' : 'Phone number'}</div>
                  <div style={{ fontWeight: '500', color: 'var(--text-main)' }}>{contact.phoneNumber || '---'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Mail size={16} style={{ color: 'var(--primary)' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{language === 'vi' ? 'Địa chỉ Email' : 'Email Address'}</div>
                  <div style={{ fontWeight: '500', color: 'var(--text-main)', wordBreak: 'break-all' }}>{contact.email}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="saas-card" style={{ padding: '48px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', flexGrow: 1 }}>
          <MessageSquare size={48} style={{ color: 'var(--primary)', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', margin: 0 }}>
            {language === 'vi' ? 'Chưa được phân công nhân viên hỗ trợ' : 'No Assigned Consultant'}
          </h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }}>
            {language === 'vi' 
              ? 'Tài khoản của bạn hiện tại chưa được phân công nhân viên tư vấn riêng. Hệ thống sẽ tự động gán nhân viên phụ trách khi bạn thực hiện mua gói bảo hiểm hoặc khai báo sự cố đầu tiên.'
              : 'You have not been assigned a personal consultant yet. The system will assign one automatically when you purchase a package or report an incident.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default LiveSupportChat;
