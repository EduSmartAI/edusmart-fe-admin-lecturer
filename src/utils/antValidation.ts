// src/utils/validation.ts
import type { Rule } from "antd/lib/form";
import { XmlColumn } from "./xmlColumn";

/**
 * Chuyển chuỗi rules từ xmlColumn.rules thành Rule[] của AntD
 */
export function buildRules(xmlColumn: XmlColumn): Rule[] {
  return xmlColumn.rules
    .split("|")
    .map<Rule | null>((rule) => {
      if (rule === "required") {
        return {
          required: true,
          message: `Vui lòng nhập ${xmlColumn.name.toLowerCase()}!`,
        };
      }
      if (rule.startsWith("confirm_password:")) {
        const fieldToMatch = rule.split(":")[1];
        return ({ getFieldValue }) => ({
          validator(_: Rule, value: unknown) {
            if (!value || getFieldValue(fieldToMatch) === value) {
              return Promise.resolve();
            }
            return Promise.reject(
              new Error(`${xmlColumn.name} không khớp ${fieldToMatch}`),
            );
          },
        });
      }
      return null;
    })
    .filter((r): r is Rule => r !== null);
}
