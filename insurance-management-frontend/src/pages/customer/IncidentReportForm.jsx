import React, { useState, useEffect } from 'react';
import { X, Calendar, AlertCircle, DollarSign, FileText, Paperclip } from 'lucide-react';
import apiClient from '../../api/apiClient';

const IncidentReportForm = ({ isOpen, onClose, onSubmitSuccess }) => {
  const [contracts, setContracts] = useState([]);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [customerInsuranceId, setCustomerInsuranceId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [claimAmount, setClaimAmount] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [errors, setErrors] = useState({});

  // Fetch approved customer contracts on open
  useEffect(() => {
    if (isOpen) {
      const fetchApprovedContracts = async () => {
        setLoadingContracts(true);
        try {
          const res = await apiClient.get('/api/customer/insurances/my');
          // Only show APPROVED policies
          const approved = res.data.filter(ins => ins.status === 'APPROVED');
          setContracts(approved);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingContracts(false);
        }
      };

      fetchApprovedContracts();
      // Reset form
      setCustomerInsuranceId('');
      setTitle('');
      setDescription('');
      setClaimAmount('');
      setIncidentDate(new Date().toISOString().split('T')[0]);
      setAttachmentName('');
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateForm = () => {
    const tempErrors = {};
    if (!customerInsuranceId) {
      tempErrors.customerInsuranceId = 'Vui lòng chọn hợp đồng bảo hiểm liên kết!';
    }
    if (!title || title.trim().length < 5) {
      tempErrors.title = 'Tiêu đề sự cố phải có ít nhất 5 ký tự!';
    }
    if (!description || description.trim().length < 10) {
      tempErrors.description = 'Mô tả chi tiết phải có ít nhất 10 ký tự!';
    }
    if (claimAmount === '' || Number(claimAmount) < 0) {
      tempErrors.claimAmount = 'Số tiền yêu cầu bồi thường phải lớn hơn hoặc bằng 0!';
    }
    if (!incidentDate) {
      tempErrors.incidentDate = 'Vui lòng chọn ngày xảy ra sự cố!';
    } else {
      const selected = new Date(incidentDate);
      const today = new Date();
      // Clear time components for fair date comparison
      selected.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      if (selected > today) {
        tempErrors.incidentDate = 'Ngày xảy ra sự cố không được ở tương lai!';
      }
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachmentName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        claimAmount: Number(claimAmount),
        incidentDate,
        customerInsuranceId: Number(customerInsuranceId),
        attachmentUrl: attachmentName || null
      };

      await apiClient.post('/api/customer/reports', payload);
      onSubmitSuccess('Đã gửi báo cáo sự cố thành công! Nhân viên chăm sóc sẽ sớm xử lý yêu cầu.');
      onClose();
    } catch (err) {
      console.error(err);
      let errMsg = 'Không thể gửi báo cáo sự cố. Vui lòng thử lại!';
      if (err.response && err.response.data && err.response.data.message) {
        errMsg = err.response.data.message;
      }
      setErrors({ server: errMsg });
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
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
        maxWidth: '600px',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '90vh',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>Khai Báo Sự Cố Mới</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Vui lòng cung cấp chi tiết sự cố và hồ sơ yêu cầu bồi thường bảo hiểm.
            </p>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              borderRadius: '50%',
              transition: 'var(--transition-fast)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--background)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '24px' }}>
          {errors.server && (
            <div style={{
              backgroundColor: 'var(--danger-light)',
              border: '1px solid var(--danger)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px',
              color: 'var(--danger)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px'
            }}>
              <AlertCircle size={16} />
              <span>{errors.server}</span>
            </div>
          )}

          {!loadingContracts && contracts.length === 0 && (
            <div style={{
              backgroundColor: 'var(--danger-light)',
              border: '1px solid var(--danger)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px',
              color: 'var(--danger)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px'
            }}>
              <AlertCircle size={16} />
              <span>Chú ý: Bạn không có hợp đồng bảo hiểm nào đang có hiệu lực để khai báo sự cố. Vui lòng mua bảo hiểm trước!</span>
            </div>
          )}

          {/* Contract Selector */}
          <div className="form-group">
            <label className="form-label">Chọn Hợp Đồng Bảo Hiểm Liên Quan *</label>
            {loadingContracts ? (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Đang tải danh sách hợp đồng...</span>
            ) : (
              <select
                className={`form-input ${errors.customerInsuranceId ? 'border-danger' : ''}`}
                value={customerInsuranceId}
                onChange={(e) => setCustomerInsuranceId(e.target.value)}
                disabled={contracts.length === 0}
              >
                <option value="">-- Chọn hợp đồng bảo hiểm liên kết --</option>
                {contracts.map(ins => (
                  <option key={ins.id} value={ins.id}>
                    {ins.insurancePackageName} ({ins.contractCode || 'Chưa cấp mã'}) - Phí: {formatCurrency(ins.price)}
                  </option>
                ))}
              </select>
            )}
            {errors.customerInsuranceId && (
              <span style={{ color: 'var(--danger)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                <AlertCircle size={12} /> {errors.customerInsuranceId}
              </span>
            )}
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Chọn đúng hợp đồng bảo hiểm bị phát sinh sự cố để tiến hành làm hồ sơ yêu cầu bồi thường.
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Incident Date */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} /> Ngày Xảy Ra Sự Cố *
              </label>
              <input
                type="date"
                className={`form-input ${errors.incidentDate ? 'border-danger' : ''}`}
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
              />
              {errors.incidentDate && (
                <span style={{ color: 'var(--danger)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={12} /> {errors.incidentDate}
                </span>
              )}
            </div>

            {/* Claim Amount */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <DollarSign size={14} /> Số Tiền Đề Nghị Bồi Thường (VND) *
              </label>
              <input
                type="number"
                min="0"
                step="any"
                className={`form-input ${errors.claimAmount ? 'border-danger' : ''}`}
                placeholder="Ví dụ: 500000"
                value={claimAmount}
                onChange={(e) => setClaimAmount(e.target.value)}
              />
              {errors.claimAmount && (
                <span style={{ color: 'var(--danger)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={12} /> {errors.claimAmount}
                </span>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label">Tiêu Đề Báo Cáo *</label>
            <input
              type="text"
              className={`form-input ${errors.title ? 'border-danger' : ''}`}
              placeholder="Tóm tắt sự cố (ví dụ: Va chạm xe máy trên đường đi làm)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {errors.title && (
              <span style={{ color: 'var(--danger)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertCircle size={12} /> {errors.title}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Mô Tả Chi Tiết Sự Cố *</label>
            <textarea
              className={`form-input ${errors.description ? 'border-danger' : ''}`}
              placeholder="Mô tả cụ thể thời gian, địa điểm, diễn biến sự cố và các thiệt hại thực tế..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ resize: 'vertical' }}
            />
            {errors.description && (
              <span style={{ color: 'var(--danger)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertCircle size={12} /> {errors.description}
              </span>
            )}
          </div>

          {/* Attachment */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Paperclip size={14} /> Tài Liệu Đính Kèm (Hóa đơn, hình ảnh sự cố)
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <input
                type="file"
                id="file-attachment"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept="image/*,.pdf"
              />
              <label 
                htmlFor="file-attachment" 
                className="btn btn-secondary"
                style={{ cursor: 'pointer', padding: '8px 14px', fontSize: '0.8rem' }}
              >
                Chọn tệp tin...
              </label>
              <span style={{ fontSize: '0.85rem', color: attachmentName ? 'var(--text-main)' : 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {attachmentName || 'Chưa chọn tệp tin nào'}
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Đính kèm hóa đơn viện phí, biên bản tai nạn hoặc ảnh chụp thiệt hại (định dạng ảnh hoặc PDF).
            </span>
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            borderTop: '1px solid var(--border)',
            paddingTop: '20px',
            marginTop: '24px'
          }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={submitting}
            >
              Hủy bỏ
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={submitting || contracts.length === 0}
            >
              {submitting ? 'Đang gửi...' : 'Gửi báo cáo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IncidentReportForm;
