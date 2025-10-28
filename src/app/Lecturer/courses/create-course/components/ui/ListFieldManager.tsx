'use client';
/* eslint-disable */
import { FC, useState } from 'react';
import { Form, Input, Button, Typography } from 'antd';
import { FaPlus, FaTrash, FaInfoCircle } from 'react-icons/fa';

const { Text } = Typography;

interface ListFieldManagerProps {
  name: string;
  label: string;
  placeholder: string;
  minItems?: number;
  maxItems?: number;
  helpText?: string;
  examples?: string[];
  required?: boolean;
  clearable?: boolean; // show a delete button beside the label to clear all items
}

const ListFieldManager: FC<ListFieldManagerProps> = ({
  name,
  label,
  placeholder,
  minItems = 1,
  maxItems = 10,
  helpText,
  examples = [],
  required = false,
  clearable = true
}) => {
  const form = Form.useFormInstance();
  const [isOperating, setIsOperating] = useState(false);

  const handleAdd = (add: () => void) => {
    setIsOperating(true);
    add();
    
    // Reset operating state after operation completes
    setTimeout(() => {
      setIsOperating(false);
      
      // Focus on the newly added input
      const fields = form.getFieldValue(name) || [];
      const newInputs = document.querySelectorAll(`[id*="${name}_${fields.length - 1}"]`);
      if (newInputs.length > 0) {
        (newInputs[0] as HTMLInputElement)?.focus();
      }
    }, 100);
  };

  const handleRemove = (remove: (index: number) => void, fieldName: number) => {
    setIsOperating(true);
    remove(fieldName);
    
    // Reset operating state after operation completes
    setTimeout(() => {
      setIsOperating(false);
    }, 100);
  };

  return (
    <div className="space-y-3">
      {/* Label row - positioned to align with badges and delete buttons */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', height: '40px' }}>
        <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Empty space matching badge position */}
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', marginTop: '-8px' }}>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {helpText && (
            <div className="group relative">
              <FaInfoCircle className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help" />
              <div className="absolute left-6 top-0 w-80 p-3 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none">
                {helpText}
              </div>
            </div>
          )}
        </div>
        <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Empty space matching delete button position */}
        </div>
      </div>

      <Form.List
        name={name}
      >
        {(fields, { add, remove }, { errors }) => {
          // Custom validation for minimum items - show warning but don't block actions
          const hasMinimumItems = fields.length >= minItems;
          const showMinimumWarning = required && !hasMinimumItems && fields.length > 0;

          return (
            <div className="space-y-3">
              
              {/* Show minimum items warning if applicable */}
              {showMinimumWarning && (
                <div className="text-amber-600 dark:text-amber-400 text-sm bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                  ⚠️ Cần thêm ít nhất {minItems - fields.length} mục nữa để đáp ứng yêu cầu tối thiểu
                </div>
              )}
              
              {fields.map(({ key, name: fieldName, ...restField }) => (
              <div key={key} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div 
                  className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-medium"
                  style={{ width: '40px', height: '40px', flexShrink: 0, marginTop: '-8px' }}
                >
                  {fieldName + 1}
                </div>
                <Form.Item
                  {...restField}
                  name={[fieldName]}
                  className="mb-0"
                  style={{ flex: 1 }}
                  rules={[
                    { 
                      required: true, 
                      message: 'Vui lòng nhập nội dung!',
                      validateTrigger: ['onSubmit'] // Only validate on submit, not during typing or blur
                    },
                    { 
                      max: 200, 
                      message: 'Không được vượt quá 200 ký tự!',
                      validateTrigger: ['onBlur', 'onSubmit']
                    }
                  ]}
                >
                  <Input
                    placeholder={`${placeholder} ${fieldName + 1}`}
                    size="large"
                    className="w-full"
                  />
                </Form.Item>
                <Button
                  type="text"
                  icon={<FaTrash />}
                  onClick={() => handleRemove(remove, fieldName)}
                  disabled={isOperating}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-50"
                  style={{ width: '40px', height: '40px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '-8px' }}
                  title="Xóa mục này"
                />
              </div>
            ))}

            {fields.length < maxItems && (
              <Button
                type="dashed"
                onClick={() => handleAdd(add)}
                disabled={isOperating}
                icon={<FaPlus />}
                className="w-full h-12 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50"
              >
                {isOperating ? 'Đang xử lý...' : `Thêm mục mới (${fields.length}/${maxItems})`}
              </Button>
            )}

            {errors.length > 0 && (
              <div className="text-red-500 text-sm">
                {errors.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            )}

            {examples.length > 0 && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <Text className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                  💡 Ví dụ:
                </Text>
                <ul className="mt-1 text-sm text-blue-600 dark:text-blue-400 space-y-1">
                  {examples.map((example, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Tối thiểu: {minItems} mục</span>
              <span>Tối đa: {maxItems} mục</span>
            </div>
          </div>
          );
        }}
      </Form.List>
    </div>
  );
};

export default ListFieldManager;
