import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { Mail, ArrowLeft, AlertCircle, CheckCircle, HeartHandshake, KeyRound, Eye, EyeOff, Lock } from 'lucide-react';
import './AuthPage.css';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter OTP & New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (tokenParam) {
      setOtp(tokenParam);
      setStep(2);
    }
  }, [tokenParam]);

  const handleEmailSubmit = async (e) => {
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
      setSuccess(response.data.message || 'Mã OTP đặt lại mật khẩu đã được gửi về email của bạn!');
      setStep(2);
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

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otp || otp.trim().length !== 6) {
      setError('Mã OTP xác thực phải chứa đúng 6 chữ số!');
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError('Vui lòng nhập mật khẩu mới và xác nhận mật khẩu mới!');
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
        token: otp.trim(),
        newPassword
      });
      setSuccess(response.data.message || 'Đặt lại mật khẩu thành công! Đang chuyển về trang đăng nhập...');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      console.error(err);
      let errorMsg = 'Đặt lại mật khẩu thất bại. Mã OTP có thể đã hết hạn hoặc không chính xác!';
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
      <div className="container" style={{ minHeight: step === 1 ? '420px' : '520px', width: '450px', display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease' }}>
        <form onSubmit={step === 1 ? handleEmailSubmit : handleResetSubmit} style={{ padding: '40px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', color: 'var(--primary)' }}>
            <HeartHandshake size={32} />
            <span style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--primary)', margin: 0 }}>
              Bảo An Insurance
            </span>
          </div>

          <h1 style={{ fontSize: '1.5rem', marginBottom: '8px', textAlign: 'left', width: '100%' }}>Quên mật khẩu?</h1>
          <p style={{ fontSize: '0.85rem', margin: '0 0 20px 0', textAlign: 'left', color: 'var(--text-muted)' }}>
            {step === 1 
              ? 'Nhập email tài khoản của bạn để nhận mã xác thực OTP đặt lại mật khẩu.' 
              : 'Nhập mã OTP 6 số đã được gửi đến email và thiết lập mật khẩu mới của bạn bên dưới.'
            }
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

          {step === 1 ? (
            <>
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
                {isSubmitting ? 'Đang gửi...' : 'Gửi mã OTP'}
              </button>
            </>
          ) : (
            <>
              <div className="input-field-container">
                <input
                  type="text"
                  placeholder="Nhập mã OTP 6 số"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  disabled={isSubmitting}
                  style={{ letterSpacing: otp.length > 0 ? '6px' : 'normal', textAlign: otp.length > 0 ? 'center' : 'left', fontWeight: 'bold' }}
                />
                <KeyRound className="input-field-icon" size={16} />
              </div>

              <div className="input-field-container" style={{ marginTop: '12px' }}>
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isSubmitting}
                  style={{ paddingRight: '40px' }}
                />
                <Lock className="input-field-icon" size={16} />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', padding: 0, boxShadow: 'none'
                  }}
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                  style={{ paddingRight: '40px' }}
                />
                <Lock className="input-field-icon" size={16} />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', padding: 0, boxShadow: 'none'
                  }}
                  disabled={isSubmitting}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button type="submit" disabled={isSubmitting} style={{ width: '100%', marginTop: '20px', borderRadius: 'var(--radius-sm)' }}>
                {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
              </button>
            </>
          )}

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
