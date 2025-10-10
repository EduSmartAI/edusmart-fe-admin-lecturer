'use client';
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars */
import { FC, useCallback, useState, useRef, useEffect } from 'react';
import { Form } from 'antd';
import type { Rule } from 'antd/es/form';
import dynamic from 'next/dynamic';

// Dynamically import CKEditor to avoid SSR issues
const CKEditor = dynamic(
  () => import('@ckeditor/ckeditor5-react').then(mod => ({ default: mod.CKEditor })),
  { 
    ssr: false,
    loading: () => <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
  }
);

// Import ClassicEditor statically but use it conditionally
let ClassicEditor: unknown = null;
if (typeof window !== 'undefined') {
  ClassicEditor = require('@ckeditor/ckeditor5-build-classic');
}

interface RichTextEditorProps {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  rules?: Rule[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  height?: number;
  showCount?: boolean;
  className?: string;
  extra?: React.ReactNode;
}

const RichTextEditor: FC<RichTextEditorProps> = ({
  name,
  label,
  placeholder = 'Nhập nội dung...',
  required = false,
  maxLength = 2000,
  minLength,
  rules = [],
  value,
  onChange,
  disabled = false,
  height = 200,
  showCount = true,
  className = '',
  extra,
}) => {
  const editorRef = useRef<unknown>(null);
  const [isReady, setIsReady] = useState(false);
  const [currentLength, setCurrentLength] = useState(0);

  // Initialize length when value prop changes
  useEffect(() => {
    if (value) {
      setCurrentLength(getPlainTextLength(value));
    } else {
      setCurrentLength(0);
    }
  }, [value]);

  // Function to count plain text characters (without HTML tags)
  const getPlainTextLength = (html: string): number => {
    if (typeof window === 'undefined') return 0;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent?.length || 0;
  };

  // CKEditor configuration
  const editorConfig: unknown = {
    toolbar: {
      items: [
        'heading',
        '|',
        'bold',
        'italic',
        'underline',
        'strikethrough',
        '|',
        'fontSize',
        'fontFamily',
        'fontColor',
        'fontBackgroundColor',
        '|',
        'alignment',
        '|',
        'bulletedList',
        'numberedList',
        '|',
        'indent',
        'outdent',
        '|',
        'link',
        'blockQuote',
        'insertTable',
        '|',
        'undo',
        'redo'
      ]
    },
    fontSize: {
      options: [
        9,
        11,
        13,
        'default',
        17,
        19,
        21,
        24,
        28,
        32,
        36
      ]
    },
    fontFamily: {
      options: [
        'default',
        'Arial, sans-serif',
        'Times New Roman, serif',
        'Courier New, monospace',
        'Georgia, serif',
        'Helvetica, sans-serif',
        'Verdana, sans-serif',
        'Trebuchet MS, sans-serif',
        'Impact, sans-serif',
        'Comic Sans MS, cursive',
        'Tahoma, sans-serif',
        'Palatino Linotype, serif',
        'Garamond, serif',
        'Book Antiqua, serif',
        'Arial Black, sans-serif'
      ]
    },
    fontColor: {
      colors: [
        {
          color: 'hsl(0, 0%, 0%)',
          label: 'Black'
        },
        {
          color: 'hsl(0, 0%, 30%)',
          label: 'Dim grey'
        },
        {
          color: 'hsl(0, 0%, 60%)',
          label: 'Grey'
        },
        {
          color: 'hsl(0, 0%, 90%)',
          label: 'Light grey'
        },
        {
          color: 'hsl(0, 0%, 100%)',
          label: 'White',
          hasBorder: true
        },
        // Colors
        {
          color: 'hsl(0, 75%, 60%)',
          label: 'Red'
        },
        {
          color: 'hsl(30, 75%, 60%)',
          label: 'Orange'
        },
        {
          color: 'hsl(60, 75%, 60%)',
          label: 'Yellow'
        },
        {
          color: 'hsl(90, 75%, 60%)',
          label: 'Light green'
        },
        {
          color: 'hsl(120, 75%, 60%)',
          label: 'Green'
        },
        {
          color: 'hsl(150, 75%, 60%)',
          label: 'Aquamarine'
        },
        {
          color: 'hsl(180, 75%, 60%)',
          label: 'Turquoise'
        },
        {
          color: 'hsl(210, 75%, 60%)',
          label: 'Light blue'
        },
        {
          color: 'hsl(240, 75%, 60%)',
          label: 'Blue'
        },
        {
          color: 'hsl(270, 75%, 60%)',
          label: 'Purple'
        }
      ]
    },
    fontBackgroundColor: {
      colors: [
        {
          color: 'hsl(0, 0%, 100%)',
          label: 'White',
          hasBorder: true
        },
        {
          color: 'hsl(0, 0%, 90%)',
          label: 'Light grey'
        },
        {
          color: 'hsl(0, 0%, 60%)',
          label: 'Grey'
        },
        {
          color: 'hsl(0, 0%, 30%)',
          label: 'Dim grey'
        },
        {
          color: 'hsl(0, 0%, 0%)',
          label: 'Black'
        },
        // Colors
        {
          color: 'hsl(0, 75%, 60%)',
          label: 'Red'
        },
        {
          color: 'hsl(30, 75%, 60%)',
          label: 'Orange'
        },
        {
          color: 'hsl(60, 75%, 60%)',
          label: 'Yellow'
        },
        {
          color: 'hsl(90, 75%, 60%)',
          label: 'Light green'
        },
        {
          color: 'hsl(120, 75%, 60%)',
          label: 'Green'
        },
        {
          color: 'hsl(150, 75%, 60%)',
          label: 'Aquamarine'
        },
        {
          color: 'hsl(180, 75%, 60%)',
          label: 'Turquoise'
        },
        {
          color: 'hsl(210, 75%, 60%)',
          label: 'Light blue'
        },
        {
          color: 'hsl(240, 75%, 60%)',
          label: 'Blue'
        },
        {
          color: 'hsl(270, 75%, 60%)',
          label: 'Purple'
        }
      ]
    },
    heading: {
      options: [
        { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
        { model: 'heading1' as const, view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
        { model: 'heading2' as const, view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
        { model: 'heading3' as const, view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' }
      ]
    },
    link: {
      decorators: {
        addTargetToExternalLinks: true,
        defaultProtocol: 'https://',
        toggleDownloadable: {
          mode: 'manual',
          label: 'Downloadable',
          attributes: {
            download: 'file'
          }
        }
      }
    },
    table: {
      contentToolbar: [
        'tableColumn',
        'tableRow',
        'mergeTableCells',
        'tableCellProperties',
        'tableProperties'
      ]
    },
    placeholder,
    language: 'vi'
  };

    // Handle editor data change
  const handleEditorChange = useCallback((event: unknown, editor: any) => {
    const data = editor.getData();
    const plainTextLength = getPlainTextLength(data);
    setCurrentLength(plainTextLength);
    
    if (onChange) {
      onChange(data);
    }
  }, [onChange]);

  const handleReady = useCallback((editor: any) => {
    editorRef.current = editor;
    setIsReady(true);

    // Custom validation for max length
    if (editor && editor.model && editor.model.document) {
      editor.model.document.on('change:data', () => {
        const data = editor.getData();
        const plainTextLength = getPlainTextLength(data);
        
        // Update current length state
        setCurrentLength(plainTextLength);
        
        if (maxLength && plainTextLength > maxLength) {
          // Prevent the change by undoing it
          try {
            editor.execute('undo');
          } catch (error) {
            console.warn('Could not undo editor change:', error);
          }
        }
      });
    }
  }, [maxLength]);

  const getCurrentLength = (): number => {
    // Use internal state for real-time counting, fallback to value prop
    const length = currentLength || (value ? getPlainTextLength(value) : 0);
    return length;
  };

  const isOverLimit = (): boolean => {
    return maxLength ? getCurrentLength() > maxLength : false;
  };

  const formRules: Rule[] = [
    ...(required ? [{
      validator: (_: unknown, val: string) => {
        // Handle empty or undefined values
        if (!val || val.trim() === '') {
          return Promise.reject(`Vui lòng nhập ${label.toLowerCase()}!`);
        }
        
        const plainLength = getPlainTextLength(val);
        // Check if there's actual text content (not just empty HTML tags)
        if (plainLength === 0 || val.replace(/<[^>]*>/g, '').trim() === '') {
          return Promise.reject(`Vui lòng nhập ${label.toLowerCase()}!`);
        }
        return Promise.resolve();
      }
    }] : []),
    ...(minLength ? [{
      validator: (_: unknown, val: string) => {
        if (!val) return Promise.resolve(); // Skip minLength check if field is empty (handled by required)
        const plainLength = getPlainTextLength(val);
        if (plainLength < minLength) {
          return Promise.reject(`${label} phải có ít nhất ${minLength} ký tự!`);
        }
        return Promise.resolve();
      }
    }] : []),
    ...(maxLength ? [{
      validator: (_: unknown, val: string) => {
        const plainLength = val ? getPlainTextLength(val) : 0;
        if (plainLength > maxLength) {
          return Promise.reject(`${label} không được vượt quá ${maxLength} ký tự!`);
        }
        return Promise.resolve();
      }
    }] : []),
    ...rules,
  ];

  return (
    <Form.Item
      name={name}
      label={
        <div className="flex items-center justify-between w-full">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </span>
          {showCount && (
            <span className={`text-xs ${isOverLimit() ? 'text-red-500' : 'text-gray-400'}`}>
              {getCurrentLength()}/{maxLength}
            </span>
          )}
        </div>
      }
      rules={formRules}
      extra={extra}
      className={`mb-6 ${className}`}
      validateStatus={isOverLimit() ? 'error' : undefined}
      help={isOverLimit() ? `Nội dung không được vượt quá ${maxLength} ký tự!` : undefined}
    >
      <div 
        className={`border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden ${disabled ? 'bg-gray-100' : 'bg-white'} ${isOverLimit() ? 'border-red-300' : ''}`}
        style={{ minHeight: height }}
      >
        {typeof window !== 'undefined' && ClassicEditor && CKEditor ? (
          <CKEditor
            editor={ClassicEditor as any}
            config={editorConfig as any}
            data={value || ''}
            onChange={handleEditorChange}
            onReady={handleReady}
            disabled={disabled}
          />
        ) : (
          <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded animate-pulse flex items-center justify-center">
            <span className="text-gray-500 dark:text-gray-400">Loading editor...</span>
          </div>
        )}
      </div>
    </Form.Item>
  );
};

export default RichTextEditor;