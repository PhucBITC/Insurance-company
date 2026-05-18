import React from 'react';

const StatCard = ({ title, value, icon: Icon, trend, trendType = 'up', description }) => {
  return (
    <div className="saas-card saas-card-hover" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      position: 'relative'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '500' }}>{title}</span>
        {Icon && (
          <div style={{
            background: 'var(--background)',
            border: '1px solid var(--border)',
            width: '38px',
            height: '38px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)'
          }}>
            <Icon size={18} />
          </div>
        )}
      </div>

      <div>
        <h3 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--text-main)', lineHeight: '1.1' }}>{value}</h3>
        
        {(trend || description) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '0.75rem' }}>
            {trend && (
              <span style={{
                color: trendType === 'up' ? 'var(--success)' : 'var(--danger)',
                fontWeight: '600',
                background: trendType === 'up' ? 'var(--success-light)' : 'var(--danger-light)',
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                {trend}
              </span>
            )}
            {description && (
              <span style={{ color: 'var(--text-muted)' }}>{description}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
