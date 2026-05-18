import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  Shield, 
  FileText, 
  Activity, 
  PlusCircle, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Tổng số tài khoản', value: '24', icon: Users, color: 'var(--primary)', desc: '+3 đăng ký mới tuần này' },
    { label: 'Gói bảo hiểm ACTIVE', value: '6', icon: FileText, color: 'var(--secondary)', desc: '2 gói bảo hiểm đặc biệt' },
    { label: 'Đã phân công', value: '18', icon: Shield, color: 'var(--accent)', desc: '98% khách hàng được chăm sóc' },
    { label: 'Yêu cầu sự cố PENDING', value: '3', icon: Activity, color: 'var(--danger)', desc: 'Cần giải quyết ngay' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="animate-fade-in">
      {/* Welcome Banner */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        padding: '32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px', color: 'white' }}>Xin chào, Quản trị viên! 👋</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Chào mừng trở lại bảng điều khiển Admin. Dưới đây là thông số vận hành tổng quan hệ thống hôm nay.</p>
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
          <TrendingUp size={16} style={{ color: 'var(--accent)' }} />
          <span>Hệ thống hoạt động bình thường</span>
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

      {/* Quick Actions & Recent Logs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '32px'
      }}>
        {/* Actions Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>Thao tác nhanh</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button className="btn btn-primary" style={{ justifyContent: 'space-between', padding: '16px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <PlusCircle size={18} />
                Tạo Gói Bảo Hiểm Mới
              </span>
              <ArrowRight size={16} />
            </button>

            <button className="btn btn-secondary" style={{ justifyContent: 'space-between', padding: '16px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users size={18} style={{ color: 'var(--primary)' }} />
                Phân công Khách hàng cho Nhân viên
              </span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Audit Log Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>Nhật ký hệ thống gần đây</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { text: "Admin đã tạo gói bảo hiểm 'Gia Đình An Vui'", time: "5 phút trước", status: "success" },
              { text: "Khách hàng customer@insurance.com đã đăng nhập", time: "12 phút trước", status: "info" },
              { text: "Nhân viên employee@insurance.com cập nhật sự cố #SR-409", time: "1 giờ trước", status: "warning" },
            ].map((log, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.85rem',
                borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.02)' : 'none',
                paddingBottom: i < 2 ? '12px' : '0'
              }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: log.status === 'success' ? 'var(--success)' : log.status === 'info' ? 'var(--info)' : 'var(--warning)'
                  }} />
                  <span style={{ color: 'var(--text-primary)' }}>{log.text}</span>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
