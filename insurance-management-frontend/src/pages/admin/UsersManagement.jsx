import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  ShieldCheck, 
  Briefcase, 
  HeartHandshake, 
  PlusCircle, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  CreditCard,
  Key,
  X,
  UserPlus,
  Lock,
  Unlock,
  Download
} from 'lucide-react';
import apiClient from '../../api/apiClient';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import SearchFilterBar from '../../components/SearchFilterBar';
import ConfirmDialog from '../../components/ConfirmDialog';
import Toast from '../../components/Toast';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';

const UsersManagement = () => {
  const { t } = useUI();
  const { user: currentUser } = useAuth();
  
  // State
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'employees', 'customers'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValue, setFilterValue] = useState('ALL');
  const [filterValue2, setFilterValue2] = useState('ALL');
  
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [customers, setCustomers] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modal & Confirm States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); // Employee or Customer to edit/delete/status update
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  // Form Fields
  const [formFields, setFormFields] = useState({
    // Account
    email: '',
    password: '',
    // Common profile
    fullName: '',
    phoneNumber: '',
    // Employee profile
    employeeCode: '',
    position: '',
    department: '',
    salary: '',
    hireDate: '',
    // Customer profile
    customerCode: '',
    address: '',
    dateOfBirth: '',
    gender: 'Nam',
    identityCard: ''
  });

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const handleExportCustomers = async () => {
    try {
      const res = await apiClient.get('/api/admin/exports/customers', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'danh_sach_khach_hang.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      showToast('Đang tải file danh sách khách hàng...', 'success');
    } catch (err) {
      console.error(err);
      showToast('Không thể xuất danh sách khách hàng.', 'error');
    }
  };

  // Load Data
  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const res = await apiClient.get('/api/admin/users');
        setUsers(res.data);
      } else if (activeTab === 'employees') {
        const res = await apiClient.get('/api/admin/employees');
        setEmployees(res.data);
      } else if (activeTab === 'customers') {
        const res = await apiClient.get('/api/admin/customers');
        setCustomers(res.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Không thể tải dữ liệu từ máy chủ. Vui lòng thử lại!', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Clear search and filter when changing tab
    setSearchTerm('');
    setFilterValue('ALL');
    setFilterValue2('ALL');
    setFormErrors({});
    setCurrentPage(1);
  }, [activeTab]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterValue, filterValue2]);

  // Form Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormFields(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setSelectedItem(null);
    setFormErrors({});
    setFormFields({
      email: '',
      password: '',
      fullName: '',
      phoneNumber: '',
      employeeCode: activeTab === 'employees' ? `EMP-${Date.now().toString().slice(-6)}` : '',
      position: '',
      department: '',
      salary: '',
      hireDate: new Date().toISOString().split('T')[0],
      customerCode: activeTab === 'customers' ? `CUS-${Date.now().toString().slice(-6)}` : '',
      address: '',
      dateOfBirth: '',
      gender: 'Nam',
      identityCard: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setIsEditMode(true);
    setSelectedItem(item);
    setFormErrors({});
    setFormFields({
      email: item.email || '',
      password: '', // blank for edit
      fullName: item.fullName || '',
      phoneNumber: item.phoneNumber || '',
      employeeCode: item.employeeCode || '',
      position: item.position || '',
      department: item.department || '',
      salary: item.salary || '',
      hireDate: item.hireDate || '',
      customerCode: item.customerCode || '',
      address: item.address || '',
      dateOfBirth: item.dateOfBirth || '',
      gender: item.gender || 'Nam',
      identityCard: item.identityCard || ''
    });
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    
    // Email validation
    if (!formFields.email) {
      errors.email = 'Email đăng nhập là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formFields.email)) {
      errors.email = 'Định dạng email không hợp lệ (ví dụ: name@company.com)';
    }

    // Password validation
    if (!isEditMode) {
      if (!formFields.password) {
        errors.password = 'Mật khẩu đăng nhập là bắt buộc';
      } else if (formFields.password.length < 6) {
        errors.password = 'Mật khẩu phải chứa ít nhất 6 ký tự';
      }
    } else {
      if (formFields.password && formFields.password.length < 6) {
        errors.password = 'Mật khẩu mới phải chứa ít nhất 6 ký tự';
      }
    }

    // FullName validation
    if (!formFields.fullName) {
      errors.fullName = 'Họ và tên là bắt buộc';
    } else if (formFields.fullName.trim().length < 2) {
      errors.fullName = 'Họ và tên phải có ít nhất 2 ký tự';
    }

    // Code validation
    if (activeTab === 'employees') {
      if (!formFields.employeeCode) {
        errors.employeeCode = 'Mã nhân viên là bắt buộc';
      }
    } else if (activeTab === 'customers') {
      if (!formFields.customerCode) {
        errors.customerCode = 'Mã khách hàng là bắt buộc';
      }
    }

    // Phone validation
    if (formFields.phoneNumber) {
      if (!/^(0[3|5|7|8|9])[0-9]{8}$/.test(formFields.phoneNumber)) {
        errors.phoneNumber = 'Số điện thoại không hợp lệ (phải gồm 10 chữ số, VD: 0912345678)';
      }
    }

    // Identity Card validation
    if (activeTab === 'customers' && formFields.identityCard) {
      if (!/^[0-9]{9}$|^[0-9]{12}$/.test(formFields.identityCard)) {
        errors.identityCard = 'Số CMND/CCCD không hợp lệ (phải gồm 9 hoặc 12 chữ số)';
      }
    }

    // Salary validation
    if (activeTab === 'employees' && formFields.salary) {
      const salaryNum = parseFloat(formFields.salary);
      if (isNaN(salaryNum) || salaryNum <= 0) {
        errors.salary = 'Lương phải là một số dương lớn hơn 0';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Vui lòng kiểm tra lại thông tin nhập vào!', 'error');
      return;
    }

    setSubmitting(true);

    try {
      if (activeTab === 'employees') {
        const payload = {
          employeeCode: formFields.employeeCode,
          fullName: formFields.fullName,
          phoneNumber: formFields.phoneNumber,
          position: formFields.position,
          department: formFields.department,
          salary: formFields.salary ? parseFloat(formFields.salary) : null,
          hireDate: formFields.hireDate || null,
          email: formFields.email,
          password: formFields.password
        };

        if (isEditMode) {
          await apiClient.put(`/api/admin/employees/${selectedItem.id}`, payload);
          showToast('Cập nhật hồ sơ nhân viên thành công!', 'success');
        } else {
          await apiClient.post('/api/admin/employees', payload);
          showToast('Thêm mới nhân viên và tài khoản thành công!', 'success');
        }
      } else if (activeTab === 'customers') {
        const payload = {
          customerCode: formFields.customerCode,
          fullName: formFields.fullName,
          phoneNumber: formFields.phoneNumber,
          address: formFields.address,
          dateOfBirth: formFields.dateOfBirth || null,
          gender: formFields.gender,
          identityCard: formFields.identityCard,
          email: formFields.email,
          password: formFields.password
        };

        if (isEditMode) {
          await apiClient.put(`/api/admin/customers/${selectedItem.id}`, payload);
          showToast('Cập nhật hồ sơ khách hàng thành công!', 'success');
        } else {
          await apiClient.post('/api/admin/customers', payload);
          showToast('Thêm mới khách hàng và tài khoản thành công!', 'success');
        }
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      let msg = 'Có lỗi xảy ra trong quá trình xử lý!';
      if (err.response && err.response.data) {
        if (err.response.data.message) {
          msg = err.response.data.message;
        } else if (typeof err.response.data === 'string') {
          msg = err.response.data;
        }
      }
      
      const nextFormErrors = {};
      if (msg.includes('Email') || msg.toLowerCase().includes('email')) {
        nextFormErrors.email = msg;
      } else if (msg.includes('Mã nhân viên') || msg.toLowerCase().includes('employee code') || msg.toLowerCase().includes('mã nv')) {
        nextFormErrors.employeeCode = msg;
      } else if (msg.includes('Mã khách hàng') || msg.toLowerCase().includes('customer code') || msg.toLowerCase().includes('mã kh')) {
        nextFormErrors.customerCode = msg;
      } else if (msg.includes('CMND/CCCD') || msg.toLowerCase().includes('identity card') || msg.toLowerCase().includes('cmnd') || msg.toLowerCase().includes('cccd')) {
        nextFormErrors.identityCard = msg;
      }
      
      if (Object.keys(nextFormErrors).length > 0) {
        setFormErrors(prev => ({ ...prev, ...nextFormErrors }));
      }
      
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const triggerDelete = (item) => {
    setSelectedItem(item);
    setIsConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsConfirmOpen(false);
    setLoading(true);

    try {
      if (activeTab === 'users') {
        const res = await apiClient.delete(`/api/admin/users/${selectedItem.id}`);
        showToast(res.data?.message || 'Ngưng hoạt động tài khoản thành công!', 'success');
      } else if (activeTab === 'employees') {
        const res = await apiClient.delete(`/api/admin/employees/${selectedItem.id}`);
        showToast(res.data?.message || 'Ngưng hoạt động nhân viên thành công!', 'success');
      } else if (activeTab === 'customers') {
        const res = await apiClient.delete(`/api/admin/customers/${selectedItem.id}`);
        showToast(res.data?.message || 'Ngưng hoạt động khách hàng thành công!', 'success');
      }
      fetchData();
    } catch (err) {
      console.error(err);
      let msg = 'Không thể ngưng hoạt động bản ghi!';
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, userEmail, newRole) => {
    if (userEmail === currentUser?.email) {
      showToast('Bạn không thể tự thay đổi hoặc khóa tài khoản của chính mình.', 'error');
      return;
    }
    try {
      const res = await apiClient.put(`/api/admin/users/${userId}?roleName=${newRole}`);
      showToast(res.data?.message || 'Cập nhật vai trò người dùng thành công!', 'success');
      fetchData();
    } catch (err) {
      console.error(err);
      let msg = 'Không thể đổi vai trò người dùng.';
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      showToast(msg, 'error');
    }
  };

  const handleToggleStatus = async (userRow) => {
    if (userRow.email === currentUser?.email) {
      showToast('Bạn không thể tự thay đổi hoặc khóa tài khoản của chính mình.', 'error');
      return;
    }
    
    const nextStatus = userRow.status === 'LOCKED' ? 'ACTIVE' : 'LOCKED';
    setLoading(true);
    try {
      const res = await apiClient.put(`/api/admin/users/${userRow.id}/status?status=${nextStatus}`);
      showToast(res.data?.message || 'Cập nhật trạng thái tài khoản thành công!', 'success');
      fetchData();
    } catch (err) {
      console.error(err);
      let msg = 'Không thể cập nhật trạng thái tài khoản.';
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter & Search Logic
  const getFilteredData = () => {
    const s = searchTerm.toLowerCase().trim();
    if (activeTab === 'users') {
      return users.filter(u => {
        const matchesSearch = 
          u.email.toLowerCase().includes(s) || 
          (u.fullName && u.fullName.toLowerCase().includes(s));
        const matchesRole = filterValue === 'ALL' || u.role === filterValue;
        const matchesStatus = filterValue2 === 'ALL' || u.status === filterValue2;
        return matchesSearch && matchesRole && matchesStatus;
      });
    } else if (activeTab === 'employees') {
      return employees.filter(e => {
        const matchesSearch = 
          e.fullName.toLowerCase().includes(s) || 
          e.employeeCode.toLowerCase().includes(s) || 
          e.email.toLowerCase().includes(s) ||
          (e.phoneNumber && e.phoneNumber.toLowerCase().includes(s)) ||
          (e.position && e.position.toLowerCase().includes(s)) ||
          (e.department && e.department.toLowerCase().includes(s));
        const matchesStatus = filterValue === 'ALL' || e.status === filterValue;
        return matchesSearch && matchesStatus;
      });
    } else if (activeTab === 'customers') {
      return customers.filter(c => {
        const matchesSearch = 
          c.fullName.toLowerCase().includes(s) || 
          c.customerCode.toLowerCase().includes(s) || 
          c.email.toLowerCase().includes(s) ||
          (c.phoneNumber && c.phoneNumber.toLowerCase().includes(s)) ||
          (c.identityCard && c.identityCard.toLowerCase().includes(s));
        const matchesStatus = filterValue === 'ALL' || c.status === filterValue;
        return matchesSearch && matchesStatus;
      });
    }
    return [];
  };

  const filteredData = getFilteredData();

  // Columns / Headers Definitions
  const getUserHeaders = () => [
    { label: 'Tài khoản Email', key: 'email' },
    { label: 'Họ tên', key: 'fullName' },
    { label: 'Vai Trò', key: 'role', width: '150px' },
    { label: 'Trạng thái', key: 'status', width: '120px' },
    { label: 'Ngày Tạo', key: 'createdAt', width: '180px' },
    { label: 'Hành Động', key: 'actions', width: '180px' }
  ];

  const getEmployeeHeaders = () => [
    { label: 'Mã NV', key: 'employeeCode', width: '100px' },
    { label: 'Họ Tên', key: 'fullName' },
    { label: 'Email', key: 'email' },
    { label: 'SĐT', key: 'phoneNumber', width: '120px' },
    { label: 'Chức Vụ', key: 'position', width: '140px' },
    { label: 'Phòng Ban', key: 'department', width: '140px' },
    { label: 'Lương', key: 'salary', width: '120px' },
    { label: 'Trạng thái', key: 'status', width: '120px' },
    { label: 'Hành Động', key: 'actions', width: '130px' }
  ];

  const getCustomerHeaders = () => [
    { label: 'Mã KH', key: 'customerCode', width: '100px' },
    { label: 'Họ Tên', key: 'fullName' },
    { label: 'Email', key: 'email' },
    { label: 'SĐT', key: 'phoneNumber', width: '120px' },
    { label: 'CMND/CCCD', key: 'identityCard', width: '120px' },
    { label: 'Giới Tính', key: 'gender', width: '90px' },
    { label: 'Địa Chỉ', key: 'address' },
    { label: 'Trạng thái', key: 'status', width: '120px' },
    { label: 'Hành Động', key: 'actions', width: '130px' }
  ];

  const headers = activeTab === 'users' ? getUserHeaders() : activeTab === 'employees' ? getEmployeeHeaders() : getCustomerHeaders();

  // Cell Renderer
  const renderCell = (row, key, value) => {
    if (key === 'actions') {
      if (activeTab === 'users') {
        const isSelf = row.email === currentUser?.email;
        const isDefaultAdmin = row.id === 1 || row.email === 'admin@insurance.com';
        const isDisabled = isSelf || isDefaultAdmin;
        const isLocked = row.status === 'LOCKED';
        const isInactive = row.status === 'INACTIVE';
        
        return (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select 
              className="form-input" 
              style={{ height: '30px', padding: '2px 8px', fontSize: '0.8rem', width: '110px' }}
              value={row.role}
              disabled={isDisabled}
              onChange={(e) => handleRoleChange(row.id, row.email, e.target.value)}
            >
              <option value="ROLE_ADMIN">ADMIN</option>
              <option value="ROLE_EMPLOYEE">EMPLOYEE</option>
              <option value="ROLE_CUSTOMER">CUSTOMER</option>
            </select>
            {!isDisabled && (
              <>
                <button
                  onClick={() => handleToggleStatus(row)}
                  className="btn btn-secondary"
                  style={{ 
                    padding: '4px 8px', 
                    color: isLocked ? 'var(--success)' : 'var(--warning)', 
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderColor: isLocked ? 'rgba(22, 163, 74, 0.2)' : 'rgba(245, 158, 11, 0.2)'
                  }}
                  title={isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                >
                  {isLocked ? <Unlock size={14} /> : <Lock size={14} />}
                </button>
                {!isInactive && (
                  <button 
                    onClick={() => triggerDelete(row)} 
                    className="btn btn-secondary" 
                    style={{ padding: '4px 8px', color: 'var(--danger)', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Ngưng hoạt động"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </>
            )}
            {isSelf && (
              <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '600' }}>Tài khoản của bạn</span>
            )}
          </div>
        );
      } else {
        const isInactive = row.status === 'INACTIVE';
        return (
          <div style={{ display: 'flex', gap: '6px' }}>
            <button 
              onClick={() => openEditModal(row)} 
              className="btn btn-secondary" 
              style={{ padding: '6px', height: '32px', minWidth: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Sửa"
            >
              <Edit size={14} style={{ color: 'var(--primary)' }} />
            </button>
            {!isInactive && (
              <button 
                onClick={() => triggerDelete(row)} 
                className="btn btn-secondary" 
                style={{ padding: '6px', height: '32px', minWidth: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Ngưng hoạt động"
              >
                <Trash2 size={14} style={{ color: 'var(--danger)' }} />
              </button>
            )}
          </div>
        );
      }
    }
    
    if (key === 'role') {
      return <StatusBadge status={value} />;
    }
    
    if (key === 'status') {
      return <StatusBadge status={value} variant="text" />;
    }

    if (key === 'salary') {
      return value ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value) : '---';
    }

    if (key === 'createdAt') {
      return value ? new Date(value).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '---';
    }
    
    if (key === 'email') {
      return <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{value}</span>;
    }

    return value || '---';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      <PageHeader 
        title="Quản lý Nhân Sự & Tài Khoản" 
        description="Quản lý toàn bộ danh sách tài khoản người dùng, hồ sơ nhân viên và khách hàng trong hệ thống doanh nghiệp Bảo An."
      />

      {/* Toast Overlay Container */}
      <div style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
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

      {/* Tabs Row */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border)',
        gap: '4px',
        marginBottom: '4px'
      }}>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'users' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'users' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'users' ? '600' : '500',
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'var(--transition-fast)'
          }}
        >
          <ShieldCheck size={18} />
          Tài khoản hệ thống
        </button>

        <button
          onClick={() => setActiveTab('employees')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'employees' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'employees' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'employees' ? '600' : '500',
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'var(--transition-fast)'
          }}
        >
          <Briefcase size={18} />
          Nhân viên (Employee)
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'customers' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'customers' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'customers' ? '600' : '500',
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'var(--transition-fast)'
          }}
        >
          <HeartHandshake size={18} />
          Khách hàng (Customer)
        </button>
      </div>

      {/* Search and Filters */}
      <div className="saas-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <SearchFilterBar 
          searchPlaceholder={
            activeTab === 'users' 
              ? 'Tìm theo email hoặc họ tên...' 
              : activeTab === 'employees' 
              ? 'Tìm theo mã, tên, email, SĐT, chức vụ hoặc phòng ban...'
              : 'Tìm theo mã, tên, email, SĐT hoặc CMND/CCCD...'
          }
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          filterValue={filterValue}
          onFilterChange={setFilterValue}
          filterOptions={
            activeTab === 'users'
              ? [
                  { value: 'ALL', label: 'Tất cả Vai trò' },
                  { value: 'ROLE_ADMIN', label: 'Admin' },
                  { value: 'ROLE_EMPLOYEE', label: 'Nhân viên' },
                  { value: 'ROLE_CUSTOMER', label: 'Khách hàng' }
                ]
              : [
                  { value: 'ALL', label: 'Tất cả Trạng thái' },
                  { value: 'ACTIVE', label: 'Hoạt động' },
                  { value: 'INACTIVE', label: 'Ngưng hoạt động' }
                ]
          }
          filterValue2={activeTab === 'users' ? filterValue2 : undefined}
          onFilterChange2={activeTab === 'users' ? setFilterValue2 : undefined}
          filterOptions2={
            activeTab === 'users' 
              ? [
                  { value: 'ALL', label: 'Tất cả Trạng thái' },
                  { value: 'ACTIVE', label: 'Hoạt động' },
                  { value: 'INACTIVE', label: 'Ngưng hoạt động' },
                  { value: 'LOCKED', label: 'Bị khóa' }
                ]
              : []
          }
          actions={
            <div style={{ display: 'flex', gap: '8px' }}>
              {activeTab === 'customers' && (
                <button 
                  onClick={handleExportCustomers}
                  className="btn btn-secondary"
                  style={{ height: '38px', gap: '6px', fontSize: '0.85rem', display: 'flex', alignItems: 'center' }}
                >
                  <Download size={14} />
                  <span>Xuất báo cáo</span>
                </button>
              )}
              {activeTab !== 'users' && (
                <button onClick={openAddModal} className="btn btn-primary" style={{ height: '38px' }}>
                  <PlusCircle size={16} />
                  {activeTab === 'employees' ? 'Thêm nhân viên' : 'Thêm khách hàng'}
                </button>
              )}
            </div>
          }
        />

        {/* Data Table */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              border: '3px solid var(--border)',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }}></div>
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Đang tải dữ liệu, vui lòng đợi...</span>
          </div>
        ) : (
          <DataTable 
            headers={headers} 
            data={filteredData} 
            rowsPerPage={6}
            renderCell={renderCell}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Profile Form Modal (Add / Edit) */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          animation: 'fadeIn 0.2s ease-out',
          padding: '20px',
          overflowY: 'auto'
        }}>
          <div className="saas-card" style={{
            width: '100%',
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: 'var(--shadow-lg)',
            position: 'relative'
          }}>
            <button 
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px'
              }}
            >
              <X size={18} />
            </button>

            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserPlus size={20} style={{ color: 'var(--primary)' }} />
              {isEditMode ? 'Cập nhật thông tin hồ sơ' : activeTab === 'employees' ? 'Thêm mới nhân sự' : 'Đăng ký khách hàng mới'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              {isEditMode ? 'Chỉnh sửa thông tin hồ sơ và tài khoản liên kết.' : 'Nhập thông tin cá nhân và tài khoản để tạo mới tài khoản đăng nhập.'}
            </p>

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px'
              }}>
                {/* Account Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '4px' }}>Thông tin tài khoản</h4>
                  
                  <div className="form-group">
                    <label className="form-label">Email đăng nhập *</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="email" 
                        name="email" 
                        required 
                        disabled={isEditMode || submitting}
                        className="form-input" 
                        style={{ paddingLeft: '32px', borderColor: formErrors.email ? 'var(--danger)' : '' }}
                        value={formFields.email}
                        onChange={handleInputChange}
                        placeholder="ten@insurance.com"
                      />
                    </div>
                    {formErrors.email && <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '4px' }}>{formErrors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">{isEditMode ? 'Mật khẩu mới (bỏ trống nếu không đổi)' : 'Mật khẩu đăng nhập *'}</label>
                    <div style={{ position: 'relative' }}>
                      <Key size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="password" 
                        name="password" 
                        required={!isEditMode}
                        disabled={submitting}
                        className="form-input" 
                        style={{ paddingLeft: '32px', borderColor: formErrors.password ? 'var(--danger)' : '' }}
                        value={formFields.password}
                        onChange={handleInputChange}
                        placeholder={isEditMode ? '••••••••' : 'Nhập mật khẩu ít nhất 6 ký tự'}
                      />
                    </div>
                    {formErrors.password && <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '4px' }}>{formErrors.password}</span>}
                  </div>
                </div>

                {/* Profile Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '4px' }}>Thông tin cá nhân</h4>
                  
                  <div className="form-group">
                    <label className="form-label">Mã {activeTab === 'employees' ? 'nhân viên' : 'khách hàng'} *</label>
                    <input 
                      type="text" 
                      name={activeTab === 'employees' ? 'employeeCode' : 'customerCode'} 
                      required 
                      disabled={isEditMode || submitting}
                      className="form-input" 
                      style={{ borderColor: (activeTab === 'employees' ? formErrors.employeeCode : formErrors.customerCode) ? 'var(--danger)' : '' }}
                      value={activeTab === 'employees' ? formFields.employeeCode : formFields.customerCode}
                      onChange={handleInputChange}
                      placeholder={activeTab === 'employees' ? 'EMP001' : 'CUS001'}
                    />
                    {activeTab === 'employees' ? (
                      formErrors.employeeCode && <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '4px' }}>{formErrors.employeeCode}</span>
                    ) : (
                      formErrors.customerCode && <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '4px' }}>{formErrors.customerCode}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Họ và tên *</label>
                    <input 
                      type="text" 
                      name="fullName" 
                      required 
                      disabled={submitting}
                      className="form-input" 
                      style={{ borderColor: formErrors.fullName ? 'var(--danger)' : '' }}
                      value={formFields.fullName}
                      onChange={handleInputChange}
                      placeholder="Nguyễn Văn A"
                    />
                    {formErrors.fullName && <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '4px' }}>{formErrors.fullName}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Số điện thoại</label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="text" 
                        name="phoneNumber" 
                        disabled={submitting}
                        className="form-input" 
                        style={{ paddingLeft: '32px', borderColor: formErrors.phoneNumber ? 'var(--danger)' : '' }}
                        value={formFields.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="09xx xxx xxx"
                      />
                    </div>
                    {formErrors.phoneNumber && <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '4px' }}>{formErrors.phoneNumber}</span>}
                  </div>
                </div>
              </div>

              {/* Advanced fields conditional by tab */}
              {activeTab === 'employees' ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '16px',
                  borderTop: '1px solid var(--border)',
                  paddingTop: '16px'
                }}>
                  <div className="form-group">
                    <label className="form-label">Chức vụ</label>
                    <input 
                      type="text" 
                      name="position" 
                      disabled={submitting}
                      className="form-input" 
                      value={formFields.position}
                      onChange={handleInputChange}
                      placeholder="Chuyên viên tư vấn"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phòng ban</label>
                    <input 
                      type="text" 
                      name="department" 
                      disabled={submitting}
                      className="form-input" 
                      value={formFields.department}
                      onChange={handleInputChange}
                      placeholder="Phòng Kinh doanh"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Lương (VND)</label>
                    <input 
                      type="number" 
                      name="salary" 
                      disabled={submitting}
                      className="form-input" 
                      style={{ borderColor: formErrors.salary ? 'var(--danger)' : '' }}
                      value={formFields.salary}
                      onChange={handleInputChange}
                      placeholder="15000000"
                    />
                    {formErrors.salary && <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '4px' }}>{formErrors.salary}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ngày vào làm</label>
                    <div style={{ position: 'relative' }}>
                      <Calendar size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="date" 
                        name="hireDate" 
                        disabled={submitting}
                        className="form-input" 
                        style={{ paddingLeft: '32px' }}
                        value={formFields.hireDate}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '16px',
                  borderTop: '1px solid var(--border)',
                  paddingTop: '16px'
                }}>
                  <div className="form-group">
                    <label className="form-label">Giới tính</label>
                    <select 
                      name="gender" 
                      disabled={submitting}
                      className="form-input" 
                      value={formFields.gender}
                      onChange={handleInputChange}
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ngày sinh</label>
                    <div style={{ position: 'relative' }}>
                      <Calendar size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="date" 
                        name="dateOfBirth" 
                        disabled={submitting}
                        className="form-input" 
                        style={{ paddingLeft: '32px' }}
                        value={formFields.dateOfBirth}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">CMND / CCCD</label>
                    <div style={{ position: 'relative' }}>
                      <CreditCard size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="text" 
                        name="identityCard" 
                        disabled={submitting}
                        className="form-input" 
                        style={{ paddingLeft: '32px', borderColor: formErrors.identityCard ? 'var(--danger)' : '' }}
                        value={formFields.identityCard}
                        onChange={handleInputChange}
                        placeholder="0010xxxxxxxx"
                      />
                    </div>
                    {formErrors.identityCard && <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '4px' }}>{formErrors.identityCard}</span>}
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Địa chỉ thường trú</label>
                    <div style={{ position: 'relative' }}>
                      <MapPin size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
                      <textarea 
                        name="address" 
                        rows="2"
                        disabled={submitting}
                        className="form-input" 
                        style={{ paddingLeft: '32px', resize: 'vertical' }}
                        value={formFields.address}
                        onChange={handleInputChange}
                        placeholder="Số nhà, Tên đường, Quận/Huyện, Tỉnh/Thành phố"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                marginTop: '12px',
                borderTop: '1px solid var(--border)',
                paddingTop: '16px'
              }}>
                <button type="button" onClick={() => setIsModalOpen(false)} disabled={submitting} className="btn btn-secondary">
                  Hủy bỏ
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Đang xử lý...' : (isEditMode ? 'Lưu thay đổi' : 'Tạo mới hồ sơ')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Deletion Dialog */}
      <ConfirmDialog 
        isOpen={isConfirmOpen}
        title={
          activeTab === 'users' 
            ? 'Xác nhận ngưng hoạt động tài khoản' 
            : activeTab === 'employees' 
            ? 'Xác nhận ngưng hoạt động nhân viên' 
            : 'Xác nhận ngưng hoạt động khách hàng'
        }
        message={
          activeTab === 'users' 
            ? 'Bạn có chắc muốn ngưng hoạt động tài khoản này không?'
            : activeTab === 'employees' 
            ? 'Bạn có chắc muốn ngưng hoạt động nhân viên này không?'
            : 'Bạn có chắc muốn ngưng hoạt động khách hàng này không?'
        }
        confirmText="Đồng ý"
        cancelText="Hủy bỏ"
        type="danger"
        onConfirm={handleDeleteConfirm}
        onClose={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};

export default UsersManagement;
