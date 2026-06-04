import React, { createContext, useState, useEffect, useContext } from 'react';
import { HelpCircle, AlertCircle } from 'lucide-react';

const UIContext = createContext(null);

const translations = {
  vi: {
    // Topbar
    welcomeBack: "Chào mừng trở lại!",
    logout: "Đăng xuất",
    systemTitle: "Hệ thống Quản lý Bảo hiểm Doanh nghiệp",
    // Sidebar
    insurePro: "BẢO AN",
    adminSystem: "Hệ thống Quản trị",
    employeePortal: "Cổng Nhân viên",
    customerPortal: "Cổng Khách hàng",
    navOverview: "Dashboard tổng quan",
    navUsers: "Quản lý tài khoản",
    navPackages: "Gói bảo hiểm",
    navAssignments: "Phân công nhân sự",
    navLogs: "Lịch sử hoạt động",
    
    // Path translations for Sidebar
    "path:/admin/dashboard": "Dashboard tổng quan",
    "path:/admin/users": "Quản lý tài khoản",
    "path:/admin/packages": "Gói bảo hiểm",
    "path:/admin/assignments": "Phân công nhân sự",
    "path:/admin/contracts": "Duyệt yêu cầu gói",
    "path:/admin/incidents": "Sự cố bảo hiểm",
    "path:/admin/logs": "Lịch sử hoạt động",
    "path:/employee/dashboard": "Dashboard nhân viên",
    "path:/employee/customers": "Khách hàng của tôi",
    "path:/employee/contracts": "Duyệt yêu cầu gói",
    "path:/employee/incidents": "Sự cố bảo hiểm",
    "path:/customer/dashboard": "Trang cá nhân",
    "path:/customer/packages": "Mua gói bảo hiểm",
    "path:/customer/my-insurances": "Hợp đồng bảo hiểm",
    "path:/customer/reports": "Báo cáo sự cố",
    "path:/customer/chatbot": "Trợ lý AI chatbot",
    "path:/admin/appointments": "Lịch tư vấn",
    "path:/employee/appointments": "Lịch tư vấn",
    "path:/customer/appointments": "Lịch tư vấn",
    "path:/admin/wiki": "Quản lý tài liệu Wiki",
    "path:/employee/chat": "Hỗ trợ khách hàng",
    "path:/customer/chat": "Trò chuyện hỗ trợ",
    "path:/admin/ai-analyst": "Trợ lý AI hệ thống",
    "path:/employee/ai-assistant": "Trợ lý AI nghiệp vụ",

    // Admin Dashboard
    newPackageBtn: "Gói bảo hiểm mới",
    refreshBtn: "Làm mới dữ liệu",
    dashboardTitle: "Dashboard Tổng Quan",
    dashboardDesc: "Chào mừng bạn đến với Cổng quản trị doanh nghiệp Bảo An. Theo dõi số liệu vận hành và hệ thống bảo hiểm.",
    statTotalUsers: "TỔNG SỐ TÀI KHOẢN",
    statTotalUsersTrend: "+12% tháng này",
    statTotalUsersDesc: "Đang hoạt động tốt",
    statActivePackages: "GÓI BẢO HIỂM ACTIVE",
    statActivePackagesTrend: "Đạt chuẩn MVP",
    statActivePackagesDesc: "Khách hàng có thể mua",
    statAssignments: "PHÂN CÔNG PHỤ TRÁCH",
    statAssignmentsTrend: "+3 mới gán",
    statAssignmentsDesc: "Phục vụ khách hàng tốt",
    statPendingIncidents: "YÊU CẦU SỰ CỐ PENDING",
    statPendingIncidentsTrend: "-25% thời gian xử lý",
    statPendingIncidentsDesc: "Cần nhân viên xử lý ngay",
    chartTitle: "Xu Hướng Đăng Ký Bảo Hiểm",
    chartDesc: "Biểu đồ thống kê số lượt đăng ký mua bảo hiểm mới 6 tháng gần nhất.",
    tableTitle: "Nhật Ký Hoạt Động Hệ Thống",
    tableDesc: "Xem lịch sử các thao tác thay đổi quyền hạn và quản lý của người dùng.",
    tableSearchPlaceholder: "Tìm kiếm hành động hoặc tài khoản...",
    tableHeaderAction: "Hành động nghiệp vụ",
    tableHeaderUser: "Tài khoản",
    tableHeaderTime: "Thời gian",
    tableHeaderStatus: "Trạng thái",
    filterAllRoles: "Tất cả các Role",
    filterAdmin: "Admin",
    filterEmployee: "Nhân viên",
    filterCustomer: "Khách hàng",
  },
  en: {
    // Topbar
    welcomeBack: "Welcome back!",
    logout: "Logout",
    systemTitle: "Enterprise Insurance Management System",
    // Sidebar
    insurePro: "BAO AN",
    adminSystem: "Administration System",
    employeePortal: "Employee Portal",
    customerPortal: "Customer Portal",
    navOverview: "Overview Dashboard",
    navUsers: "Account Management",
    navPackages: "Insurance Packages",
    navAssignments: "Staff Assignment",
    navLogs: "Activity Logs",

    // Path translations for Sidebar
    "path:/admin/dashboard": "Overview Dashboard",
    "path:/admin/users": "Account Management",
    "path:/admin/packages": "Insurance Packages",
    "path:/admin/assignments": "Staff Assignment",
    "path:/admin/contracts": "Approve Contracts",
    "path:/admin/incidents": "Insurance Incidents",
    "path:/admin/logs": "Activity Logs",
    "path:/employee/dashboard": "Employee Dashboard",
    "path:/employee/customers": "My Customers",
    "path:/employee/contracts": "Approve Contracts",
    "path:/employee/incidents": "Insurance Incidents",
    "path:/customer/dashboard": "My Dashboard",
    "path:/customer/packages": "Buy Insurance",
    "path:/customer/my-insurances": "Insurance Contracts",
    "path:/customer/reports": "Report Incident",
    "path:/customer/chatbot": "AI Chatbot Assistant",
    "path:/admin/appointments": "Consultations",
    "path:/employee/appointments": "Consultations",
    "path:/customer/appointments": "Consultations",
    "path:/admin/wiki": "Wiki Documents",
    "path:/employee/chat": "Live Support",
    "path:/customer/chat": "Live Support",
    "path:/admin/ai-analyst": "System AI Analyst",
    "path:/employee/ai-assistant": "Operational AI Assistant",

    // Admin Dashboard
    newPackageBtn: "New Package",
    refreshBtn: "Refresh Data",
    dashboardTitle: "Overview Dashboard",
    dashboardDesc: "Welcome to the Bao An Enterprise Administration Portal. Track operational metrics and insurance systems.",
    statTotalUsers: "TOTAL ACCOUNTS",
    statTotalUsersTrend: "+12% this month",
    statTotalUsersDesc: "Operating successfully",
    statActivePackages: "ACTIVE INSURANCE PACKAGES",
    statActivePackagesTrend: "MVP Standard",
    statActivePackagesDesc: "Available for purchase",
    statAssignments: "STAFF ASSIGNMENTS",
    statAssignmentsTrend: "+3 newly assigned",
    statAssignmentsDesc: "Serving customers well",
    statPendingIncidents: "PENDING INCIDENT REPORTS",
    statPendingIncidentsTrend: "-25% resolution time",
    statPendingIncidentsDesc: "Requires immediate action",
    chartTitle: "Insurance Subscription Trends",
    chartDesc: "Statistical chart of new insurance subscriptions in the last 6 months.",
    tableTitle: "System Activity Logs",
    tableDesc: "View history of user privilege changes and management actions.",
    tableSearchPlaceholder: "Search actions or accounts...",
    tableHeaderAction: "Business Action",
    tableHeaderUser: "Account",
    tableHeaderTime: "Time",
    tableHeaderStatus: "Status",
    filterAllRoles: "All Roles",
    filterAdmin: "Admin",
    filterEmployee: "Employee",
    filterCustomer: "Customer",
  }
};

