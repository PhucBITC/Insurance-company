import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  UploadCloud, 
  Trash2, 
  Clock, 
  User, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle,
  FileDown
} from 'lucide-react';
import apiClient from '../../api/apiClient';
import PageHeader from '../../components/PageHeader';
import { useUI } from '../../context/UIContext';

const WikiManagement = () => {
  const { language } = useUI();
  
  // State
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchDocuments = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await apiClient.get('/api/admin/wiki/list');
      setDocuments(res.data || []);
    } catch (err) {
      console.error(err);
      setErrorMsg(language === 'vi' ? 'Không thể tải danh sách tài liệu Wiki.' : 'Failed to load Wiki documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const extension = file.name.split('.').pop().toLowerCase();
      if (extension !== 'pdf' && extension !== 'txt') {
        setErrorMsg(language === 'vi' ? 'Chỉ hỗ trợ tệp định dạng .pdf hoặc .txt!' : 'Only .pdf or .txt formats are supported!');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setErrorMsg('');
      setSuccessMsg('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg(language === 'vi' ? 'Vui lòng chọn một tệp để tải lên!' : 'Please select a file to upload!');
      return;
    }

    setUploading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await apiClient.post('/api/admin/wiki/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setSuccessMsg(res.data.message || (language === 'vi' ? 'Tải tài liệu lên thành công!' : 'File uploaded successfully!'));
      setSelectedFile(null);
      // Reset input element
      const fileInput = document.getElementById('wiki-file-input');
      if (fileInput) fileInput.value = '';
      fetchDocuments();
    } catch (err) {
      console.error(err);
      let msg = language === 'vi' ? 'Tải lên thất bại. Vui lòng kiểm tra lại tệp tin!' : 'Upload failed. Please check the file!';
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      setErrorMsg(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, fileName) => {
    const confirmDelete = window.confirm(
      language === 'vi' 
        ? `Bạn có chắc chắn muốn xóa tài liệu "${fileName}" không?` 
        : `Are you sure you want to delete document "${fileName}"?`
    );
    if (!confirmDelete) return;

    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await apiClient.delete(`/api/admin/wiki/delete/${id}`);
      setSuccessMsg(res.data.message || (language === 'vi' ? 'Đã xóa tài liệu thành công!' : 'Document deleted successfully!'));
      fetchDocuments();
    } catch (err) {
      console.error(err);
      let msg = language === 'vi' ? 'Xóa tài liệu thất bại.' : 'Failed to delete document.';
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      setErrorMsg(msg);
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
        minute: '2-digit'
      });
    } catch (e) {
      return dateTimeString;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      <PageHeader 
        title={language === 'vi' ? "Quản lý Tài liệu Wiki & AI Context" : "Wiki & AI Context Management"} 
        description={language === 'vi' ? "Tải lên các tài liệu hướng dẫn nội bộ (PDF/TXT) để AI Chatbot tự động trích xuất thông tin tư vấn cho khách hàng." : "Upload internal guide documents (PDF/TXT) for the AI Chatbot to reference during customer support."}
        actions={
          <button 
            onClick={fetchDocuments} 
            className="btn btn-secondary" 
            style={{ height: '38px', gap: '6px' }}
            disabled={loading}
          >
            <RefreshCw className={loading ? "animate-spin" : ""} size={14} />
            {language === 'vi' ? 'Tải lại' : 'Refresh'}
          </button>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'start' }}>
        {/* Upload Form Box */}
        <div className="saas-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UploadCloud size={18} style={{ color: 'var(--primary)' }} />
            {language === 'vi' ? 'Tải lên tài liệu mới' : 'Upload New Document'}
          </h3>

          <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div 
              style={{
                border: '2px dashed var(--glass-border)',
                borderRadius: 'var(--radius-md)',
                padding: '24px 16px',
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: 'rgba(255, 255, 255, 0.01)',
                transition: 'border-color 0.2s ease',
                position: 'relative'
              }}
              onClick={() => document.getElementById('wiki-file-input').click()}
            >
              <input 
                id="wiki-file-input"
                type="file" 
                accept=".pdf,.txt"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <FileDown size={36} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-main)', margin: '0 0 4px 0' }}>
                {selectedFile ? selectedFile.name : (language === 'vi' ? 'Chọn file PDF hoặc TXT' : 'Select PDF or TXT file')}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : (language === 'vi' ? 'Hỗ trợ tệp có định dạng .pdf, .txt' : 'Supports .pdf, .txt')}
              </p>
            </div>

            {errorMsg && (
              <div className="form-alert form-alert-danger" style={{ margin: 0 }}>
                <AlertCircle size={14} />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="form-alert form-alert-success" style={{ margin: 0 }}>
                <CheckCircle size={14} />
                <span>{successMsg}</span>
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', height: '40px', justifyContent: 'center' }}
              disabled={uploading || !selectedFile}
            >
              {uploading ? (
                <>
                  <RefreshCw className="animate-spin" size={14} style={{ marginRight: '6px' }} />
                  {language === 'vi' ? 'Đang trích xuất...' : 'Extracting...'}
                </>
              ) : (
                language === 'vi' ? 'Bắt đầu tải lên & đọc file' : 'Upload and Parse File'
              )}
            </button>
          </form>
        </div>

        {/* Document List Box */}
        <div className="saas-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} style={{ color: 'var(--primary)' }} />
            {language === 'vi' ? 'Danh sách tài liệu đã tải lên' : 'Uploaded Documents'}
          </h3>

          <div className="saas-table-container" style={{ margin: 0, maxHeight: '420px', overflowY: 'auto' }}>
            <table className="saas-table">
              <thead>
                <tr>
                  <th>{language === 'vi' ? 'Tên tệp' : 'File Name'}</th>
                  <th style={{ width: '130px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} />{language === 'vi' ? 'Thời gian' : 'Time'}</div></th>
                  <th style={{ width: '150px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={12} />{language === 'vi' ? 'Người tải' : 'Uploaded By'}</div></th>
                  <th style={{ width: '80px', textAlign: 'center' }}>{language === 'vi' ? 'Hành động' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      <RefreshCw className="animate-spin" size={20} style={{ margin: '0 auto 8px' }} />
                      <div>{language === 'vi' ? 'Đang tải dữ liệu...' : 'Loading...'}</div>
                    </td>
                  </tr>
                ) : documents.length > 0 ? (
                  documents.map((doc) => (
                    <tr key={doc.id}>
                      <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileText size={16} style={{ color: 'var(--primary)' }} />
                          {doc.fileName}
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {formatDateTime(doc.uploadedAt)}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {doc.uploadedBy || 'ADMIN'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => handleDelete(doc.id, doc.fileName)}
                          className="btn btn-secondary"
                          style={{
                            color: 'var(--danger)',
                            border: 'none',
                            padding: '6px',
                            minWidth: 'auto',
                            boxShadow: 'none',
                            background: 'none'
                          }}
                          title={language === 'vi' ? 'Xóa tài liệu' : 'Delete document'}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      {language === 'vi' ? 'Chưa có tài liệu Wiki nào được tải lên.' : 'No Wiki documents uploaded yet.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WikiManagement;
