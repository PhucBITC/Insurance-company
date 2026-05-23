import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  User
} from 'lucide-react';
import apiClient from '../../api/apiClient';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import Toast from '../../components/Toast';

const MyCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [toasts, setToasts] = useState([]);

  const fetchMyCustomers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/employee/customers');
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
      showToast('Không thể tải danh sách khách hàng của bạn.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCustomers();
  }, []);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const formatDate = (val) => {
    if (!val) return '-';
    const parts = val.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return new Date(val).toLocaleDateString('vi-VN');
  };

  const filteredCustomers = customers.filter(c => 
    c.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.customerCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phoneNumber?.includes(searchTerm) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.identityCard?.includes(searchTerm)
  );

  const headers = [
    { label: 'Mã Khách Hàng', key: 'customerCode', width: '150px' },
    { label: 'Họ Tên', key: 'fullName' },
    { label: 'Số Điện Thoại', key: 'phoneNumber', width: '140px' },
    { label: 'Email', key: 'email' },
    { label: 'Địa Chỉ', key: 'address' },
    { label: 'CMND/CCCD', key: 'identityCard', width: '130px' },
    { label: 'Giới Tính', key: 'gender', width: '100px' },
    { label: 'Ngày Sinh', key: 'dateOfBirth', width: '120px' }
  ];

  const renderCell = (row, key, val) => {
    switch (key) {
      case 'customerCode':
        return <strong style={{ color: 'var(--primary)' }}>{val}</strong>;
      case 'phoneNumber':
        return val ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Phone size={12} style={{ color: 'var(--text-muted)' }} />
            {val}
          </span>
        ) : '-';
      case 'email':
        return val ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Mail size={12} style={{ color: 'var(--text-muted)' }} />
            {val}
          </span>
        ) : '-';
      case 'address':
        return val ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={val}>
            <MapPin size={12} style={{ color: 'var(--text-muted)' }} />
            {val}
          </span>
        ) : '-';
      case 'dateOfBirth':
        return formatDate(val);
      default:
        return val;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="saas-fade-in">
      {/* Page Header */}
      <PageHeader 
        title="Khách Hàng Của Tôi" 
        description="Danh sách các khách hàng do bạn phụ trách chăm sóc. Theo dõi thông tin liên hệ và tư vấn sản phẩm thích hợp."
      />

      <div className="saas-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Search bar */}
        <div style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '16px'
        }}>
          <div style={{ position: 'relative', width: '320px' }}>
            <input 
              type="text" 
              placeholder="Tìm theo tên, mã KH, số điện thoại, CMND..." 
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

          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Tổng số: <strong>{filteredCustomers.length}</strong> khách hàng
          </div>
        </div>

        {/* DataTable */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <div>Đang tải danh sách khách hàng...</div>
          </div>
        ) : (
          <DataTable 
            headers={headers}
            data={filteredCustomers}
            rowsPerPage={10}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            renderCell={renderCell}
          />
        )}
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

export default MyCustomers;
