import React, { createContext, useState, useEffect, useContext } from 'react';

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

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <UIContext.Provider value={{ theme, setTheme, language, setLanguage, toggleTheme, t }}>
      {children}
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
