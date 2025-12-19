'use client';
import { FC, useCallback, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRealTimeValidation } from '../../hooks/useRealTimeValidation';
import ValidationFeedback from './ValidationFeedback';

// Dynamically import CKEditor to avoid chunk loading issues
const CKEditor = dynamic(
  () => import('@ckeditor/ckeditor5-react').then(mod => ({ default: mod.CKEditor })),
  { ssr: false, loading: () => <div>Loading editor...</div> }
);

interface RichTextEditorProps {
  name: string;
  label: string;
  placeholder?: string;
  validationType: string;
  required?: boolean;
  maxLength?: number;
  minHeight?: number;
  className?: string;
  showValidationFeedback?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

const RichTextEditor: FC<RichTextEditorProps> = ({
  name,
  label,
  placeholder = 'Nhập nội dung...',
  validationType,
  required = false,
  maxLength = 2000,
  minHeight = 200,
  className = '',
  showValidationFeedback = true,
  value = '',
  onChange
}) => {
  const { validateField, getValidation } = useRealTimeValidation();
  const [isFocused, setIsFocused] = useState(false);
  const [editorData, setEditorData] = useState(value);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [ClassicEditor, setClassicEditor] = useState<any>(null);

  // Load ClassicEditor dynamically on client side
  useEffect(() => {
    import('@ckeditor/ckeditor5-build-classic').then(module => {
      setClassicEditor(module.default);
    });
  }, []);

  const validation = getValidation(name);

  const handleContentChange = (_event: unknown, editor: unknown) => {
    const currentEditor = editor as { getData: () => string };
    const data = currentEditor.getData();
    setEditorData(data);
    if (onChange) {
      onChange(data);
    }
    const text = new DOMParser().parseFromString(data, 'text/html').body.textContent || "";
    validateField(name, text, validationType);
  };

  const getPlainTextLength = useCallback(() => {
    return (new DOMParser().parseFromString(editorData, 'text/html').body.textContent || "").length;
  }, [editorData]);

  return (
    <div className={`mb-6 ${className}`}>
      <label className="flex items-center justify-between w-full mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {label}
          </span>
          {required && <span className="text-red-500">*</span>}
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {getPlainTextLength()}/{maxLength}
        </span>
      </label>
      <div className="ck-editor-container" style={{ minHeight: `${minHeight}px` }}>
        {ClassicEditor ? (
          <CKEditor
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            editor={ClassicEditor as any}
            config={{
              placeholder: placeholder,
            }}
            data={value}
            onChange={handleContentChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        ) : (
          <div>Loading editor...</div>
        )}
      </div>
      {showValidationFeedback && validation && (isFocused || validation.level === 'error') && (
        <div className="mt-2">
            <ValidationFeedback
                validation={validation}
                showSuggestions={isFocused || validation.level !== 'success'}
            />
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;