import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { Mail, Lock, CheckCircle, ArrowLeft, Shield } from 'lucide-react';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side validations
    if (!email || !password || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ tất cả các trường!');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu bảo mật phải chứa ít nhất 6 ký tự!');
      return;
    }

    if (password !== confirmPassword) {
      setError('Xác nhận mật khẩu không khớp với mật khẩu đã nhập!');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiClient.post('/api/auth/register', { email, password });
      
      setSuccess(response.data.message || 'Đăng ký tài khoản thành công!');
      
      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2500);
      
    } catch (err) {
      console.error('Registration failed:', err);
      let errorMsg = 'Đăng ký thất bại. Vui lòng kết nối lại máy chủ hoặc thử lại sau!';
      if (err.response && err.response.data && err.response.data.message) {
        errorMsg = err.response.data.message;
      }
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
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
        {/* Brand Title */}
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
            <Shield size={24} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px' }}>
            Đăng Ký Tài Khoản
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Tạo tài khoản mới tham gia dịch vụ InsurePro SaaS
          </p>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="saas-alert saas-alert-success" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={16} />
            <span>{success} (Đang chuyển hướng sang Đăng nhập...)</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="saas-alert saas-alert-danger">
            <span>{error}</span>
          </div>
        )}

        {/* Form Registration */}
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                placeholder="customer@insurance.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting || success}
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
                placeholder="Ít nhất 6 ký tự"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting || success}
                style={{ paddingLeft: '38px', height: '40px' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Xác nhận mật khẩu</label>
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
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting || success}
                style={{ paddingLeft: '38px', height: '40px' }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || success}
            style={{ width: '100%', marginTop: '8px', height: '42px', fontSize: '0.9rem' }}
          >
            {isSubmitting ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản'}
          </button>
        </form>

        {/* Footer Actions */}
        <div style={{
          marginTop: '28px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border)',
          textAlign: 'center',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.85rem'
        }}>
          <span style={{ color: 'var(--text-muted)' }}>Bạn đã có tài khoản?</span>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              cursor: 'pointer',
              fontWeight: '600',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>Đăng nhập ngay</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
