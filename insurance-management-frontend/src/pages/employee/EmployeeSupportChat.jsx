import React, { useState, useEffect, useRef } from 'react';
import { Send, User, MessageSquare, AlertCircle, RefreshCw, Search } from 'lucide-react';
import apiClient from '../../api/apiClient';
import PageHeader from '../../components/PageHeader';
import { useUI } from '../../context/UIContext';

const EmployeeSupportChat = () => {
  const { language } = useUI();
  
  // State
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [connected, setConnected] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingContent, setEditingContent] = useState('');

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const selectedContactRef = useRef(null);

  useEffect(() => {
    selectedContactRef.current = selectedContact;
  }, [selectedContact]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 1. Fetch assigned customers (contacts)
  const fetchContacts = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await apiClient.get('/api/chat/contacts');
      const data = res.data || [];
      // Initialize unreadCount from backend data
      const mapped = data.map(c => ({ ...c, unreadCount: c.unreadCount || 0 }));
      setContacts(mapped);
      
      // Auto select first customer if available
      if (mapped.length > 0) {
        handleSelectContact(mapped[0]);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(language === 'vi' ? 'Không thể tải danh sách khách hàng hỗ trợ.' : 'Failed to load support customers list.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Select customer and load history
  const handleSelectContact = async (contact) => {
    setSelectedContact(contact);
    setHistoryLoading(true);
    
    // Clear unread count for this contact
    setContacts(prev => prev.map(c => {
      if (c.userId === contact.userId) {
        return { ...c, unreadCount: 0 };
      }
      return c;
    }));

    try {
      const res = await apiClient.get('/api/chat/history', {
        params: { contactId: contact.userId }
      });
      setMessages(res.data || []);

      // Mark as read via HTTP
      apiClient.post(`/api/chat/read?contactId=${contact.userId}`).catch(err => console.error(err));
      
      // Send WS read update
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: 'READ', recipientId: contact.userId }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // 3. Connect WebSocket for receiving messages from any customer
  const connectWebSocket = () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const wsUrl = `ws://localhost:8080/ws/chat?token=${token}`;
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      console.log('Employee WebSocket connected');
      if (selectedContactRef.current) {
        ws.send(JSON.stringify({ type: 'READ', recipientId: selectedContactRef.current.userId }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        const activeContact = selectedContactRef.current;
        
        if (msg.type === 'READ_RECEIPT') {
          // The selected customer read our messages, set all our messages to read
          if (activeContact && msg.senderId === activeContact.userId) {
            setMessages(prev => prev.map(m => {
              if (m.senderId === 'ME' || m.senderId !== activeContact.userId) {
                return { ...m, isRead: true };
              }
              return m;
            }));
          }
        } else if (msg.type === 'SENT_CONFIRMATION') {
          if (activeContact && msg.recipientId === activeContact.userId) {
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
          }
        } else if (msg.type === 'RECALL') {
          if (activeContact && msg.senderId === activeContact.userId) {
            setMessages(prev => prev.map(m => {
              if (m.id === msg.messageId) {
                return { ...m, isRecalled: true, content: 'Tin nhắn đã được thu hồi' };
              }
              return m;
            }));
          }
        } else if (msg.type === 'EDIT') {
          if (activeContact && msg.senderId === activeContact.userId) {
            setMessages(prev => prev.map(m => {
              if (m.id === msg.messageId) {
                return { ...m, content: msg.content, isEdited: true };
              }
              return m;
            }));
          }
        } else if (msg.type === 'REACT') {
          if (activeContact && msg.senderId === activeContact.userId) {
            setMessages(prev => prev.map(m => {
              if (m.id === msg.messageId) {
                return { ...m, reaction: msg.reaction };
              }
              return m;
            }));
          }
        } else if (activeContact && msg.senderId === activeContact.userId) {
          // Add to active chat
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
          ws.send(JSON.stringify({ type: 'READ', recipientId: activeContact.userId }));
          apiClient.post(`/api/chat/read?contactId=${activeContact.userId}`).catch(err => console.error(err));
        } else {
          // Increment unread count for the sender
          setContacts(prev => prev.map(c => {
            if (c.userId === msg.senderId) {
              return { ...c, unreadCount: (c.unreadCount || 0) + 1 };
            }
            return c;
          }));
        }
      } catch (e) {
        console.error(e);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      console.log('Employee WebSocket disconnected');
    };

    ws.onerror = (err) => {
      console.error('Employee WebSocket error:', err);
    };
  };

  useEffect(() => {
    fetchContacts();
    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedContact || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    const content = input.trim();
    const tempId = 'temp-' + Date.now();
    const payload = {
      recipientId: selectedContact.userId,
      content: content,
      tempId: tempId
    };

    socketRef.current.send(JSON.stringify(payload));

    const tempMsg = {
      id: tempId,
      senderId: 'ME',
      recipientId: selectedContact.userId,
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
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN || !selectedContact) return;

    socketRef.current.send(JSON.stringify({
      type: 'RECALL',
      messageId: msg.id,
      recipientId: selectedContact.userId
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
    if (!editingContent.trim() || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN || !selectedContact) return;

    socketRef.current.send(JSON.stringify({
      type: 'EDIT',
      messageId: msg.id,
      content: editingContent.trim(),
      recipientId: selectedContact.userId
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
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN || !selectedContact) return;

    const newReaction = msg.reaction === emoji ? null : emoji;

    socketRef.current.send(JSON.stringify({
      type: 'REACT',
      messageId: msg.id,
      reaction: newReaction,
      recipientId: selectedContact.userId
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

  const filteredContacts = contacts.filter(c => 
    c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)', gap: '20px' }} className="animate-fade-in">
      <PageHeader 
        title={language === 'vi' ? "Hỗ trợ khách hàng thời gian thực" : "Live Customer Support"} 
        description={language === 'vi' ? "Phòng chat trực tuyến tư vấn, giải đáp thắc mắc của khách hàng bạn phụ trách." : "Online chatroom to support and answer queries of your assigned customers."}
      />

      {loading ? (
        <div className="saas-card" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw className="animate-spin" size={32} style={{ marginBottom: '12px' }} />
          <div>{language === 'vi' ? 'Đang tải danh sách...' : 'Loading list...'}</div>
        </div>
      ) : contacts.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', flexGrow: 1, height: '80%' }}>
          
          {/* Left Column: Customers List */}
          <div className="saas-card" style={{ display: 'flex', flexDirection: 'column', padding: '16px', gap: '16px', height: '100%', overflowY: 'auto' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                placeholder={language === 'vi' ? "Tìm khách hàng..." : "Search customers..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '36px', height: '36px', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', flexGrow: 1 }}>
              {filteredContacts.map(c => {
                const isSelected = selectedContact && selectedContact.userId === c.userId;
                return (
                  <div
                    key={c.userId}
                    onClick={() => handleSelectContact(c)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                      border: isSelected ? '1px solid var(--primary)' : '1px solid transparent',
                      transition: 'all 0.2s ease'
                    }}
                    className={!isSelected ? "sidebar-link-hover" : ""}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>
                        {c.fullName.charAt(0)}
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {c.fullName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {c.email}
                        </div>
                      </div>
                    </div>
                    {c.unreadCount > 0 && (
                      <span style={{ backgroundColor: 'var(--danger)', color: 'white', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Chat Window */}
          <div className="saas-card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', height: '100%' }}>
            {selectedContact ? (
              <>
                {/* Header */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255, 255, 255, 0.01)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {selectedContact.fullName.charAt(0)}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-main)' }}>{selectedContact.fullName}</h4>
                      <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', color: connected ? 'var(--success)' : 'var(--text-muted)' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: connected ? 'var(--success)' : 'var(--text-muted)', display: 'inline-block' }}></span>
                        {connected ? (language === 'vi' ? 'Sẵn sàng nhận tin nhắn' : 'Ready') : (language === 'vi' ? 'Mất kết nối' : 'Disconnected')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Messages Body */}
                <div style={{ flexGrow: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                  {historyLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
                      <RefreshCw className="animate-spin" size={24} />
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderId === 'ME' || msg.senderId !== selectedContact.userId;
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
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Footer Send Input */}
                <form onSubmit={handleSend} style={{ padding: '16px 20px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '12px' }}>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={language === 'vi' ? "Nhập tin nhắn phản hồi..." : "Type a reply..."}
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
              </>
            ) : (
              <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: '12px' }}>
                <MessageSquare size={36} />
                <div>{language === 'vi' ? 'Vui lòng chọn một khách hàng từ danh sách để bắt đầu.' : 'Select a customer to start chatting.'}</div>
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="saas-card" style={{ padding: '48px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', flexGrow: 1 }}>
          <AlertCircle size={48} style={{ color: 'var(--warning)', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', margin: 0 }}>
            {language === 'vi' ? 'Không có khách hàng phụ trách' : 'No Assigned Customers'}
          </h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: 0, fontSize: '0.9rem' }}>
            {language === 'vi' 
              ? 'Tài khoản của bạn hiện tại chưa được phân công quản lý khách hàng nào. Khi Admin phân công, danh sách chat sẽ tự động hiển thị tại đây.'
              : 'You are not assigned to manage any customers yet. The support chatroom will appear when the Admin delegates assignments.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default EmployeeSupportChat;
