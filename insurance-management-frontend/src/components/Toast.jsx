import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (elapsed >= duration) {
        clearInterval(interval);
        onClose();
      }
    }, 10);

    return () => clearInterval(interval);
  }, [duration, onClose]);

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle size={18} style={{ color: 'var(--success)' }} />,
          title: 'Thành công',
          color: 'var(--success)',
          bg: 'var(--success-light)',
          border: 'rgba(22, 163, 74, 0.15)',
          barBg: 'linear-gradient(to right, #4ade80, #22c55e)'
        };
      case 'error':
        return {
          icon: <AlertCircle size={18} style={{ color: 'var(--danger)' }} />,
          title: 'Lỗi',
          color: 'var(--danger)',
          bg: 'var(--danger-light)',
          border: 'rgba(220, 38, 38, 0.15)',
          barBg: 'linear-gradient(to right, #f87171, #ef4444)'
        };
      case 'warning':
        return {
          icon: <AlertTriangle size={18} style={{ color: 'var(--warning)' }} />,
          title: 'Cảnh báo',
          color: 'var(--warning)',
          bg: 'var(--warning-light)',
          border: 'rgba(245, 158, 11, 0.15)',
          barBg: 'linear-gradient(to right, #fbbf24, #f59e0b)'
        };
      case 'info':
      default:
        return {
          icon: <Info size={18} style={{ color: 'var(--info)' }} />,
          title: 'Thông tin',
          color: 'var(--info)',
          bg: 'var(--info-light)',
          border: 'rgba(14, 165, 233, 0.15)',
          barBg: 'linear-gradient(to right, #60a5fa, #3b82f6)'
        };
    }
  };

  const config = getToastConfig();

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      minWidth: '320px',
      maxWidth: '420px',
      padding: '14px 16px',
      borderRadius: 'var(--radius-md)',
      backgroundColor: config.bg,
      border: `1px solid ${config.border}`,
      boxShadow: 'var(--shadow-lg)',
      display: 'flex',
      gap: '12px',
      alignItems: 'flex-start',
      overflow: 'hidden',
      pointerEvents: 'auto',
      animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)'
    }}>
      <div style={{ marginTop: '2px', display: 'flex', flexShrink: 0 }}>
        {config.icon}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{ 
          fontSize: '0.875rem', 
          fontWeight: '600', 
          color: config.color 
        }}>
          {config.title}
        </span>
        <span style={{ 
          fontSize: '0.825rem', 
          color: 'var(--text-main)', 
          opacity: 0.9,
          lineHeight: '1.4'
        }}>
          {message}
        </span>
      </div>
      <button 
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2px',
          borderRadius: '50%',
          transition: 'var(--transition-fast)',
          marginTop: '2px'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <X size={16} />
      </button>
      
      {/* Progress Bar */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: '3px',
        width: `${progress}%`,
        background: config.barBg,
        transition: 'width 10ms linear'
      }} />
    </div>
  );
};

export default Toast;
