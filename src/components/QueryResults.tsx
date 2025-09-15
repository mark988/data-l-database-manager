import React, { useState } from 'react';
import { Download, Filter, RotateCcw, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { QueryResult } from '../types';

interface QueryResultsProps {
  result: QueryResult | null;
  isExecuting: boolean;
  executionTime?: number;
  error?: string;
  onExport: (format: 'csv' | 'excel' | 'json') => void;
}

export const QueryResults: React.FC<QueryResultsProps> = ({
  result,
  isExecuting,
  executionTime,
  error,
  onExport
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(100);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<Record<string, string>>({});

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const renderStatus = () => {
    if (isExecuting) {
      return (
        <div className="flex items-center space-x-2 text-blue-400">
          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <span>正在执行查询...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center space-x-2 text-red-400">
          <AlertCircle className="w-4 h-4" />
          <span>错误: {error}</span>
        </div>
      );
    }

    if (result) {
      return (
        <div className="flex items-center space-x-4 text-green-400">
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-4 h-4" />
            <span>查询成功</span>
          </div>
          <span>•</span>
          <span>{result.rowCount.toLocaleString()} 行</span>
          <span>•</span>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{result.executionTime}ms</span>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="h-80 bg-gray-800 border-t border-gray-700 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between bg-gray-900 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center space-x-4">
          <h3 className="text-white font-medium">查询结果</h3>
          {renderStatus()}
        </div>

        {result && !isExecuting && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onExport('csv')}
              className="flex items-center space-x-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>导出CSV</span>
            </button>
            <button
              onClick={() => onExport('excel')}
              className="flex items-center space-x-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>导出Excel</span>
            </button>
            <button
              onClick={() => onExport('json')}
              className="flex items-center space-x-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>导出JSON</span>
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {error ? (
          <div className="p-4 bg-red-900/20 border border-red-800 mx-4 my-4 rounded-lg">
            <h4 className="text-red-400 font-medium mb-2">执行错误</h4>
            <pre className="text-red-300 text-sm whitespace-pre-wrap">{error}</pre>
          </div>
        ) : result ? (
          <div className="overflow-auto">
            <table className="w-full">
              <thead className="bg-gray-700 sticky top-0">
                <tr>
                  {result.columns.map((column, index) => (
                    <th
                      key={index}
                      className="text-left p-3 text-white font-medium cursor-pointer hover:bg-gray-600 transition-colors"
                      onClick={() => handleSort(column)}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{column}</span>
                        {sortColumn === column && (
                          <span className="text-blue-400">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-b border-gray-700 hover:bg-gray-750 transition-colors"
                  >
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="p-3 text-gray-300">
                        <div className="max-w-xs truncate" title={String(cell)}>
                          {cell === null ? (
                            <span className="text-gray-500 italic">NULL</span>
                          ) : (
                            String(cell)
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {result.hasMore && (
              <div className="p-4 text-center">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                  加载更多结果
                </button>
              </div>
            )}
          </div>
        ) : !isExecuting ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <p>执行SQL查询后，结果将显示在这里</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};