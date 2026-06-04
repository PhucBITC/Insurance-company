import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import { AlertCircle, Loader } from 'lucide-react';
import './AuthPage.css';

const OAuth2CallbackPage = () => {
  const { provider } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithOAuthToken } = useAuth();
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const code = searchParams.get('code');
    
    if (!code) {
      setError('Không tìm thấy mã xác thực từ ' + (provider === 'google' ? 'Google' : 'Facebook') + '.');
      setLoading(false);
      return;
    }

    const exchangeCode = async () => {
      try {
        const response = await apiClient.post(`/api/auth/oauth2/callback/${provider}`, { code });
        const { token, id, email, role } = response.data;

        // Perform login inside AuthContext
        loginWithOAuthToken(token, { id, email, role });

        // Navigate to appropriate dashboard based on user role
        if (role === 'ROLE_ADMIN') {
          navigate('/admin/dashboard', { replace: true });
        } else if (role === 'ROLE_EMPLOYEE') {
          navigate('/employee/dashboard', { replace: true });
        } else {
          navigate('/customer/dashboard', { replace: true });
        }
      } catch (err) {
        console.error('OAuth2 login error:', err);
        let errorMsg = 'Đăng nhập mạng xã hội thất bại. Vui lòng thử lại sau!';
        if (err.response && err.response.data && err.response.data.message) {
          errorMsg = err.response.data.message;
        }
        setError(errorMsg);
        setLoading(false);
      }
    };

    exchangeCode();
  }, [provider, searchParams, loginWithOAuthToken, navigate]);

  const providerName = provider === 'google' ? 'Google' : 'Facebook';

  return (
    <div className="auth-page-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="glass-card animate-fade-in" style={{ padding: '40px', width: '100%', maxWidth: '450px', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <Loader className="animate-spin" size={48} style={{ color: 'var(--primary-light)' }} />
            <h2 style={{ fontSize: '1.4rem', color: '#ffffff', margin: 0 }}>Đang đăng nhập</h2>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Vui lòng đợi trong giây lát khi chúng tôi xác thực tài khoản của bạn qua {providerName}...</p>
          </div>
        )}

        {error && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '16px', borderRadius: '50%', color: '#ef4444' }}>
              <AlertCircle size={36} />
            </div>
            <h2 style={{ fontSize: '1.4rem', color: '#ffffff', margin: 0 }}>Đăng nhập thất bại</h2>
            <p style={{ color: 'rgba(239, 68, 68, 0.9)', margin: 0, fontSize: '0.95rem' }}>{error}</p>
            <button 
              onClick={() => navigate('/login', { replace: true })}
              style={{
                marginTop: '12px',
                padding: '10px 24px',
                fontSize: '0.95rem',
                cursor: 'pointer'
              }}
            >
              Quay lại Đăng nhập
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OAuth2CallbackPage;
