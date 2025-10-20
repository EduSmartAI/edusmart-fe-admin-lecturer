'use client';
import { FC } from 'react';
import { Form } from 'antd';
import RichTextEditor from 'EduSmart/components/BaseControl/RichTextEditor';
import ListFieldManager from '../../ui/ListFieldManager';

const DescriptionSection: FC = () => {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">Mô tả khóa học</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Mô tả chi tiết về nội dung, lợi ích và giá trị mà học viên sẽ nhận được.
      </p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Mô tả chi tiết <span className="text-red-500">*</span>
          </label>
          <Form.Item
            name="description"
            rules={[
              { required: true, message: 'Vui lòng nhập mô tả chi tiết' },
              { min: 100, message: 'Mô tả chi tiết phải có ít nhất 100 ký tự' }
            ]}
          >
            <RichTextEditor
              name="description"
              label=""
              value=""
              onChange={() => {}}
              placeholder="Nhập mô tả chi tiết về khóa học..."
            />
          </Form.Item>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Mô tả chi tiết giúp học viên hiểu rõ hơn về nội dung và giá trị của khóa học.
          </p>
        </div>

        <ListFieldManager
          name="learningObjectives"
          label="Mục tiêu học tập"
          placeholder="VD: Hiểu và áp dụng được các khái niệm cơ bản của React"
          minItems={4}
          maxItems={15}
          required
          helpText="Những kỹ năng hoặc kiến thức cụ thể mà học viên sẽ đạt được sau khi hoàn thành khóa học"
          examples={[
            "Hiểu và áp dụng được các khái niệm cơ bản của React",
            "Xây dựng ứng dụng web với React Hooks",
            "Quản lý state với Redux Toolkit"
          ]}
        />

        <ListFieldManager
          name="requirements"
          label="Yêu cầu trước khóa học"
          placeholder="VD: Hiểu biết cơ bản về HTML, CSS và JavaScript"
          minItems={2}
          maxItems={10}
          required
          helpText="Kiến thức hoặc kỹ năng cần thiết mà học viên phải có trước khi tham gia khóa học"
          examples={[
            "Hiểu biết cơ bản về HTML, CSS",
            "Có kiến thức nền tảng về JavaScript",
            "Đã cài đặt Node.js và npm"
          ]}
        />

        <ListFieldManager
          name="targetAudience"
          label="Đối tượng học viên"
          placeholder="VD: Sinh viên IT muốn học về React"
          minItems={3}
          maxItems={10}
          required
          helpText="Mô tả những đối tượng phù hợp nhất với khóa học này"
          examples={[
            "Sinh viên ngành Công nghệ thông tin",
            "Lập trình viên mới bắt đầu với React",
            "Người chuyển ngành sang lập trình web"
          ]}
        />
      </div>
    </div>
  );
};

export default DescriptionSection;
