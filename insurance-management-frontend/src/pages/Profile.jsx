import React, { useState, useEffect } from 'react';
import { 
  User, 
  Lock, 
  Mail, 
  Phone, 
  Briefcase, 
  MapPin, 
  Calendar, 
  Shield, 
  AlertCircle, 
  RefreshCw, 
  CheckCircle,
  Key
} from 'lucide-react';
import apiClient from '../api/apiClient';
import PageHeader from '../components/PageHeader';
import { useUI } from '../context/UIContext';

const Profile = () => {
  const { language } = useUI();

  // Profile data state
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [updating, setUpdating] = useState(false);

  // Edit fields state
  const [editFields, setEditFields] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    identityCard: ''
  });

  // Password state
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const fetchProfile = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await apiClient.get('/api/profile');
      setProfile(res.data);
      setEditFields({
        fullName: res.data.fullName || '',
        phoneNumber: res.data.phoneNumber || '',
        address: res.data.address || '',
        dateOfBirth: res.data.dateOfBirth || '',
        gender: res.data.gender || 'Nam',
        identityCard: res.data.identityCard || ''
      });
    } catch (err) {
      console.error(err);
      setErrorMsg(language === 'vi' ? 'Không thể tải thông tin hồ sơ cá nhân.' : 'Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Validation
    if (profile.role === 'ROLE_EMPLOYEE' || profile.role === 'ROLE_CUSTOMER') {
      if (!editFields.fullName.trim() || editFields.fullName.trim().length < 2) {
        setErrorMsg(language === 'vi' ? 'Họ và tên phải có ít nhất 2 ký tự!' : 'Full name must have at least 2 characters!');
        setUpdating(false);
        return;
      }
      if (!editFields.phoneNumber.trim() || !/^(0[3|5|7|8|9])[0-9]{8}$/.test(editFields.phoneNumber.trim())) {
        setErrorMsg(language === 'vi' ? 'Số điện thoại không hợp lệ (gồm 10 số bắt đầu bằng 03/05/07/08/09)!' : 'Invalid phone number (must be 10 digits starting with 03/05/07/08/09)!');
        setUpdating(false);
        return;
      }
    }

    if (profile.role === 'ROLE_CUSTOMER') {
      if (!editFields.identityCard.trim() || !/^[0-9]{9}$|^[0-9]{12}$/.test(editFields.identityCard.trim())) {
        setErrorMsg(language === 'vi' ? 'CMND/CCCD phải gồm 9 hoặc 12 chữ số!' : 'ID Card must be 9 or 12 digits!');
        setUpdating(false);
        return;
      }
      if (!editFields.address.trim() || editFields.address.trim().length < 5) {
        setErrorMsg(language === 'vi' ? 'Địa chỉ liên hệ phải dài ít nhất 5 ký tự!' : 'Contact address must be at least 5 characters long!');
        setUpdating(false);
        return;
      }
      if (!editFields.dateOfBirth) {
        setErrorMsg(language === 'vi' ? 'Ngày sinh là bắt buộc!' : 'Date of birth is required!');
        setUpdating(false);
        return;
      }
    }

    try {
      await apiClient.put('/api/profile', editFields);
      setSuccessMsg(language === 'vi' ? 'Cập nhật hồ sơ thành công!' : 'Profile updated successfully!');
      // Refresh profile data
      const res = await apiClient.get('/api/profile');
      setProfile(res.data);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || (language === 'vi' ? 'Lỗi hệ thống khi cập nhật hồ sơ.' : 'System error while updating profile.'));
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordData.oldPassword) {
      setPasswordError(language === 'vi' ? 'Vui lòng nhập mật khẩu hiện tại!' : 'Please enter your current password!');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError(language === 'vi' ? 'Mật khẩu mới phải có tối thiểu 6 ký tự!' : 'New password must be at least 6 characters long!');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError(language === 'vi' ? 'Xác nhận mật khẩu mới không trùng khớp!' : 'Passwords do not match!');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await apiClient.post('/api/profile/change-password', {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordSuccess(language === 'vi' ? 'Đổi mật khẩu thành công!' : 'Password changed successfully!');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error(err);
      setPasswordError(err.response?.data?.message || (language === 'vi' ? 'Mật khẩu cũ không chính xác hoặc lỗi hệ thống.' : 'Incorrect old password or system error.'));
    } finally {
      setPasswordLoading(false);
    }
  };

  const formatCurrency = (val) => {
    if (!val) return '---';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="saas-fade-in">
      <PageHeader 
        title={language === 'vi' ? "Hồ sơ cá nhân" : "User Profile"} 
        description={language === 'vi' ? "Quản lý thông tin định danh cá nhân và thay đổi mật khẩu tài khoản." : "Manage personal identification details and account security credentials."}
      />

      {loading ? (
        <div className="saas-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: 'var(--text-muted)' }}>
          <RefreshCw className="animate-spin" size={32} style={{ marginBottom: '12px' }} />
          <div>{language === 'vi' ? 'Đang tải thông tin hồ sơ...' : 'Loading profile...'}</div>
        </div>
      ) : profile ? (
        <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: '24px', alignItems: 'start' }}>
          
          {/* Column 1: Details & Update Form */}
          <div className="saas-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
              <User size={18} style={{ color: 'var(--primary)' }} />
              {language === 'vi' ? 'Thông tin hồ sơ' : 'Profile Details'}
            </h3>

            {errorMsg && (
              <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
                <AlertCircle size={16} />
                <div>{errorMsg}</div>
              </div>
            )}

            {successMsg && (
              <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
                <CheckCircle size={16} />
                <div>{successMsg}</div>
              </div>
            )}

            <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Email - Readonly */}
                <div>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={14} style={{ color: 'var(--text-muted)' }} />
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    value={profile.email}
                    disabled
                    style={{ backgroundColor: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)', cursor: 'not-allowed' }}
                  />
                </div>

                {/* Role - Readonly */}
                <div>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Shield size={14} style={{ color: 'var(--text-muted)' }} />
                    {language === 'vi' ? 'Quyền hạn' : 'Role'}
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={profile.role === 'ROLE_ADMIN' ? 'Quản trị viên (Admin)' : profile.role === 'ROLE_EMPLOYEE' ? 'Nhân viên (Employee)' : 'Khách hàng (Customer)'}
                    disabled
                    style={{ backgroundColor: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)', cursor: 'not-allowed' }}
                  />
                </div>
              </div>

              {profile.role !== 'ROLE_ADMIN' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {/* Full Name */}
                  <div>
                    <label className="form-label">{language === 'vi' ? 'Họ và tên' : 'Full Name'}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editFields.fullName}
                      onChange={(e) => setEditFields(prev => ({ ...prev, fullName: e.target.value }))}
                      required
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={14} style={{ color: 'var(--text-muted)' }} />
                      {language === 'vi' ? 'Số điện thoại' : 'Phone Number'}
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={editFields.phoneNumber}
                      onChange={(e) => setEditFields(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Employee specific fields */}
              {profile.role === 'ROLE_EMPLOYEE' && (
                <div style={{ padding: '12px', border: '1px dashed var(--glass-border)', borderRadius: 'var(--radius-sm)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>{language === 'vi' ? 'Mã nhân viên' : 'Employee Code'}:</span>
                    <strong style={{ marginLeft: '6px', color: 'var(--text-main)' }}>{profile.employeeCode}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>{language === 'vi' ? 'Chức vụ' : 'Position'}:</span>
                    <strong style={{ marginLeft: '6px', color: 'var(--text-main)' }}>{profile.position || '---'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>{language === 'vi' ? 'Phòng ban' : 'Department'}:</span>
                    <strong style={{ marginLeft: '6px', color: 'var(--text-main)' }}>{profile.department || '---'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>{language === 'vi' ? 'Lương cơ bản' : 'Salary'}:</span>
                    <strong style={{ marginLeft: '6px', color: 'var(--text-main)' }}>{formatCurrency(profile.salary)}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>{language === 'vi' ? 'Ngày vào làm' : 'Hire Date'}:</span>
                    <strong style={{ marginLeft: '6px', color: 'var(--text-main)' }}>
                      {profile.hireDate ? new Date(profile.hireDate).toLocaleDateString('vi-VN') : '---'}
                    </strong>
                  </div>
                </div>
              )}

              {/* Customer specific fields */}
              {profile.role === 'ROLE_CUSTOMER' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {/* Identity Card */}
                    <div>
                      <label className="form-label">{language === 'vi' ? 'Số CMND/CCCD' : 'Identity Card'}</label>
                      <input
                        type="text"
                        className="form-input"
                        value={editFields.identityCard}
                        onChange={(e) => setEditFields(prev => ({ ...prev, identityCard: e.target.value }))}
                        required
                      />
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                        {language === 'vi' ? 'Ngày sinh' : 'Date of Birth'}
                      </label>
                      <input
                        type="date"
                        className="form-input"
                        value={editFields.dateOfBirth}
                        onChange={(e) => setEditFields(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
                    {/* Gender */}
                    <div>
                      <label className="form-label">{language === 'vi' ? 'Giới tính' : 'Gender'}</label>
                      <select
                        className="form-input"
                        value={editFields.gender}
                        onChange={(e) => setEditFields(prev => ({ ...prev, gender: e.target.value }))}
                      >
                        <option value="Nam">{language === 'vi' ? 'Nam' : 'Male'}</option>
                        <option value="Nữ">{language === 'vi' ? 'Nữ' : 'Female'}</option>
                        <option value="Khác">{language === 'vi' ? 'Khác' : 'Other'}</option>
                      </select>
                    </div>

                    {/* Address */}
                    <div>
                      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={14} style={{ color: 'var(--text-muted)' }} />
                        {language === 'vi' ? 'Địa chỉ liên hệ' : 'Address'}
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={editFields.address}
                        onChange={(e) => setEditFields(prev => ({ ...prev, address: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>{language === 'vi' ? 'Mã khách hàng' : 'Customer Code'}:</span>
                    <strong style={{ marginLeft: '6px', color: 'var(--text-main)' }}>{profile.customerCode}</strong>
                  </div>
                </>
              )}

              {profile.role !== 'ROLE_ADMIN' && (
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ alignSelf: 'flex-start', marginTop: '8px', minWidth: '150px' }}
                  disabled={updating}
                >
                  {updating ? (
                    <RefreshCw className="animate-spin" size={16} />
                  ) : (
                    language === 'vi' ? 'Lưu thay đổi' : 'Save Changes'
                  )}
                </button>
              )}
            </form>
          </div>

          {/* Column 2: Change Password */}
          <div className="saas-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
              <Key size={18} style={{ color: 'var(--warning)' }} />
              {language === 'vi' ? 'Đổi mật khẩu' : 'Change Password'}
            </h3>

            {passwordError && (
              <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
                <AlertCircle size={16} />
                <div>{passwordError}</div>
              </div>
            )}

            {passwordSuccess && (
              <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
                <CheckCircle size={16} />
                <div>{passwordSuccess}</div>
              </div>
            )}

            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label">{language === 'vi' ? 'Mật khẩu hiện tại' : 'Current Password'}</label>
                <input
                  type="password"
                  className="form-input"
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, oldPassword: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="form-label">{language === 'vi' ? 'Mật khẩu mới' : 'New Password'}</label>
                <input
                  type="password"
                  className="form-input"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="form-label">{language === 'vi' ? 'Xác nhận mật khẩu mới' : 'Confirm New Password'}</label>
                <input
                  type="password"
                  className="form-input"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  marginTop: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  borderColor: 'rgba(99, 102, 241, 0.3)',
                  color: 'var(--primary)'
                }}
                disabled={passwordLoading}
              >
                {passwordLoading ? (
                  <RefreshCw className="animate-spin" size={16} />
                ) : (
                  <>
                    <Lock size={14} />
                    {language === 'vi' ? 'Cập nhật mật khẩu' : 'Update Password'}
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      ) : null}
    </div>
  );
};

export default Profile;
