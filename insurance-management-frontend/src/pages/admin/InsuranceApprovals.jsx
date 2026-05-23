import React, { useState, useEffect } from 'react';
import { 
  Check, 
  X, 
  AlertCircle, 
  ShieldAlert, 
  User, 
  FileText,
  HelpCircle,
  Search
} from 'lucide-react';
import apiClient from '../../api/apiClient';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';
import Toast from '../../components/Toast';

const InsuranceApprovals = () => {
  const [insurances, setInsurances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, PENDING, APPROVED, REJECTED

  // Confirm Approve dialog state
  const [selectedApproveId, setSelectedApproveId] = useState(null);
  const [isApproveConfirmOpen, setIsApproveConfirmOpen] = useState(false);

  // Reject Modal state
  const [selectedRejectId, setSelectedRejectId] = useState(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const fetchInsurances = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/admin/insurances');
      setInsurances(res.data);
    } catch (err) {
      console.error(err);
      showToast('Không thể tải danh sách đăng ký bảo hiểm.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsurances();
  }, []);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const handleApproveClick = (id) => {
    setSelectedApproveId(id);
    setIsApproveConfirmOpen(true);
  };

  const handleApproveConfirm = async () => {
    if (!selectedApproveId) return;
    setIsApproveConfirmOpen(false);
    try {
      await apiClient.put(`/api/admin/insurances/${selectedApproveId}/approve`);
      showToast('Phê duyệt yêu cầu đăng ký bảo hiểm thành công!', 'success');
      fetchInsurances();
    } catch (err) {
      console.error(err);
      let msg = 'Có lỗi xảy ra khi phê duyệt hợp đồng.';
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      showToast(msg, 'error');
    } finally {
      setSelectedApproveId(null);
    }
  };

  const handleRejectClick = (id) => {
    setSelectedRejectId(id);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRejectId) return;
    if (!rejectReason.trim()) {
      showToast('Vui lòng nhập lý do từ chối!', 'warning');
      return;
    }

    setIsRejectModalOpen(false);
    try {
      await apiClient.put(`/api/admin/insurances/${selectedRejectId}/reject`, {
        rejectReason: rejectReason
      });
      showToast('Từ chối yêu cầu đăng ký bảo hiểm thành công!', 'success');
      fetchInsurances();
    } catch (err) {
      console.error(err);
      let msg = 'Có lỗi xảy ra khi từ chối hợp đồng.';
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      showToast(msg, 'error');
    } finally {
      setSelectedRejectId(null);
      setRejectReason('');
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

  const formatDateTime = (val) => {
    if (!val) return '-';
    const d = new Date(val);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  // Filter & Search logic
  const filteredData = insurances.filter(item => {
    const matchesSearch = 
      item.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customerCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.insurancePackageName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.insurancePackageCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.contractCode && item.contractCode.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = statusFilter === 'ALL' || item.status === statusFilter;
    
    return matchesSearch && matchesFilter;
  });

  const headers = [
    { label: 'Khách Hàng', key: 'customerName' },
    { label: 'Gói Bảo Hiểm', key: 'insurancePackageName' },
    { label: 'Phí Bảo Hiểm', key: 'price', width: '130px' },
    { label: 'Mã Hợp Đồng', key: 'contractCode', width: '150px' },
    { label: 'Ngày Đăng Ký', key: 'createdAt', width: '150px' },
    { label: 'Trạng Thái', key: 'status', width: '150px' },
    { label: 'Thao Tác', key: 'actions', width: '180px' }
  ];

  const renderCell = (row, key, val) => {
    switch (key) {
      case 'customerName':
        return (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{val}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.customerCode}</span>
          </div>
        );
      case 'insurancePackageName':
        return (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: '500' }}>{val}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.insurancePackageCode}</span>
          </div>
        );
      case 'price':
        return formatCurrency(val);
      case 'contractCode':
        return val ? (
          <strong style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--primary)' }}>{val}</strong>
        ) : (
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Chưa cấp mã</span>
        );
      case 'createdAt':
        return formatDateTime(val);
      case 'status':
        if (val === 'APPROVED') {
          return <StatusBadge status="APPROVED" text="Đang hiệu lực" />;
        } else if (val === 'REJECTED') {
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <StatusBadge status="REJECTED" text="Bị từ chối" />
              <span 
                title={`Lý do từ chối: ${row.rejectReason || 'Không rõ lý do'}`} 
                style={{ cursor: 'help', color: 'var(--danger)', display: 'inline-flex', alignItems: 'center' }}
              >
                <HelpCircle size={14} />
              </span>
            </div>
          );
        } else {
          return <StatusBadge status="PENDING" text="Chờ duyệt" />;
        }
      case 'actions':
        if (row.status === 'PENDING') {
          return (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => handleApproveClick(row.id)}
                className="btn" 
                style={{ 
                  backgroundColor: 'var(--success-light)', 
                  color: 'var(--success)', 
                  border: '1px solid rgba(22, 163, 74, 0.15)',
                  padding: '4px 10px',
                  height: '28px',
                  fontSize: '0.75rem',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <Check size={14} />
                <span>Duyệt</span>
              </button>
              <button 
                onClick={() => handleRejectClick(row.id)}
                className="btn" 
                style={{ 
                  backgroundColor: 'var(--danger-light)', 
                  color: 'var(--danger)', 
                  border: '1px solid rgba(220, 38, 38, 0.15)',
                  padding: '4px 10px',
                  height: '28px',
                  fontSize: '0.75rem',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <X size={14} />
                <span>Từ chối</span>
              </button>
            </div>
          );
        }
        return <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Đã xử lý</span>;
      default:
        return val;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="saas-fade-in">
      {/* Page Header */}
      <PageHeader 
        title="Duyệt Đăng Ký Gói Bảo Hiểm" 
        description="Danh sách các yêu cầu đăng ký mua bảo hiểm từ khách hàng. Thực hiện phê duyệt để cấp số hợp đồng hoặc từ chối kèm lý do."
      />

      <div className="saas-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Search and Filters */}
        <div style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '16px'
        }}>
          <div style={{ position: 'relative', width: '320px' }}>
            <input 
              type="text" 
              placeholder="Tìm theo tên KH, mã KH, gói bảo hiểm..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Bộ lọc trạng thái:</span>
            <select 
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="form-input"
              style={{ width: '160px' }}
            >
              <option value="ALL">Tất cả</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="APPROVED">Đang hiệu lực</option>
              <option value="REJECTED">Bị từ chối</option>
            </select>
          </div>
        </div>

        {/* List Table */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <div>Đang tải dữ liệu...</div>
          </div>
        ) : (
          <DataTable 
            headers={headers}
            data={filteredData}
            rowsPerPage={10}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            renderCell={renderCell}
          />
        )}
      </div>

      {/* Confirm Approve Dialog */}
      <ConfirmDialog 
        isOpen={isApproveConfirmOpen}
        title="Xác nhận phê duyệt hợp đồng"
        message="Bạn có chắc chắn muốn phê duyệt yêu cầu này không? Hệ thống sẽ tự động tạo mã hợp đồng và tính thời hạn hiệu lực bắt đầu từ ngày hôm nay."
        onConfirm={handleApproveConfirm}
        onCancel={() => {
          setIsApproveConfirmOpen(false);
          setSelectedApproveId(null);
        }}
      />

      {/* Reject Modal Dialog */}
      {isRejectModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(9, 13, 22, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div className="saas-card" style={{
            width: '100%',
            maxWidth: '500px',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={18} />
                Lý Do Từ Chối Phê Duyệt
              </h3>
              <button 
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setSelectedRejectId(null);
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Lý do từ chối *</label>
                <textarea 
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Nhập lý do không đồng ý duyệt hợp đồng này (ví dụ: Khách hàng không đủ tuổi quy định, hồ sơ sức khỏe không đạt,...)"
                  className="form-input"
                  style={{ minHeight: '120px', resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <button 
                  type="button"
                  onClick={() => {
                    setIsRejectModalOpen(false);
                    setSelectedRejectId(null);
                  }}
                  className="btn btn-secondary"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  className="btn btn-danger"
                >
                  Xác nhận từ chối
                </button>
              </div>
            </form>
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

export default InsuranceApprovals;
