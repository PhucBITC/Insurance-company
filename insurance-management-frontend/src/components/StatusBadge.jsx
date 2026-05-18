import React from 'react';

const StatusBadge = ({ status }) => {
  const normalized = status ? status.toUpperCase().trim() : '';

  const getStyle = () => {
    switch (normalized) {
      case 'ACTIVE':
      case 'ROLE_ADMIN':
      case 'APPROVED':
      case 'RESOLVED':
      case 'SUCCESS':
        return {
          bg: 'var(--success-light)',
          color: 'var(--success)',
          border: 'rgba(22, 163, 74, 0.15)',
          text: status === 'ROLE_ADMIN' ? 'Admin' : status
        };
      case 'PENDING':
      case 'ROLE_EMPLOYEE':
      case 'PROCESSING':
      case 'WARNING':
      case 'NEED_MORE_INFO':
      case 'ASSIGNED':
        return {
          bg: 'var(--warning-light)',
          color: 'var(--warning)',
          border: 'rgba(245, 158, 11, 0.15)',
          text: status === 'ROLE_EMPLOYEE' ? 'Nhân viên' : status
        };
      case 'REJECTED':
      case 'CANCELLED':
      case 'DANGER':
      case 'ERROR':
        return {
          bg: 'var(--danger-light)',
          color: 'var(--danger)',
          border: 'rgba(220, 38, 38, 0.15)',
          text: status
        };
      default:
        return {
          bg: 'var(--info-light)',
          color: 'var(--info)',
          border: 'rgba(14, 165, 233, 0.15)',
          text: status === 'ROLE_CUSTOMER' ? 'Khách hàng' : status
        };
    }
  };

  const badgeStyle = getStyle();

  return (
    <span className="badge" style={{
      backgroundColor: badgeStyle.bg,
      color: badgeStyle.color,
      border: `1px solid ${badgeStyle.border}`
    }}>
      {badgeStyle.text}
    </span>
  );
};

export default StatusBadge;
