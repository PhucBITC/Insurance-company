import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DataTable = ({ 
  headers = [], 
  data = [], 
  rowsPerPage = 5,
  renderCell,
  currentPage: externalPage,
  onPageChange
}) => {
  const [internalPage, setInternalPage] = useState(1);
  
  const isControlled = externalPage !== undefined;
  const currentPage = isControlled ? externalPage : internalPage;
  const setCurrentPage = isControlled ? onPageChange : setInternalPage;

  // Pagination calculation
  const totalPages = Math.ceil(data.length / rowsPerPage) || 1;

  // Ensure current page is within valid range
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    } else if (currentPage < 1) {
      setCurrentPage(1);
    }
  }, [data.length, totalPages, currentPage, setCurrentPage]);

  const activePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (activePage - 1) * rowsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + rowsPerPage);

  const handlePrevPage = () => {
    if (activePage > 1) {
      setCurrentPage(activePage - 1);
    }
  };

  const handleNextPage = () => {
    if (activePage < totalPages) {
      setCurrentPage(activePage + 1);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="saas-table-container">
        <table className="saas-table">
          <thead>
            <tr>
              {headers.map((header, idx) => (
                <th key={idx} style={{ width: header.width || 'auto' }}>
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  {headers.map((header, colIdx) => {
                    const value = row[header.key];
                    return (
                      <td key={colIdx}>
                        {renderCell ? renderCell(row, header.key, value) : value}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={headers.length} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  Không tìm thấy bản ghi nào tương ứng.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination control block */}
      {data.length > 0 && (
        <div className="saas-pagination">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Hiển thị <strong>{startIndex + 1}</strong> đến <strong>{Math.min(startIndex + rowsPerPage, data.length)}</strong> trong tổng số <strong>{data.length}</strong> kết quả
          </span>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={handlePrevPage} 
              disabled={currentPage === 1}
              className="btn btn-secondary" 
              style={{ padding: '6px 10px', height: '32px', minWidth: 'auto' }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ 
              fontSize: '0.875rem', 
              color: 'var(--text-main)', 
              fontWeight: '550',
              display: 'flex',
              alignItems: 'center',
              padding: '0 8px'
            }}>
              Trang {currentPage} / {totalPages}
            </span>
            <button 
              onClick={handleNextPage} 
              disabled={currentPage === totalPages}
              className="btn btn-secondary" 
              style={{ padding: '6px 10px', height: '32px', minWidth: 'auto' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
