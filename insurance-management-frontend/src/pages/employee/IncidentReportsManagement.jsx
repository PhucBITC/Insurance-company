import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertCircle, FileText, Search, RefreshCw, CheckCircle, Trash2, Eye, Ban, Download, Sparkles } from 'lucide-react';
import apiClient from '../../api/apiClient';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Toast from '../../components/Toast';
import ConfirmDialog from '../../components/ConfirmDialog';

const IncidentReportsManagement = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // User Role State
  const [isAdmin, setIsAdmin] = useState(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.role === 'ROLE_ADMIN';
      } catch (err) {
        console.error('Error parsing user storage', err);
      }
    }
    return false;
  });

  // Modals & Popups state
  const [selectedReport, setSelectedReport] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Reject State
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  // Action / State confirmation
  const [confirmAction, setConfirmAction] = useState(null); // { reportId, status, title, message }
  const [processingAction, setProcessingAction] = useState(false);

  // Admin Delete State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const endpoint = isAdmin ? '/api/admin/reports' : '/api/employee/reports/my';
      const res = await apiClient.get(endpoint);
      setReports(res.data);
    } catch (err) {
      console.error(err);
      showToast('Không thể tải danh sách báo cáo sự cố.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Wait for isAdmin role to be verified from localStorage
    fetchReports();
  }, [isAdmin]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const handleExportIncidents = async () => {
    try {
      const res = await apiClient.get('/api/admin/exports/incidents', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'su_co_bao_hiem.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      showToast('Đang tải file báo cáo sự cố...', 'success');
    } catch (err) {
      console.error(err);
      showToast('Không thể xuất báo cáo sự cố.', 'error');
    }
  };

  const handleUpdateStatus = async (reportId, status, rejectReasonText = null) => {
    setProcessingAction(true);
    try {
      const endpoint = isAdmin 
        ? `/api/admin/reports/${reportId}/status` 
        : `/api/employee/reports/${reportId}/status`;

      const payload = { status };
      if (rejectReasonText) {
        payload.rejectReason = rejectReasonText;
      }

      await apiClient.put(endpoint, payload);
      showToast(`Cập nhật trạng thái báo cáo sang "${getStatusLabel(status)}" thành công!`, 'success');
      
      // Close detail view if open
      setIsDetailOpen(false);
      setSelectedReport(null);

      fetchReports();
    } catch (err) {
      console.error(err);
      let msg = 'Không thể cập nhật trạng thái sự cố.';
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      showToast(msg, 'error');
    } finally {
      setProcessingAction(false);
      setConfirmAction(null);
    }
  };

  const handleRejectClick = (report) => {
    setSelectedReport(report);
    setRejectReason('');
    setIsRejectOpen(true);
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      showToast('Vui lòng nhập lý do từ chối!', 'error');
      return;
    }
    setRejecting(true);
    try {
      const endpoint = isAdmin 
        ? `/api/admin/reports/${selectedReport.id}/status` 
        : `/api/employee/reports/${selectedReport.id}/status`;

      await apiClient.put(endpoint, {
        status: 'REJECTED',
        rejectReason: rejectReason.trim()
      });

      showToast('Đã từ chối bồi thường và lưu lý do thành công!', 'success');
      setIsRejectOpen(false);
      setIsDetailOpen(false);
      setSelectedReport(null);
      fetchReports();
    } catch (err) {
      console.error(err);
      let msg = 'Không thể cập nhật từ chối.';
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      showToast(msg, 'error');
    } finally {
      setRejecting(false);
    }
  };

  const handleDeleteClick = (report) => {
    setReportToDelete(report);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!reportToDelete) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/api/admin/reports/${reportToDelete.id}`);
      showToast('Xóa báo cáo sự cố thành công!', 'success');
      setIsDeleteOpen(false);
      setIsDetailOpen(false);
      setSelectedReport(null);
      fetchReports();
    } catch (err) {
      console.error(err);
      let msg = 'Không thể xóa báo cáo sự cố.';
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      showToast(msg, 'error');
    } finally {
      setDeleting(false);
      setReportToDelete(null);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const formatDate = (val) => {
    if (!val) return '-';
    const parts = val.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return new Date(val).toLocaleDateString('vi-VN');
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'NEW': return 'Mới (Chờ tiếp nhận)';
      case 'PROCESSING': return 'Đang xử lý';
      case 'RESOLVED': return 'Đã chi trả';
      case 'REJECTED': return 'Bị từ chối';
      default: return status;
    }
  };

  const getStatusComponent = (row) => {
    const status = row.status;
    switch (status) {
      case 'NEW':
        return <StatusBadge status="PENDING" text="Chờ tiếp nhận" />;
      case 'PROCESSING':
        return <StatusBadge status="PROCESSING" text="Đang xử lý" />;
      case 'RESOLVED':
        return <StatusBadge status="APPROVED" text="Đã chi trả" />;
      case 'REJECTED':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
            <StatusBadge status="REJECTED" text="Bị từ chối" />
            {row.rejectReason && (
              <span 
                style={{ 
                  fontSize: '0.725rem', 
                  color: 'var(--danger)', 
                  fontStyle: 'italic', 
                  whiteSpace: 'normal', 
                  wordBreak: 'break-word', 
                  maxWidth: '180px',
                  display: 'block' 
                }}
                title={row.rejectReason}
              >
                Lý do: {row.rejectReason}
              </span>
            )}
          </div>
        );
      default:
        return <StatusBadge status={status} />;
    }
  };

  // Filters logic
  const filteredReports = reports.filter(r => {
    const matchSearch = 
      r.reportCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customerPhone?.includes(searchTerm);
    
    const matchStatus = statusFilter === '' || r.status === statusFilter;
    
    return matchSearch && matchStatus;
  });

  const headers = [
    { label: 'Mã Sự Cố', key: 'reportCode', width: '130px' },
    { label: 'Khách Hàng', key: 'customerName', width: '150px' },
    { label: 'Tiêu Đề', key: 'title' },
    { label: 'Số Tiền Yêu Cầu', key: 'claimAmount', width: '130px' },
    { label: 'Ngày Xảy Ra', key: 'incidentDate', width: '110px' },
    { label: 'Trạng Thái', key: 'status', width: '180px' },
    { label: 'Nhân Viên Hỗ Trợ', key: 'handlerEmployeeName', width: '150px' },
    { label: 'Thao Tác', key: 'actions', width: '220px' }
  ];

  const renderCell = (row, key, val) => {
    switch (key) {
      case 'reportCode':
        return <strong style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--text-main)' }}>{val}</strong>;
      case 'customerName':
        return (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{val}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.customerPhone}</span>
          </div>
        );
      case 'claimAmount':
        return formatCurrency(val);
      case 'incidentDate':
        return formatDate(val);
      case 'status':
        return getStatusComponent(row);
      case 'handlerEmployeeName':
        return val ? (
          <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{val}</span>
        ) : (
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>Chưa phân công</span>
        );
      case 'actions':
        return (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button 
              type="button"
              onClick={() => {
                setSelectedReport(row);
                setIsDetailOpen(true);
              }}
              className="btn btn-secondary"
              style={{ padding: '4px 8px', fontSize: '0.75rem', height: '28px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <Eye size={12} />
              <span>Xem</span>
            </button>

            {row.status === 'NEW' && (
              <button 
                type="button"
                onClick={() => setConfirmAction({
                  reportId: row.id,
                  status: 'PROCESSING',
                  title: 'Xác nhận xử lý',
                  message: `Tiếp nhận xử lý sự cố "${row.title}" (Mã: ${row.reportCode})?`
                })}
                className="btn btn-primary"
                style={{ padding: '4px 8px', fontSize: '0.75rem', height: '28px', backgroundColor: 'var(--info)', borderColor: 'var(--info)' }}
              >
                Tiếp nhận
              </button>
            )}

            {row.status === 'PROCESSING' && (
              <>
                <button 
                  type="button"
                  onClick={() => setConfirmAction({
                    reportId: row.id,
                    status: 'RESOLVED',
                    title: 'Xác nhận duyệt chi trả',
                    message: `Duyệt chi trả số tiền bồi thường ${formatCurrency(row.claimAmount)} cho sự cố "${row.title}" (Mã: ${row.reportCode})?`
                  })}
                  className="btn btn-primary"
                  style={{ padding: '4px 8px', fontSize: '0.75rem', height: '28px' }}
                >
                  <CheckCircle size={12} />
                  <span>Duyệt chi</span>
                </button>
                <button 
                  type="button"
                  onClick={() => handleRejectClick(row)}
                  className="btn btn-danger"
                  style={{ padding: '4px 8px', fontSize: '0.75rem', height: '28px' }}
                >
                  <Ban size={12} />
                  <span>Từ chối</span>
                </button>
              </>
            )}

            {isAdmin && (
              <button 
                type="button"
                onClick={() => handleDeleteClick(row)}
                className="btn btn-secondary"
                style={{ 
                  color: 'var(--danger)', 
                  borderColor: 'var(--danger)', 
                  padding: '4px 8px', 
                  fontSize: '0.75rem', 
                  height: '28px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Trash2 size={12} />
                <span>Xóa</span>
              </button>
            )}
          </div>
        );
      default:
        return val;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="saas-fade-in">
      <PageHeader 
        title={isAdmin ? "Quản Lý Báo Cáo Sự Cố (Admin)" : "Báo Cáo Sự Cố Được Phân Công (Nhân Viên)"} 
        description="Tiếp nhận, xử lý và cập nhật tiến trình bồi thường cho các yêu cầu khai báo sự cố bảo hiểm từ khách hàng."
      />

      <div className="saas-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Filters */}
        <div style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '16px'
        }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1, maxWidth: '600px' }}>
            <div style={{ position: 'relative', width: '280px' }}>
              <input 
                type="text" 
                placeholder="Tìm theo mã sự cố, tên khách hàng..." 
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="form-input"
                style={{ paddingLeft: '36px' }}
              />
              <Search size={16} style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: 'var(--text-muted)' 
              }} />
            </div>

            <select
              className="form-input"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: '200px' }}
            >
              <option value="">-- Tất cả trạng thái --</option>
              <option value="NEW">Chờ tiếp nhận</option>
              <option value="PROCESSING">Đang xử lý</option>
              <option value="RESOLVED">Đã chi trả</option>
              <option value="REJECTED">Bị từ chối</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button 
              type="button" 
              onClick={fetchReports} 
              className="btn btn-secondary" 
              style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
              title="Làm mới"
            >
              <RefreshCw size={14} />
              <span>Tải lại</span>
            </button>
            {isAdmin && (
              <button 
                type="button" 
                onClick={handleExportIncidents} 
                className="btn btn-secondary" 
                style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Download size={14} />
                <span>Xuất báo cáo</span>
              </button>
            )}
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Kết quả: <strong>{filteredReports.length}</strong> báo cáo
            </div>
          </div>
        </div>

        {/* DataTable */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
            <div>Đang tải danh sách báo cáo...</div>
          </div>
        ) : (
          <DataTable 
            headers={headers}
            data={filteredReports}
            rowsPerPage={10}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            renderCell={renderCell}
          />
        )}
      </div>

      {/* Confirm Action Dialog */}
      <ConfirmDialog 
        isOpen={confirmAction !== null}
        title={confirmAction?.title || ''}
        message={confirmAction?.message || ''}
        confirmText={processingAction ? "Đang xử lý..." : "Xác nhận"}
        cancelText="Hủy"
        onConfirm={() => handleUpdateStatus(confirmAction.reportId, confirmAction.status)}
        onCancel={() => setConfirmAction(null)}
      />

      {/* Confirm Delete Dialog (Admin Only) */}
      <ConfirmDialog 
        isOpen={isDeleteOpen}
        title="Xóa báo cáo sự cố"
        message={reportToDelete ? `Bạn có chắc chắn muốn XÓA VĨNH VIỄN báo cáo sự cố "${reportToDelete.title}" (Mã: ${reportToDelete.reportCode}) khỏi hệ thống không? Thao tác này không thể hoàn tác!` : ''}
        confirmText={deleting ? "Đang xóa..." : "Xóa vĩnh viễn"}
        cancelText="Hủy"
        type="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setIsDeleteOpen(false);
          setReportToDelete(null);
        }}
      />

      {/* Reject Reason Form Modal */}
      {isRejectOpen && selectedReport && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }} className="saas-fade-in">
          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '500px',
            boxShadow: 'var(--shadow-lg)',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '10px', color: 'var(--danger)' }}>
              Từ Chối Bồi Thường Sự Cố
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Vui lòng nhập lý do cụ thể vì sao yêu cầu bồi thường sự cố <strong>{selectedReport.reportCode}</strong> bị từ chối. Khách hàng sẽ thấy lý do này trực tiếp trên màn hình của họ.
            </p>

            <form onSubmit={handleRejectSubmit}>
              <div className="form-group">
                <label className="form-label">Lý do từ chối *</label>
                <textarea
                  className="form-input"
                  placeholder="Nhập lý do từ chối chi tiết..."
                  rows={4}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setIsRejectOpen(false);
                    setSelectedReport(null);
                  }}
                  disabled={rejecting}
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  className="btn btn-danger"
                  disabled={rejecting}
                >
                  {rejecting ? 'Đang cập nhật...' : 'Từ chối yêu cầu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailOpen && selectedReport && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }} className="saas-fade-in">
          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '550px',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '90vh',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Xem Chi Tiết Hồ Sơ Sự Cố</h3>
              <button 
                onClick={() => {
                  setIsDetailOpen(false);
                  setSelectedReport(null);
                }}
                className="btn btn-secondary"
                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
              >
                Đóng
              </button>
            </div>
            
            <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mã sự cố</span>
                  <div style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{selectedReport.reportCode}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Trạng thái</span>
                  <div>{getStatusComponent(selectedReport)}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tên Khách Hàng</span>
                  <div style={{ fontWeight: '600' }}>{selectedReport.customerName}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Số Điện Thoại</span>
                  <div style={{ fontWeight: '500' }}>{selectedReport.customerPhone}</div>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tiêu đề sự cố</span>
                <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{selectedReport.title}</div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mô tả sự cố</span>
                <p style={{ 
                  fontSize: '0.85rem', 
                  backgroundColor: 'var(--background)', 
                  padding: '12px', 
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  whiteSpace: 'pre-wrap',
                  margin: '4px 0'
                }}>
                  {selectedReport.description}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ngày xảy ra</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>{formatDate(selectedReport.incidentDate)}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Số tiền yêu cầu</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--success)' }}>
                    {formatCurrency(selectedReport.claimAmount)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hợp đồng bảo hiểm</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                    {selectedReport.insurancePackageName ? `${selectedReport.insurancePackageName} (${selectedReport.contractCode})` : 'Không liên kết'}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Nhân viên hỗ trợ</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>{selectedReport.handlerEmployeeName || 'Chưa phân công'}</div>
                </div>
              </div>

              {selectedReport.attachmentUrl && (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tài liệu đính kèm</span>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    fontSize: '0.85rem', 
                    padding: '8px 12px', 
                    backgroundColor: 'var(--background)', 
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    marginTop: '4px'
                  }}>
                    <FileText size={14} style={{ color: 'var(--primary)' }} />
                    <span>{selectedReport.attachmentUrl}</span>
                  </div>
                </div>
              )}

              {selectedReport.status === 'REJECTED' && selectedReport.rejectReason && (
                <div style={{
                  backgroundColor: 'var(--danger-light)',
                  border: '1px solid var(--danger)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px',
                  color: 'var(--danger)'
                }}>
                  <strong style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <AlertCircle size={14} /> Lý Do Từ Chối Bồi Thường:
                  </strong>
                  <p style={{ fontSize: '0.85rem', fontStyle: 'italic', margin: 0 }}>
                    {selectedReport.rejectReason}
                  </p>
                </div>
              )}

              {/* Action options inside detail modal for quick handling */}
              {selectedReport.status === 'NEW' && (
                <div style={{
                  borderTop: '1px solid var(--border)',
                  paddingTop: '16px',
                  marginTop: '12px',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '8px'
                }}>
                  <button
                    onClick={() => handleUpdateStatus(selectedReport.id, 'PROCESSING')}
                    className="btn btn-secondary"
                    style={{ backgroundColor: 'var(--info-light)', color: 'var(--info)', borderColor: 'var(--info)' }}
                  >
                    Tiếp nhận
                  </button>
                </div>
              )}

              {selectedReport.status === 'PROCESSING' && (
                <div style={{
                  borderTop: '1px solid var(--border)',
                  paddingTop: '16px',
                  marginTop: '12px',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '8px'
                }}>
                  <button
                    onClick={() => handleUpdateStatus(selectedReport.id, 'RESOLVED')}
                    className="btn btn-primary"
                  >
                    Duyệt chi trả
                  </button>
                  <button
                    onClick={() => handleRejectClick(selectedReport)}
                    className="btn btn-danger"
                  >
                    Từ chối
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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

export default IncidentReportsManagement;
