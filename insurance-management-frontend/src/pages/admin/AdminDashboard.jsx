import React, { useState } from 'react';
import { 
  Users, 
  FileText, 
  UserCheck, 
  Activity, 
  PlusCircle, 
  RefreshCw
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import SearchFilterBar from '../../components/SearchFilterBar';
import { useUI } from '../../context/UIContext';

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
  const { t, language } = useUI();
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
    { 
      id: 1, 
      action: language === 'vi' ? 'Tạo gói bảo hiểm "Gia Đình An Vui"' : 'Created insurance package "Happy Family"', 
      user: 'admin@insurance.com', 
      role: 'ROLE_ADMIN', 
      time: language === 'vi' ? '10 phút trước' : '10 minutes ago', 
      status: 'SUCCESS' 
    },
    { 
      id: 2, 
      action: language === 'vi' ? 'Đăng ký tài khoản khách hàng mới' : 'Registered new customer account', 
      user: 'customer@insurance.com', 
      role: 'ROLE_CUSTOMER', 
      time: language === 'vi' ? '25 phút trước' : '25 minutes ago', 
      status: 'SUCCESS' 
    },
    { 
      id: 3, 
      action: language === 'vi' ? 'Phân công khách hàng cho nhân viên' : 'Assigned customer to support employee', 
      user: 'admin@insurance.com', 
      role: 'ROLE_ADMIN', 
      time: language === 'vi' ? '1 giờ trước' : '1 hour ago', 
      status: 'SUCCESS' 
    },
    { 
      id: 4, 
      action: language === 'vi' ? 'Cập nhật trạng thái sự cố #SR-409' : 'Updated incident report #SR-409 status', 
      user: 'employee@insurance.com', 
      role: 'ROLE_EMPLOYEE', 
      time: language === 'vi' ? '2 giờ trước' : '2 hours ago', 
      status: 'WARNING' 
    },
    { 
      id: 5, 
      action: language === 'vi' ? 'Thử nghiệm truy cập API trái phép' : 'Unauthorized API access attempt', 
      user: 'unknown@test.com', 
      role: 'UNKNOWN', 
      time: language === 'vi' ? '4 giờ trước' : '4 hours ago', 
      status: 'DANGER' 
    },
    { 
      id: 6, 
      action: language === 'vi' ? 'Thay đổi cấu hình hệ thống bảo mật' : 'Modified security system configurations', 
      user: 'admin@insurance.com', 
      role: 'ROLE_ADMIN', 
      time: language === 'vi' ? '1 ngày trước' : '1 day ago', 
      status: 'SUCCESS' 
    },
  ];

  // Filter & Search logic
  const filteredLogs = allLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRole === 'ALL' || log.role === filterRole;
    return matchesSearch && matchesFilter;
  });

  const headers = [
    { label: t('tableHeaderAction'), key: 'action' },
    { label: t('tableHeaderUser'), key: 'user' },
    { label: t('tableHeaderTime'), key: 'time' },
    { label: t('tableHeaderStatus'), key: 'status', width: '120px' }
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
        {t('refreshBtn')}
      </button>
      <button className="btn btn-primary" style={{ height: '38px', gap: '6px' }}>
        <PlusCircle size={16} />
        {t('newPackageBtn')}
      </button>
    </>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      
      {/* Page Header */}
      <PageHeader 
        title={t('dashboardTitle')} 
        description={t('dashboardDesc')}
        actions={actionButtons}
      />

      {/* KPI Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '24px'
      }}>
        <StatCard 
          title={t('statTotalUsers')} 
          value="24" 
          icon={Users} 
          trend={t('statTotalUsersTrend')} 
          trendType="up"
          description={t('statTotalUsersDesc')}
        />
        <StatCard 
          title={t('statActivePackages')} 
          value="6" 
          icon={FileText} 
          trend={t('statActivePackagesTrend')}
          trendType="up"
          description={t('statActivePackagesDesc')}
        />
        <StatCard 
          title={t('statAssignments')} 
          value="18" 
          icon={UserCheck} 
          trend={t('statAssignmentsTrend')} 
          trendType="up"
          description={t('statAssignmentsDesc')}
        />
        <StatCard 
          title={t('statPendingIncidents')} 
          value="3" 
          icon={Activity} 
          trend={t('statPendingIncidentsTrend')} 
          trendType="down"
          description={t('statPendingIncidentsDesc')}
        />
      </div>

      {/* Analytics Chart Block */}
      <div className="saas-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)' }}>{t('chartTitle')}</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{t('chartDesc')}</p>
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
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)' }}>{t('tableTitle')}</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{t('tableDesc')}</p>
        </div>

        {/* Filter controls */}
        <SearchFilterBar 
          searchPlaceholder={t('tableSearchPlaceholder')}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          filterValue={filterRole}
          onFilterChange={setFilterRole}
          filterOptions={[
            { value: 'ALL', label: t('filterAllRoles') },
            { value: 'ROLE_ADMIN', label: t('filterAdmin') },
            { value: 'ROLE_EMPLOYEE', label: t('filterEmployee') },
            { value: 'ROLE_CUSTOMER', label: t('filterCustomer') }
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
