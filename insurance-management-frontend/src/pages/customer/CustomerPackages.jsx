import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  DollarSign, 
  Calendar, 
  Award, 
  Activity, 
  Check, 
  Sparkles,
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import apiClient from '../../api/apiClient';
import PageHeader from '../../components/PageHeader';
import ConfirmDialog from '../../components/ConfirmDialog';
import Toast from '../../components/Toast';

const CustomerPackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  
  // Register package state
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [registering, setRegistering] = useState(false);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/insurance-packages');
      setPackages(res.data);
    } catch (err) {
      console.error(err);
      showToast('Không thể tải danh sách gói bảo hiểm.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const handleRegisterClick = (pkg) => {
    setSelectedPackage(pkg);
    setIsConfirmOpen(true);
  };

  const handleRegisterConfirm = async () => {
    if (!selectedPackage) return;
    setIsConfirmOpen(false);
    setRegistering(true);

    try {
      await apiClient.post('/api/customer/insurances', {
        insurancePackageId: selectedPackage.id
      });
      showToast(`Đăng ký thành công gói bảo hiểm "${selectedPackage.name}". Vui lòng chờ phê duyệt từ quản trị viên!`, 'success');
    } catch (err) {
      console.error(err);
      let msg = 'Có lỗi xảy ra khi đăng ký gói bảo hiểm.';
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      showToast(msg, 'error');
    } finally {
      setRegistering(false);
      setSelectedPackage(null);
    }
  };

  const getTypeName = (type) => {
    switch (type) {
      case 'HEALTH': return 'Sức khỏe';
      case 'LIFE': return 'Nhân thọ';
      case 'VEHICLE': return 'Phương tiện';
      case 'PROPERTY': return 'Tài sản';
      default: return type;
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="saas-fade-in">
      {/* Page Header */}
      <PageHeader 
        title="Mua Gói Bảo Hiểm Trực Tuyến" 
        description="Khám phá các gói giải pháp bảo vệ tài chính toàn diện dành riêng cho bạn và gia đình. Đăng ký trực tuyến nhanh chóng, phê duyệt dễ dàng."
      />

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <div className="loading-spinner">Đang tải danh sách...</div>
        </div>
      ) : packages.length === 0 ? (
        <div className="saas-card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
          Hiện tại không có gói bảo hiểm nào đang hoạt động. Vui lòng quay lại sau!
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '28px'
        }}>
          {packages.map((pkg) => (
            <div key={pkg.id} className="saas-card saas-card-hover" style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '20px',
              backgroundColor: 'var(--card)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Type Badge */}
              <div style={{
                position: 'absolute',
                top: '0',
                right: '0',
                backgroundColor: 'var(--primary-dark)',
                color: '#white',
                padding: '6px 16px',
                fontSize: '0.75rem',
                fontWeight: '600',
                borderBottomLeftRadius: 'var(--radius-md)',
                color: '#ffffff'
              }}>
                {getTypeName(pkg.type)}
              </div>

              {/* Title & Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', letterSpacing: '0.05em' }}>
                  {pkg.packageCode}
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', lineHeight: '1.4', paddingRight: '80px' }}>
                  {pkg.name}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', minHeight: '60px', lineBreak: 'auto' }}>
                  {pkg.description || 'Chưa có mô tả chi tiết cho gói bảo hiểm này.'}
                </p>
              </div>

              {/* Key Specs */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                padding: '16px',
                backgroundColor: 'var(--background)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> Thời hạn
                  </span>
                  <strong style={{ fontSize: '0.85rem' }}>{pkg.durationMonths} Tháng</strong>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Award size={12} /> Đền bù tối đa
                  </span>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--success)' }}>{formatCurrency(pkg.maxBenefit)}</strong>
                </div>
              </div>

              {/* Price & Action */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderTop: '1px solid var(--border)',
                paddingTop: '16px',
                marginTop: '8px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phí bảo hiểm</span>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--primary)', fontWeight: '800' }}>
                    {formatCurrency(pkg.price)}
                  </strong>
                </div>

                <button 
                  className="btn btn-primary" 
                  onClick={() => handleRegisterClick(pkg)}
                  style={{ gap: '6px', padding: '10px 18px', height: '40px' }}
                >
                  <span>Đăng ký ngay</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog 
        isOpen={isConfirmOpen}
        title="Xác nhận đăng ký bảo hiểm"
        message={selectedPackage ? `Bạn có chắc chắn muốn đăng ký mua gói bảo hiểm "${selectedPackage.name}" với mức phí ${formatCurrency(selectedPackage.price)} không?` : ''}
        onConfirm={handleRegisterConfirm}
        onCancel={() => {
          setIsConfirmOpen(false);
          setSelectedPackage(null);
        }}
      />

      {/* Toast Overlay Container */}
      <div style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
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

export default CustomerPackages;
