import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { Lock, ArrowLeft, AlertCircle, CheckCircle, HeartHandshake, Eye, EyeOff } from 'lucide-react';
import './AuthPage.css';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Lỗi: Đường dẫn đặt lại mật khẩu không hợp lệ hoặc thiếu mã xác thực!');
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin mật khẩu!');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải chứa ít nhất 6 ký tự!');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiClient.post('/api/auth/reset-password', {
        token,
        newPassword
      });
      setSuccess(response.data.message || 'Đặt lại mật khẩu thành công! Đang chuyển hướng về trang đăng nhập...');
      setNewPassword('');
      setConfirmPassword('');
      
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      console.error(err);
      let errorMsg = 'Đặt lại mật khẩu thất bại. Token có thể đã hết hạn hoặc không hợp lệ!';
      if (err.response && err.response.data && err.response.data.message) {
        errorMsg = err.response.data.message;
      }
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="container" style={{ minHeight: '480px', width: '450px', display: 'flex', flexDirection: 'column' }}>
        <form onSubmit={handleSubmit} style={{ padding: '40px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', color: 'var(--primary)' }}>
            <HeartHandshake size={32} />
            <span style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--primary)', margin: 0 }}>
              Bảo An Insurance
            </span>
          </div>

          <h1 style={{ fontSize: '1.5rem', marginBottom: '8px', textAlign: 'left', width: '100%' }}>Đặt lại mật khẩu</h1>
          <p style={{ fontSize: '0.85rem', margin: '0 0 20px 0', textAlign: 'left', color: 'var(--text-muted)' }}>
            Nhập mật khẩu mới cực kỳ bảo mật của bạn dưới đây.
          </p>

          {!token && (
            <div className="form-alert form-alert-danger">
              <AlertCircle size={14} />
              <span>Thiếu mã Token đặt lại mật khẩu! Vui lòng dùng liên kết chính xác từ email.</span>
            </div>
          )}

          {error && (
            <div className="form-alert form-alert-danger">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="form-alert form-alert-success">
              <CheckCircle size={14} />
              <span>{success}</span>
            </div>
          )}

          <div className="input-field-container">
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isSubmitting || !token}
              style={{ paddingRight: '40px' }}
            />
            <Lock className="input-field-icon" size={16} />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                padding: 0,
                boxShadow: 'none'
              }}
              disabled={isSubmitting || !token}
            >
              {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div className="input-field-container" style={{ marginTop: '12px' }}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Xác nhận mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isSubmitting || !token}
              style={{ paddingRight: '40px' }}
            />
            <Lock className="input-field-icon" size={16} />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                padding: 0,
                boxShadow: 'none'
              }}
              disabled={isSubmitting || !token}
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <button type="submit" disabled={isSubmitting || !token} style={{ width: '100%', marginTop: '20px', borderRadius: 'var(--radius-sm)' }}>
            {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
          </button>

          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); navigate('/login'); }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--primary)' }}
            >
              <ArrowLeft size={14} />
              Quay lại đăng nhập
            </a>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
