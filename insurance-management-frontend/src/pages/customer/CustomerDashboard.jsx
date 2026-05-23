import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  ShieldCheck, 
  HelpCircle, 
  Sparkles,
  ArrowRight,
  Send,
  MessageSquare,
  FileCheck,
  AlertTriangle,
  User,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Edit2
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import apiClient from '../../api/apiClient';
import Toast from '../../components/Toast';

const CustomerDashboard = () => {
  const [profile, setProfile] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    dateOfBirth: '',
    gender: 'Nam',
    identityCard: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [errors, setErrors] = useState({});

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/customer/profile');
      if (res.data) {
        setProfile({
          fullName: res.data.fullName || '',
          phoneNumber: res.data.phoneNumber || '',
          address: res.data.address || '',
          dateOfBirth: res.data.dateOfBirth || '',
          gender: res.data.gender || 'Nam',
          identityCard: res.data.identityCard || ''
        });
      }
    } catch (err) {
      console.error(err);
      showToast('Không thể tải thông tin hồ sơ của bạn.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const validateForm = () => {
    const errs = {};
    
    // Họ tên
    if (!profile.fullName || !profile.fullName.trim()) {
      errs.fullName = 'Họ và tên là bắt buộc và không được để trống';
    } else if (profile.fullName.trim().length < 2) {
      errs.fullName = 'Họ và tên phải có ít nhất 2 ký tự';
    } else if (profile.fullName.trim() === 'Khách Hàng Mới') {
      errs.fullName = 'Vui lòng cập nhật họ và tên thật của bạn';
    }

    // Số điện thoại
    if (!profile.phoneNumber || !profile.phoneNumber.trim()) {
      errs.phoneNumber = 'Số điện thoại là bắt buộc và không được để trống';
    } else if (!/^(0[3|5|7|8|9])[0-9]{8}$/.test(profile.phoneNumber.trim())) {
      errs.phoneNumber = 'Số điện thoại không hợp lệ (phải gồm 10 chữ số, bắt đầu bằng 03/05/07/08/09)';
    }

    // CMND/CCCD
    if (!profile.identityCard || !profile.identityCard.trim()) {
      errs.identityCard = 'Số CMND/CCCD là bắt buộc và không được để trống';
    } else if (!/^[0-9]{9}$|^[0-9]{12}$/.test(profile.identityCard.trim())) {
      errs.identityCard = 'Số CMND/CCCD không hợp lệ (phải gồm 9 hoặc 12 chữ số)';
    }

    // Ngày sinh
    if (!profile.dateOfBirth) {
      errs.dateOfBirth = 'Ngày sinh là bắt buộc';
    } else {
      const parts = profile.dateOfBirth.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);
        const dob = new Date(year, month - 1, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (dob > today) {
          errs.dateOfBirth = 'Ngày sinh không được ở tương lai';
        }
      } else {
        errs.dateOfBirth = 'Ngày sinh không hợp lệ';
      }
    }

    // Giới tính
    if (!profile.gender || !profile.gender.trim()) {
      errs.gender = 'Giới tính là bắt buộc';
    } else if (!['Nam', 'Nữ', 'Khác'].includes(profile.gender.trim())) {
      errs.gender = 'Giới tính không hợp lệ';
    }

    // Địa chỉ
    if (!profile.address || !profile.address.trim()) {
      errs.address = 'Địa chỉ liên hệ là bắt buộc và không được để trống';
    } else if (profile.address.trim().length < 5) {
      errs.address = 'Địa chỉ liên hệ phải dài ít nhất 5 ký tự';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Vui lòng kiểm tra lại thông tin nhập vào!', 'error');
      return;
    }
    setSaving(true);
    try {
      await apiClient.put('/api/customer/profile', profile);
      showToast('Cập nhật hồ sơ cá nhân thành công!', 'success');
      setIsEditing(false);
      fetchProfile();
      setErrors({});
    } catch (err) {
      console.error(err);
      let msg = 'Không thể cập nhật thông tin hồ sơ.';
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const actionButtons = (
    <button className="btn btn-primary" style={{ height: '38px', gap: '6px' }}>
      <Sparkles size={14} />
      Ưu đãi thành viên
    </button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="saas-fade-in">
      
      {/* Page Header */}
      <PageHeader 
        title="Trang Cá Nhân Khách Hàng" 
        description="Chào mừng bạn đến với Cổng bảo hiểm Bảo An. Dễ dàng xem hợp đồng hiện có, tạo báo cáo sự cố hoặc hỏi đáp trợ lý ảo."
        actions={actionButtons}
      />

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '24px'
      }}>
        <StatCard 
          title="HỢP ĐỒNG ĐANG HOẠT ĐỘNG" 
          value="1 Gói" 
          icon={ShieldCheck} 
          trend="Đang bảo vệ" 
          trendType="up"
          description="Gói An Sinh Toàn Diện"
        />
        <StatCard 
          title="YÊU CẦU BỒI THƯỜNG" 
          value="0" 
          icon={AlertTriangle} 
          trend="Không có sự cố" 
          trendType="up"
          description="Hồ sơ bồi thường sạch"
        />
        <StatCard 
          title="NGÀY ĐÓNG PHÍ KẾ TIẾP" 
          value="01/01/2027" 
          icon={FileCheck} 
          trend="Đã thanh toán" 
          trendType="up"
          description="Đóng phí hàng năm"
        />
        <StatCard 
          title="TƯ VẤN VIÊN RIÊNG" 
          value="Nguyễn Văn B" 
          icon={MessageSquare} 
          trend="Đang trực tuyến" 
          trendType="up"
          description="employee@insurance.com"
        />
      </div>

      {/* Hồ sơ cá nhân Card */}
      <div className="saas-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid var(--border)', 
          paddingBottom: '12px'
        }}>
          <h3 style={{ 
            fontSize: '1rem', 
            fontWeight: '600', 
            display: 'flex', 
            alignItems: 'center',
            gap: '8px',
            margin: 0
          }}>
            <User size={18} style={{ color: 'var(--primary)' }} />
            Thông tin hồ sơ cá nhân
          </h3>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)} 
              className="btn btn-secondary" 
              style={{ height: '32px', padding: '0 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Edit2 size={12} />
              Chỉnh sửa
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '10px 0' }}>Đang tải thông tin hồ sơ...</div>
        ) : isEditing ? (
          <form onSubmit={handleProfileSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '500', fontSize: '0.85rem', color: 'var(--text-main)' }}>Họ và tên <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input 
                type="text" 
                name="fullName" 
                className={`form-input ${errors.fullName ? 'border-danger' : ''}`} 
                value={profile.fullName} 
                onChange={(e) => {
                  setProfile(prev => ({ ...prev, fullName: e.target.value }));
                  if (errors.fullName) setErrors(prev => ({ ...prev, fullName: '' }));
                }}
                required 
              />
              {errors.fullName && <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.fullName}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '500', fontSize: '0.85rem', color: 'var(--text-main)' }}>Số điện thoại <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input 
                type="text" 
                name="phoneNumber" 
                className={`form-input ${errors.phoneNumber ? 'border-danger' : ''}`} 
                value={profile.phoneNumber} 
                onChange={(e) => {
                  setProfile(prev => ({ ...prev, phoneNumber: e.target.value }));
                  if (errors.phoneNumber) setErrors(prev => ({ ...prev, phoneNumber: '' }));
                }} 
              />
              {errors.phoneNumber && <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.phoneNumber}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '500', fontSize: '0.85rem', color: 'var(--text-main)' }}>Số CMND/CCCD <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input 
                type="text" 
                name="identityCard" 
                className={`form-input ${errors.identityCard ? 'border-danger' : ''}`} 
                value={profile.identityCard} 
                onChange={(e) => {
                  setProfile(prev => ({ ...prev, identityCard: e.target.value }));
                  if (errors.identityCard) setErrors(prev => ({ ...prev, identityCard: '' }));
                }} 
              />
              {errors.identityCard && <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.identityCard}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '500', fontSize: '0.85rem', color: 'var(--text-main)' }}>Ngày sinh <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input 
                type="date" 
                name="dateOfBirth" 
                className={`form-input ${errors.dateOfBirth ? 'border-danger' : ''}`} 
                value={profile.dateOfBirth} 
                onChange={(e) => {
                  setProfile(prev => ({ ...prev, dateOfBirth: e.target.value }));
                  if (errors.dateOfBirth) setErrors(prev => ({ ...prev, dateOfBirth: '' }));
                }} 
              />
              {errors.dateOfBirth && <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.dateOfBirth}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '500', fontSize: '0.85rem', color: 'var(--text-main)' }}>Giới tính <span style={{ color: 'var(--danger)' }}>*</span></label>
              <select 
                name="gender" 
                className={`form-input ${errors.gender ? 'border-danger' : ''}`} 
                value={profile.gender} 
                onChange={(e) => {
                  setProfile(prev => ({ ...prev, gender: e.target.value }));
                  if (errors.gender) setErrors(prev => ({ ...prev, gender: '' }));
                }}
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
              {errors.gender && <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.gender}</span>}
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label" style={{ fontWeight: '500', fontSize: '0.85rem', color: 'var(--text-main)' }}>Địa chỉ liên hệ <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input 
                type="text" 
                name="address" 
                className={`form-input ${errors.address ? 'border-danger' : ''}`} 
                value={profile.address} 
                onChange={(e) => {
                  setProfile(prev => ({ ...prev, address: e.target.value }));
                  if (errors.address) setErrors(prev => ({ ...prev, address: '' }));
                }} 
              />
              {errors.address && <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.address}</span>}
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button 
                type="button" 
                onClick={() => { setIsEditing(false); fetchProfile(); setErrors({}); }} 
                className="btn btn-secondary" 
                style={{ height: '36px' }}
                disabled={saving}
              >
                Hủy
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ height: '36px' }}
                disabled={saving}
              >
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', padding: '5px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <User size={16} style={{ color: 'var(--text-muted)' }} />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Họ và tên</div>
                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)' }}>{profile.fullName || '---'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Phone size={16} style={{ color: 'var(--text-muted)' }} />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Số điện thoại</div>
                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)' }}>{profile.phoneNumber || '---'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CreditCard size={16} style={{ color: 'var(--text-muted)' }} />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Số CMND/CCCD</div>
                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)' }}>{profile.identityCard || '---'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ngày sinh / Giới tính</div>
                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)' }}>
                  {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('vi-VN') : '---'} ({profile.gender})
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', gridColumn: '1 / -1' }}>
              <MapPin size={16} style={{ color: 'var(--text-muted)' }} />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Địa chỉ liên hệ</div>
                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)' }}>{profile.address || '---'}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Details Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '28px'
      }}>
        
        {/* Active Policy Detail Card */}
        <div className="saas-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ 
            fontSize: '1rem', 
            fontWeight: '600', 
            borderBottom: '1px solid var(--border)', 
            paddingBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <ShieldCheck size={18} style={{ color: 'var(--primary)' }} />
            Chi tiết Hợp đồng Bảo hiểm Active
          </h3>

          <div style={{
            backgroundColor: 'var(--background)',
            border: '1px solid var(--border)',
            padding: '18px',
            borderRadius: 'var(--radius-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <StatusBadge status="ACTIVE" />
                <h4 style={{ fontSize: '1rem', fontWeight: '700', marginTop: '8px', color: 'var(-- Saas-text-main, #0f172a)' }}>
                  Gói An Sinh Toàn Diện Pro
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mã hợp đồng: #HD-92810</span>
              </div>
              <Heart size={24} style={{ color: 'var(--danger)', fill: 'rgba(220, 38, 38, 0.05)' }} />
            </div>

            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '8px', 
              fontSize: '0.85rem', 
              color: '#334155',
              borderTop: '1px solid var(--border)',
              paddingTop: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Ngày bắt đầu:</span>
                <strong>01/01/2026</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Ngày đáo hạn:</span>
                <strong>01/01/2027</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Hạn mức chi trả:</span>
                <strong style={{ color: 'var(--primary)' }}>500,000,000đ</strong>
              </div>
            </div>
          </div>

          <button className="btn btn-secondary" style={{ width: '100%', gap: '8px', height: '38px' }}>
            <span>Xem điều khoản & Điều kiện bảo hiểm</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* My Consultant Details */}
        <div className="saas-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ 
            fontSize: '1rem', 
            fontWeight: '600', 
            borderBottom: '1px solid var(--border)', 
            paddingBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <MessageSquare size={18} style={{ color: 'var(--warning)' }} />
            Tư vấn viên Chăm sóc của bạn
          </h3>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            backgroundColor: 'var(--background)',
            padding: '16px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '1rem'
            }}>
              NVB
            </div>
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '750', color: 'var(--text-main)' }}>Nguyễn Văn B (Staff)</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>employee@insurance.com</p>
              <div style={{ marginTop: '4px' }}>
                <StatusBadge status="ROLE_EMPLOYEE" />
              </div>
            </div>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            Nhân viên tư vấn riêng chịu trách nhiệm giải thích các quyền lợi, hướng dẫn làm giấy tờ bồi thường khi bạn gặp sự cố và hỗ trợ tái ký hợp đồng.
          </p>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            Nhân viên tư vấn riêng chịu trách nhiệm giải thích các quyền lợi, hướng dẫn làm giấy tờ bồi thường khi bạn gặp sự cố và hỗ trợ tái ký hợp đồng.
          </p>

          <button className="btn btn-primary" style={{ width: '100%', gap: '8px', height: '38px' }}>
            <Send size={14} />
            <span>Gửi tin nhắn hỗ trợ trực tiếp</span>
          </button>
        </div>
      </div>

      {/* Quick shortcuts row */}
      <div className="saas-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>Bạn muốn thực hiện thao tác nào?</h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {[
            { title: "Khai báo tai nạn / Yêu cầu bồi thường", desc: "Tạo phiếu báo cáo sự cố (ảnh hiện trường, hóa đơn viện phí) để yêu cầu chi trả bồi thường bảo hiểm nhanh chóng.", icon: AlertTriangle, color: "var(--danger)" },
            { title: "Mua gói bảo hiểm mới trực tuyến", desc: "Khám phá danh sách các gói bảo hiểm sức khỏe, xe máy, tài sản đang active với quy trình duyệt tự động.", icon: Heart, color: "var(--primary)" },
            { title: "Trò chuyện với chatbot tư vấn AI", desc: "Đặt câu hỏi trực tiếp cho trợ lý ảo về quy chế bồi thường, điều khoản miễn trừ trách nhiệm của hợp đồng.", icon: HelpCircle, color: "var(--info)" }
          ].map((action, idx) => {
            const Icon = action.icon;
            return (
              <div key={idx} className="saas-card saas-card-hover" style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                cursor: 'pointer',
                backgroundColor: '#ffffff'
              }}>
                <div style={{
                  color: action.color,
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  width: '36px',
                  height: '36px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={16} />
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)' }}>{action.title}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', flexGrow: 1 }}>{action.desc}</p>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  color: 'var(--primary)',
                  marginTop: '8px'
                }}>
                  <span>Bắt đầu thực hiện</span>
                  <ArrowRight size={12} />
                </div>
              </div>
            );
          })}
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

export default CustomerDashboard;