export const UIProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'vi');

  useEffect(() => {
    // Sync theme to body element
    const body = document.body;
    if (theme === 'dark') {
      body.classList.add('dark');
    } else {
      body.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const [modalConfig, setModalConfig] = useState(null);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  const showAlert = (message, title = '') => {
    return new Promise((resolve) => {
      setModalConfig({
        message,
        title: title || (language === 'vi' ? 'Thông báo' : 'Notification'),
        type: 'alert',
        onConfirm: () => {
          setModalConfig(null);
          resolve(true);
        }
      });
    });
  };

  const showConfirm = (message, title = '') => {
    return new Promise((resolve) => {
      setModalConfig({
        message,
        title: title || (language === 'vi' ? 'Xác nhận' : 'Confirm'),
        type: 'confirm',
        onConfirm: () => {
          setModalConfig(null);
          resolve(true);
        },
        onCancel: () => {
          setModalConfig(null);
          resolve(false);
        }
      });
    });
  };

  useEffect(() => {
    window.alert = (message) => {
      showAlert(message);
    };
    window.confirm = (message) => {
      return showConfirm(message);
    };
  }, [language]);

  return (
    <UIContext.Provider value={{ theme, setTheme, language, setLanguage, toggleTheme, t, showConfirm, showAlert }}>
      {children}
      {modalConfig && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 99999,
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{
            width: '90%',
            maxWidth: '480px',
            backgroundColor: 'var(--card, #1e1e2e)',
            border: '1px solid var(--glass-border, rgba(255, 255, 255, 0.08))',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3), 0 10px 10px -5px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            animation: 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: modalConfig.type === 'confirm' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                color: modalConfig.type === 'confirm' ? 'var(--warning, #eab308)' : 'var(--primary, #6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {modalConfig.type === 'confirm' ? (
                  <HelpCircle size={20} />
                ) : (
                  <AlertCircle size={20} />
                )}
              </div>
              <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main, #ffffff)' }}>
                {modalConfig.title}
              </h4>
            </div>

            {/* Message Body */}
            <p style={{
              margin: 0,
              fontSize: '0.925rem',
              lineHeight: '1.6',
              color: 'var(--text-secondary, #b3b3b3)',
              whiteSpace: 'pre-wrap'
            }}>
              {modalConfig.message}
            </p>

            {/* Footer Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
              {modalConfig.type === 'confirm' && (
                <button
                  type="button"
                  onClick={modalConfig.onCancel}
                  className="btn btn-secondary"
                  style={{
                    height: '38px',
                    padding: '0 18px',
                    fontSize: '0.85rem',
                    borderRadius: '8px',
                    borderColor: 'var(--glass-border, rgba(255,255,255,0.08))',
                    color: 'var(--text-muted, #808080)',
                    cursor: 'pointer'
                  }}
                >
                  {language === 'vi' ? 'Hủy bỏ' : 'Cancel'}
                </button>
              )}
              <button
                type="button"
                onClick={modalConfig.onConfirm}
                className="btn btn-primary"
                style={{
                  height: '38px',
                  padding: '0 18px',
                  fontSize: '0.85rem',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                {language === 'vi' ? 'Xác nhận' : 'OK'}
              </button>
            </div>
          </div>

          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes scaleIn {
              from { transform: scale(0.95); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
