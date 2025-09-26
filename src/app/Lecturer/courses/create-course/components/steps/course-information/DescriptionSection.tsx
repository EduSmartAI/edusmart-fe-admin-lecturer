'use client';
import React, { FC } from 'react';
import { Form } from 'antd';
import SmartInput from '../../ui/SmartInput';
import ListFieldManager from '../../ui/ListFieldManager';

// Standalone Rich Text Editor using CKEditor
const RichTextFormField: React.FC<{
  value?: string;
  onChange?: (value: string) => void;
}> = ({ value, onChange }) => {
  const [editorComponents, setEditorComponents] = React.useState<{
    CKEditor: any;
    ClassicEditor: any;
  } | null>(null);
  
  const [currentLength, setCurrentLength] = React.useState(0);
  const editorRef = React.useRef<any>(null);

  // Use value from form field
  const editorValue = value || '';

  // Load CKEditor dynamically
  React.useEffect(() => {
    const loadEditor = async () => {
      try {
        const [ckEditorModule, classicEditorModule] = await Promise.all([
          import('@ckeditor/ckeditor5-react'),
          import('@ckeditor/ckeditor5-build-classic')
        ]);
        
        setEditorComponents({
          CKEditor: ckEditorModule.CKEditor,
          ClassicEditor: classicEditorModule.default
        });
      } catch (error) {
        console.error('Failed to load CKEditor:', error);
      }
    };
    
    if (typeof window !== 'undefined') {
      loadEditor();
    }
  }, []);

  // Function to count plain text characters
  const getPlainTextLength = (html: string): number => {
    if (typeof window === 'undefined') return 0;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent?.length || 0;
  };

  // Update length when content changes
  React.useEffect(() => {
    setCurrentLength(getPlainTextLength(editorValue));
  }, [editorValue]);

  // Handle editor change
  const handleEditorChange = React.useCallback((event: any, editor: any) => {
    const data = editor.getData();
    setCurrentLength(getPlainTextLength(data));
    if (onChange) {
      onChange(data);
    }
  }, [onChange]);

  // Handle editor ready
  const handleReady = React.useCallback((editor: any) => {
    editorRef.current = editor;
  }, []);

  const maxLength = 2000;
  const isOverLimit = currentLength > maxLength;

  const editorConfig = {
    toolbar: {
      items: [
        'heading',
        '|',
        'bold',
        'italic',
        'underline',
        '|',
        'fontSize',
        'fontColor',
        '|',
        'bulletedList',
        'numberedList',
        '|',
        'alignment',
        '|',
        'link',
        'blockQuote',
        '|',
        'undo',
        'redo'
      ],
    },
    placeholder: 'Mô tả chi tiết về khóa học, nội dung, phương pháp giảng dạy...',
    language: 'vi',
    // Cấu hình để sử dụng <br> thay vì <p> tags khi Enter
    enterMode: 'br', // hoặc có thể dùng 'div'
    // Loại bỏ auto-paragraphing
    autoParagraph: false,
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">
          Sử dụng các công cụ định dạng để tạo nội dung chi tiết và hấp dẫn
        </span>
        <span className={`text-xs ${isOverLimit ? 'text-red-500' : 'text-gray-400'}`}>
          {currentLength}/{maxLength}
        </span>
      </div>
      <div 
        className={`border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white ${isOverLimit ? 'border-red-300' : ''}`}
        style={{ minHeight: 350 }}
      >
        {editorComponents ? (
          <editorComponents.CKEditor
            editor={editorComponents.ClassicEditor}
            config={editorConfig}
            data={editorValue}
            onChange={handleEditorChange}
            onReady={handleReady}
          />
        ) : (
          <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded animate-pulse flex items-center justify-center">
            <span className="text-gray-500 dark:text-gray-400">Loading editor...</span>
          </div>
        )}
      </div>
      
      {isOverLimit && (
        <div className="text-red-500 text-xs">
          Nội dung không được vượt quá {maxLength} ký tự!
        </div>
      )}
    </div>
  );
};

const DescriptionSection: FC = () => {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">Mô tả chi tiết</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Giúp học viên hiểu rõ về nội dung và mục tiêu của khóa học.</p>
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Mô tả chi tiết
              <span className="text-red-500 ml-1">*</span>
            </span>
          </div>
          <Form.Item
            name="description"
            rules={[
              { required: true, message: 'Vui lòng nhập mô tả chi tiết!' },
            ]}
            className="mb-0"
          >
            <RichTextFormField />
          </Form.Item>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ListFieldManager
            name="learningObjectives"
            label="Mục tiêu học tập"
            placeholder="VD: Xây dựng ứng dụng React từ đầu"
            minItems={4}
            maxItems={10}
            required
            helpText="Mô tả những gì học viên sẽ đạt được sau khi hoàn thành khóa học. Sử dụng động từ hành động như 'Xây dựng', 'Tạo ra', 'Phân tích'..."
            examples={[
              "Xây dựng ứng dụng web hoàn chỉnh với React và Redux",
              "Tạo ra các component tái sử dụng và hiệu quả",
              "Triển khai ứng dụng lên production environment",
              "Tối ưu hóa performance và SEO cho ứng dụng React"
            ]}
          />

          <ListFieldManager
            name="targetAudience"
            label="Đối tượng học viên"
            placeholder="VD: Sinh viên CNTT muốn học Frontend"
            minItems={3}
            maxItems={6}
            required
            helpText="Mô tả ai là đối tượng phù hợp nhất cho khóa học này. Giúp học viên tự đánh giá xem khóa học có phù hợp với họ không."
            examples={[
              "Sinh viên CNTT muốn học phát triển Frontend",
              "Lập trình viên Backend muốn chuyển sang Fullstack",
              "Người mới bắt đầu với kiến thức HTML/CSS cơ bản",
              "Freelancer muốn nâng cao kỹ năng React"
            ]}
          />
        </div>

        <ListFieldManager
          name="requirements"
          label="Yêu cầu trước khi học"
          placeholder="VD: Kiến thức HTML, CSS cơ bản"
          minItems={2}
          maxItems={7}
          required
          helpText="Liệt kê những kiến thức, kỹ năng hoặc công cụ mà học viên cần có trước khi bắt đầu khóa học."
          examples={[
            "Kiến thức HTML và CSS cơ bản",
            "Hiểu biết về JavaScript ES6+",
            "Máy tính có cài đặt Node.js và VS Code",
            "Kinh nghiệm sử dụng Git và GitHub",
            "Không cần kinh nghiệm React trước đó"
          ]}
        />
      </div>
    </div>
  );
};

export default DescriptionSection;

