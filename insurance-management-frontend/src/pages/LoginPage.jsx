import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import { Mail, Lock, AlertCircle, CheckCircle, HeartHandshake, Eye, EyeOff } from 'lucide-react';
import Toast from '../components/Toast';
import './AuthPage.css';

const LoginPage = () => {
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register State
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [isRegisterSubmitting, setIsRegisterSubmitting] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [toasts, setToasts] = useState([]);
  const successToastShown = useRef(false);
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const isSignUp = location.pathname === '/register';

  // Clear errors when switching routes
  useEffect(() => {
    setLoginError('');
    setRegisterError('');
    setRegisterSuccess('');
  }, [location.pathname]);

  // Show verification success toast if redirected from VerifyEmail
  useEffect(() => {
    if (location.state?.verificationSuccess && !successToastShown.current) {
      showToast('Xác thực tài khoản thành công! Bạn có thể đăng nhập ngay bây giờ.', 'success');
      successToastShown.current = true;
      // Clear state to avoid showing on reload
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setLoginError('Vui lòng nhập đầy đủ email và mật khẩu!');
      return;
    }

    setLoginError('');
    setIsLoginSubmitting(true);

    const result = await login(email, password);
    setIsLoginSubmitting(false);

    if (result.success) {
      if (result.user.role === 'ROLE_ADMIN') {
        navigate('/admin/dashboard');
      } else if (result.user.role === 'ROLE_EMPLOYEE') {
        navigate('/employee/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } else {
      setLoginError(result.error);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');

    if (!registerEmail || !registerPassword || !confirmPassword) {
      setRegisterError('Vui lòng nhập đầy đủ tất cả các trường!');
      return;
    }

    if (registerPassword.length < 6) {
      setRegisterError('Mật khẩu bảo mật phải chứa ít nhất 6 ký tự!');
      return;
    }

    if (registerPassword !== confirmPassword) {
      setRegisterError('Xác nhận mật khẩu không khớp!');
      return;
    }

    setIsRegisterSubmitting(true);

    try {
      const response = await apiClient.post('/api/auth/register', {
        email: registerEmail,
        password: registerPassword
      });

      const { requiresVerification, email: verifiedEmail } = response.data;

      if (requiresVerification) {
        setRegisterSuccess(response.data.message || 'Đăng ký tài khoản thành công! Vui lòng xác thực tài khoản...');
        setRegisterEmail('');
        setRegisterPassword('');
        setConfirmPassword('');
        
        setTimeout(() => {
          navigate(`/verify-email?email=${encodeURIComponent(verifiedEmail)}`);
        }, 300);
      } else {
        setRegisterSuccess(response.data.message || 'Đăng ký tài khoản thành công!');
        setRegisterEmail('');
        setRegisterPassword('');
        setConfirmPassword('');
        
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      let errorMsg = 'Đăng ký thất bại. Vui lòng kết nối lại máy chủ hoặc thử lại sau!';
      if (err.response && err.response.data && err.response.data.message) {
        errorMsg = err.response.data.message;
      }
      setRegisterError(errorMsg);
    } finally {
      setIsRegisterSubmitting(false);
    }
  };

  const googleIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );

  const facebookIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );

  const linkedinIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );

  return (
    <div className="auth-page-wrapper">
      <div className={`container ${isSignUp ? 'right-panel-active' : ''}`} id="container">
        
        {/* Sign Up / Registration Container */}
        <div className="form-container sign-up-container">
          <form onSubmit={handleRegisterSubmit}>
            <h1>Tạo tài khoản</h1>
            <div className="social-container">
              <a href="#" className="social" onClick={(e) => e.preventDefault()}>{facebookIcon}</a>
              <a href="#" className="social" onClick={(e) => e.preventDefault()}>{googleIcon}</a>
              <a href="#" className="social" onClick={(e) => e.preventDefault()}>{linkedinIcon}</a>
            </div>
            <span>hoặc sử dụng email để đăng ký</span>
            
            {registerError && (
              <div className="form-alert form-alert-danger">
                <AlertCircle size={14} />
                <span>{registerError}</span>
              </div>
            )}

            {registerSuccess && (
              <div className="form-alert form-alert-success">
                <CheckCircle size={14} />
                <span>{registerSuccess}</span>
              </div>
            )}

            <div className="input-field-container">
              <input
                type="email"
                placeholder="Email tài khoản"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                disabled={isRegisterSubmitting || !!registerSuccess}
                required
              />
              <Mail size={16} className="input-field-icon" />
            </div>

            <div className="input-field-container">
              <input
                type={showRegisterPassword ? "text" : "password"}
                placeholder="Mật khẩu bảo mật"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                disabled={isRegisterSubmitting || !!registerSuccess}
                style={{ paddingRight: '40px' }}
                required
              />
              <Lock size={16} className="input-field-icon" />
              <button
                type="button"
                onClick={() => setShowRegisterPassword(!showRegisterPassword)}
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
                disabled={isRegisterSubmitting || !!registerSuccess}
              >
                {showRegisterPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="input-field-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Xác nhận mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isRegisterSubmitting || !!registerSuccess}
                style={{ paddingRight: '40px' }}
                required
              />
              <Lock size={16} className="input-field-icon" />
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
                disabled={isRegisterSubmitting || !!registerSuccess}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button type="submit" disabled={isRegisterSubmitting || !!registerSuccess} style={{ marginTop: '16px' }}>
              {isRegisterSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
          </form>
        </div>

        {/* Sign In / Login Container */}
        <div className="form-container sign-in-container">
          <form onSubmit={handleLoginSubmit}>
            <h1>Đăng nhập</h1>
            <div className="social-container">
              <a href="#" className="social" onClick={(e) => e.preventDefault()}>{facebookIcon}</a>
              <a href="#" className="social" onClick={(e) => e.preventDefault()}>{googleIcon}</a>
              <a href="#" className="social" onClick={(e) => e.preventDefault()}>{linkedinIcon}</a>
            </div>
            <span>hoặc sử dụng tài khoản của bạn</span>

            {loginError && (
              <div className="form-alert form-alert-danger">
                <AlertCircle size={14} />
                <span>{loginError}</span>
              </div>
            )}

            <div className="input-field-container">
              <input
                type="email"
                placeholder="Tài khoản Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoginSubmitting}
                required
              />
              <Mail size={16} className="input-field-icon" />
            </div>

            <div className="input-field-container">
              <input
                type={showLoginPassword ? "text" : "password"}
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoginSubmitting}
                style={{ paddingRight: '40px' }}
                required
              />
              <Lock size={16} className="input-field-icon" />
              <button
                type="button"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
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
                disabled={isLoginSubmitting}
              >
                {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }}>Quên mật khẩu?</a>
            <button type="submit" disabled={isLoginSubmitting}>
              {isLoginSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
        </div>

        {/* Overlay Panels */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <HeartHandshake size={42} style={{ marginBottom: '16px', color: '#ffffff', opacity: 0.95 }} />
              <h1>Chào mừng trở lại!</h1>
              <p>Để tiếp tục kết nối với chúng tôi, vui lòng đăng nhập bằng tài khoản cá nhân của bạn</p>
              <button className="ghost" id="signIn" onClick={() => navigate('/login')}>
                Đăng nhập
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <HeartHandshake size={42} style={{ marginBottom: '16px', color: '#ffffff', opacity: 0.95 }} />
              <h1>Chào bạn!</h1>
              <p>Nhập thông tin cá nhân của bạn và bắt đầu hành trình tuyệt vời với chúng tôi</p>
              <button className="ghost" id="signUp" onClick={() => navigate('/register')}>
                Đăng ký
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Toast Overlay Container */}
      <div style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        pointerEvents: 'none'
      }}>
        {toasts.map(toast => (
          <Toast 
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
          />
        ))}
      </div>
    </div>
  );
};

export default LoginPage;
