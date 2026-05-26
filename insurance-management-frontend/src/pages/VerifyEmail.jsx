import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { KeyRound, ArrowLeft, AlertCircle, CheckCircle, HeartHandshake, RefreshCw } from 'lucide-react';
import './AuthPage.css';

const VerifyEmail = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const navigate = useNavigate();

  // Timer countdown logic
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Thiếu thông tin email để xác thực!');
      return;
    }

    if (!otp || otp.trim().length !== 6) {
      setError('Mã OTP xác thực phải chứa đúng 6 chữ số!');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiClient.post('/api/auth/verify-registration', {
        email,
        otp: otp.trim()
      });
      
      const successMsg = response.data.message || 'Xác thực tài khoản thành công! Đang chuyển hướng về trang đăng nhập...';
      setSuccess(successMsg);
      setOtp('');
      
      setTimeout(() => {
        navigate('/login', { state: { verificationSuccess: true } });
      }, 2000);
    } catch (err) {
      let errorMsg = 'Xác thực thất bại. Mã OTP có thể đã hết hạn hoặc không chính xác!';
      if (err.response && err.response.data && err.response.data.message) {
        errorMsg = err.response.data.message;
      }
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || isResending) return;
    
    setError('');
    setSuccess('');
    setIsResending(true);

    try {
      const response = await apiClient.post('/api/auth/resend-otp', { email });
      const successMsg = response.data.message || 'Đã gửi lại mã xác thực OTP mới thành công!';
      setSuccess(successMsg);
      setCountdown(60);
    } catch (err) {
      let errorMsg = 'Không thể gửi lại OTP. Vui lòng thử lại sau!';
      if (err.response && err.response.data && err.response.data.message) {
        errorMsg = err.response.data.message;
      }
      setError(errorMsg);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="container" style={{ minHeight: '460px', width: '450px', display: 'flex', flexDirection: 'column' }}>
        <form onSubmit={handleVerifySubmit} style={{ padding: '40px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', color: 'var(--primary)' }}>
            <HeartHandshake size={32} />
            <span style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--primary)', margin: 0 }}>
              Bảo An Insurance
            </span>
          </div>

          <h1 style={{ fontSize: '1.5rem', marginBottom: '8px', textAlign: 'left', width: '100%' }}>Xác thực tài khoản</h1>
          
          {!success && (
            <p style={{ fontSize: '0.85rem', margin: '0 0 20px 0', textAlign: 'left', color: 'var(--text-muted)' }}>
              Mã OTP 6 số đã được gửi đến email: <strong style={{ color: 'var(--text-main)' }}>{email}</strong>. Vui lòng kiểm tra và nhập mã xác thực.
            </p>
          )}

          {!email && (
            <div className="form-alert form-alert-danger">
              <AlertCircle size={14} />
              <span>Thiếu địa chỉ email cần xác thực! Vui lòng quay lại đăng ký.</span>
            </div>
          )}

          {error && (
            <div className="form-alert form-alert-danger">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="form-alert form-alert-success" style={{ marginBottom: '24px' }}>
              <CheckCircle size={14} />
              <span>{success}</span>
            </div>
          )}

          {!success && (
            <>
              <div className="input-field-container">
                <input
                  type="text"
                  placeholder="Nhập mã OTP 6 số"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // only allow digits
                  disabled={isSubmitting || !email}
                  style={{ letterSpacing: otp.length > 0 ? '6px' : 'normal', textAlign: otp.length > 0 ? 'center' : 'left', fontWeight: 'bold', fontSize: '1.1rem' }}
                />
                <KeyRound className="input-field-icon" size={16} />
              </div>

              <button type="submit" disabled={isSubmitting || !email || otp.length !== 6} style={{ width: '100%', marginTop: '20px', borderRadius: 'var(--radius-sm)' }}>
                {isSubmitting ? 'Đang xác thực...' : 'Xác thực tài khoản'}
              </button>

              <div style={{ marginTop: '20px', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                {countdown > 0 ? (
                  <span>Gửi lại mã OTP sau: <strong style={{ color: 'var(--primary)' }}>{countdown}s</strong></span>
                ) : (
                  <button 
                    type="button" 
                    onClick={handleResendOtp} 
                    disabled={isResending}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      cursor: 'pointer',
                      fontWeight: '600',
                      padding: '4px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: 'none',
                      textTransform: 'none',
                      fontSize: '0.85rem'
                    }}
                  >
                    <RefreshCw size={14} className={isResending ? 'animate-spin' : ''} />
                    <span>Gửi lại mã OTP</span>
                  </button>
                )}
              </div>
            </>
          )}

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
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

export default VerifyEmail;
