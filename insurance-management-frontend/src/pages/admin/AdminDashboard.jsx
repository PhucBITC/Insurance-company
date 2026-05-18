import React, { useState } from 'react';
import { 
  Users, 
  FileText, 
  UserCheck, 
  Activity, 
  PlusCircle, 
  Settings, 
  RefreshCw,
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
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';

const AdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');

  // Simulated chart data
  const chartData = [
    { name: 'T1', subscriptions: 12, revenue: 120000000 },
    { name: 'T2', subscriptions: 19, revenue: 185000000 },
    { name: 'T3', subscriptions: 15, revenue: 150000000 },
    { name: 'T4', subscriptions: 28, revenue: 260000000 },
    { name: 'T5', subscriptions: 34, revenue: 320000000 },
    { name: 'T6', subscriptions: 45, revenue: 410000000 },
  ];

  // Simulated audit logs
  const allLogs = [
    { id: 1, action: 'Tạo gói bảo hiểm "Gia Đình An Vui"', user: 'admin@insurance.com', role: 'ROLE_ADMIN', time: '10 phút trước', status: 'SUCCESS' },
    { id: 2, action: 'Đăng ký tài khoản khách hàng mới', user: 'customer@insurance.com', role: 'ROLE_CUSTOMER', time: '25 phút trước', status: 'SUCCESS' },
    { id: 3, action: 'Phân công khách hàng cho nhân viên', user: 'admin@insurance.com', role: 'ROLE_ADMIN', time: '1 giờ trước', status: 'SUCCESS' },
    { id: 4, action: 'Cập nhật trạng thái sự cố #SR-409', user: 'employee@insurance.com', role: 'ROLE_EMPLOYEE', time: '2 giờ trước', status: 'WARNING' },
    { id: 5, action: 'Thử nghiệm truy cập API trái phép', user: 'unknown@test.com', role: 'UNKNOWN', time: '4 giờ trước', status: 'DANGER' },
    { id: 6, action: 'Thay đổi cấu hình hệ thống bảo mật', user: 'admin@insurance.com', role: 'ROLE_ADMIN', time: '1 ngày trước', status: 'SUCCESS' },
  ];

  // Filter & Search logic
  const filteredLogs = allLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRole === 'ALL' || log.role === filterRole;
    return matchesSearch && matchesFilter;
  });

  const headers = [
    { label: 'Hành động nghiệp vụ', key: 'action' },
    { label: 'Tài khoản', key: 'user' },
    { label: 'Thời gian', key: 'time' },
    { label: 'Trạng thái', key: 'status', width: '120px' }
  ];

  // Custom table cell renderer
  const renderCell = (row, key, value) => {
    if (key === 'status') {
      return <StatusBadge status={value} />;
    }
    if (key === 'user') {
      return <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{value}</span>;
    }
    if (key === 'action') {
      return <strong style={{ color: 'var(--text-main)' }}>{value}</strong>;
    }
    return value;
  };

  const actionButtons = (
    <>
      <button className="btn btn-secondary" style={{ height: '38px', gap: '6px' }}>
        <RefreshCw size={14} />
        Làm mới dữ liệu
      </button>
      <button className="btn btn-primary" style={{ height: '38px', gap: '6px' }}>
        <PlusCircle size={16} />
        Gói Bảo Hiểm Mới
      </button>
    </>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      
      {/* Page Header */}
      <PageHeader 
        title="Dashboard Tổng Quan" 
        description="Chào mừng bạn đến với Cổng quản trị doanh nghiệp InsurePro. Theo dõi số liệu vận hành và hệ thống bảo hiểm."
        actions={actionButtons}
      />

      {/* KPI Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '24px'
      }}>
        <StatCard 
          title="TỔNG SỐ TÀI KHOẢN" 
          value="24" 
          icon={Users} 
          trend="+12% tháng này" 
          trendType="up"
          description="Đang hoạt động tốt"
        />
        <StatCard 
          title="GÓI BẢO HIỂM ACTIVE" 
          value="6" 
          icon={FileText} 
          trend="Đạt chuẩn MVP"
          trendType="up"
          description="Khách hàng có thể mua"
        />
        <StatCard 
          title="PHÂN CÔNG PHỤ TRÁCH" 
          value="18" 
          icon={UserCheck} 
          trend="+3 mới gán" 
          trendType="up"
          description="Phục vụ khách hàng tốt"
        />
        <StatCard 
          title="YÊU CẦU SỰ CỐ PENDING" 
          value="3" 
          icon={Activity} 
          trend="-25% thời gian xử lý" 
          trendType="down"
          description="Cần nhân viên xử lý ngay"
        />
      </div>

      {/* Analytics Chart Block */}
      <div className="saas-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)' }}>Xu Hướng Đăng Ký Bảo Hiểm</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>Biểu đồ thống kê số lượt đăng ký mua bảo hiểm mới 6 tháng gần nhất.</p>
        </div>

        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.01}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
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
              <Area type="monotone" dataKey="subscriptions" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorSub)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Logs Table Section */}
      <div className="saas-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)' }}>Nhật Ký Hoạt Động Hệ Thống</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>Xem lịch sử các thao tác thay đổi quyền hạn và quản lý của người dùng.</p>
        </div>

        {/* Filter controls */}
        <SearchFilterBar 
          searchPlaceholder="Tìm kiếm hành động hoặc tài khoản..."
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          filterValue={filterRole}
          onFilterChange={setFilterRole}
          filterOptions={[
            { value: 'ALL', label: 'Tất cả các Role' },
            { value: 'ROLE_ADMIN', label: 'Admin' },
            { value: 'ROLE_EMPLOYEE', label: 'Nhân viên' },
            { value: 'ROLE_CUSTOMER', label: 'Khách hàng' }
          ]}
        />

        {/* Table Component */}
        <DataTable 
          headers={headers} 
          data={filteredLogs} 
          rowsPerPage={4}
          renderCell={renderCell}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
