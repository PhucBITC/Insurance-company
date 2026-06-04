import React from 'react';
import AppLayout from '../components/AppLayout';
import { 
  LayoutDashboard, 
  Users, 
  AlertTriangle,
  FileCheck,
  Calendar,
  MessageSquare,
  Sparkles
} from 'lucide-react';

const EmployeeLayout = () => {
  const navItems = [
    { path: '/employee/dashboard', name: 'Dashboard Nhân Viên', icon: LayoutDashboard },
    { path: '/employee/customers', name: 'Khách Hàng Của Tôi', icon: Users },
    { path: '/employee/contracts', name: 'Duyệt yêu cầu gói', icon: FileCheck },
    { path: '/employee/incidents', name: 'Sự Cố Bảo Hiểm', icon: AlertTriangle },
    { path: '/employee/appointments', name: 'Lịch tư vấn', icon: Calendar },
    { path: '/employee/chat', name: 'Hỗ trợ khách hàng', icon: MessageSquare },
    { path: '/employee/ai-assistant', name: 'Trợ lý AI nghiệp vụ', icon: Sparkles },
  ];

  return <AppLayout navItems={navItems} />;
};

export default EmployeeLayout;
