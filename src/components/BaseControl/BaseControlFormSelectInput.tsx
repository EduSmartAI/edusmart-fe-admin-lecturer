// File: components/ReusableDropdown.tsx
import React, { useMemo } from "react";
import { Form, Select } from "antd";
import type { SelectProps } from "antd";
import { Rule } from "antd/es/form";
import { XmlColumn } from "EduSmart/utils/xmlColumn";
import { buildRules } from "EduSmart/utils/antValidation";

interface BaseControlFormSelectInputProps {
  xmlColumn: XmlColumn;
  options: { label: string; value: string }[];
  defaultValue?: string;
  onChange?: (value: string) => void;
  size?: SelectProps["size"];
  style?: React.CSSProperties;
  /** Nếu true thì bật chức năng search */
  isSearch?: boolean;
  disabled?: boolean;
  value?: string;
  className?: string;
}
const BaseControlFormSelectInput: React.FC<BaseControlFormSelectInputProps> = ({
  className = "",
  xmlColumn,
  options,
  defaultValue,
  onChange,
  size = "middle",
  style = {},
  isSearch = false,
  disabled = false,
  value = undefined,
}) => {
  // build rule từ xmlColumn.rules
  const rulesList = useMemo<Rule[]>(() => buildRules(xmlColumn), [xmlColumn]);
  return (
    <Form.Item
      name={xmlColumn.id}
      label={xmlColumn.name}
      rules={rulesList}
      validateTrigger="onBlur"
      style={{ marginBottom: 0 }}
    >
      <Select
        className={className}
        value={value}
        disabled={disabled}
        placeholder={defaultValue}
        style={{ ...style }}
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
        allowClear
      />
    </Form.Item>
  );
};

export default BaseControlFormSelectInput;
