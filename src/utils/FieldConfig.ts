import { XmlColumn } from "./xmlColumn";

export interface FieldConfig {
  xmlColumn: XmlColumn;
  maxLength?: number;
  placeholder?: string;
  span?: number;
}
