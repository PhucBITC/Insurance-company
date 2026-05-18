import React from 'react';
import AppLayout from '../components/AppLayout';
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  FileText, 
  Activity 
} from 'lucide-react';

const AdminLayout = () => {
  const navItems = [
    { path: '/admin/dashboard', name: 'Dashboard Tổng Quan', icon: LayoutDashboard },
    { path: '/admin/users', name: 'Quản lý Tài khoản', icon: Shield },
    { path: '/admin/packages', name: 'Gói Bảo Hiểm', icon: FileText },
    { path: '/admin/assignments', name: 'Phân Công Nhân Sự', icon: Users },
    { path: '/admin/logs', name: 'Lịch Sử Hoạt Động', icon: Activity },
  ];

  return <AppLayout navItems={navItems} />;
};

export default AdminLayout;
