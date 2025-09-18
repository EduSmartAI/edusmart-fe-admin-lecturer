'use client';
import { FC } from 'react';
import { Form } from 'antd';
import SmartInput from '../../ui/SmartInput';
import ListFieldManager from '../../ui/ListFieldManager';

const DescriptionSection: FC = () => {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">Mô tả chi tiết</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Giúp học viên hiểu rõ về nội dung và mục tiêu của khóa học.</p>
      <div className="space-y-6">
        <SmartInput
          name="description"
          label="Mô tả ngắn"
          type="textarea"
          placeholder="Mô tả ngắn gọn, hấp dẫn để thu hút học viên."
          validationType="description"
          required
          maxLength={200}
          rows={3}
          showCount
        />
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

