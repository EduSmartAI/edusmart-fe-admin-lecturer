// src/components/BaseControl/BaseControlDivide.tsx
"use client";
import React from "react";
import { Row, Col } from "antd";
import type { ColProps } from "antd/lib/grid";

// Giao diện props
interface BaseControlDivideProps {
  children: React.ReactNode[];
  colSizes?: ColProps[];
  cols?: number;
  gutter?: number | [number, number];
}

const BaseControlDivide: React.FC<BaseControlDivideProps> = ({
  children,
  colSizes,
  cols,
  gutter = 16,
}) => {
  const totalCols = cols ?? children.length;
  const defaultSpan = Math.floor(24 / totalCols);

  return (
    <Row gutter={gutter}>
      {React.Children.map(children, (child, index) => {
        const sizeProps: ColProps =
          colSizes && colSizes[index]
            ? colSizes[index]!
            : { span: defaultSpan };

        return (
          <Col key={index} {...sizeProps}>
            {child}
          </Col>
        );
      })}
    </Row>
  );
};

export default BaseControlDivide;
