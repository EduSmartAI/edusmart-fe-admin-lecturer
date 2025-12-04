'use client';
import { FC } from 'react';
import { Form, Select } from 'antd';
import SmartInput from '../../ui/SmartInput';
import { CloudinaryImageUpload } from 'EduSmart/components/Common/FileUpload';
import StreamingVideoUploader from 'EduSmart/components/Video/StreamingVideoUploader';

const BasicInfoSection: FC = () => {
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
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={[
              // Updated with correct subject IDs from database
              { label: 'PRF192', value: 'a4917fc0-bbcc-46b1-a7c8-f32e1d2aa298' },
              { label: 'MAE101', value: 'a83eabde-fb96-4732-88f3-3e7a846796bc' },
              { label: 'CEA201', value: '432cabc2-79bd-42ac-a67b-fc233dd3a6bc' },
              { label: 'SSL101C', value: '3ed33ae3-da55-49f7-b563-41ca0503fab5' },
              { label: 'CSI104', value: '63368d18-6112-413d-9815-4e31597b6e4c' },
              { label: 'NWC203C', value: '5e8967c9-2971-4250-a7fc-a8a26ca7f106' },
              { label: 'SSG104', value: '0611fe1b-416d-49eb-b0bd-b0ff73cc00c9' },
              { label: 'PRO192', value: 'e70ee6db-2fc9-4176-adae-904973bcc475' },
              { label: 'MAD101', value: 'ec341342-0993-42b2-a4df-ff0433381605' },
              { label: 'OSG202', value: 'b47af2e8-ac4c-4328-b61a-7ba0446556a7' },
              { label: 'CSD201', value: 'ed305e62-8cdc-49af-b7d0-290c54a6dbfb' },
              { label: 'DBI202', value: '16299387-cb9f-476c-aff1-a93fcd3d9266' },
              { label: 'LAB211', value: '75ef24fc-2915-4a76-9c26-b4ff1af07f2e' },
              { label: 'JPD113', value: '8d6297cd-98df-4ed0-9c52-cce0be2642da' },
              { label: 'WED201C', value: 'c1604ae9-5ee3-457d-b7d0-186546f490ba' },
              { label: 'SWE201C', value: 'c61bfce2-fc50-478f-a33d-cd2031211125' },
              { label: 'JPD123', value: '006449aa-5a7e-4d91-990a-5ffefaa6d220' },
              { label: 'IOT102', value: 'bc1cedaa-4279-4bca-b5d2-60cd4705b4dc' },
              { label: 'PRJ301', value: '4bbc5bf7-bfe9-4762-90cd-7825ca9bffde' },
              { label: 'MAS291', value: 'a7a8d965-8564-4ad9-ac34-2c8c76f7103b' },
              { label: 'SWR302', value: '7d6c6094-fcd2-4521-b568-09c5fb796c75' },
              { label: 'SWT301', value: 'de4982a0-82aa-48b0-b824-8267edb15a55' },
              { label: 'SWP391', value: 'a4b86226-5d71-4e97-a822-284ab4bca343' },
              { label: 'ITE302C', value: '898e94b7-cbab-4b6d-857b-3a3a09dfbe0e' },
              { label: 'OJT202', value: '2a56f88e-29c4-4482-92c3-23ae0de88d72' },
              { label: 'ENW492C', value: '810cc767-1a1f-42ab-8510-d670aa11a69b' },
              { label: 'EXE101', value: '9b9b36a8-5dbf-4ba3-8caf-3645716918c2' },
              { label: 'PRU212', value: '3ccd8b12-32a5-451d-9cc7-e034c3c544f0' },
              { label: 'PMG201C', value: '7b8bbd5b-abdf-4203-800c-1890144a6159' },
              { label: 'SWD392', value: 'fa1f6445-3fc7-4284-b8ac-0338148cd10a' },
              { label: 'MLN122', value: 'd3d0a48d-ba44-4c8a-b9b3-d6cf9e6e2166' },
              { label: 'MLN111', value: 'a9030ae8-8799-4548-82ab-6df7e5fd0fef' },
              { label: 'EXE201', value: '0773bda7-4280-4dbe-aed2-40bbc6ecf324' },
              { label: 'WDU203C', value: '6c8111e7-0bb2-45a4-b0c3-13ebc34bb621' },
              { label: 'PRM392', value: '9119e3a2-1471-4521-99bc-d28e981c2bfd' },
              { label: 'MLN131', value: 'df536a34-ad72-423d-b398-bf8727287d12' },
              { label: 'VNR202', value: '5e0350ac-c664-4818-93f0-8b3b1eb244df' },
              { label: 'HCM202', value: '15f5dda4-68b9-4b97-81d5-800a250e0a4e' },
              { label: 'SEP490', value: '7f0174b9-2a64-480e-9be5-df87092c9f70' },
              { label: 'PRN212', value: '888a4c89-ea86-4653-aea7-9c8d87139928' },
              { label: 'PRN222', value: '2857f69c-c1c7-4d87-a365-79a59af754fb' },
              { label: 'PRN232', value: 'b48cb061-4bc6-4eb7-a5b7-856e01d9c283' },
            ]}
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

