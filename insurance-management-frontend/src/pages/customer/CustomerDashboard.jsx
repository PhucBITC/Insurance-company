import React from 'react';
import { 
  Heart, 
  ShieldCheck, 
  HelpCircle, 
  Sparkles,
  ArrowRight,
  Send,
  MessageSquare,
  FileCheck,
  AlertTriangle
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';

const CustomerDashboard = () => {
  const actionButtons = (
    <button className="btn btn-primary" style={{ height: '38px', gap: '6px' }}>
      <Sparkles size={14} />
      Ưu đãi thành viên
    </button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="saas-fade-in">
      
      {/* Page Header */}
      <PageHeader 
        title="Trang Cá Nhân Khách Hàng" 
        description="Chào mừng bạn đến với Cổng bảo hiểm Bảo An. Dễ dàng xem hợp đồng hiện có, tạo báo cáo sự cố hoặc hỏi đáp trợ lý ảo."
        actions={actionButtons}
      />

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '24px'
      }}>
        <StatCard 
          title="HỢP ĐỒNG ĐANG HOẠT ĐỘNG" 
          value="1 Gói" 
          icon={ShieldCheck} 
          trend="Đang bảo vệ" 
          trendType="up"
          description="Gói An Sinh Toàn Diện"
        />
        <StatCard 
          title="YÊU CẦU BỒI THƯỜNG" 
          value="0" 
          icon={AlertTriangle} 
          trend="Không có sự cố" 
          trendType="up"
          description="Hồ sơ bồi thường sạch"
        />
        <StatCard 
          title="NGÀY ĐÓNG PHÍ KẾ TIẾP" 
          value="01/01/2027" 
          icon={FileCheck} 
          trend="Đã thanh toán" 
          trendType="up"
          description="Đóng phí hàng năm"
        />
        <StatCard 
          title="TƯ VẤN VIÊN RIÊNG" 
          value="Nguyễn Văn B" 
          icon={MessageSquare} 
          trend="Đang trực tuyến" 
          trendType="up"
          description="employee@insurance.com"
        />
      </div>

      {/* Main Details Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '28px'
      }}>
        
        {/* Active Policy Detail Card */}
        <div className="saas-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ 
            fontSize: '1rem', 
            fontWeight: '600', 
            borderBottom: '1px solid var(--border)', 
            paddingBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <ShieldCheck size={18} style={{ color: 'var(--primary)' }} />
            Chi tiết Hợp đồng Bảo hiểm Active
          </h3>

          <div style={{
            backgroundColor: 'var(--background)',
            border: '1px solid var(--border)',
            padding: '18px',
            borderRadius: 'var(--radius-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <StatusBadge status="ACTIVE" />
                <h4 style={{ fontSize: '1rem', fontWeight: '700', marginTop: '8px', color: 'var(-- Saas-text-main, #0f172a)' }}>
                  Gói An Sinh Toàn Diện Pro
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mã hợp đồng: #HD-92810</span>
              </div>
              <Heart size={24} style={{ color: 'var(--danger)', fill: 'rgba(220, 38, 38, 0.05)' }} />
            </div>

            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '8px', 
              fontSize: '0.85rem', 
              color: '#334155',
              borderTop: '1px solid var(--border)',
              paddingTop: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Ngày bắt đầu:</span>
                <strong>01/01/2026</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Ngày đáo hạn:</span>
                <strong>01/01/2027</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Hạn mức chi trả:</span>
                <strong style={{ color: 'var(--primary)' }}>500,000,000đ</strong>
              </div>
            </div>
          </div>

          <button className="btn btn-secondary" style={{ width: '100%', gap: '8px', height: '38px' }}>
            <span>Xem điều khoản & Điều kiện bảo hiểm</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* My Consultant Details */}
        <div className="saas-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ 
            fontSize: '1rem', 
            fontWeight: '600', 
            borderBottom: '1px solid var(--border)', 
            paddingBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <MessageSquare size={18} style={{ color: 'var(--warning)' }} />
            Tư vấn viên Chăm sóc của bạn
          </h3>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            backgroundColor: 'var(--background)',
            padding: '16px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '1rem'
            }}>
              NVB
            </div>
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '750', color: 'var(--text-main)' }}>Nguyễn Văn B (Staff)</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>employee@insurance.com</p>
              <div style={{ marginTop: '4px' }}>
                <StatusBadge status="ROLE_EMPLOYEE" />
              </div>
            </div>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            Nhân viên tư vấn riêng chịu trách nhiệm giải thích các quyền lợi, hướng dẫn làm giấy tờ bồi thường khi bạn gặp sự cố và hỗ trợ tái ký hợp đồng.
          </p>

          <button className="btn btn-primary" style={{ width: '100%', gap: '8px', height: '38px' }}>
            <Send size={14} />
            <span>Gửi tin nhắn hỗ trợ trực tiếp</span>
          </button>
        </div>
      </div>

      {/* Quick shortcuts row */}
      <div className="saas-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>Bạn muốn thực hiện thao tác nào?</h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {[
            { title: "Khai báo tai nạn / Yêu cầu bồi thường", desc: "Tạo phiếu báo cáo sự cố (ảnh hiện trường, hóa đơn viện phí) để yêu cầu chi trả bồi thường bảo hiểm nhanh chóng.", icon: AlertTriangle, color: "var(--danger)" },
            { title: "Mua gói bảo hiểm mới trực tuyến", desc: "Khám phá danh sách các gói bảo hiểm sức khỏe, xe máy, tài sản đang active với quy trình duyệt tự động.", icon: Heart, color: "var(--primary)" },
            { title: "Trò chuyện với chatbot tư vấn AI", desc: "Đặt câu hỏi trực tiếp cho trợ lý ảo về quy chế bồi thường, điều khoản miễn trừ trách nhiệm của hợp đồng.", icon: HelpCircle, color: "var(--info)" }
          ].map((action, idx) => {
            const Icon = action.icon;
            return (
              <div key={idx} className="saas-card saas-card-hover" style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                cursor: 'pointer',
                backgroundColor: '#ffffff'
              }}>
                <div style={{
                  color: action.color,
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  width: '36px',
                  height: '36px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={16} />
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)' }}>{action.title}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', flexGrow: 1 }}>{action.desc}</p>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  color: 'var(--primary)',
                  marginTop: '8px'
                }}>
                  <span>Bắt đầu thực hiện</span>
                  <ArrowRight size={12} />
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
