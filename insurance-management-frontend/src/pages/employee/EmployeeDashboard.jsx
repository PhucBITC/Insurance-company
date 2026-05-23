import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Calendar,
  RefreshCw,
  Clock,
  Search
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import SearchFilterBar from '../../components/SearchFilterBar';
import apiClient from '../../api/apiClient';

// Recharts imports
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPackage, setFilterPackage] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/employee/dashboard');
      setData(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Không thể tải dữ liệu thống kê công việc của nhân viên.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const headers = [
    { label: 'Tên Khách Hàng', key: 'name' },
    { label: 'Email', key: 'email' },
    { label: 'Gói Bảo Hiểm Tham Gia', key: 'package' },
    { label: 'Ngày Bắt Đầu', key: 'date' },
    { label: 'Trạng Thái', key: 'SaasStatusBadge', width: '120px' }
  ];

  const renderCell = (row, key, value) => {
    if (key === 'SaasStatusBadge') {
      return <StatusBadge status={row.status} />;
    }
    if (key === 'email') {
      return <span style={{ color: 'var(--text-muted)' }}>{value}</span>;
    }
    if (key === 'name') {
      return <strong style={{ color: 'var(--text-main)' }}>{value}</strong>;
    }
    return value;
  };

  const actionButtons = (
    <button 
      onClick={fetchDashboardData} 
      className="btn btn-secondary" 
      style={{ height: '38px', gap: '6px' }}
    >
      <RefreshCw size={14} />
      Làm mới công việc
    </button>
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '400px', color: 'var(--text-muted)', gap: '16px' }} className="saas-fade-in">
        <RefreshCw className="animate-spin" size={24} />
        <span>Đang tải dữ liệu công việc nhân viên...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="saas-card saas-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <p style={{ color: 'var(--danger)', fontWeight: '600' }}>{error}</p>
        <button onClick={fetchDashboardData} className="btn btn-primary" style={{ height: '38px' }}>
          Thử lại
        </button>
      </div>
    );
  }

  const incidentStats = data?.incidentStats || [];
  const allCustomers = data?.customers || [];

  // Filter & Search logic
  const filteredCustomers = allCustomers.filter(cust => {
    const matchesSearch = cust.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          cust.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterPackage === 'ALL' || cust.package === filterPackage;
    return matchesSearch && matchesFilter;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="saas-fade-in">
      
      {/* Page Header */}
      <PageHeader 
        title={`Cổng Tư Vấn Viên: ${user?.email.split('@')[0]}`} 
        description="Quản lý hồ sơ sự cố bảo hiểm, cập nhật tiến độ bồi thường và theo dõi danh sách khách hàng được phân công."
        actions={actionButtons}
      />

      {/* KPI Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '24px'
      }}>
        <StatCard 
          title="KHÁCH HÀNG PHỤ TRÁCH" 
          value={data?.assignedCustomersCount ?? 0} 
          icon={Users} 
          trend="+2 trong tháng" 
          trendType="up"
          description="Được phân công trực tiếp"
        />
        <StatCard 
          title="SỰ CỐ CẦN XỬ LÝ" 
          value={data?.pendingIncidentsCount ?? 0} 
          icon={AlertTriangle} 
          trend="1 hồ sơ khẩn cấp" 
          trendType="down"
          description="Cần duyệt giấy tờ"
        />
        <StatCard 
          title="ĐÃ GIẢI QUYẾT" 
          value={data?.resolvedIncidentsCount ?? 0} 
          icon={CheckCircle} 
          trend="Đạt 96% mục tiêu" 
          trendType="up"
          description="Hoàn tất chi trả"
        />
        <StatCard 
          title="LỊCH HẸN TƯ VẤN" 
          value={data?.consultations ?? 0} 
          icon={Calendar} 
          trend="Hôm nay có 1 lịch" 
          trendType="up"
          description="Trực tuyến qua Google Meet"
        />
      </div>

      {/* Recharts Bar Chart Block */}
      <div className="saas-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)' }}>Hiệu Suất Giải Quyết Hồ Sơ</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>Thống kê số lượng hồ sơ sự cố (Duyệt bồi thường, Đang xử lý, Chờ duyệt) trong tuần qua.</p>
        </div>

        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={incidentStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--saas-border, #e2e8f0)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--card)', 
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-md)'
                }}
              />
              <Legend verticalAlign="top" height={36} fontSize={12} />
              <Bar dataKey="resolved" name="Đã duyệt" fill="var(--success)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="processing" name="Đang xử lý" fill="var(--info)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" name="Chờ duyệt" fill="var(--warning)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Customers List Section */}
      <div className="saas-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)' }}>Danh Sách Khách Hàng Được Gán</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>Tìm kiếm thông tin liên hệ và trạng thái hoạt động của những khách hàng bạn phụ trách.</p>
        </div>

        {/* Filter row */}
        <SearchFilterBar 
          searchPlaceholder="Tìm kiếm tên khách hàng hoặc email..."
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          filterValue={filterPackage}
          onFilterChange={setFilterPackage}
          filterOptions={[
            { value: 'ALL', label: 'Tất cả các Gói' },
            { value: 'An Sinh Toàn Diện Pro', label: 'An Sinh Toàn Diện' },
            { value: 'Sức Khỏe Vàng', label: 'Sức Khỏe Vàng' },
            { value: 'Bảo Hiểm Xe Máy', label: 'Bảo Hiểm Xe Máy' },
            { value: 'Chưa tham gia', label: 'Chưa tham gia gói' }
          ]}
        />

        {/* DataTable */}
        <DataTable 
          headers={headers} 
          data={filteredCustomers} 
          rowsPerPage={4}
          renderCell={renderCell}
        />
      </div>
    </div>
  );
};

export default EmployeeDashboard;
