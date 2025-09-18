'use client';
import { FC, useCallback, useState } from 'react';
import { Input, InputNumber, Form } from 'antd';
import type { Rule } from 'antd/es/form';
import { useRealTimeValidation } from '../../hooks/useRealTimeValidation';
import ValidationFeedback from './ValidationFeedback';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface SmartInputProps {
  name: string;
  label: string;
  placeholder?: string;
  type?: 'text' | 'textarea' | 'number' | 'password';
  validationType: string;
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  rows?: number;
  showCount?: boolean;
  size?: 'small' | 'middle' | 'large';
  disabled?: boolean;
  addonAfter?: string;
  min?: number;
  max?: number;
  precision?: number;
  formatter?: (value: string | undefined) => string;
  parser?: (value: string | undefined) => number;
  className?: string;
  rules?: Rule[];
  extra?: React.ReactNode;
  showValidationFeedback?: boolean;
  showOptimizationTips?: boolean;
}

const SmartInput: FC<SmartInputProps> = ({
  name,
  label,
  placeholder,
  type = 'text',
  validationType,
  required = false,
  maxLength,
  minLength,
  rows = 3,
  showCount = false,
  size = 'large',
  disabled = false,
  addonAfter,
  min,
  max,
  precision,
  formatter,
  parser,
  className = '',
  rules = [],
  extra,
  showValidationFeedback = true,
  showOptimizationTips = true
}) => {
  const { validateField, getValidation } = useRealTimeValidation();

  const [isFocused, setIsFocused] = useState(false);
  const validation = getValidation(name);

  const handleChange = useCallback((newValue: string | number) => {
    validateField(name, newValue, validationType);
  }, [name, validationType, validateField]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const getOptimizationStatus = () => {
    if (!validation) return null;

    switch (validation.level) {
        case 'success':
            return { color: 'text-green-600', text: 'Tối ưu', icon: '✓' };
        case 'warning':
            return { color: 'text-yellow-600', text: 'Có thể cải thiện', icon: '⚠' };
        case 'error':
            return { color: 'text-red-600', text: 'Cần sửa', icon: '✗' };
        default:
            return { color: 'text-blue-600', text: 'Đang kiểm tra...', icon: '○' };
    }
  };


  const getValidateStatus = (level: 'error' | 'warning' | 'success' | 'info' | undefined): 'error' | 'warning' | 'success' | undefined => {
    if (level === 'info') return undefined;
    return level;
  };

  const renderInput = () => {
    const commonProps = {
      size,
      disabled,
      className: `${className} ${validation?.level === 'error' ? 'border-red-300' : validation?.level === 'success' ? 'border-green-300' : ''}`,
      onFocus: handleFocus,
      onBlur: handleBlur,
    };

    switch (type) {
      case 'textarea':
        return (
          <Input.TextArea
            {...commonProps}
            placeholder={placeholder}
            rows={rows}
            maxLength={maxLength}
            showCount={showCount}
            onChange={(e) => handleChange(e.target.value)}
            autoSize={rows > 3 ? { minRows: rows, maxRows: rows + 2 } : false}
          />
        );

      case 'number':
        return (
          <InputNumber
            size={size}
            disabled={disabled}
            className={`${className} ${validation?.level === 'error' ? 'border-red-300' : validation?.level === 'success' ? 'border-green-300' : ''}`}
            onFocus={handleFocus}
            onBlur={handleBlur}
            min={min as any} // eslint-disable-line @typescript-eslint/no-explicit-any
            max={max as any} // eslint-disable-line @typescript-eslint/no-explicit-any
            precision={precision}
            formatter={formatter}
            parser={parser as any} // eslint-disable-line @typescript-eslint/no-explicit-any
            addonAfter={addonAfter}
            style={{ width: '100%' }}
            onChange={(val) => handleChange(val || 0)}
          />
        );

      case 'password':
        return (
          <Input.Password
            {...commonProps}
            placeholder={placeholder}
            maxLength={maxLength}
            onChange={(e) => handleChange(e.target.value)}
            iconRender={(visible) => (visible ? <FaEye /> : <FaEyeSlash />)}
          />
        );

      default:
        return (
          <Input
            {...commonProps}
            placeholder={placeholder}
            maxLength={maxLength}
            showCount={showCount}
            onChange={(e) => handleChange(e.target.value)}
          />
        );
    }
  };

  const optimizationStatus = getOptimizationStatus();

  return (
    <Form.Item
      name={name}
      label={
        <div className="flex items-center justify-between w-full">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </span>
          {showOptimizationTips && optimizationStatus && (
            <div className={`flex items-center gap-1 text-xs ${optimizationStatus.color}`}>
              <span>{optimizationStatus.icon}</span>
              <span>{optimizationStatus.text}</span>
            </div>
          )}
        </div>
      }
      validateStatus={getValidateStatus(validation?.level)}
      help={
        showValidationFeedback && validation && (isFocused || validation.level === 'error') && (
            <ValidationFeedback
                validation={validation}
                showSuggestions={isFocused || validation.level !== 'success'}
            />
        )
      }
      rules={[
        { required, message: `Vui lòng nhập ${label.toLowerCase()}!` },
        ...(minLength ? [{ min: minLength, message: `${label} phải có ít nhất ${minLength} ký tự!` }] : []),
        ...(maxLength ? [{ max: maxLength, message: `${label} không được vượt quá ${maxLength} ký tự!` }] : []),
        ...rules,
      ]}
      extra={extra}
      className="mb-6"
    >
      {renderInput()}
    </Form.Item>
  );
};

export default SmartInput;
