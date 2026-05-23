import React, { useState, useEffect } from 'react';
import { HelpCircle, Shield, FileText, AlertCircle } from 'lucide-react';
import apiClient from '../../api/apiClient';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Toast from '../../components/Toast';
import ConfirmDialog from '../../components/ConfirmDialog';

const MyInsurances = () => {
  const [insurances, setInsurances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Delete/Cancel states
  const [selectedInsurance, setSelectedInsurance] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchMyInsurances = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/customer/insurances/my');
      setInsurances(res.data);
    } catch (err) {
      console.error(err);
      showToast('Không thể tải danh sách hợp đồng của bạn.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyInsurances();
  }, []);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const handleDeleteClick = (ins) => {
    setSelectedInsurance(ins);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedInsurance) return;
    setIsDeleteOpen(false);
    setDeleting(true);
    try {
      await apiClient.delete(`/api/customer/insurances/${selectedInsurance.id}`);
      showToast('Đã xóa/hủy yêu cầu đăng ký bảo hiểm thành công!', 'success');
      fetchMyInsurances();
    } catch (err) {
      console.error(err);
      let msg = 'Không thể xóa yêu cầu đăng ký bảo hiểm.';
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      showToast(msg, 'error');
    } finally {
      setDeleting(false);
      setSelectedInsurance(null);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const formatDate = (val) => {
    if (!val) return '-';
    // Format YYYY-MM-DD to DD/MM/YYYY
    const parts = val.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return new Date(val).toLocaleDateString('vi-VN');
  };

  const headers = [
    { label: 'Mã Hợp Đồng', key: 'contractCode', width: '140px' },
    { label: 'Gói Bảo Hiểm', key: 'insurancePackageName' },
    { label: 'Mã Gói', key: 'insurancePackageCode', width: '110px' },
    { label: 'Phí Bảo Hiểm', key: 'price', width: '130px' },
    { label: 'Ngày Bắt Đầu', key: 'startDate', width: '110px' },
    { label: 'Ngày Đáo Hạn', key: 'endDate', width: '110px' },
    { label: 'Trạng Thái', key: 'status', width: '180px' },
    { label: 'Thao Tác', key: 'actions', width: '110px' }
  ];

  const renderCell = (row, key, val) => {
    switch (key) {
      case 'contractCode':
        return val ? (
          <strong style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--text-main)' }}>{val}</strong>
        ) : (
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Chưa cấp mã</span>
        );
      case 'price':
        return formatCurrency(val);
      case 'startDate':
      case 'endDate':
        return formatDate(val);
      case 'status':
        if (val === 'APPROVED') {
          return <StatusBadge status="APPROVED" text="Đang hiệu lực" />;
        } else if (val === 'REJECTED') {
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
                    wordBreak: 'break-all', 
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
        } else {
          return <StatusBadge status="PENDING" text="Chờ duyệt" />;
        }
      case 'actions':
        if (row.status === 'PENDING' || row.status === 'REJECTED') {
          return (
            <button 
              type="button"
              onClick={() => handleDeleteClick(row)}
              className="btn btn-secondary"
              style={{
                color: 'var(--danger)',
                borderColor: 'var(--danger)',
                padding: '4px 10px',
                fontSize: '0.75rem',
                height: '28px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              Hủy / Xóa
            </button>
          );
        }
        return <span style={{ color: 'var(--text-muted)' }}>-</span>;
      default:
        return val;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="saas-fade-in">
      {/* Page Header */}
      <PageHeader 
        title="Hợp Đồng Bảo Hiểm Của Tôi" 
        description="Theo dõi danh sách các hợp đồng bảo hiểm bạn đã đăng ký mua, xem trạng thái phê duyệt và thời hạn bảo vệ."
      />

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <div>Đang tải danh sách hợp đồng...</div>
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
            <Shield size={18} style={{ color: 'var(--primary)' }} />
            Danh sách hợp đồng cá nhân
          </h3>

          <DataTable 
            headers={headers}
            data={insurances}
            rowsPerPage={5}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            renderCell={renderCell}
          />
        </div>
      )}

      <ConfirmDialog 
        isOpen={isDeleteOpen}
        title="Xác nhận xóa/hủy yêu cầu"
        message={selectedInsurance ? `Bạn có chắc chắn muốn xóa/hủy yêu cầu đăng ký gói bảo hiểm "${selectedInsurance.insurancePackageName}" này không?` : ''}
        confirmText={deleting ? "Đang xóa..." : "Xóa/Hủy"}
        cancelText="Đóng"
        type="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setIsDeleteOpen(false);
          setSelectedInsurance(null);
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

export default MyInsurances;
