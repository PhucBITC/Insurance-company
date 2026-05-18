import React, { useState } from 'react';
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

  // Simulated chart data (Incidents processed)
  const incidentStats = [
    { name: 'Thứ 2', resolved: 4, processing: 2, pending: 1 },
    { name: 'Thứ 3', resolved: 6, processing: 3, pending: 0 },
    { name: 'Thứ 4', resolved: 5, processing: 1, pending: 2 },
    { name: 'Thứ 5', resolved: 8, processing: 2, pending: 1 },
    { name: 'Thứ 6', resolved: 7, processing: 4, pending: 0 },
    { name: 'Thứ 7', resolved: 3, processing: 1, pending: 1 },
  ];

  // Assigned customers data
  const allCustomers = [
    { id: 1, name: 'Nguyễn Văn A', email: 'customer@insurance.com', package: 'An Sinh Toàn Diện Pro', date: '01/01/2026', status: 'ACTIVE' },
    { id: 2, name: 'Trần Thị B', email: 'tranthib@gmail.com', package: 'Sức Khỏe Vàng', date: '12/01/2026', status: 'ACTIVE' },
    { id: 3, name: 'Phạm Văn C', email: 'phamvanc@gmail.com', package: 'Bảo Hiểm Xe Máy', date: '04/02/2026', status: 'PROCESSING' },
    { id: 4, name: 'Lê Hoàng D', email: 'lehoangd@gmail.com', package: 'An Sinh Toàn Diện Pro', date: '19/02/2026', status: 'ACTIVE' },
    { id: 5, name: 'Đặng Minh E', email: 'dangminhe@gmail.com', package: 'Chưa tham gia', date: 'Chưa thiết lập', status: 'PENDING' },
  ];

  // Filter & Search logic
  const filteredCustomers = allCustomers.filter(cust => {
    const matchesSearch = cust.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          cust.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterPackage === 'ALL' || cust.package === filterPackage;
    return matchesSearch && matchesFilter;
  });

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
    <button className="btn btn-secondary" style={{ height: '38px', gap: '6px' }}>
      <RefreshCw size={14} />
      Làm mới công việc
    </button>
  );

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
          value="8" 
          icon={Users} 
          trend="+2 trong tháng" 
          trendType="up"
          description="Được phân công trực tiếp"
        />
        <StatCard 
          title="SỰ CỐ CẦN XỬ LÝ" 
          value="2" 
          icon={AlertTriangle} 
          trend="1 hồ sơ khẩn cấp" 
          trendType="down"
          description="Cần duyệt giấy tờ"
        />
        <StatCard 
          title="ĐÃ GIẢI QUYẾT" 
          value="14" 
          icon={CheckCircle} 
          trend="Đạt 96% mục tiêu" 
          trendType="up"
          description="Hoàn tất chi trả"
        />
        <StatCard 
          title="LỊCH HẸN TƯ VẤN" 
          value="3" 
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
