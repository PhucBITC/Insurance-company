import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  PlusCircle, 
  Edit, 
  Trash2, 
  DollarSign, 
  Calendar, 
  Activity,
  X,
  FileSpreadsheet
} from 'lucide-react';
import apiClient from '../../api/apiClient';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import SearchFilterBar from '../../components/SearchFilterBar';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useUI } from '../../context/UIContext';

const PackagesManagement = () => {
  const { t } = useUI();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Modals & Dialogs
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  // Form State
  const [formFields, setFormFields] = useState({
    packageCode: '',
    name: '',
    type: 'HEALTH', // HEALTH, LIFE, VEHICLE, PROPERTY
    description: '',
    price: '',
    durationMonths: 12,
    maxBenefit: '',
    conditions: '',
    status: 'ACTIVE' // ACTIVE, INACTIVE
  });

  // Fetch Packages
  const fetchPackages = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await apiClient.get('/api/admin/insurance-packages');
      setPackages(res.data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Không thể tải danh sách gói bảo hiểm từ máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  // Alert Timeout
  useEffect(() => {
    if (successMsg || errorMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg('');
        setErrorMsg('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMsg, errorMsg]);

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormFields(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setSelectedPackage(null);
    setFormFields({
      packageCode: `PKG-${Date.now().toString().slice(-6)}`,
      name: '',
      type: 'HEALTH',
      description: '',
      price: '',
      durationMonths: 12,
      maxBenefit: '',
      conditions: '',
      status: 'ACTIVE'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (pkg) => {
    setIsEditMode(true);
    setSelectedPackage(pkg);
    setFormFields({
      packageCode: pkg.packageCode || '',
      name: pkg.name || '',
      type: pkg.type || 'HEALTH',
      description: pkg.description || '',
      price: pkg.price || '',
      durationMonths: pkg.durationMonths || 12,
      maxBenefit: pkg.maxBenefit || '',
      conditions: pkg.conditions || '',
      status: pkg.status || 'ACTIVE'
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const payload = {
      ...formFields,
      price: parseFloat(formFields.price),
      durationMonths: parseInt(formFields.durationMonths),
      maxBenefit: parseFloat(formFields.maxBenefit)
    };

    try {
      if (isEditMode) {
        await apiClient.put(`/api/admin/insurance-packages/${selectedPackage.id}`, payload);
        setSuccessMsg('Cập nhật gói bảo hiểm thành công!');
      } else {
        await apiClient.post('/api/admin/insurance-packages', payload);
        setSuccessMsg('Thêm mới gói bảo hiểm thành công!');
      }
      setIsModalOpen(false);
      fetchPackages();
    } catch (err) {
      console.error(err);
      let msg = 'Có lỗi xảy ra khi lưu thông tin gói bảo hiểm!';
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const triggerDelete = (pkg) => {
    setSelectedPackage(pkg);
    setIsConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsConfirmOpen(false);
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      await apiClient.delete(`/api/admin/insurance-packages/${selectedPackage.id}`);
      setSuccessMsg('Xóa gói bảo hiểm thành công!');
      fetchPackages();
    } catch (err) {
      console.error(err);
      let msg = 'Không thể xóa gói bảo hiểm này!';
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // Filter & Search
  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          pkg.packageCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || pkg.type === filterType;
    return matchesSearch && matchesType;
  });

  const headers = [
    { label: 'Mã Gói', key: 'packageCode', width: '130px' },
    { label: 'Tên Gói Bảo Hiểm', key: 'name' },
    { label: 'Loại', key: 'type', width: '120px' },
    { label: 'Phí Bảo Hiểm', key: 'price', width: '140px' },
    { label: 'Thời Hạn', key: 'durationMonths', width: '100px' },
    { label: 'Hạn Mức Đền Bù', key: 'maxBenefit', width: '150px' },
    { label: 'Trạng Thái', key: 'status', width: '120px' },
    { label: 'Hành Động', key: 'actions', width: '110px' }
  ];

  const renderCell = (row, key, value) => {
    if (key === 'actions') {
      return (
        <div style={{ display: 'flex', gap: '6px' }}>
          <button 
            onClick={() => openEditModal(row)} 
            className="btn btn-secondary" 
            style={{ padding: '6px', height: '32px', minWidth: 'auto' }}
            title="Sửa gói"
          >
            <Edit size={14} style={{ color: 'var(--primary)' }} />
          </button>
          <button 
            onClick={() => triggerDelete(row)} 
            className="btn btn-secondary" 
            style={{ padding: '6px', height: '32px', minWidth: 'auto' }}
            title="Xóa gói"
          >
            <Trash2 size={14} style={{ color: 'var(--danger)' }} />
          </button>
        </div>
      );
    }

    if (key === 'status') {
      const badgeType = value === 'ACTIVE' ? 'success' : 'danger';
      const text = value === 'ACTIVE' ? 'Hoạt động' : 'Tạm ngưng';
      return <StatusBadge status={badgeType} text={text} />;
    }

    if (key === 'type') {
      const types = {
        HEALTH: 'Sức khỏe',
        LIFE: 'Nhân thọ',
        VEHICLE: 'Xe cộ',
        PROPERTY: 'Tài sản'
      };
      return types[value] || value;
    }

    if (key === 'price') {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    }

    if (key === 'maxBenefit') {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    }

    if (key === 'durationMonths') {
      return `${value} tháng`;
    }

    return value || '---';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      <PageHeader 
        title="Quản lý Gói Bảo Hiểm" 
        description="Định cấu hình các gói bảo hiểm của công ty: mức đóng phí, quyền lợi đền bù tối đa, thời hạn hợp đồng và các điều khoản điều kiện kèm theo."
      />

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

      {/* Control Card */}
      <div className="saas-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <SearchFilterBar 
          searchPlaceholder="Tìm gói bảo hiểm theo mã hoặc tên gói..."
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          filterValue={filterType}
          onFilterChange={setFilterType}
          filterOptions={[
            { value: 'ALL', label: 'Tất cả các loại' },
            { value: 'HEALTH', label: 'Bảo hiểm Sức khỏe' },
            { value: 'LIFE', label: 'Bảo hiểm Nhân thọ' },
            { value: 'VEHICLE', label: 'Bảo hiểm Xe cộ' },
            { value: 'PROPERTY', label: 'Bảo hiểm Tài sản' }
          ]}
          actions={
            <button onClick={openAddModal} className="btn btn-primary" style={{ height: '38px' }}>
              <PlusCircle size={16} />
              Gói bảo hiểm mới
            </button>
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
            data={filteredPackages} 
            rowsPerPage={6}
            renderCell={renderCell}
          />
        )}
      </div>

      {/* Add / Edit Modal */}
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
          padding: '20px'
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
              <FileSpreadsheet size={20} style={{ color: 'var(--primary)' }} />
              {isEditMode ? 'Cập nhật gói bảo hiểm' : 'Tạo mới gói bảo hiểm'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Điền đầy đủ thông tin để định cấu hình quyền lợi và biểu phí cho khách hàng đăng ký.
            </p>

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px'
              }}>
                {/* Left fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Mã gói bảo hiểm *</label>
                    <input 
                      type="text" 
                      name="packageCode" 
                      required 
                      className="form-input" 
                      value={formFields.packageCode}
                      onChange={handleInputChange}
                      placeholder="PKG-HEALTH-01"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tên gói bảo hiểm *</label>
                    <input 
                      type="text" 
                      name="name" 
                      required 
                      className="form-input" 
                      value={formFields.name}
                      onChange={handleInputChange}
                      placeholder="Bảo hiểm Sức khỏe Gia đình"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phân loại gói bảo hiểm *</label>
                    <select 
                      name="type" 
                      className="form-input" 
                      value={formFields.type}
                      onChange={handleInputChange}
                    >
                      <option value="HEALTH">Bảo hiểm Sức khỏe</option>
                      <option value="LIFE">Bảo hiểm Nhân thọ</option>
                      <option value="VEHICLE">Bảo hiểm Xe cộ</option>
                      <option value="PROPERTY">Bảo hiểm Tài sản</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Trạng thái phát hành *</label>
                    <select 
                      name="status" 
                      className="form-input" 
                      value={formFields.status}
                      onChange={handleInputChange}
                    >
                      <option value="ACTIVE">Hoạt động (Active)</option>
                      <option value="INACTIVE">Tạm ngưng (Inactive)</option>
                    </select>
                  </div>
                </div>

                {/* Right fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Phí đóng định kỳ (VND) *</label>
                    <div style={{ position: 'relative' }}>
                      <DollarSign size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="number" 
                        name="price" 
                        required 
                        className="form-input" 
                        style={{ paddingLeft: '32px' }}
                        value={formFields.price}
                        onChange={handleInputChange}
                        placeholder="1200000"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Thời hạn hợp đồng (tháng) *</label>
                    <div style={{ position: 'relative' }}>
                      <Calendar size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="number" 
                        name="durationMonths" 
                        required 
                        className="form-input" 
                        style={{ paddingLeft: '32px' }}
                        value={formFields.durationMonths}
                        onChange={handleInputChange}
                        placeholder="12"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Hạn mức đền bù tối đa (VND) *</label>
                    <div style={{ position: 'relative' }}>
                      <Activity size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="number" 
                        name="maxBenefit" 
                        required 
                        className="form-input" 
                        style={{ paddingLeft: '32px' }}
                        value={formFields.maxBenefit}
                        onChange={handleInputChange}
                        placeholder="100000000"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Text areas */}
              <div className="form-group" style={{ marginTop: '4px' }}>
                <label className="form-label">Mô tả chi tiết gói bảo hiểm</label>
                <textarea 
                  name="description" 
                  rows="3"
                  className="form-input" 
                  value={formFields.description}
                  onChange={handleInputChange}
                  placeholder="Mô tả các quyền lợi nổi bật, phạm vi bảo vệ..."
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Điều kiện tham gia bảo hiểm</label>
                <textarea 
                  name="conditions" 
                  rows="3"
                  className="form-input" 
                  value={formFields.conditions}
                  onChange={handleInputChange}
                  placeholder="Độ tuổi, điều kiện sức khỏe, loại phương tiện phù hợp..."
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                marginTop: '8px',
                borderTop: '1px solid var(--border)',
                paddingTop: '16px'
              }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary">
                  {isEditMode ? 'Lưu thay đổi' : 'Tạo mới gói'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog 
        isOpen={isConfirmOpen}
        title="Xác nhận xóa gói bảo hiểm"
        message={`Bạn có chắc chắn muốn xóa gói bảo hiểm "${selectedPackage?.name}" (Mã: ${selectedPackage?.packageCode})? Hành động này không thể hoàn tác.`}
        confirmText="Xác nhận xóa"
        cancelText="Hủy bỏ"
        type="danger"
        onConfirm={handleDeleteConfirm}
        onClose={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};

export default PackagesManagement;
