import React from 'react';
import { Menu, LogOut } from 'lucide-react';

const Topbar = ({ toggleSidebar, user, onLogout }) => {
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
            backgroundColor: '#ffffff'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
        >
          <Menu size={18} />
        </button>
        <span style={{ 
          fontSize: '0.875rem', 
          fontWeight: '550', 
          color: 'var(--text-muted)',
          display: 'none',
          WebkitLineClamp: 1
        }}>
          Hệ thống Quản lý Bảo hiểm Doanh nghiệp
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-main)' }}>
            Chào mừng trở lại!
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {user?.email}
          </span>
        </div>

        <button 
          onClick={onLogout}
          className="btn btn-secondary"
          style={{ 
            height: '36px', 
            padding: '0 12px', 
            fontSize: '0.85rem',
            gap: '6px',
            borderColor: '#fca5a5',
            color: '#dc2626',
            backgroundColor: '#fef2f2'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#fee2e2';
            e.currentTarget.style.borderColor = '#ef4444';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#fef2f2';
            e.currentTarget.style.borderColor = '#fca5a5';
          }}
        >
          <LogOut size={14} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </header>
  );
};

export default Topbar;
