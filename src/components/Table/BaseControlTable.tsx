// BaseControlTable.tsx
import React from "react";
import { Table } from "antd";
import type { TableColumnsType, TablePaginationConfig } from "antd";
import type { FilterValue, SorterResult } from "antd/es/table/interface";

export interface BaseControlTableProps<T> {
  columns: TableColumnsType<T>;
  data: T[];
  /** Tổng số record từ server (để tính số trang) */
  total?: number;
  /** Loading khi đang call API */
  loading?: boolean;
  /** Bật expandable row */
  isShowDescription?: boolean;
  /** Render nội dung mô tả ở row expand */
  getDescription?: (record: T) => React.ReactNode;
  /** Bật chọn row */
  rowSelectionEnabled?: boolean;
  onRowSelectChange?: (selectedRowKeys: React.Key[], selectedRows: T[]) => void;
  /** Phân trang controlled */
  pagination?: false | TablePaginationConfig;
  /** Sự kiện đổi trang/sort/filter → bạn gọi API ở ngoài */
  onChange?: (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<T> | SorterResult<T>[],
  ) => void;
}

function BaseControlTable<T extends { key: React.Key }>({
  columns,
  data,
  total,
  loading = false,
  isShowDescription = false,
  getDescription,
  rowSelectionEnabled = false,
  onRowSelectChange,
  pagination = { pageSize: 10, showSizeChanger: true },
  onChange,
}: BaseControlTableProps<T>) {
  return (
    <Table<T>
      rowSelection={
        rowSelectionEnabled ? { onChange: onRowSelectChange } : undefined
      }
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={pagination === false ? false : { ...pagination, total }}
      expandable={
        isShowDescription
          ? {
              expandedRowRender: (record) =>
                getDescription ? getDescription(record) : null,
              rowExpandable: (record) =>
                typeof getDescription === "function" &&
                !!getDescription(record),
            }
          : undefined
      }
      onChange={onChange}
    />
  );
}

export default BaseControlTable;
