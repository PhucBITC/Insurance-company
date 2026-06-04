import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, Sun, Moon, User, Bell, Globe } from 'lucide-react';
import { useUI } from '../context/UIContext';
import apiClient from '../api/apiClient';

const Topbar = ({ toggleSidebar, user, onLogout }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme, language, setLanguage, t } = useUI();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await apiClient.get('/api/notifications');
      setNotifications(res.data || []);
      
      const countRes = await apiClient.get('/api/notifications/unread-count');
      setUnreadCount(countRes.data.count || 0);
    } catch (err) {
      console.error('Lỗi khi tải thông báo:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // 15 seconds polling
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAllAsRead = async () => {
    try {
      await apiClient.put('/api/notifications/read-all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendTestNotif = async () => {
    try {
      await apiClient.post('/api/notifications/test-seed');
      fetchNotifications();
    } catch (err) {
      console.error('Lỗi khi gửi thông báo thử nghiệm:', err);
    }
  };

  const handleNotificationClick = async (notif) => {
    setIsNotifDropdownOpen(false);
    if (!notif.isRead) {
      try {
        await apiClient.put(`/api/notifications/${notif.id}/read`);
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
      } catch (err) {
        console.error(err);
      }
    }
    if (notif.link) {
      window.location.href = notif.link;
    }
  };

  const formatTimeAgo = (dateTimeString) => {
    if (!dateTimeString) return '';
    try {
      const diffMs = Date.now() - new Date(dateTimeString).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return language === 'vi' ? 'Vừa xong' : 'Just now';
      if (diffMins < 60) return `${diffMins} ${language === 'vi' ? 'phút trước' : 'm ago'}`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} ${language === 'vi' ? 'giờ trước' : 'h ago'}`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} ${language === 'vi' ? 'ngày trước' : 'd ago'}`;
    } catch (e) {
      return '';
    }
  };

  return (
    <header style={{
      height: '64px',
      backgroundColor: 'var(--card)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.02)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          onClick={toggleSidebar}
          style={{
            background: 'none',
            border: '1px solid var(--border)',
            color: 'var(--text-main)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-sm)',
            transition: 'var(--transition-fast)',
            backgroundColor: 'var(--card)'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--background)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--card)'}
        >
          <Menu size={18} />
        </button>
        <span style={{ 
          fontSize: '0.875rem', 
          fontWeight: '550', 
          color: 'var(--text-muted)',
          display: 'inline-block',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '300px'
        }}>
          {t('systemTitle')}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme}
          style={{
            background: 'none',
            border: '1px solid var(--border)',
            color: 'var(--text-main)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-sm)',
            transition: 'var(--transition-fast)',
            backgroundColor: 'var(--card)'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--background)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--card)'}
          title={theme === 'light' ? 'Chuyển sang giao diện tối' : 'Chuyển sang giao diện sáng'}
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        {/* Language Toggle Button */}
        <button 
          onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
          style={{
            background: 'none',
            border: '1px solid var(--border)',
            color: 'var(--text-main)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '0 10px',
            height: '36px',
            borderRadius: 'var(--radius-sm)',
            transition: 'var(--transition-fast)',
            backgroundColor: 'var(--card)',
            fontSize: '0.8rem',
            fontWeight: '600'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--background)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--card)'}
          title={language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
        >
          <Globe size={15} style={{ color: 'var(--text-muted)' }} />
          <span>
            {language === 'vi' ? 'VI' : 'EN'}
          </span>
        </button>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button 
            onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
            style={{
              background: 'none',
              border: '1px solid var(--border)',
              color: 'var(--text-main)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              transition: 'var(--transition-fast)',
              backgroundColor: 'var(--card)',
              position: 'relative'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--background)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--card)'}
            title={language === 'vi' ? 'Thông báo' : 'Notifications'}
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: 'var(--danger)',
                color: 'white',
                fontSize: '0.65rem',
                fontWeight: '700',
                borderRadius: '10px',
                padding: '2px 5px',
                lineHeight: '1',
                boxShadow: '0 0 0 2px var(--card)'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifDropdownOpen && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '44px',
              width: '320px',
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-lg)',
              padding: '12px 0',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 100,
              maxHeight: '400px',
              animation: 'slideDown 0.2s ease-out'
            }}>
              {/* Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 16px 8px 16px',
                borderBottom: '1px solid var(--border)'
              }}>
                <span style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-main)' }}>
                  {language === 'vi' ? 'Thông báo' : 'Notifications'}
                </span>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllAsRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    {language === 'vi' ? 'Đọc tất cả' : 'Read all'}
                  </button>
                )}
              </div>

              {/* List */}
              <div style={{ overflowY: 'auto', flexGrow: 1, maxHeight: '300px' }}>
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      style={{
                        padding: '10px 16px',
                        borderBottom: '1px solid var(--border)',
                        cursor: 'pointer',
                        transition: 'var(--transition-fast)',
                        backgroundColor: notif.isRead ? 'transparent' : 'rgba(99, 102, 241, 0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--background)'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = notif.isRead ? 'transparent' : 'rgba(99, 102, 241, 0.03)'}
                    >
                      <div style={{
                        fontWeight: notif.isRead ? '500' : '650',
                        fontSize: '0.825rem',
                        color: 'var(--text-main)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px'
                      }}>
                        <span>{notif.title}</span>
                        {!notif.isRead && (
                          <span style={{
                            width: '6px',
                            height: '6px',
                            backgroundColor: 'var(--primary)',
                            borderRadius: '50%',
                            flexShrink: 0
                          }}></span>
                        )}
                      </div>
                      <p style={{
                        fontSize: '0.775rem',
                        color: 'var(--text-secondary)',
                        margin: 0,
                        lineHeight: '1.4',
                        textAlign: 'left'
                      }}>
                        {notif.content}
                      </p>
                      <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', textAlign: 'left' }}>
                        {formatTimeAgo(notif.createdAt)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div style={{ 
                    padding: '24px 16px', 
                    textAlign: 'center', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: '12px' 
                  }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {language === 'vi' ? 'Không có thông báo nào' : 'No notifications'}
                    </span>
                    <button
                      onClick={handleSendTestNotif}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'var(--transition-fast)'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                      onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                    >
                      {language === 'vi' ? 'Gửi thông báo thử' : 'Send test notification'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border)' }}></div>

        {/* User Account Dropdown */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              background: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              color: 'var(--primary)',
              fontWeight: '700',
              fontSize: '0.9rem',
              transition: 'var(--transition-fast)',
              border: '2px solid var(--primary)',
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            title="Account Menu"
          >
            {user?.email ? user.email.charAt(0).toUpperCase() : <User size={16} />}
          </button>

          {isDropdownOpen && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '44px',
              width: '240px',
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-lg)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              zIndex: 100,
              animation: 'slideDown 0.2s ease-out'
            }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('welcomeBack')}</p>
                <p style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '600', 
                  color: 'var(--text-main)',
                  wordBreak: 'break-all',
                  marginTop: '2px'
                }}>
                  {user?.email}
                </p>
                <div style={{ marginTop: '6px' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    color: 'white',
                    backgroundColor: user?.role === 'ROLE_ADMIN' ? 'var(--primary)' : user?.role === 'ROLE_EMPLOYEE' ? 'var(--warning)' : 'var(--success)',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    textTransform: 'uppercase'
                  }}>
                    {user?.role === 'ROLE_ADMIN' ? t('filterAdmin') : user?.role === 'ROLE_EMPLOYEE' ? t('filterEmployee') : t('filterCustomer')}
                  </span>
                </div>
              </div>

              <div style={{ height: '1px', backgroundColor: 'var(--border)' }}></div>

              <button 
                onClick={() => {
                  setIsDropdownOpen(false);
                  if (user?.role === 'ROLE_ADMIN') {
                    navigate('/admin/profile');
                  } else if (user?.role === 'ROLE_EMPLOYEE') {
                    navigate('/employee/profile');
                  } else {
                    navigate('/customer/profile');
                  }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem',
                  fontWeight: '550',
                  textAlign: 'left',
                  cursor: 'pointer',
                  padding: '6px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <User size={14} />
                <span>{language === 'vi' ? 'Xem Hồ Sơ' : 'View Profile'}</span>
              </button>

              <button 
                onClick={() => {
                  setIsDropdownOpen(false);
                  onLogout();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#dc2626',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  textAlign: 'left',
                  cursor: 'pointer',
                  padding: '6px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <LogOut size={14} />
                <span>{t('logout')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
