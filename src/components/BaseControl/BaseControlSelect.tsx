// File: components/ReusableDropdown.tsx
import React from "react";
import { Select } from "antd";
import type { SelectProps } from "antd";

interface BaseControlSelectProps {
  options: { label: string; value: string }[];
  defaultValue?: string;
  onChange?: (value: string) => void;
  width?: number | string;
  size?: SelectProps["size"];
  style?: React.CSSProperties;
  /** Nếu true thì bật chức năng search */
  isSearch?: boolean;
}

const BaseControlSelect: React.FC<BaseControlSelectProps> = ({
  options,
  defaultValue,
  onChange,
  width = 120,
  size = "middle",
  style = {},
  isSearch = false,
}) => {
  return (
    <Select
      defaultValue={defaultValue}
      style={{ width, ...style }}
      options={options}
      size={size}
      onChange={onChange}
      showSearch={isSearch}
      optionFilterProp={isSearch ? "label" : undefined}
      filterOption={
        isSearch
          ? (input, option) =>
              (option?.label ?? "")
                .toString()
                .toLowerCase()
                .includes(input.toLowerCase())
          : undefined
      }
    />
  );
};

export default BaseControlSelect;
