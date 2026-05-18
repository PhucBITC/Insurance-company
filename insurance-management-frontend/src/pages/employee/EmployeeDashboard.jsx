import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Calendar,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

const EmployeeDashboard = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Khách hàng phụ trách', value: '8', icon: Users, color: 'var(--info)', desc: '2 khách hàng mới tuần này' },
    { label: 'Sự cố cần xử lý', value: '2', icon: AlertTriangle, color: 'var(--warning)', desc: '1 yêu cầu bồi thường khẩn cấp' },
    { label: 'Đã giải quyết tháng này', value: '14', icon: CheckCircle, color: 'var(--success)', desc: 'Tỷ lệ hài lòng 96%' },
    { label: 'Lịch hẹn tư vấn', value: '3', icon: Calendar, color: 'var(--primary)', desc: 'Hôm nay có 1 lịch hẹn' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="animate-fade-in">
      {/* Welcome Banner */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        padding: '32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px', color: 'white' }}>Xin chào, {user?.email.split('@')[0]}! 👋</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Chào mừng trở lại cổng thông tin Nhân Viên. Hãy kiểm tra các yêu cầu sự cố và khách hàng mới cần hỗ trợ hôm nay.</p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255,255,255,0.05)',
          padding: '8px 16px',
          borderRadius: '9999px',
          fontSize: '0.85rem',
          border: '1px solid var(--glass-border)'
        }}>
          <TrendingUp size={16} style={{ color: 'var(--success)' }} />
          <span>Hoàn thành 88% KPI tháng</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '24px'
      }}>
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="glass-card" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Glow background */}
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: stat.color,
                filter: 'blur(40px)',
                opacity: 0.15,
                pointerEvents: 'none'
              }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{stat.label}</span>
                <div style={{
                  background: `rgba(255,255,255,0.03)`,
                  border: '1px solid var(--glass-border)',
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: stat.color
                }}>
                  <Icon size={20} />
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '2.2rem', fontWeight: '800', lineHeight: 1 }}>{stat.value}</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>{stat.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Queue & Customer Reminders */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '32px'
      }}>
        {/* Task Queue */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>Công việc cần làm ngay</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { title: "Duyệt yêu cầu bồi thường tai nạn xe máy", code: "#SR-9810", type: "Urgent" },
              { title: "Liên hệ tư vấn gói bảo hiểm Gia Đình An Vui", code: "#C-2819", type: "Normal" },
              { title: "Yêu cầu bổ sung chứng từ viện phí", code: "#SR-9755", type: "Action Needed" }
            ].map((task, idx) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.01)',
                border: '1px solid var(--glass-border)',
                padding: '16px',
                borderRadius: 'var(--radius-md)'
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{task.code}</span>
                  <p style={{ fontSize: '0.9rem', fontWeight: '600', color: 'white', marginTop: '2px' }}>{task.title}</p>
                </div>
                <span className="badge" style={{
                  fontSize: '0.7rem',
                  background: task.type === 'Urgent' ? 'rgba(239, 68, 68, 0.15)' : task.type === 'Normal' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: task.type === 'Urgent' ? 'var(--danger)' : task.type === 'Normal' ? 'var(--info)' : 'var(--warning)',
                  border: `1px solid ${task.type === 'Urgent' ? 'rgba(239,68,68,0.25)' : task.type === 'Normal' ? 'rgba(59,130,246,0.25)' : 'rgba(245,158,11,0.25)'}`
                }}>{task.type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Assigned Customers */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>Khách hàng chăm sóc gần đây</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { name: "Nguyễn Văn A", email: "customer@insurance.com", packages: "Gói An Sinh Toàn Diện" },
              { name: "Trần Thị B", email: "tranthib@gmail.com", packages: "Gói Sức Khỏe Vàng" },
              { name: "Phạm Văn C", email: "phamvanc@gmail.com", packages: "Chưa tham gia gói" }
            ].map((cust, idx) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: idx < 2 ? '1px solid rgba(255,255,255,0.02)' : 'none'
              }}>
                <div>
                  <p style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{cust.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cust.email}</p>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{cust.packages}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
