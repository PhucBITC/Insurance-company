import React, { useState, useEffect } from 'react';
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
import apiClient from '../../api/apiClient';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/admin/dashboard');
      setData(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(language === 'vi' ? 'Không thể tải dữ liệu thống kê từ hệ thống.' : 'Failed to load system metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
      <button 
        onClick={fetchDashboardData} 
        className="btn btn-secondary" 
        style={{ height: '38px', gap: '6px' }}
      >
        <RefreshCw size={14} />
        {t('refreshBtn')}
      </button>
      <button 
        className="btn btn-primary" 
        style={{ height: '38px', gap: '6px' }}
        onClick={() => window.location.href = '/admin/packages'}
      >
        <PlusCircle size={16} />
        {t('newPackageBtn')}
      </button>
    </>
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '400px', color: 'var(--text-muted)', gap: '16px' }} className="animate-fade-in">
        <RefreshCw className="animate-spin" size={24} />
        <span>{language === 'vi' ? 'Đang tải dữ liệu dashboard...' : 'Loading dashboard metrics...'}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="saas-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <p style={{ color: 'var(--danger)', fontWeight: '600' }}>{error}</p>
        <button onClick={fetchDashboardData} className="btn btn-primary" style={{ height: '38px' }}>
          {language === 'vi' ? 'Thử lại' : 'Retry'}
        </button>
      </div>
    );
  }

  const chartData = data?.chartData || [];
  const allLogs = data?.logs || [];

  // Filter & Search logic
  const filteredLogs = allLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRole === 'ALL' || log.role === filterRole;
    return matchesSearch && matchesFilter;
  });

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
          value={data?.totalUsers ?? 0} 
          icon={Users} 
          trend={t('statTotalUsersTrend')} 
          trendType="up"
          description={t('statTotalUsersDesc')}
        />
        <StatCard 
          title={t('statActivePackages')} 
          value={data?.activePackages ?? 0} 
          icon={FileText} 
          trend={t('statActivePackagesTrend')}
          trendType="up"
          description={t('statActivePackagesDesc')}
        />
        <StatCard 
          title={t('statAssignments')} 
          value={data?.totalAssignments ?? 0} 
          icon={UserCheck} 
          trend={t('statAssignmentsTrend')} 
          trendType="up"
          description={t('statAssignmentsDesc')}
        />
        <StatCard 
          title={t('statPendingIncidents')} 
          value={data?.pendingIncidents ?? 0} 
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
