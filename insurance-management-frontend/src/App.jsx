import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UIProvider } from './context/UIContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import EmployeeLayout from './layouts/EmployeeLayout';
import CustomerLayout from './layouts/CustomerLayout';

// Core Pages
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersManagement from './pages/admin/UsersManagement';
import PackagesManagement from './pages/admin/PackagesManagement';
import InsuranceApprovals from './pages/admin/InsuranceApprovals';
import AssignmentsManagement from './pages/admin/AssignmentsManagement';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import MyCustomers from './pages/employee/MyCustomers';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerPackages from './pages/customer/CustomerPackages';
import MyInsurances from './pages/customer/MyInsurances';


// Helper redirect component for root "/"
const HomeRedirect = () => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  if (user.role === 'ROLE_ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (user.role === 'ROLE_EMPLOYEE') {
    return <Navigate to="/employee/dashboard" replace />;
  } else {
    return <Navigate to="/customer/dashboard" replace />;
  }
};

// Elegant Auxiliary Placeholder Page Generator
const PlaceholderPage = ({ title, desc }) => (
  <div className="glass-card animate-fade-in" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
    <h2 style={{ fontSize: '1.6rem', color: 'white', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>{title}</h2>
    <p style={{ color: 'var(--text-secondary)' }}>{desc}</p>
    <div style={{
      background: 'rgba(255,255,255,0.01)',
      border: '1px solid var(--glass-border)',
      borderRadius: 'var(--radius-md)',
      padding: '48px',
      textAlign: 'center',
      color: 'var(--text-muted)',
      fontStyle: 'italic'
    }}>
      Tính năng đang được phát triển tiếp theo trong Giai đoạn 2 của MVP
    </div>
  </div>
);

function App() {
  return (
    <UIProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<LoginPage />} />

            {/* Root Redirect */}
            <Route path="/" element={<HomeRedirect />} />

            {/* Admin Protected Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UsersManagement />} />
              <Route path="packages" element={<PackagesManagement />} />
              <Route path="contracts" element={<InsuranceApprovals />} />
              <Route path="assignments" element={<AssignmentsManagement />} />
              <Route path="logs" element={<PlaceholderPage title="Nhật ký hệ thống & Access logs" desc="Chức năng theo dõi toàn bộ lịch sử truy cập (Login/Logout) và lịch sử thao tác nghiệp vụ của nhân viên." />} />
            </Route>

            {/* Employee Protected Routes */}
            <Route path="/employee" element={
              <ProtectedRoute allowedRoles={['ROLE_EMPLOYEE']}>
                <EmployeeLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<EmployeeDashboard />} />
              <Route path="customers" element={<MyCustomers />} />
              <Route path="contracts" element={<InsuranceApprovals />} />
              <Route path="incidents" element={<PlaceholderPage title="Xử lý báo cáo sự cố" desc="Tiếp nhận, kiểm tra hồ sơ yêu cầu bồi thường bảo hiểm, cập nhật trạng thái duyệt/từ chối hồ sơ sự cố." />} />
            </Route>

            {/* Customer Protected Routes */}
            <Route path="/customer" element={
              <ProtectedRoute allowedRoles={['ROLE_CUSTOMER']}>
                <CustomerLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<CustomerDashboard />} />
              <Route path="packages" element={<CustomerPackages />} />
              <Route path="my-insurances" element={<MyInsurances />} />
              <Route path="reports" element={<PlaceholderPage title="Báo cáo tai nạn / Sự cố" desc="Gửi báo cáo yêu cầu bồi thường (loại sự cố, mô tả sự cố, hình ảnh chứng minh) khi phát sinh tai nạn, ốm đau." />} />
              <Route path="chatbot" element={<PlaceholderPage title="Trợ lý ảo AI Chatbot" desc="Hỏi đáp thông minh về điều khoản bảo hiểm, hướng dẫn thủ tục bồi thường tự động qua tài liệu nội bộ PDF." />} />
            </Route>

            {/* Fallback to Root */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </UIProvider>
  );
}

export default App;
