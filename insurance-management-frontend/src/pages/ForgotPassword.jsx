import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { Mail, ArrowLeft, AlertCircle, CheckCircle, HeartHandshake } from 'lucide-react';
import './AuthPage.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Vui lòng nhập địa chỉ email!');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiClient.post('/api/auth/forgot-password', { email });
      setSuccess(response.data.message || 'Yêu cầu thành công. Vui lòng kiểm tra email (hoặc console backend)!');
      setEmail('');
    } catch (err) {
      console.error(err);
      let errorMsg = 'Có lỗi xảy ra. Vui lòng kiểm tra kết nối và thử lại!';
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
      <div className="container" style={{ minHeight: '420px', width: '450px', display: 'flex', flexDirection: 'column' }}>
        <form onSubmit={handleSubmit} style={{ padding: '40px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', color: 'var(--primary)' }}>
            <HeartHandshake size={32} />
            <span style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--primary)', margin: 0 }}>
              Bảo An Insurance
            </span>
          </div>

          <h1 style={{ fontSize: '1.5rem', marginBottom: '8px', textAlign: 'left', width: '100%' }}>Quên mật khẩu?</h1>
          <p style={{ fontSize: '0.85rem', margin: '0 0 20px 0', textAlign: 'left', color: 'var(--text-muted)' }}>
            Nhập email tài khoản của bạn để nhận liên kết đặt lại mật khẩu bảo mật mới.
          </p>

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
              type="email"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
            <Mail className="input-field-icon" size={16} />
          </div>

          <button type="submit" disabled={isSubmitting} style={{ width: '100%', marginTop: '16px', borderRadius: 'var(--radius-sm)' }}>
            {isSubmitting ? 'Đang gửi...' : 'Gửi liên kết đặt lại'}
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

export default ForgotPassword;
