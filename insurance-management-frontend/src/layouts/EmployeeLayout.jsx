import React, { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  AlertTriangle, 
  LogOut, 
  Menu, 
  X,
  Briefcase,
  ChevronRight
} from 'lucide-react';

const EmployeeLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/employee/dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/employee/customers', name: 'Khách hàng của tôi', icon: Users },
    { path: '/employee/incidents', name: 'Sự cố bảo hiểm', icon: AlertTriangle },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)', position: 'relative' }}>
      {/* Background Orbs */}
      <div className="bg-glow-container">
        <div className="bg-glow-orb orb-primary" />
        <div className="bg-glow-orb orb-secondary" />
      </div>

      {/* Sidebar */}
      <aside style={{
        width: isSidebarOpen ? '280px' : '0px',
        opacity: isSidebarOpen ? 1 : 0,
        overflow: 'hidden',
        transition: 'var(--transition-smooth)',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--glass-border)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid var(--glass-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--info) 0%, var(--primary) 100%)',
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 4px 10px rgba(59, 130, 246, 0.4)'
          }}>
            <Briefcase size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>INSURE PRO</h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--info)', fontWeight: 'bold', tracking: '0.05em' }}>EMPLOYEE PORTAL</span>
          </div>
        </div>

        {/* User Info Card */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--glass-border)' }}>
          <div className="glass-card" style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Nhân viên phụ trách</p>
            <p style={{ fontSize: '0.9rem', fontWeight: 'bold', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{user?.email}</p>
            <span className="badge badge-employee" style={{ marginTop: '8px' }}>STAFF MEMBER</span>
          </div>
        </div>

        {/* Nav Links */}
        <nav style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
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
                  gap: '14px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  background: isActive ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)' : 'transparent',
                  border: isActive ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid transparent',
                  fontWeight: isActive ? '600' : '500',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <Icon size={20} style={{ color: isActive ? 'var(--info)' : 'var(--text-secondary)' }} />
                <span>{item.name}</span>
                {isActive && <ChevronRight size={16} style={{ marginLeft: 'auto', color: 'var(--info)' }} />}
              </Link>
            );
          })}
        </nav>

        {/* Logout section */}
        <div style={{ padding: '24px', borderTop: '1px solid var(--glass-border)' }}>
          <button 
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{ width: '100%', gap: '10px', background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.1)', color: '#f43f5e' }}
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content Wrappers */}
      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0 }}>
        {/* Top Navbar */}
        <header style={{
          height: '70px',
          background: 'var(--glass-bg)',
          borderBottom: '1px solid var(--glass-border)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          justifyContent: 'space-between',
          zIndex: 40
        }}>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '8px',
              borderRadius: '8px',
              transition: 'var(--transition-smooth)'
            }}
          >
            {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Hệ thống Bảo hiểm MVP v1.0</span>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--info)',
              boxShadow: '0 0 10px var(--info)'
            }} />
          </div>
        </header>

        {/* Body Container */}
        <main style={{ padding: '32px', flexGrow: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default EmployeeLayout;
