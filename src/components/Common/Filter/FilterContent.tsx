"use client";
import React from "react";
import { Checkbox } from "antd";
import Title from "antd/es/typography/Title";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type FilterOption = { label: string; value: string };
export type FilterGroup = {
  param: string;
  title: string;
  type?: "multi" | "single";
  options: FilterOption[];
};

export default function FilterContent({ groups }: { groups: FilterGroup[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = (
    param: string,
    values: string[],
    type: "multi" | "single" = "multi",
  ) => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete(param);

    if (type === "single") {
      if (values[0]) next.set(param, values[0]);
    } else {
      values.forEach((v) => next.append(param, v));
    }

    const qs = next.toString();
    const href = qs ? `${pathname}?${qs}` : pathname;

    console.log("[FilterChanged]", { param, values, type, href });
    router.replace(href, { scroll: false });
  };

  return (
    <div className="p-4">
      <Title level={4} style={{ marginBottom: 8 }}>
        Lọc khóa học
      </Title>

      {groups.map((group) => {
        const paramName = group.param;
        const type = group.type ?? "multi";

        const selectedValues: string[] =
          type === "single"
            ? searchParams.get(paramName)
              ? [searchParams.get(paramName)!]
              : []
            : searchParams.getAll(paramName);

        return (
          <div key={paramName} className="mb-6 dark:bg-[#0b1220]">
            <h4 className="font-medium mb-2">{group.title}</h4>
            <Checkbox.Group
              className="flex flex-col gap-1 text-gray-600"
              options={group.options.map((o) => ({
                label: o.label,
                value: o.value,
              }))}
              value={selectedValues}
              onChange={(vals) => {
                const arr = vals as string[];
                const nextVals = group.type === "single" ? arr.slice(-1) : arr;
                updateParam(paramName, nextVals, type);
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
