import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, HeartHandshake, Briefcase } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { useUI } from '../context/UIContext';

const Sidebar = ({ isSidebarOpen, navItems = [], user }) => {
  const { t } = useUI();
  const location = useLocation();

  const getRoleIcon = () => {
    if (user?.role === 'ROLE_ADMIN') return <ShieldCheck size={20} />;
    if (user?.role === 'ROLE_EMPLOYEE') return <Briefcase size={20} />;
    return <HeartHandshake size={20} />;
  };

  const getRoleLabelColor = () => {
    if (user?.role === 'ROLE_ADMIN') return 'var(--primary)';
    if (user?.role === 'ROLE_EMPLOYEE') return 'var(--warning)';
    return 'var(--success)';
  };

  return (
    <aside style={{
      width: isSidebarOpen ? '260px' : '0px',
      opacity: isSidebarOpen ? 1 : 0,
      overflow: 'hidden',
      transition: 'var(--transition-normal)',
      backgroundColor: 'var(--card)',
      color: 'var(--text-secondary)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 50,
      height: '100vh',
      position: 'sticky',
      top: 0,
      flexShrink: 0
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          backgroundColor: getRoleLabelColor(),
          color: 'white',
          width: '36px',
          height: '36px',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          {getRoleIcon()}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '0.05em' }}>{t('insurePro')}</h2>
          <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', fontWeight: '600', tracking: '0.1em', textTransform: 'uppercase' }}>
            {user?.role === 'ROLE_ADMIN' ? t('adminSystem') : user?.role === 'ROLE_EMPLOYEE' ? t('employeePortal') : t('customerPortal')}
          </span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav style={{ padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '4px', flexGrow: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 16px',
                borderRadius: 'var(--radius-sm)',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                fontWeight: isActive ? '600' : '500',
                fontSize: '0.875rem',
                transition: 'var(--transition-fast)'
              }}
              className={!isActive ? "sidebar-link-hover" : ""}
            >
              {Icon && <Icon size={18} style={{ color: isActive ? '#ffffff' : 'var(--text-muted)' }} />}
              <span>{t('path:' + item.path)}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid var(--border)',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        textAlign: 'center'
      }}>
        Bảo An SaaS v1.0
      </div>
    </aside>
  );
};

export default Sidebar;
