'use client';
import { FC } from 'react';
import { Form } from 'antd';
import BaseControlSelect from 'EduSmart/components/BaseControl/BaseControlSelect';
import CourseTagsSelector from '../../ui/CourseTagsSelector';

const ClassificationSection: FC = () => {

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">Phân loại khóa học</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Giúp học viên dễ dàng tìm thấy khóa học của bạn thông qua tìm kiếm và bộ lọc.</p>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          <Form.Item
            label="Trình độ"
            name="level"
            rules={[{ required: true, message: 'Vui lòng chọn trình độ!' }]}
          >
            <BaseControlSelect
              options={[
                { label: 'Người mới bắt đầu', value: 'Beginner' },
                { label: 'Trung bình', value: 'Intermediate' },
                { label: 'Nâng cao', value: 'Advanced' }
              ]}
              width="100%"
              size="large"
            />
          </Form.Item>
        </div>

        <Form.Item name="courseTags">
          <CourseTagsSelector
            maxTags={10}
            placeholder="Nhập và chọn các từ khóa liên quan..."
          />
        </Form.Item>
      </div>
    </div>
  );
};

export default ClassificationSection;

