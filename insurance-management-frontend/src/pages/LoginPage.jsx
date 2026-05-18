import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, ShieldCheck, UserCheck, Heart } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu!');
      return;
    }

    setError('');
    setIsSubmitting(true);

    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      // Redirect to correct dashboard
      if (result.user.role === 'ROLE_ADMIN') {
        navigate('/admin/dashboard');
      } else if (result.user.role === 'ROLE_EMPLOYEE') {
        navigate('/employee/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } else {
      setError(result.error);
    }
  };

  const fillCredentials = (roleEmail, rolePassword) => {
    setEmail(roleEmail);
    setPassword(rolePassword);
    setError('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-main)',
      position: 'relative',
      padding: '24px'
    }}>
      {/* Background Animated Glow Orbs */}
      <div className="bg-glow-container">
        <div className="bg-glow-orb orb-primary" />
        <div className="bg-glow-orb orb-secondary" />
      </div>

      <div className="glass-card animate-fade-in" style={{
        width: '100%',
        maxWidth: '460px',
        padding: '40px',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Logo and title */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            padding: '12px',
            borderRadius: '16px',
            color: 'white',
            marginBottom: '16px',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)'
          }}>
            <LogIn size={28} />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px' }}>Chào mừng trở lại</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Hệ thống quản lý công ty bảo hiểm MVP</p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="toast-msg danger" style={{ marginBottom: '24px', fontSize: '0.85rem' }}>
            <span>{error}</span>
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label className="form-label">Địa chỉ Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type="email"
                className="form-input"
                placeholder="ten@insurance.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                style={{ paddingLeft: '48px' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                style={{ paddingLeft: '48px' }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
            style={{ width: '100%', marginTop: '8px', padding: '14px' }}
          >
            {isSubmitting ? 'Đang xác thực...' : 'Đăng nhập hệ thống'}
          </button>
        </form>

        {/* Quick autofill links */}
        <div style={{
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: '1px solid var(--glass-border)',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Đăng nhập nhanh để Demo (Mật khẩu: 123456)</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => fillCredentials('admin@insurance.com', '123456')}
              className="btn btn-secondary"
              style={{
                fontSize: '0.75rem',
                padding: '6px 12px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ShieldCheck size={14} style={{ color: 'var(--secondary)' }} />
              Admin
            </button>
            
            <button
              onClick={() => fillCredentials('employee@insurance.com', '123456')}
              className="btn btn-secondary"
              style={{
                fontSize: '0.75rem',
                padding: '6px 12px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <UserCheck size={14} style={{ color: 'var(--info)' }} />
              Nhân viên
            </button>
            
            <button
              onClick={() => fillCredentials('customer@insurance.com', '123456')}
              className="btn btn-secondary"
              style={{
                fontSize: '0.75rem',
                padding: '6px 12px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Heart size={14} style={{ color: 'var(--accent)' }} />
              Khách hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
