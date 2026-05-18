import React from 'react';
import { Search, Filter } from 'lucide-react';

const SearchFilterBar = ({ 
  searchPlaceholder = "Tìm kiếm...", 
  searchValue, 
  onSearchChange,
  filterValue,
  onFilterChange,
  filterOptions = [],
  actions
}) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      marginBottom: '20px',
      flexWrap: 'wrap'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexGrow: 1,
        maxWidth: '500px',
        width: '100%',
        flexWrap: 'wrap'
      }}>
        {/* Search Input wrapper */}
        <div style={{ position: 'relative', flexGrow: 1, minWidth: '200px' }}>
          <Search size={16} style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)'
          }} />
          <input
            type="text"
            className="form-input"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ paddingLeft: '36px', height: '38px' }}
          />
        </div>

        {/* Filter select wrapper */}
        {filterOptions.length > 0 && (
          <div style={{ position: 'relative', minWidth: '160px' }}>
            <select
              className="form-input"
              value={filterValue}
              onChange={(e) => onFilterChange(e.target.value)}
              style={{
                height: '38px',
                paddingRight: '30px',
                appearance: 'none',
                cursor: 'pointer',
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 10px center',
                backgroundSize: '16px'
              }}
            >
              {filterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {actions}
        </div>
      )}
    </div>
  );
};

export default SearchFilterBar;
