import React from 'react';
import AppLayout from '../components/AppLayout';
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  FileText, 
  Activity,
  FileCheck,
  AlertTriangle
} from 'lucide-react';

const AdminLayout = () => {
  const navItems = [
    { path: '/admin/dashboard', name: 'Dashboard tổng quan', icon: LayoutDashboard },
    { path: '/admin/users', name: 'Quản lý tài khoản', icon: Shield },
    { path: '/admin/packages', name: 'Gói bảo hiểm', icon: FileText },
    { path: '/admin/contracts', name: 'Duyệt yêu cầu gói', icon: FileCheck },
    { path: '/admin/assignments', name: 'Phân công nhân sự', icon: Users },
    { path: '/admin/incidents', name: 'Sự cố bảo hiểm', icon: AlertTriangle },
    { path: '/admin/logs', name: 'Lịch sử hoạt động', icon: Activity },
  ];

  return <AppLayout navItems={navItems} />;
};

export default AdminLayout;
