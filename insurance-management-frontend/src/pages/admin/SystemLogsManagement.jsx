import React, { useState, useEffect } from 'react';
import { 
  Clock,
  User,
  Shield,
  FileText,
  Globe,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import apiClient from '../../api/apiClient';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import { useUI } from '../../context/UIContext';

const SystemLogsManagement = () => {
  const { t, language } = useUI();
  
  // State
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1); // 1-indexed for UI
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(10);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to page 1 on search change
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Fetch logs when debounced search, role, or page changes
  const fetchLogs = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await apiClient.get('/api/admin/logs', {
        params: {
          role: filterRole,
          search: debouncedSearch,
          page: currentPage - 1,
          size: pageSize
        }
      });
      setLogs(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalItems(res.data.totalItems || 0);
    } catch (err) {
      console.error(err);
      setErrorMsg(language === 'vi' ? 'Không thể tải danh sách nhật ký hệ thống.' : 'Failed to load system logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [debouncedSearch, filterRole, currentPage]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      return dateTimeString;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      <PageHeader 
        title={language === 'vi' ? "Nhật ký hệ thống & Access logs" : "System Logs & Access Logs"} 
        description={language === 'vi' ? "Theo dõi lịch sử hoạt động toàn hệ thống, đăng nhập, thay đổi thông tin và các hoạt động nghiệp vụ khác." : "Track system-wide activity logs, login history, data updates and other business operations."}
        actions={
          <button 
            onClick={fetchLogs} 
            className="btn btn-secondary" 
            style={{ height: '38px', gap: '6px' }}
            disabled={loading}
          >
            <RefreshCw className={loading ? "animate-spin" : ""} size={14} />
            {t('refreshBtn')}
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="saas-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexGrow: 1,
            maxWidth: '700px',
            width: '100%',
            flexWrap: 'wrap'
          }}>
            {/* Search input wrapper */}
            <div style={{ position: 'relative', flexGrow: 1, minWidth: '200px' }}>
              <Search size={16} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type="text"
                className="form-input"
                placeholder={language === 'vi' ? "Tìm kiếm tài khoản hoặc hành động..." : "Search accounts or actions..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '36px', height: '38px' }}
              />
            </div>

            {/* Filter select wrapper */}
            <div style={{ position: 'relative', minWidth: '160px' }}>
              <select
                className="form-input"
                value={filterRole}
                onChange={(e) => {
                  setFilterRole(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  height: '38px',
                  paddingRight: '30px',
                  appearance: 'none',
                  cursor: 'pointer',
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 10px center',
                  backgroundSize: '16px'
                }}
              >
                <option value="ALL">{t('filterAllRoles')}</option>
                <option value="ROLE_ADMIN">{t('filterAdmin')}</option>
                <option value="ROLE_EMPLOYEE">{t('filterEmployee')}</option>
                <option value="ROLE_CUSTOMER">{t('filterCustomer')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div style={{ color: 'var(--danger)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--danger-light)', fontSize: '0.9rem', fontWeight: '500' }}>
            {errorMsg}
          </div>
        )}

        {/* Table representation */}
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: '8px' }}>
          <div className="saas-table-container">
            <table className="saas-table">
              <thead>
                <tr>
                  <th style={{ width: '180px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} />{language === 'vi' ? 'Thời gian' : 'Time'}</div></th>
                  <th style={{ width: '220px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={14} />{language === 'vi' ? 'Tài khoản' : 'Account'}</div></th>
                  <th style={{ width: '130px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Shield size={14} />{language === 'vi' ? 'Vai trò' : 'Role'}</div></th>
                  <th><div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FileText size={14} />{language === 'vi' ? 'Hành động nghiệp vụ' : 'Business Action'}</div></th>
                  <th style={{ width: '140px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Globe size={14} />{language === 'vi' ? 'Địa chỉ IP' : 'IP Address'}</div></th>
                  <th style={{ width: '120px' }}>{language === 'vi' ? 'Trạng thái' : 'Status'}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                      <RefreshCw className="animate-spin" size={24} style={{ margin: '0 auto 12px' }} />
                      <div>{language === 'vi' ? 'Đang tải dữ liệu...' : 'Loading data...'}</div>
                    </td>
                  </tr>
                ) : logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                        {log.userEmail}
                      </td>
                      <td>
                        <StatusBadge status={log.role} />
                      </td>
                      <td style={{ fontWeight: '550', color: 'var(--text-main)' }}>
                        {log.action}
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {log.ipAddress}
                      </td>
                      <td>
                        <StatusBadge status={log.status} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                      {language === 'vi' ? 'Không tìm thấy nhật ký hoạt động nào.' : 'No activity logs found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && logs.length > 0 && (
            <div className="saas-pagination">
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {language === 'vi' ? (
                  <>
                    Hiển thị <strong>{((currentPage - 1) * pageSize) + 1}</strong> đến <strong>{Math.min(currentPage * pageSize, totalItems)}</strong> trong tổng số <strong>{totalItems}</strong> kết quả
                  </>
                ) : (
                  <>
                    Showing <strong>{((currentPage - 1) * pageSize) + 1}</strong> to <strong>{Math.min(currentPage * pageSize, totalItems)}</strong> of <strong>{totalItems}</strong> records
                  </>
                )}
              </span>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={handlePrevPage} 
                  disabled={currentPage === 1}
                  className="btn btn-secondary" 
                  style={{ padding: '6px 10px', height: '32px', minWidth: 'auto' }}
                >
                  <ChevronLeft size={16} />
                </button>
                <span style={{ 
                  fontSize: '0.875rem', 
                  color: 'var(--text-main)', 
                  fontWeight: '550',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 8px'
                }}>
                  {language === 'vi' ? `Trang ${currentPage} / ${totalPages}` : `Page ${currentPage} / ${totalPages}`}
                </span>
                <button 
                  onClick={handleNextPage} 
                  disabled={currentPage === totalPages}
                  className="btn btn-secondary" 
                  style={{ padding: '6px 10px', height: '32px', minWidth: 'auto' }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemLogsManagement;
