// src/components/DateRangePicker.tsx
"use client";

import React from "react";
import { DatePicker } from "antd";
import type { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;

interface DateRangePickerProps {
  value: [Dayjs, Dayjs];
  format: string;
  onChange: (dates: [Dayjs, Dayjs] | null) => void;
}

const BaseControlRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  format = "YYYY-MM-DD",
  onChange,
}) => (
  <RangePicker
    value={value}
    onChange={(dates) => {
      if (dates) onChange(dates as [Dayjs, Dayjs]);
    }}
    format={format}
    allowClear={false}
  />
);

export default BaseControlRangePicker;
