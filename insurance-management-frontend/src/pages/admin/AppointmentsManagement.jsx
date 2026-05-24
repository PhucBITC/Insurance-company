import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Video, 
  MapPin, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Award,
  UserPlus,
  AlertCircle
} from 'lucide-react';
import apiClient from '../../api/apiClient';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Toast from '../../components/Toast';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';

const AppointmentsManagement = () => {
  const { t, language } = useUI();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ROLE_ADMIN';

  // State
  const [appointments, setAppointments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Dialogs & Modals state
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const endpoint = isAdmin ? '/api/admin/appointments' : '/api/employee/appointments/my';
      const res = await apiClient.get(endpoint);
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
      showToast(language === 'vi' ? 'Không thể tải danh sách lịch hẹn.' : 'Failed to load appointments.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    if (!isAdmin) return;
    try {
      const res = await apiClient.get('/api/admin/employees');
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchEmployees();
  }, [user]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Status updates
  const handleStatusChange = async (appId, status, reason = '') => {
    setActionLoading(true);
    try {
      await apiClient.put(`/api/admin-or-employee/appointments/${appId}/status`, {
        status,
        rejectReason: reason
      });
      
      let successMsg = language === 'vi' ? 'Cập nhật trạng thái lịch hẹn thành công!' : 'Appointment status updated!';
      if (status === 'APPROVED') {
        successMsg = language === 'vi' ? 'Đã duyệt lịch hẹn tư vấn!' : 'Appointment approved!';
      } else if (status === 'REJECTED') {
        successMsg = language === 'vi' ? 'Đã từ chối lịch hẹn tư vấn!' : 'Appointment rejected!';
      } else if (status === 'COMPLETED') {
        successMsg = language === 'vi' ? 'Đã hoàn thành buổi tư vấn!' : 'Consultation completed!';
      }
      
      showToast(successMsg, 'success');
      setIsRejectOpen(false);
      setRejectReason('');
      fetchAppointments();
    } catch (err) {
      console.error(err);
      let errMsg = language === 'vi' ? 'Lỗi khi cập nhật trạng thái.' : 'Failed to update status.';
      if (err.response && err.response.data && err.response.data.message) {
        errMsg = err.response.data.message;
      }
      showToast(errMsg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Assign employee
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployeeId) {
      showToast(language === 'vi' ? 'Vui lòng chọn nhân viên tư vấn!' : 'Please select a consultant!', 'error');
      return;
    }

    setActionLoading(true);
    try {
      await apiClient.put(`/api/admin/appointments/${selectedAppointment.id}/assign`, {
        employeeId: parseInt(selectedEmployeeId)
      });
      showToast(language === 'vi' ? 'Phân công nhân viên tư vấn thành công!' : 'Consultant assigned successfully!', 'success');
      setIsAssignOpen(false);
      setSelectedEmployeeId('');
      fetchAppointments();
    } catch (err) {
      console.error(err);
      let errMsg = language === 'vi' ? 'Lỗi khi phân công nhân viên.' : 'Failed to assign employee.';
      if (err.response && err.response.data && err.response.data.message) {
        errMsg = err.response.data.message;
      }
      showToast(errMsg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectDialog = (app) => {
    setSelectedAppointment(app);
    setIsRejectOpen(true);
  };

  const openAssignModal = (app) => {
    setSelectedAppointment(app);
    setSelectedEmployeeId(app.employeeId ? app.employeeId.toString() : '');
    setIsAssignOpen(true);
  };

  const formatDate = (val) => {
    if (!val) return '-';
    const parts = val.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return new Date(val).toLocaleDateString('vi-VN');
  };

  const headers = [
    { label: language === 'vi' ? 'Thời gian' : 'Time', key: 'appointmentDate', width: '160px' },
    { label: language === 'vi' ? 'Khách hàng' : 'Customer', key: 'customerName', width: '180px' },
    { label: language === 'vi' ? 'Nội dung cuộc hẹn' : 'Content', key: 'title' },
    { label: language === 'vi' ? 'Hình thức' : 'Type', key: 'consultationType', width: '120px' },
    { label: language === 'vi' ? 'Nhân viên phụ trách' : 'Consultant', key: 'employeeName', width: '180px' },
    { label: language === 'vi' ? 'Trạng thái' : 'Status', key: 'status', width: '120px' },
    { label: language === 'vi' ? 'Thao tác' : 'Actions', key: 'actions', width: '220px' }
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
      case 'customerName':
        return (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: '500', color: 'var(--text-main)' }}>{val}</span>
            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{row.customerCode}</span>
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
            Online
          </span>
        ) : (
          <span className="badge" style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}>
            <MapPin size={12} />
            Offline
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
        const isPending = row.status === 'PENDING';
        const isApproved = row.status === 'APPROVED';
        
        return (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {/* Approved and Reject buttons for PENDING */}
            {isPending && (
              <>
                <button 
                  onClick={() => handleStatusChange(row.id, 'APPROVED')}
                  className="btn btn-secondary" 
                  style={{ height: '30px', padding: '0 8px', color: 'var(--success)', borderColor: 'rgba(22, 163, 74, 0.15)', gap: '4px', minWidth: 'auto', fontSize: '0.8rem' }}
                  title={language === 'vi' ? 'Duyệt cuộc hẹn' : 'Approve'}
                >
                  <CheckCircle size={14} />
                  <span>{language === 'vi' ? 'Duyệt' : 'Approve'}</span>
                </button>
                <button 
                  onClick={() => openRejectDialog(row)}
                  className="btn btn-secondary" 
                  style={{ height: '30px', padding: '0 8px', color: 'var(--danger)', borderColor: 'rgba(220, 38, 38, 0.15)', gap: '4px', minWidth: 'auto', fontSize: '0.8rem' }}
                  title={language === 'vi' ? 'Từ chối cuộc hẹn' : 'Reject'}
                >
                  <XCircle size={14} />
                  <span>{language === 'vi' ? 'Từ chối' : 'Reject'}</span>
                </button>
              </>
            )}

            {/* Complete button for APPROVED */}
            {isApproved && (
              <button 
                onClick={() => handleStatusChange(row.id, 'COMPLETED')}
                className="btn btn-secondary" 
                style={{ height: '30px', padding: '0 8px', color: 'var(--primary)', borderColor: 'rgba(99, 102, 241, 0.15)', gap: '4px', minWidth: 'auto', fontSize: '0.8rem' }}
              >
                <Award size={14} />
                <span>{language === 'vi' ? 'Hoàn thành' : 'Complete'}</span>
              </button>
            )}

            {/* Assign Employee button (Admin only, for PENDING/APPROVED) */}
            {isAdmin && (isPending || isApproved) && (
              <button 
                onClick={() => openAssignModal(row)}
                className="btn btn-secondary" 
                style={{ height: '30px', padding: '0 8px', color: '#4f46e5', gap: '4px', minWidth: 'auto', fontSize: '0.8rem' }}
                title={language === 'vi' ? 'Phân công tư vấn viên' : 'Assign employee'}
              >
                <UserPlus size={14} />
                <span>{row.employeeId ? (language === 'vi' ? 'Đổi NV' : 'Reassign') : (language === 'vi' ? 'Gán NV' : 'Assign')}</span>
              </button>
            )}
          </div>
        );
      default:
        return val;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      <PageHeader 
        title={language === 'vi' ? 'Quản lý lịch hẹn tư vấn' : 'Consultation Appointments'}
        description={language === 'vi' ? 'Duyệt lịch hẹn, hoàn thành tư vấn và gán nhân viên phụ trách khách hàng.' : 'Manage customer consultation meetings, approve requests and assign consultants.'}
        actions={
          <button 
            onClick={fetchAppointments} 
            className="btn btn-secondary" 
            style={{ height: '38px', gap: '6px' }}
            disabled={loading}
          >
            <RefreshCw className={loading ? "animate-spin" : ""} size={14} />
            {t('refreshBtn')}
          </button>
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

      {/* Reject Reason Dialog */}
      <ConfirmDialog 
        isOpen={isRejectOpen}
        title={language === 'vi' ? 'Từ chối lịch hẹn' : 'Reject Appointment'}
        message={
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <p>{language === 'vi' ? `Vui lòng nhập lý do từ chối lịch hẹn "${selectedAppointment?.title}":` : `Please enter the reason for rejecting "${selectedAppointment?.title}":`}</p>
            <input 
              type="text" 
              className="form-input" 
              placeholder={language === 'vi' ? "Lý do từ chối..." : "Reason..."}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
        }
        onConfirm={() => {
          if (!rejectReason.trim()) {
            showToast(language === 'vi' ? 'Lý do từ chối không được để trống!' : 'Rejection reason cannot be empty!', 'error');
            return;
          }
          handleStatusChange(selectedAppointment.id, 'REJECTED', rejectReason);
        }}
        onCancel={() => {
          setIsRejectOpen(false);
          setRejectReason('');
          setSelectedAppointment(null);
        }}
        confirmText={language === 'vi' ? 'Xác nhận từ chối' : 'Reject'}
        cancelText={language === 'vi' ? 'Quay lại' : 'No'}
        loading={actionLoading}
      />

      {/* Assign Employee Modal (Admin Only) */}
      {isAssignOpen && (
        <div className="modal-backdrop">
          <div className="saas-card modal-container animate-slide-up" style={{ maxWidth: '450px', width: '90%', padding: '0', overflow: 'hidden' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 24px',
              borderBottom: '1px solid var(--border)'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserPlus size={18} style={{ color: 'var(--primary)' }} />
                {language === 'vi' ? 'Phân công nhân viên tư vấn' : 'Assign Consultant'}
              </h3>
              <button 
                onClick={() => setIsAssignOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <Clock size={20} />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit}>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {language === 'vi' ? 'Lựa chọn nhân viên tư vấn chịu trách nhiệm hỗ trợ lịch hẹn cho khách hàng: ' : 'Select the employee responsible for supporting this consultation appointment: '}
                  <strong>{selectedAppointment?.customerName}</strong>
                </div>

                <div className="form-group">
                  <label className="form-label">{language === 'vi' ? 'Chọn Nhân Viên *' : 'Select Employee *'}</label>
                  <select
                    className="form-input"
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    required
                  >
                    <option value="">{language === 'vi' ? '-- Chọn nhân viên --' : '-- Select Employee --'}</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.fullName} ({emp.employeeCode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

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
                  onClick={() => setIsAssignOpen(false)}
                  disabled={actionLoading}
                >
                  {language === 'vi' ? 'Hủy' : 'Cancel'}
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={actionLoading}
                  style={{ gap: '6px' }}
                >
                  {actionLoading && <RefreshCw size={14} className="animate-spin" />}
                  {language === 'vi' ? 'Xác nhận gán' : 'Assign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

export default AppointmentsManagement;
