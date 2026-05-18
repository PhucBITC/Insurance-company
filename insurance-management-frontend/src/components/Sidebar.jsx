import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, HeartHandshake, Briefcase } from 'lucide-react';
import StatusBadge from './StatusBadge';

const Sidebar = ({ isSidebarOpen, navItems = [], user }) => {
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
      backgroundColor: '#1e293b', // Deep dark slate background to give high-end contrast
      color: '#cbd5e1',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 50,
      height: '100vh',
      position: 'sticky',
      top: 0
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid #334155',
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
          <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'white', letterSpacing: '0.05em' }}>INSURE PRO</h2>
          <span style={{ fontSize: '0.675rem', color: '#94a3b8', fontWeight: '600', tracking: '0.1em', textTransform: 'uppercase' }}>
            {user?.role === 'ROLE_ADMIN' ? 'Hệ thống Quản trị' : user?.role === 'ROLE_EMPLOYEE' ? 'Cổng Nhân viên' : 'Cổng Khách hàng'}
          </span>
        </div>
      </div>

      {/* User Info Section */}
      {user && (
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #334155' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid #334155',
            padding: '12px',
            borderRadius: 'var(--radius-sm)'
          }}>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email}
            </p>
            <div style={{ marginTop: '6px' }}>
              <StatusBadge status={user.role} />
            </div>
          </div>
        </div>
      )}

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
                color: isActive ? '#ffffff' : '#94a3b8',
                backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                fontWeight: isActive ? '600' : '500',
                fontSize: '0.875rem',
                transition: 'var(--transition-fast)'
              }}
            >
              {Icon && <Icon size={18} style={{ color: isActive ? '#ffffff' : '#64748b' }} />}
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid #334155',
        fontSize: '0.75rem',
        color: '#64748b',
        textAlign: 'center'
      }}>
        InsurePro SaaS v1.0
      </div>
    </aside>
  );
};

export default Sidebar;
