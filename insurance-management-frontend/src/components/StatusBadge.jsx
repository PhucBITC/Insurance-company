import React from 'react';

const StatusBadge = ({ status, variant, text }) => {
  const normalized = status ? status.toUpperCase().trim() : 'ACTIVE';

  const getStyle = () => {
    switch (normalized) {
      case 'ACTIVE':
      case 'SUCCESS':
      case 'APPROVED':
      case 'RESOLVED':
        return {
          bg: 'var(--success-light)',
          color: 'var(--success)',
          border: 'rgba(22, 163, 74, 0.15)',
          text: 'ACTIVE'
        };
      case 'INACTIVE':
      case 'CANCELLED':
        return {
          bg: '#f1f5f9', // Gray neutral background
          color: '#64748b', // Gray neutral text
          border: 'rgba(100, 116, 139, 0.15)',
          text: 'INACTIVE'
        };
      case 'LOCKED':
      case 'REJECTED':
      case 'DANGER':
      case 'ERROR':
        return {
          bg: 'var(--danger-light)',
          color: 'var(--danger)',
          border: 'rgba(220, 38, 38, 0.15)',
          text: normalized === 'LOCKED' ? 'LOCKED' : status
        };
      case 'ROLE_ADMIN':
      case 'ADMIN':
        return {
          bg: 'var(--danger-light)',
          color: 'var(--danger)',
          border: 'rgba(220, 38, 38, 0.15)',
          text: 'ADMIN'
        };
      case 'ROLE_EMPLOYEE':
      case 'EMPLOYEE':
      case 'PENDING':
      case 'PROCESSING':
      case 'WARNING':
      case 'ASSIGNED':
        return {
          bg: 'var(--warning-light)',
          color: 'var(--warning)',
          border: 'rgba(245, 158, 11, 0.15)',
          text: normalized.includes('EMPLOYEE') ? 'EMPLOYEE' : status
        };
      case 'ROLE_CUSTOMER':
      case 'CUSTOMER':
        return {
          bg: 'var(--info-light)',
          color: 'var(--info)',
          border: 'rgba(14, 165, 233, 0.15)',
          text: 'CUSTOMER'
        };
      default:
        return {
          bg: 'var(--info-light)',
          color: 'var(--info)',
          border: 'rgba(14, 165, 233, 0.15)',
          text: status
        };
    }
  };

  const badgeStyle = getStyle();
  const displayText = text || badgeStyle.text;

  if (variant === 'text') {
    return (
      <span style={{
        color: badgeStyle.color,
        fontWeight: '600',
        fontSize: '0.85rem'
      }}>
        {displayText}
      </span>
    );
  }

  return (
    <span className="badge" style={{
      backgroundColor: badgeStyle.bg,
      color: badgeStyle.color,
      border: `1px solid ${badgeStyle.border}`
    }}>
      {displayText}
    </span>
  );
};

export default StatusBadge;
