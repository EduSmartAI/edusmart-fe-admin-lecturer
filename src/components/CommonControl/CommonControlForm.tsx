import React from "react";
import { Row, Col } from "antd";
import BaseControlForm, {
  BaseControlFormProps,
} from "../BaseControl/BaseControlForm";
import BaseControlTextField from "../BaseControl/BasecontrolTextField";
import { FieldConfig } from "EduSmart/utils/FieldConfig";
export interface CommonControlFormProps
  extends Pick<BaseControlFormProps, "form" | "layout" | "maxWidth"> {
  fields: FieldConfig[];
}
// CommonControlForm renders a form with fields defined in FieldConfig
// It organizes fields into rows based on their span configuration
// Each row can contain multiple fields, respecting the total span of 24
const CommonControlForm: React.FC<CommonControlFormProps> = ({
  form,
  layout,
  maxWidth = "100%",
  fields,
}) => {
  const DEFAULT_SPAN = 24;

  const rows: FieldConfig[][] = [];
  let currentRow: FieldConfig[] = [];
  let accSpan = 0;

  fields.forEach((field) => {
    const span = field.span ?? DEFAULT_SPAN;
    if (accSpan + span > 24) {
      rows.push(currentRow);
      currentRow = [];
      accSpan = 0;
    }
    currentRow.push(field);
    accSpan += span;
  });
  if (currentRow.length) rows.push(currentRow);

  return (
    <BaseControlForm form={form} layout={layout} maxWidth={maxWidth}>
      {rows.map((rowFields, rowIdx) => (
        <Row key={rowIdx} gutter={16} style={{ marginBottom: 16 }}>
          {rowFields.map((field) => (
            <Col span={field.span ?? DEFAULT_SPAN} key={field.xmlColumn.id}>
              <BaseControlTextField
                xmlColumn={field.xmlColumn}
                maxlength={field.maxLength ?? 50}
                placeholder={field.placeholder}
              />
            </Col>
          ))}
        </Row>
      ))}
    </BaseControlForm>
  );
};

export default CommonControlForm;
