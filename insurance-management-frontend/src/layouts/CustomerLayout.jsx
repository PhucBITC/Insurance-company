import React from 'react';
import AppLayout from '../components/AppLayout';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  FileCheck, 
  AlertTriangle, 
  MessageSquareCode,
  Calendar
} from 'lucide-react';

const CustomerLayout = () => {
  const navItems = [
    { path: '/customer/dashboard', name: 'Trang Cá Nhân', icon: LayoutDashboard },
    { path: '/customer/packages', name: 'Mua Gói Bảo Hiểm', icon: ShoppingBag },
    { path: '/customer/my-insurances', name: 'Hợp Đồng Bảo Hiểm', icon: FileCheck },
    { path: '/customer/reports', name: 'Báo Cáo Sự Cố', icon: AlertTriangle },
    { path: '/customer/chatbot', name: 'Trợ Lý AI Chatbot', icon: MessageSquareCode },
    { path: '/customer/appointments', name: 'Lịch tư vấn', icon: Calendar },
  ];

  return <AppLayout navItems={navItems} />;
};

export default CustomerLayout;
