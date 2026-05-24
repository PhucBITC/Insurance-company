import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  HelpCircle, 
  PlusCircle, 
  X, 
  AlertCircle,
  Video,
  MapPin,
  RefreshCw,
  Trash2
} from 'lucide-react';
import apiClient from '../../api/apiClient';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Toast from '../../components/Toast';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useUI } from '../../context/UIContext';

const Appointments = () => {
  const { t, language } = useUI();
  
  // State
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modal & Dialog states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Form fields
  const [formFields, setFormFields] = useState({
    appointmentDate: '',
    appointmentTime: '09:00',
    consultationType: 'ONLINE',
    title: '',
    notes: ''
  });

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/customer/appointments/my');
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
      showToast(language === 'vi' ? 'Không thể tải danh sách lịch hẹn.' : 'Failed to load appointments.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormFields(prev => ({ ...prev, [name]: value }));
  };

  const openModal = () => {
    // Reset form with default tomorrow date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    
    setFormFields({
      appointmentDate: dateString,
      appointmentTime: '09:00',
      consultationType: 'ONLINE',
      title: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formFields.title.trim()) {
      showToast(language === 'vi' ? 'Vui lòng điền tiêu đề buổi hẹn!' : 'Please enter a title!', 'error');
      return;
    }
    
    setSubmitting(true);
    try {
      await apiClient.post('/api/customer/appointments', formFields);
      showToast(language === 'vi' ? 'Đặt lịch hẹn tư vấn thành công!' : 'Appointment booked successfully!', 'success');
      setIsModalOpen(false);
      fetchAppointments();
    } catch (err) {
      console.error(err);
      let errMsg = language === 'vi' ? 'Đã xảy ra lỗi khi đặt lịch hẹn.' : 'Error booking appointment.';
      if (err.response && err.response.data && err.response.data.message) {
        errMsg = err.response.data.message;
      }
      showToast(errMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelClick = (app) => {
    setSelectedAppointment(app);
    setIsConfirmOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedAppointment) return;
    setIsConfirmOpen(false);
    setCancelling(true);
    try {
      await apiClient.delete(`/api/customer/appointments/${selectedAppointment.id}`);
      showToast(language === 'vi' ? 'Đã hủy lịch hẹn tư vấn thành công!' : 'Appointment cancelled successfully!', 'success');
      fetchAppointments();
    } catch (err) {
      console.error(err);
      let errMsg = language === 'vi' ? 'Không thể hủy lịch hẹn.' : 'Failed to cancel appointment.';
      if (err.response && err.response.data && err.response.data.message) {
        errMsg = err.response.data.message;
      }
      showToast(errMsg, 'error');
    } finally {
      setCancelling(false);
      setSelectedAppointment(null);
    }
  };

  const formatDate = (val) => {
    if (!val) return '-';
    const parts = val.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return new Date(val).toLocaleDateString('vi-VN');
  };

  const timeOptions = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00',
    '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  const headers = [
    { label: language === 'vi' ? 'Thời gian' : 'Time', key: 'appointmentDate', width: '160px' },
    { label: language === 'vi' ? 'Tiêu đề cuộc hẹn' : 'Appointment Title', key: 'title' },
    { label: language === 'vi' ? 'Hình thức' : 'Type', key: 'consultationType', width: '120px' },
    { label: language === 'vi' ? 'Tư vấn viên' : 'Consultant', key: 'employeeName', width: '180px' },
    { label: language === 'vi' ? 'Trạng thái' : 'Status', key: 'status', width: '130px' },
    { label: language === 'vi' ? 'Thao tác' : 'Actions', key: 'actions', width: '100px' }
  ];

  const renderCell = (row, key, val) => {
    switch (key) {
      case 'appointmentDate':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{formatDate(val)}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} />
              {row.appointmentTime}
            </div>
          </div>
        );
      case 'title':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontWeight: '550', color: 'var(--text-main)' }}>{val}</div>
            {row.notes && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                {row.notes}
              </div>
            )}
            {row.status === 'REJECTED' && row.rejectReason && (
              <div style={{ fontSize: '0.8rem', color: 'var(--danger)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertCircle size={12} />
                <span>{language === 'vi' ? 'Lý do từ chối: ' : 'Reason: '}{row.rejectReason}</span>
              </div>
            )}
          </div>
        );
      case 'consultationType':
        return val === 'ONLINE' ? (
          <span className="badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}>
            <Video size={12} />
            {language === 'vi' ? 'Online' : 'Online'}
          </span>
        ) : (
          <span className="badge" style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}>
            <MapPin size={12} />
            {language === 'vi' ? 'Gặp mặt' : 'Offline'}
          </span>
        );
      case 'employeeName':
        return val ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: '500', color: 'var(--text-main)' }}>{val}</span>
            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{row.employeeCode}</span>
          </div>
        ) : (
          <span style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {language === 'vi' ? 'Chưa chỉ định' : 'Not assigned'}
          </span>
        );
      case 'status':
        return <StatusBadge status={val} />;
      case 'actions':
        const canCancel = row.status === 'PENDING' || row.status === 'APPROVED';
        return canCancel ? (
          <button 
            className="btn btn-secondary"
            onClick={() => handleCancelClick(row)}
            style={{ 
              color: 'var(--danger)', 
              borderColor: 'rgba(220, 38, 38, 0.15)',
              padding: '6px 10px',
              height: '32px',
              gap: '4px'
            }}
            title={language === 'vi' ? 'Hủy lịch hẹn' : 'Cancel appointment'}
          >
            <Trash2 size={14} />
          </button>
        ) : null;
      default:
        return val;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      <PageHeader 
        title={language === 'vi' ? 'Đặt lịch & Quản lý lịch hẹn' : 'Consultation Appointments'}
        description={language === 'vi' ? 'Đăng ký đặt lịch hẹn với tư vấn viên riêng để giải đáp thắc mắc về gói và hồ sơ bồi thường.' : 'Book a consultation meeting with your personal consultant to answer questions and get support.'}
        actions={
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={fetchAppointments} 
              className="btn btn-secondary" 
              style={{ height: '38px', gap: '6px' }}
              disabled={loading}
            >
              <RefreshCw className={loading ? "animate-spin" : ""} size={14} />
              {t('refreshBtn')}
            </button>
            <button 
              onClick={openModal} 
              className="btn btn-primary" 
              style={{ height: '38px', gap: '6px' }}
            >
              <PlusCircle size={16} />
              {language === 'vi' ? 'Đặt lịch tư vấn' : 'Book Appointment'}
            </button>
          </div>
        }
      />

      <div className="saas-card" style={{ padding: '24px' }}>
        {loading && appointments.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            <RefreshCw className="animate-spin" size={24} style={{ marginBottom: '12px' }} />
            <span>{language === 'vi' ? 'Đang tải danh sách lịch hẹn...' : 'Loading appointments...'}</span>
          </div>
        ) : (
          <DataTable 
            headers={headers} 
            data={appointments} 
            rowsPerPage={8}
            renderCell={renderCell}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Book Appointment Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="saas-card modal-container animate-slide-up" style={{ maxWidth: '550px', width: '90%', padding: '0', overflow: 'hidden' }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 24px',
              borderBottom: '1px solid var(--border)'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} style={{ color: 'var(--primary)' }} />
                {language === 'vi' ? 'Đặt lịch hẹn tư vấn mới' : 'Book New Consultation'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit}>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Title */}
                <div className="form-group">
                  <label className="form-label">{language === 'vi' ? 'Tiêu đề cuộc hẹn *' : 'Appointment Title *'}</label>
                  <input
                    type="text"
                    name="title"
                    className="form-input"
                    placeholder={language === 'vi' ? "Ví dụ: Tư vấn quyền lợi gói bảo hiểm sức khỏe" : "e.g. Consult on medical benefits"}
                    value={formFields.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Date and Time Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">{language === 'vi' ? 'Ngày hẹn *' : 'Appointment Date *'}</label>
                    <input
                      type="date"
                      name="appointmentDate"
                      className="form-input"
                      value={formFields.appointmentDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'vi' ? 'Giờ hẹn *' : 'Appointment Time *'}</label>
                    <select
                      name="appointmentTime"
                      className="form-input"
                      value={formFields.appointmentTime}
                      onChange={handleInputChange}
                      required
                    >
                      {timeOptions.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Consultation Type */}
                <div className="form-group">
                  <label className="form-label">{language === 'vi' ? 'Hình thức tư vấn' : 'Consultation Type'}</label>
                  <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                      <input 
                        type="radio" 
                        name="consultationType" 
                        value="ONLINE"
                        checked={formFields.consultationType === 'ONLINE'}
                        onChange={handleInputChange}
                      />
                      <Video size={14} style={{ color: 'var(--primary)' }} />
                      <span>{language === 'vi' ? 'Trực tuyến (Zoom/Meet)' : 'Online (Zoom/Meet)'}</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                      <input 
                        type="radio" 
                        name="consultationType" 
                        value="OFFLINE"
                        checked={formFields.consultationType === 'OFFLINE'}
                        onChange={handleInputChange}
                      />
                      <MapPin size={14} style={{ color: 'var(--success)' }} />
                      <span>{language === 'vi' ? 'Trực tiếp tại văn phòng' : 'Offline at Office'}</span>
                    </label>
                  </div>
                </div>

                {/* Notes */}
                <div className="form-group">
                  <label className="form-label">{language === 'vi' ? 'Ghi chú cho tư vấn viên (Không bắt buộc)' : 'Notes for Consultant (Optional)'}</label>
                  <textarea
                    name="notes"
                    className="form-input"
                    rows="3"
                    placeholder={language === 'vi' ? "Mô tả chi tiết câu hỏi của bạn để tư vấn viên chuẩn bị tốt nhất..." : "Describe your questions in detail..."}
                    value={formFields.notes}
                    onChange={handleInputChange}
                    style={{ resize: 'vertical' }}
                  ></textarea>
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '12px',
                padding: '16px 24px',
                borderTop: '1px solid var(--border)',
                backgroundColor: 'rgba(255, 255, 255, 0.01)'
              }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                >
                  {language === 'vi' ? 'Hủy' : 'Cancel'}
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={submitting}
                  style={{ gap: '6px' }}
                >
                  {submitting && <RefreshCw size={14} className="animate-spin" />}
                  {language === 'vi' ? 'Đặt lịch hẹn' : 'Book Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm cancel dialog */}
      <ConfirmDialog 
        isOpen={isConfirmOpen}
        title={language === 'vi' ? 'Xác nhận hủy lịch hẹn' : 'Cancel Appointment'}
        message={language === 'vi' ? `Bạn có chắc chắn muốn hủy lịch hẹn "${selectedAppointment?.title}" không?` : `Are you sure you want to cancel the appointment "${selectedAppointment?.title}"?`}
        onConfirm={handleCancelConfirm}
        onCancel={() => setIsConfirmOpen(false)}
        confirmText={language === 'vi' ? 'Xác nhận hủy' : 'Yes, cancel'}
        cancelText={language === 'vi' ? 'Quay lại' : 'No'}
        loading={cancelling}
      />

      {/* Toast Messages */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast 
            key={toast.id} 
            message={toast.message} 
            type={toast.type} 
            onClose={() => removeToast(toast.id)} 
          />
        ))}
      </div>
    </div>
  );
};

export default Appointments;
