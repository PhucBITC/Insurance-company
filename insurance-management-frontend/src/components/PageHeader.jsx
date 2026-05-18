import React from 'react';

const PageHeader = ({ title, description, actions }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: '20px',
      borderBottom: '1px solid var(--border)',
      marginBottom: '24px',
      flexWrap: 'wrap',
      gap: '16px'
    }}>
      <div>
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: '700',
          color: 'var(--text-main)',
          lineHeight: '1.2'
        }}>{title}</h1>
        {description && (
          <p style={{
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
            marginTop: '4px'
          }}>{description}</p>
        )}
      </div>
      {actions && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
