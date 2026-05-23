import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Trash2, 
  Search, 
  RefreshCw,
  ChevronRight,
  User,
  Users,
  CheckSquare,
  Square
} from 'lucide-react';
import apiClient from '../../api/apiClient';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import Toast from '../../components/Toast';
import ConfirmDialog from '../../components/ConfirmDialog';

const AssignmentsManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Form State
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [selectedCustomerIds, setSelectedCustomerIds] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');

  // Delete Confirm State
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const [empRes, cusRes, assignRes] = await Promise.all([
        apiClient.get('/api/admin/employees'),
        apiClient.get('/api/admin/customers'),
        apiClient.get('/api/admin/assignments')
      ]);
      setEmployees(empRes.data);
      setCustomers(cusRes.data.filter(c => c.status === 'ACTIVE'));
      setAssignments(assignRes.data);
    } catch (err) {
      console.error(err);
      showToast('Không thể tải dữ liệu phân công.', 'error');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  // Check if a customer is already assigned to the SELECTED employee
  const isAssignedToSelectedEmployee = (customerId) => {
    if (!selectedEmployeeId) return false;
    return assignments.some(a => a.customerId === customerId && a.employeeId === parseInt(selectedEmployeeId));
  };

  // Get current assignment details for a customer
  const getCustomerAssignmentInfo = (customerId) => {
    const found = assignments.filter(a => a.customerId === customerId);
    if (found.length === 0) return null;
    return found.map(a => a.employeeName).join(', ');
  };

  // Set default checkboxes when employee selection changes
  useEffect(() => {
    if (selectedEmployeeId) {
      const alreadyAssigned = customers
        .filter(c => isAssignedToSelectedEmployee(c.id))
        .map(c => c.id);
      setSelectedCustomerIds(alreadyAssigned);
    } else {
      setSelectedCustomerIds([]);
    }
  }, [selectedEmployeeId, assignments, customers]);

  const handleCustomerToggle = (customerId) => {
    setSelectedCustomerIds(prev => {
      if (prev.includes(customerId)) {
        return prev.filter(id => id !== customerId);
      } else {
        return [...prev, customerId];
      }
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployeeId) {
      showToast('Vui lòng chọn nhân viên!', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const currentAssignedForEmp = assignments
        .filter(a => a.employeeId === parseInt(selectedEmployeeId))
        .map(a => a.customerId);

      // Determine additions
      const toAdd = selectedCustomerIds.filter(id => !currentAssignedForEmp.includes(id));
      // Determine removals (unticked ones that were assigned)
      const toRemove = currentAssignedForEmp.filter(id => !selectedCustomerIds.includes(id));

      const addPromises = toAdd.map(customerId => 
        apiClient.post('/api/admin/assignments', {
          employeeId: parseInt(selectedEmployeeId),
          customerId: customerId
        })
      );

      const removePromises = toRemove.map(customerId => {
        const assignObj = assignments.find(a => a.customerId === customerId && a.employeeId === parseInt(selectedEmployeeId));
        return assignObj ? apiClient.delete(`/api/admin/assignments/${assignObj.id}`) : Promise.resolve();
      });

      await Promise.all([...addPromises, ...removePromises]);
      showToast('Cập nhật phân công chăm sóc khách hàng thành công!', 'success');
      fetchData();
    } catch (err) {
      console.error(err);
      showToast('Có lỗi xảy ra khi cập nhật phân công.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const triggerDelete = (assignmentId) => {
    setSelectedAssignmentId(assignmentId);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAssignmentId) return;
    setIsDeleteConfirmOpen(false);
    try {
      await apiClient.delete(`/api/admin/assignments/${selectedAssignmentId}`);
      showToast('Hủy phân công chăm sóc thành công!', 'success');
      fetchData();
    } catch (err) {
      console.error(err);
      showToast('Hủy phân công chăm sóc thất bại.', 'error');
    } finally {
      setSelectedAssignmentId(null);
    }
  };

  // Filter customers by search term
  const filteredCustomers = customers.filter(c => 
    c.fullName.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.customerCode.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const formatDateTime = (val) => {
    if (!val) return '-';
    const d = new Date(val);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const headers = [
    { label: 'Nhân Viên Phụ Trách', key: 'employeeName' },
    { label: 'Khách Hàng', key: 'customerName' },
    { label: 'Ngày Phân Công', key: 'assignedAt', width: '170px' },
    { label: 'Hành Động', key: 'actions', width: '100px' }
  ];

  const renderCell = (row, key, val) => {
    switch (key) {
      case 'employeeName':
        return (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{val}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.employeeCode}</span>
          </div>
        );
      case 'customerName':
        return (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: '500' }}>{val}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.customerCode}</span>
          </div>
        );
      case 'assignedAt':
        return formatDateTime(val);
      case 'actions':
        return (
          <button 
            onClick={() => triggerDelete(row.id)}
            className="btn btn-secondary"
            style={{ 
              padding: '6px', 
              color: 'var(--danger)', 
              borderColor: 'transparent',
              background: 'transparent',
              minWidth: 'auto'
            }}
            title="Hủy phân công"
          >
            <Trash2 size={16} />
          </button>
        );
      default:
        return val;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="saas-fade-in">
      {/* Page Header */}
      <PageHeader 
        title="Phân Công Nhân Sự" 
        description="Gán khách hàng cho nhân viên tư vấn chăm sóc hoặc điều chỉnh phân công hiện có để đảm bảo dịch vụ khách hàng tốt nhất."
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '28px'
      }}>
        
        {/* Left Side: Create/Edit Assignments Form */}
        <div className="saas-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'fit-content' }}>
          <h3 style={{ 
            fontSize: '1rem', 
            fontWeight: '600', 
            borderBottom: '1px solid var(--border)', 
            paddingBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <UserCheck size={18} style={{ color: 'var(--primary)' }} />
            Tạo / Cập nhật phân công
          </h3>

          <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Chọn nhân viên tư vấn *</label>
              <select 
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="form-input"
                required
              >
                <option value="">-- Chọn nhân viên --</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName} ({emp.employeeCode})
                  </option>
                ))}
              </select>
            </div>

            {selectedEmployeeId && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Chọn khách hàng quản lý *</label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Đã chọn: <strong>{selectedCustomerIds.length}</strong>
                  </span>
                </div>

                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    placeholder="Tìm nhanh khách hàng..." 
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '32px' }}
                  />
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>

                <div style={{
                  maxHeight: '300px',
                  overflowY: 'auto',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--background)'
                }}>
                  {filteredCustomers.length === 0 ? (
                    <div style={{ padding: '16px', textStyle: 'italic', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                      Không tìm thấy khách hàng.
                    </div>
                  ) : (
                    filteredCustomers.map(cus => {
                      const checked = selectedCustomerIds.includes(cus.id);
                      const assignInfo = getCustomerAssignmentInfo(cus.id);
                      
                      return (
                        <div 
                          key={cus.id} 
                          onClick={() => handleCustomerToggle(cus.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 14px',
                            borderBottom: '1px solid var(--border)',
                            cursor: 'pointer',
                            backgroundColor: checked ? 'rgba(37, 99, 235, 0.04)' : 'transparent',
                            transition: 'var(--transition-fast)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {checked ? (
                              <CheckSquare size={16} style={{ color: 'var(--primary)' }} />
                            ) : (
                              <Square size={16} style={{ color: 'var(--text-muted)' }} />
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '0.85rem', fontWeight: '550', color: 'var(--text-main)' }}>
                                {cus.fullName}
                              </span>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                Mã KH: {cus.customerCode}
                              </span>
                            </div>
                          </div>

                          {assignInfo && (
                            <span style={{ 
                              fontSize: '0.7rem', 
                              backgroundColor: 'rgba(245, 158, 11, 0.1)', 
                              color: 'var(--warning)',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              maxWidth: '120px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }} title={`Đang gán cho: ${assignInfo}`}>
                              {assignInfo}
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={submitting || !selectedEmployeeId}
              style={{ width: '100%', height: '38px', marginTop: '8px' }}
            >
              <UserCheck size={14} />
              <span>{submitting ? 'Đang cập nhật...' : 'Cập nhật phân công'}</span>
            </button>
          </form>
        </div>

        {/* Right Side: List of Current Assignments */}
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
            <Users size={18} style={{ color: 'var(--success)' }} />
            Danh sách phân công hiện tại
          </h3>

          {loadingData ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
              <div>Đang tải dữ liệu phân công...</div>
            </div>
          ) : (
            <DataTable 
              headers={headers}
              data={assignments}
              rowsPerPage={10}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              renderCell={renderCell}
            />
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog 
        isOpen={isDeleteConfirmOpen}
        title="Xác nhận hủy phân công"
        message="Bạn có chắc chắn muốn hủy phân công chăm sóc này không? Nhân viên sẽ không còn nhìn thấy khách hàng này trong danh mục cá nhân nữa."
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setIsDeleteConfirmOpen(false);
          setSelectedAssignmentId(null);
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

export default AssignmentsManagement;
