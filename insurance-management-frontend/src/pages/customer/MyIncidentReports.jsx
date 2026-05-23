import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertCircle, FileText, Plus, HelpCircle, Eye } from 'lucide-react';
import apiClient from '../../api/apiClient';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Toast from '../../components/Toast';
import ConfirmDialog from '../../components/ConfirmDialog';
import IncidentReportForm from './IncidentReportForm';

const MyIncidentReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Form & View state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // Cancel/Delete state
  const [reportToCancel, setReportToCancel] = useState(null);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchMyReports = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/customer/reports/my');
      setReports(res.data);
    } catch (err) {
      console.error(err);
      showToast('Không thể tải danh sách báo cáo sự cố của bạn.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReports();
  }, []);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const handleCancelClick = (report) => {
    setReportToCancel(report);
    setIsCancelOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!reportToCancel) return;
    setIsCancelOpen(false);
    setCancelling(true);
    try {
      await apiClient.delete(`/api/customer/reports/${reportToCancel.id}`);
      showToast('Đã hủy báo cáo sự cố thành công!', 'success');
      fetchMyReports();
    } catch (err) {
      console.error(err);
      let msg = 'Không thể hủy báo cáo sự cố.';
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      showToast(msg, 'error');
    } finally {
      setCancelling(false);
      setReportToCancel(null);
    }
  };

  const handleViewDetails = (report) => {
    setSelectedReport(report);
    setIsDetailOpen(true);
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

  const headers = [
    { label: 'Mã Sự Cố', key: 'reportCode', width: '130px' },
    { label: 'Tiêu Đề', key: 'title' },
    { label: 'Hợp Đồng', key: 'contractCode', width: '130px' },
    { label: 'Số Tiền Yêu Cầu', key: 'claimAmount', width: '130px' },
    { label: 'Ngày Xảy Ra', key: 'incidentDate', width: '110px' },
    { label: 'Trạng Thái', key: 'status', width: '180px' },
    { label: 'Nhân Viên Hỗ Trợ', key: 'handlerEmployeeName', width: '150px' },
    { label: 'Thao Tác', key: 'actions', width: '130px' }
  ];

  const renderCell = (row, key, val) => {
    switch (key) {
      case 'reportCode':
        return <strong style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--text-main)' }}>{val}</strong>;
      case 'contractCode':
        return val ? (
          <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{val}</span>
        ) : (
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Không liên kết</span>
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
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              type="button"
              onClick={() => handleViewDetails(row)}
              className="btn btn-secondary"
              style={{
                padding: '4px 8px',
                fontSize: '0.75rem',
                height: '28px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Xem chi tiết"
            >
              <Eye size={12} />
              <span>Xem</span>
            </button>
            {row.status === 'NEW' && (
              <button 
                type="button"
                onClick={() => handleCancelClick(row)}
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
                Hủy
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
      {/* Page Header */}
      <PageHeader 
        title="Khai Báo & Theo Dõi Sự Cố" 
        description="Báo cáo tai nạn, yêu cầu hỗ trợ bồi thường và theo dõi tiến trình xử lý từ nhân viên hỗ trợ."
      />

      {/* Quick Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          className="btn btn-primary" 
          onClick={() => setIsFormOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={16} />
          <span>Khai báo sự cố mới</span>
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <div>Đang tải danh sách báo cáo sự cố...</div>
        </div>
      ) : (
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
            <ShieldAlert size={18} style={{ color: 'var(--primary)' }} />
            Danh sách sự cố bảo hiểm
          </h3>

          {reports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Bạn chưa tạo báo cáo sự cố nào. Bấm nút "Khai báo sự cố mới" để bắt đầu!
            </div>
          ) : (
            <DataTable 
              headers={headers}
              data={reports}
              rowsPerPage={5}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              renderCell={renderCell}
            />
          )}
        </div>
      )}

      {/* Incident Form Modal */}
      <IncidentReportForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmitSuccess={(msg) => {
          showToast(msg, 'success');
          fetchMyReports();
        }}
      />

      {/* Confirm Cancel Dialog */}
      <ConfirmDialog 
        isOpen={isCancelOpen}
        title="Xác nhận hủy yêu cầu"
        message={reportToCancel ? `Bạn có chắc chắn muốn hủy/xóa yêu cầu sự cố "${reportToCancel.title}" (Mã: ${reportToCancel.reportCode}) không?` : ''}
        confirmText={cancelling ? "Đang hủy..." : "Hủy yêu cầu"}
        cancelText="Đóng"
        type="danger"
        onConfirm={handleCancelConfirm}
        onCancel={() => {
          setIsCancelOpen(false);
          setReportToCancel(null);
        }}
      />

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
              <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Chi Tiết Báo Cáo Sự Cố</h3>
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

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tiêu đề sự cố</span>
                <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{selectedReport.title}</div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mô tả chi tiết</span>
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

export default MyIncidentReports;
