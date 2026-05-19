import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Shield, User, Heart, LockKeyhole } from 'lucide-react';

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
      backgroundColor: 'var(--background)',
      padding: '24px'
    }}>
      <div className="saas-card" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '40px',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border)'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            backgroundColor: 'var(--primary)',
            padding: '10px',
            borderRadius: 'var(--radius-md)',
            color: 'white',
            marginBottom: '16px',
            boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
          }}>
            <LockKeyhole size={24} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px' }}>
            Hệ Thống Bảo Hiểm
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Cổng thông tin quản lý nghiệp vụ InsurePro SaaS
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="saas-alert saas-alert-danger">
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Tài khoản Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type="email"
                className="form-input"
                placeholder="admin@insurance.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                style={{ paddingLeft: '38px', height: '40px' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu bảo mật</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{
                position: 'absolute',
                left: '12px',
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
                style={{ paddingLeft: '38px', height: '40px' }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
            style={{ width: '100%', marginTop: '8px', height: '42px', fontSize: '0.9rem' }}
          >
            {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập vào hệ thống'}
          </button>
        </form>

        {/* Register navigation link */}
        <div style={{
          marginTop: '20px',
          textAlign: 'center',
          fontSize: '0.875rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span style={{ color: 'var(--text-muted)' }}>Chưa có tài khoản?</span>
          <button
            onClick={() => navigate('/register')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              cursor: 'pointer',
              fontWeight: '600',
              padding: 0
            }}
          >
            Đăng ký ngay
          </button>
        </div>

        {/* Quick autofill controls */}
        <div style={{
          marginTop: '32px',
          paddingTop: '20px',
          borderTop: '1px solid var(--border)',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: '500' }}>
            ĐĂNG NHẬP NHANH ĐỂ THỬ NGHIỆM (MẬT KHẨU: 123456)
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => fillCredentials('admin@insurance.com', '123456')}
              className="btn btn-secondary"
              style={{
                fontSize: '0.75rem',
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                height: '32px',
                gap: '4px'
              }}
            >
              <Shield size={12} style={{ color: 'var(--primary)' }} />
              <span>Admin</span>
            </button>
            
            <button
              onClick={() => fillCredentials('employee@insurance.com', '123456')}
              className="btn btn-secondary"
              style={{
                fontSize: '0.75rem',
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                height: '32px',
                gap: '4px'
              }}
            >
              <User size={12} style={{ color: 'var(--warning)' }} />
              <span>Nhân viên</span>
            </button>
            
            <button
              onClick={() => fillCredentials('customer@insurance.com', '123456')}
              className="btn btn-secondary"
              style={{
                fontSize: '0.75rem',
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                height: '32px',
                gap: '4px'
              }}
            >
              <Heart size={12} style={{ color: 'var(--success)' }} />
              <span>Khách hàng</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
