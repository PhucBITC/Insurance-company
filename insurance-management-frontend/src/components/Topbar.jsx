import React, { useState, useEffect, useRef } from 'react';
import { Menu, LogOut, Sun, Moon, User } from 'lucide-react';
import { useUI } from '../context/UIContext';

const Topbar = ({ toggleSidebar, user, onLogout }) => {
  const { theme, toggleTheme, language, setLanguage, t } = useUI();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
            padding: '0 8px',
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
          <span style={{ fontSize: '1rem', display: 'flex', alignItems: 'center' }}>
            {language === 'vi' ? '🇻🇳' : '🇬🇧'}
          </span>
          <span>
            {language === 'vi' ? 'VI' : 'EN'}
          </span>
        </button>

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
                  alert(language === 'vi' ? 'Chức năng Xem Hồ Sơ đang được phát triển trong Giai đoạn 2!' : 'Profile View feature is under development in Phase 2!');
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
