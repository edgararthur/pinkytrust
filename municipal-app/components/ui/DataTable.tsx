'use client';

import React from 'react';
import { cn } from '@/utils';
import { Button } from './Button';
import { SearchInput } from './Input';
import { Badge } from './Badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Loader2
} from 'lucide-react';
import type { TableColumn, TableProps } from '@/types';

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  pagination,
  sorting,
  selection,
  actions,
  searchable = true,
  onSearch,
}: TableProps<T> & {
  searchable?: boolean;
  onSearch?: (query: string) => void;
}) {
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleSort = (column: string) => {
    if (!sorting) return;
    
    let newOrder: 'asc' | 'desc' = 'asc';
    if (sorting.sortBy === column && sorting.sortOrder === 'asc') {
      newOrder = 'desc';
    }
    
    sorting.onSort(column);
  };

  const getSortIcon = (column: string) => {
    if (!sorting || sorting.sortBy !== column) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    
    return sorting.sortOrder === 'asc' 
      ? <ArrowUp className="h-4 w-4" />
      : <ArrowDown className="h-4 w-4" />;
  };

  const renderCell = (column: TableColumn<T>, row: T, index: number) => {
    if (column.render) {
      return column.render(row[column.key as keyof T], row);
    }

    const value = row[column.key as keyof T];
    
    // Handle different data types
    if (value === null || value === undefined) {
      return <span className="text-gray-400">—</span>;
    }
    
    if (typeof value === 'boolean') {
      return <Badge variant={value ? 'success' : 'secondary'}>{value ? 'Yes' : 'No'}</Badge>;
    }
    
    if (Array.isArray(value)) {
      return (
        <div className="flex flex-wrap gap-1">
          {value.slice(0, 3).map((item, i) => (
            <Badge key={i} variant="outline" className="text-xs">
              {String(item)}
            </Badge>
          ))}
          {value.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{value.length - 3}
            </Badge>
          )}
        </div>
      );
    }
    
    return <span>{String(value)}</span>;
  };

  return (
    <div className="space-y-4">
      {/* Search and Actions */}
      {searchable && (
        <div className="flex items-center justify-between">
          <SearchInput
            placeholder="Search..."
            onSearch={handleSearch}
            className="max-w-sm"
          />
          {selection && selection.selectedRows.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {selection.selectedRows.length} selected
              </span>
              {/* Bulk actions can be added here */}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50/50">
                {selection && (
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={
                        data.length > 0 && 
                        data.every(row => 
                          selection.selectedRows.includes(String(row.id))
                        )
                      }
                      onChange={(e) => {
                        const allIds = data.map(row => String(row.id));
                        selection.onSelectionChange(
                          e.target.checked ? allIds : []
                        );
                      }}
                      className="rounded border-gray-300"
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={cn(
                      'px-4 py-3 text-left text-sm font-medium text-gray-900',
                      column.width && `w-${column.width}`,
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right'
                    )}
                  >
                    {column.sortable ? (
                      <button
                        onClick={() => handleSort(String(column.key))}
                        className="flex items-center gap-2 hover:text-gray-700"
                      >
                        {column.label}
                        {getSortIcon(String(column.key))}
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                ))}
                {actions && actions.length > 0 && (
                  <th className="w-20 px-4 py-3 text-right text-sm font-medium text-gray-900">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td 
                    colSpan={
                      columns.length + 
                      (selection ? 1 : 0) + 
                      (actions && actions.length > 0 ? 1 : 0)
                    }
                    className="px-4 py-8 text-center"
                  >
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td 
                    colSpan={
                      columns.length + 
                      (selection ? 1 : 0) + 
                      (actions && actions.length > 0 ? 1 : 0)
                    }
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                data.map((row, index) => (
                  <tr 
                    key={row.id || index} 
                    className="border-b hover:bg-gray-50/50"
                  >
                    {selection && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selection.selectedRows.includes(String(row.id))}
                          onChange={(e) => {
                            const rowId = String(row.id);
                            const newSelection = e.target.checked
                              ? [...selection.selectedRows, rowId]
                              : selection.selectedRows.filter(id => id !== rowId);
                            selection.onSelectionChange(newSelection);
                          }}
                          className="rounded border-gray-300"
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={String(column.key)}
                        className={cn(
                          'px-4 py-3 text-sm text-gray-900',
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right'
                        )}
                      >
                        {renderCell(column, row, index)}
                      </td>
                    ))}
                    {actions && actions.length > 0 && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {actions.map((action, actionIndex) => (
                            <Button
                              key={actionIndex}
                              variant={action.variant || 'ghost'}
                              size="sm"
                              onClick={() => action.onClick(row)}
                              className="h-8 w-8 p-0"
                            >
                              {action.icon ? (
                                <span className="h-4 w-4">{action.icon}</span>
                              ) : (
                                <MoreHorizontal className="h-4 w-4" />
                              )}
                            </Button>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Rows per page:</span>
              <select
                value={pagination.limit}
                onChange={(e) => pagination.onLimitChange(Number(e.target.value))}
                className="rounded border border-gray-300 px-2 py-1 text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(1)}
                disabled={pagination.page === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="px-3 py-1 text-sm">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.totalPages)}
                disabled={pagination.page === pagination.totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
