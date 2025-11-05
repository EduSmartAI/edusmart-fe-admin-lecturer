import React from "react";
import { Skeleton, Row, Col, Card } from "antd";

/**
 * Table Skeleton Loader
 */
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 6,
}) => {
  return (
    <div className="space-y-4">
      {/* Header Row */}
      <div className="flex gap-3">
        {Array(columns)
          .fill(0)
          .map((_, i) => (
            <div key={`header-${i}`} className="flex-1">
              <Skeleton.Button
                active
                size="small"
                block
              />
            </div>
          ))}
      </div>

      {/* Data Rows */}
      {Array(rows)
        .fill(0)
        .map((_, i) => (
          <div key={`row-${i}`} className="flex gap-3">
            {Array(columns)
              .fill(0)
              .map((_, j) => (
                <div key={`cell-${i}-${j}`} className="flex-1">
                  <Skeleton.Button
                    active
                    size="small"
                    block
                  />
                </div>
              ))}
          </div>
        ))}
    </div>
  );
};

/**
 * Card Grid Skeleton Loader
 */
export const CardGridSkeleton: React.FC<{
  count?: number;
  xs?: number;
  sm?: number;
  lg?: number;
}> = ({ count = 4, xs = 24, sm = 12, lg = 6 }) => {
  return (
    <Row gutter={[16, 16]}>
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <Col key={i} xs={xs} sm={sm} lg={lg}>
            <Card className="shadow-sm">
              <Skeleton active paragraph={{ rows: 3 }} />
            </Card>
          </Col>
        ))}
    </Row>
  );
};

/**
 * Stats Card Skeleton Loader
 */
export const StatCardSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <Row gutter={16} className="mb-6">
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <Col key={i} xs={24} sm={12} lg={6}>
            <Card className="shadow-sm">
              <div className="text-center">
                <Skeleton.Button
                  active
                  size="large"
                  block
                  style={{ height: 48 }}
                />
                <div className="mt-4">
                  <Skeleton.Button
                    active
                    size="small"
                    block
                  />
                </div>
              </div>
            </Card>
          </Col>
        ))}
    </Row>
  );
};

/**
 * Form Skeleton Loader
 */
export const FormSkeleton: React.FC<{ fields?: number }> = ({ fields = 5 }) => {
  return (
    <div className="space-y-6">
      {Array(fields)
        .fill(0)
        .map((_, i) => (
          <div key={i}>
            <Skeleton.Button
              active
              size="small"
              block
              style={{ height: 20, marginBottom: 8 }}
            />
            <Skeleton.Button
              active
              size="large"
              block
            />
          </div>
        ))}
    </div>
  );
};

/**
 * List Item Skeleton Loader
 */
export const ListItemSkeleton: React.FC<{ items?: number }> = ({ items = 5 }) => {
  return (
    <div className="space-y-4">
      {Array(items)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="flex gap-4 items-start p-4 border rounded-lg">
            <Skeleton.Avatar
              active
              size={48}
              shape="circle"
            />
            <div className="flex-1">
              <Skeleton.Button
                active
                size="small"
                block
                style={{ marginBottom: 8 }}
              />
              <Skeleton.Button
                active
                size="small"
                block
                style={{ marginBottom: 8, width: "80%" }}
              />
              <Skeleton.Button
                active
                size="small"
                block
                style={{ width: "60%" }}
              />
            </div>
          </div>
        ))}
    </div>
  );
};

/**
 * Drawer Skeleton Loader
 */
export const DrawerSkeleton: React.FC<{ sections?: number }> = ({ sections = 3 }) => {
  return (
    <div className="space-y-6">
      {Array(sections)
        .fill(0)
        .map((_, i) => (
          <div key={i}>
            <Skeleton.Button
              active
              size="small"
              block
              style={{ height: 24, marginBottom: 16 }}
            />
            <div className="space-y-3">
              {Array(3)
                .fill(0)
                .map((_, j) => (
                  <Skeleton.Button
                    key={j}
                    active
                    block
                  />
                ))}
            </div>
          </div>
        ))}
    </div>
  );
};

export default {
  TableSkeleton,
  CardGridSkeleton,
  StatCardSkeleton,
  FormSkeleton,
  ListItemSkeleton,
  DrawerSkeleton,
} as const;
