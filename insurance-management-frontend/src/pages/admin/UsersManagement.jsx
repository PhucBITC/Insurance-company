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
  UserPlus
} from 'lucide-react';
import apiClient from '../../api/apiClient';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import SearchFilterBar from '../../components/SearchFilterBar';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useUI } from '../../context/UIContext';

const UsersManagement = () => {
  const { t } = useUI();
  
  // State
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'employees', 'customers'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValue, setFilterValue] = useState('ALL');
  
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [customers, setCustomers] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Modal & Confirm States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); // Employee or Customer to edit/delete
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

  // Load Data
  const fetchData = async () => {
    setLoading(true);
    setErrorMsg('');
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
      setErrorMsg('Không thể tải dữ liệu từ máy chủ. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Clear search and filter when changing tab
    setSearchTerm('');
    setFilterValue('ALL');
    setErrorMsg('');
    setSuccessMsg('');
  }, [activeTab]);

  // Alert Timout
  useEffect(() => {
    if (successMsg || errorMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg('');
        setErrorMsg('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMsg, errorMsg]);

  // Form Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormFields(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setSelectedItem(null);
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

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

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
          setSuccessMsg('Cập nhật hồ sơ nhân viên thành công!');
        } else {
          await apiClient.post('/api/admin/employees', payload);
          setSuccessMsg('Thêm mới nhân viên và tài khoản thành công!');
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
          setSuccessMsg('Cập nhật hồ sơ khách hàng thành công!');
        } else {
          await apiClient.post('/api/admin/customers', payload);
          setSuccessMsg('Thêm mới khách hàng và tài khoản thành công!');
        }
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      let msg = 'Có lỗi xảy ra trong quá trình xử lý!';
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const triggerDelete = (item) => {
    setSelectedItem(item);
    setIsConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsConfirmOpen(false);
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (activeTab === 'users') {
        await apiClient.delete(`/api/admin/users/${selectedItem.id}`);
        setSuccessMsg('Xóa tài khoản người dùng thành công!');
      } else if (activeTab === 'employees') {
        await apiClient.delete(`/api/admin/employees/${selectedItem.id}`);
        setSuccessMsg('Xóa hồ sơ nhân viên và tài khoản liên kết thành công!');
      } else if (activeTab === 'customers') {
        await apiClient.delete(`/api/admin/customers/${selectedItem.id}`);
        setSuccessMsg('Xóa hồ sơ khách hàng và tài khoản liên kết thành công!');
      }
      fetchData();
    } catch (err) {
      console.error(err);
      let msg = 'Không thể xóa bản ghi!';
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await apiClient.put(`/api/admin/users/${userId}?roleName=${newRole}`);
      setSuccessMsg('Cập nhật vai trò người dùng thành công!');
      fetchData();
    } catch (err) {
      console.error(err);
      setErrorMsg('Không thể đổi role người dùng.');
    }
  };

  // Filter & Search Logic
  const getFilteredData = () => {
    if (activeTab === 'users') {
      return users.filter(u => {
        const matchesSearch = u.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterValue === 'ALL' || u.role === filterValue;
        return matchesSearch && matchesFilter;
      });
    } else if (activeTab === 'employees') {
      return employees.filter(e => {
        return e.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
               e.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) || 
               e.email.toLowerCase().includes(searchTerm.toLowerCase());
      });
    } else if (activeTab === 'customers') {
      return customers.filter(c => {
        return c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
               c.customerCode.toLowerCase().includes(searchTerm.toLowerCase()) || 
               c.email.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }
    return [];
  };

  const filteredData = getFilteredData();

  // Columns / Headers Definitions
  const getUserHeaders = () => [
    { label: 'Tài khoản Email', key: 'email' },
    { label: 'Vai Trò', key: 'role', width: '150px' },
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
    { label: 'Hành Động', key: 'actions', width: '130px' }
  ];

  const headers = activeTab === 'users' ? getUserHeaders() : activeTab === 'employees' ? getEmployeeHeaders() : getCustomerHeaders();

  // Cell Renderer
  const renderCell = (row, key, value) => {
    if (key === 'actions') {
      if (activeTab === 'users') {
        const isDefaultAdmin = row.id === 1 || row.email === 'admin@insurance.com';
        return (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select 
              className="form-input" 
              style={{ height: '30px', padding: '2px 8px', fontSize: '0.8rem', width: '110px' }}
              value={row.role}
              disabled={isDefaultAdmin}
              onChange={(e) => handleRoleChange(row.id, e.target.value)}
            >
              <option value="ROLE_ADMIN">ADMIN</option>
              <option value="ROLE_EMPLOYEE">EMPLOYEE</option>
              <option value="ROLE_CUSTOMER">CUSTOMER</option>
            </select>
            {!isDefaultAdmin && (
              <button 
                onClick={() => triggerDelete(row)} 
                className="btn btn-secondary" 
                style={{ padding: '4px 8px', color: 'var(--danger)', height: '30px' }}
                title="Xóa tài khoản"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        );
      } else {
        return (
          <div style={{ display: 'flex', gap: '6px' }}>
            <button 
              onClick={() => openEditModal(row)} 
              className="btn btn-secondary" 
              style={{ padding: '6px', height: '32px', minWidth: 'auto' }}
              title="Sửa"
            >
              <Edit size={14} style={{ color: 'var(--primary)' }} />
            </button>
            <button 
              onClick={() => triggerDelete(row)} 
              className="btn btn-secondary" 
              style={{ padding: '6px', height: '32px', minWidth: 'auto' }}
              title="Xóa"
            >
              <Trash2 size={14} style={{ color: 'var(--danger)' }} />
            </button>
          </div>
        );
      }
    }
    
    if (key === 'role') {
      let badgeType = 'primary';
      if (value === 'ROLE_ADMIN') badgeType = 'danger';
      if (value === 'ROLE_EMPLOYEE') badgeType = 'warning';
      return <StatusBadge status={badgeType} text={value.replace('ROLE_', '')} />;
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

      {/* Success/Error Alerts */}
      {successMsg && (
        <div className="saas-alert saas-alert-success animate-fade-in">
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="saas-alert saas-alert-danger animate-fade-in">
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="saas-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <SearchFilterBar 
          searchPlaceholder={
            activeTab === 'users' 
              ? 'Tìm theo email...' 
              : activeTab === 'employees' 
              ? 'Tìm theo mã, tên hoặc email nhân viên...'
              : 'Tìm theo mã, tên hoặc email khách hàng...'
          }
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          filterValue={activeTab === 'users' ? filterValue : undefined}
          onFilterChange={activeTab === 'users' ? setFilterValue : undefined}
          filterOptions={activeTab === 'users' ? [
            { value: 'ALL', label: 'Tất cả các Role' },
            { value: 'ROLE_ADMIN', label: 'Admin' },
            { value: 'ROLE_EMPLOYEE', label: 'Nhân viên' },
            { value: 'ROLE_CUSTOMER', label: 'Khách hàng' }
          ] : []}
          actions={
            activeTab !== 'users' && (
              <button onClick={openAddModal} className="btn btn-primary" style={{ height: '38px' }}>
                <PlusCircle size={16} />
                {activeTab === 'employees' ? 'Thêm nhân viên' : 'Thêm khách hàng'}
              </button>
            )
          }
        />

        {/* Data Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            Đang tải dữ liệu, vui lòng đợi...
          </div>
        ) : (
          <DataTable 
            headers={headers} 
            data={filteredData} 
            rowsPerPage={6}
            renderCell={renderCell}
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
                        disabled={isEditMode}
                        className="form-input" 
                        style={{ paddingLeft: '32px' }}
                        value={formFields.email}
                        onChange={handleInputChange}
                        placeholder="ten@insurance.com"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">{isEditMode ? 'Mật khẩu mới (bỏ trống nếu không đổi)' : 'Mật khẩu đăng nhập *'}</label>
                    <div style={{ position: 'relative' }}>
                      <Key size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="password" 
                        name="password" 
                        required={!isEditMode}
                        className="form-input" 
                        style={{ paddingLeft: '32px' }}
                        value={formFields.password}
                        onChange={handleInputChange}
                        placeholder={isEditMode ? '••••••••' : 'Nhập mật khẩu ít nhất 6 ký tự'}
                      />
                    </div>
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
                      className="form-input" 
                      value={activeTab === 'employees' ? formFields.employeeCode : formFields.customerCode}
                      onChange={handleInputChange}
                      placeholder={activeTab === 'employees' ? 'EMP001' : 'CUS001'}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Họ và tên *</label>
                    <input 
                      type="text" 
                      name="fullName" 
                      required 
                      className="form-input" 
                      value={formFields.fullName}
                      onChange={handleInputChange}
                      placeholder="Nguyễn Văn A"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Số điện thoại</label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="text" 
                        name="phoneNumber" 
                        className="form-input" 
                        style={{ paddingLeft: '32px' }}
                        value={formFields.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="09xx xxx xxx"
                      />
                    </div>
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
                      className="form-input" 
                      value={formFields.salary}
                      onChange={handleInputChange}
                      placeholder="15000000"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ngày vào làm</label>
                    <div style={{ position: 'relative' }}>
                      <Calendar size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="date" 
                        name="hireDate" 
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
                        className="form-input" 
                        style={{ paddingLeft: '32px' }}
                        value={formFields.identityCard}
                        onChange={handleInputChange}
                        placeholder="0010xxxxxxxx"
                      />
                    </div>
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Địa chỉ thường trú</label>
                    <div style={{ position: 'relative' }}>
                      <MapPin size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
                      <textarea 
                        name="address" 
                        rows="2"
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
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary">
                  {isEditMode ? 'Lưu thay đổi' : 'Tạo mới hồ sơ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Deletion Dialog */}
      <ConfirmDialog 
        isOpen={isConfirmOpen}
        title={`Xác nhận xóa ${activeTab === 'users' ? 'tài khoản' : activeTab === 'employees' ? 'nhân viên' : 'khách hàng'}`}
        message={
          activeTab === 'users' 
            ? `Bạn có chắc chắn muốn xóa tài khoản "${selectedItem?.email}"? Hành động này sẽ đồng thời xóa hồ sơ tương ứng và không thể hoàn tác.`
            : `Bạn có chắc chắn muốn xóa hồ sơ "${selectedItem?.fullName}"? Hành động này sẽ đồng thời xóa vĩnh viễn tài khoản "${selectedItem?.email}" và các thông tin liên quan.`
        }
        confirmText="Xác nhận xóa"
        cancelText="Hủy bỏ"
        type="danger"
        onConfirm={handleDeleteConfirm}
        onClose={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};

export default UsersManagement;
