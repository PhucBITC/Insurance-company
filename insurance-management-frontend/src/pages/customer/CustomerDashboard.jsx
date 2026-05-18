import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Heart, 
  ShieldCheck, 
  HelpCircle, 
  Sparkles,
  ArrowRight,
  Send,
  MessageSquare
} from 'lucide-react';

const CustomerDashboard = () => {
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="animate-fade-in">
      {/* Welcome Banner */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
        border: '1px solid rgba(20, 184, 166, 0.2)',
        padding: '32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px', color: 'white' }}>Chào mừng bạn, Khách hàng thân thiết! ❤️</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Chào mừng đến với cổng thông tin khách hàng Insure Pro. Dưới đây là các quyền lợi và thông tin bảo hiểm hiện tại của bạn.</p>
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
          <Sparkles size={16} style={{ color: 'var(--accent)' }} />
          <span>Tài khoản Đã kích hoạt</span>
        </div>
      </div>

      {/* Grid of Main Details */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '32px'
      }}>
        {/* Active Insurances */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} style={{ color: 'var(--accent)' }} />
            Gói bảo hiểm đang tham gia
          </h3>
          <div style={{
            background: 'rgba(255,255,255,0.01)',
            border: '1px solid rgba(20, 184, 166, 0.2)',
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span className="badge badge-customer" style={{ fontSize: '0.65rem' }}>ĐANG HOẠT ĐỘNG</span>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginTop: '8px', color: 'white' }}>An Sinh Toàn Diện Pro</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mã hợp đồng: #HD-92810</p>
              </div>
              <Heart size={28} style={{ color: 'var(--accent)', fill: 'rgba(20, 184, 166, 0.1)' }} />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span>Ngày bắt đầu: 01/01/2026</span>
              <span>Hạn mức: 500,000,000đ</span>
            </div>
          </div>
          
          <button className="btn btn-secondary" style={{ width: '100%', gap: '8px', fontSize: '0.85rem' }}>
            Xem chi tiết hợp đồng
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Advisor & Support */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={20} style={{ color: 'var(--primary)' }} />
            Nhân viên hỗ trợ của bạn
          </h3>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: 'rgba(255,255,255,0.02)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--glass-border)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '1.2rem'
            }}>
              E
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>Nguyễn Văn B (Staff)</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>employee@insurance.com</p>
              <span className="badge badge-employee" style={{ fontSize: '0.6rem', padding: '2px 6px', marginTop: '4px' }}>TƯ VẤN VIÊN RIÊNG</span>
            </div>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Nhân viên tư vấn riêng của bạn chịu trách nhiệm hỗ trợ duyệt hồ sơ và hướng dẫn bạn bồi thường bảo hiểm khi xảy ra sự cố.
          </p>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-primary" style={{ flexGrow: 1, gap: '8px', fontSize: '0.85rem' }}>
              <Send size={14} />
              Gửi tin nhắn tư vấn
            </button>
          </div>
        </div>
      </div>

      {/* Action shortcuts */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>Bạn cần làm gì hôm nay?</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {[
            { title: "Khai báo tai nạn / Sự cố bảo hiểm", desc: "Tạo báo cáo sự cố để yêu cầu chi trả bồi thường viện phí, tai nạn.", icon: AlertTriangle, color: "var(--danger)" },
            { title: "Khám phá các gói bảo hiểm mới", desc: "Tìm hiểu thêm các gói bảo hiểm sức khỏe, tài sản, nhân thọ đang active.", icon: Heart, color: "var(--primary)" },
            { title: "Hỏi trợ lý ảo chatbot AI", desc: "Tra cứu điều khoản bảo hiểm, chính sách bồi thường nhanh chóng 24/7.", icon: HelpCircle, color: "var(--accent)" }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="glass-card" style={{
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                background: 'rgba(255,255,255,0.01)',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)'
              }}>
                <div style={{
                  color: item.color,
                  background: 'rgba(255,255,255,0.02)',
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--glass-border)'
                }}>
                  <Icon size={18} />
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'white' }}>{item.title}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', flexGrow: 1 }}>{item.desc}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: item.color, fontWeight: 'bold', marginTop: '8px' }}>
                  <span>Thực hiện ngay</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
