'use client';
import { FC, useState, useEffect } from 'react';
import { Form, Select, Spin } from 'antd';
import SmartInput from '../../ui/SmartInput';
import { CloudinaryImageUpload } from 'EduSmart/components/Common/FileUpload';
import StreamingVideoUploader from 'EduSmart/components/Video/StreamingVideoUploader';
import { subjectApiService } from 'EduSmart/api/api-subject-service';

const BasicInfoSection: FC = () => {
  const [subjects, setSubjects] = useState<{ label: string; value: string; code: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const form = Form.useFormInstance();

  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      try {
        const result = await subjectApiService.getSubjects();
        if (result.success && result.response) {
          const subjectOptions = result.response.map(subject => ({
            label: subject.code,
            value: subject.id,
            code: subject.code,
          }));
          setSubjects(subjectOptions);
        }
      } catch (error) {
        console.error('Error loading subjects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  const handleSubjectChange = (value: string) => {
    const selectedSubject = subjects.find((s) => s.value === value);
    if (selectedSubject && form) {
      // Use setFieldsValue to avoid meta deepEqual issues
      form.setFieldsValue({ subjectCode: selectedSubject.code });
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">Thông tin cơ bản</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Tên, mô tả ngắn và hình ảnh đại diện cho khóa học.</p>
      <div className="space-y-6">
        <SmartInput
          name="title"
          label="Tên khóa học"
          placeholder="VD: Lập trình ReactJS từ cơ bản đến nâng cao"
          validationType="title"
          required
          maxLength={200}
          showCount
        />

        <SmartInput
          name="subtitle"
          label="Mô tả phụ"
          placeholder="VD: Xây dựng ứng dụng web hiện đại với React, Redux và TypeScript"
          validationType="subtitle"
          required
          maxLength={500}
          showCount
        />

        <Form.Item
          name="subjectId"
          label="Mã môn học"
          rules={[{ required: true, message: 'Vui lòng chọn mã môn học!' }]}
        >
          <Select
            size="large"
            placeholder="Chọn mã môn học"
            showSearch
            loading={loading}
            notFoundContent={loading ? <Spin size="small" /> : 'Không tìm thấy môn học'}
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={subjects}
            onChange={handleSubjectChange}
          />
        </Form.Item>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ảnh bìa khóa học <span className="text-red-500">*</span>
          </label>
          <Form.Item name="courseImageUrl" rules={[{ required: true, message: 'Vui lòng tải ảnh bìa' }]} valuePropName="value">
            <CloudinaryImageUpload maxCount={1} />
          </Form.Item>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Ảnh bìa chất lượng cao (tỷ lệ 16:9, kích thước 750x422px) sẽ tạo ấn tượng tốt.
          </p>
        </div>

        <Form.Item 
          name="promoVideo" 
          label="Video giới thiệu khóa học" 
          valuePropName="value"
          getValueFromEvent={(value) => value}
        >
          <StreamingVideoUploader 
            maxSizeMB={300}
            placeholder="Chọn hoặc kéo thả video giới thiệu vào đây"
          />
        </Form.Item>
      </div>
    </div>
  );
};

export default BasicInfoSection;

