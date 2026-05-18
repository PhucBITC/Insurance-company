import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const AppLayout = ({ navItems = [] }) => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      {/* Sidebar Drawer */}
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        navItems={navItems} 
        user={user} 
      />

      {/* Main Container */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        minWidth: 0,
        transition: 'var(--transition-normal)'
      }}>
        {/* Horizontal Topbar */}
        <Topbar 
          toggleSidebar={toggleSidebar} 
          user={user} 
          onLogout={handleLogout} 
        />

        {/* Scrollable Main Area */}
        <main style={{
          padding: '28px',
          flexGrow: 1,
          overflowY: 'auto'
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
