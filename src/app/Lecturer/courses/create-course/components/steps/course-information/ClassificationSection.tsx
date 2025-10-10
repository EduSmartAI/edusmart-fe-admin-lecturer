/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { FC } from 'react';
import { Form, Select } from 'antd';
import TagsSelector from '../../ui/TagsSelector';

const ClassificationSection: FC = () => {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">Phân loại khóa học</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Giúp học viên dễ dàng tìm kiếm và lựa chọn khóa học phù hợp.
      </p>

      <div className="space-y-6">
        <Form.Item
          name="level"
          label="Cấp độ khóa học"
          rules={[{ required: true, message: 'Vui lòng chọn cấp độ' }]}
        >
          <Select
            size="large"
            placeholder="Chọn cấp độ phù hợp với khóa học"
            options={[
              { value: 'Beginner', label: '🌱 Cơ bản - Beginner' },
              { value: 'Intermediate', label: '🚀 Trung cấp - Intermediate' },
              { value: 'Advanced', label: '⭐ Nâng cao - Advanced' },
            ]}
          />
        </Form.Item>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Thẻ tag khóa học <span className="text-red-500">*</span>
          </label>
          <Form.Item
            name="courseTags"
            rules={[
              { required: true, message: 'Vui lòng chọn ít nhất 1 thẻ tag' },
              {
                validator: async (_: any, value: any[]) => {
                  if (!value || value.length < 1) {
                    throw new Error('Vui lòng chọn ít nhất 1 thẻ tag');
                  }
                  if (value.length > 10) {
                    throw new Error('Không được chọn quá 10 thẻ tag');
                  }
                }
              }
            ]}
          >
            <TagsSelector />
          </Form.Item>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Chọn từ 1-10 thẻ tag phù hợp để học viên dễ dàng tìm thấy khóa học của bạn.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClassificationSection;
