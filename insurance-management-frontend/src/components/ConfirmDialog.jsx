import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmDialog = ({
  isOpen,
  title = "Xác nhận hành động",
  message = "Bạn có chắc chắn muốn thực hiện hành động này không?",
  onConfirm,
  onClose,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  type = "primary" // danger, primary
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(15, 23, 42, 0.4)', // Soft gray-dark overlay
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <div className="saas-card" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '24px',
        boxShadow: 'var(--shadow-lg)',
        animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative'
      }}>
        {/* Close Button on top right */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px'
          }}
        >
          <X size={16} />
        </button>

        {/* Header Title with warning icon if danger */}
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '16px' }}>
          {type === 'danger' && (
            <div style={{
              background: 'var(--danger-light)',
              color: 'var(--danger)',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <AlertTriangle size={20} />
            </div>
          )}
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-main)' }}>{title}</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.4' }}>{message}</p>
          </div>
        </div>

        {/* Action Button Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px',
          marginTop: '24px',
          borderTop: '1px solid var(--border)',
          paddingTop: '16px'
        }}>
          <button onClick={onClose} className="btn btn-secondary">
            {cancelText}
          </button>
          <button 
            onClick={onConfirm} 
            className={`btn ${type === 'danger' ? 'btn-danger' : 'btn-primary'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
