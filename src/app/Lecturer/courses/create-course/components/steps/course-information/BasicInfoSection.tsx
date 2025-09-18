'use client';
import { FC } from 'react';
import { Form, Select } from 'antd';
import SmartInput from '../../ui/SmartInput';
import { CloudinaryImageUpload, CloudinaryVideoUpload } from 'EduSmart/components/Common/FileUpload';

const BasicInfoSection: FC = () => {
  const form = Form.useFormInstance();

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
          maxLength={60}
          showCount
        />

        <SmartInput
          name="subtitle"
          label="Mô tả phụ"
          placeholder="VD: Xây dựng ứng dụng web hiện đại với React, Redux và TypeScript"
          validationType="subtitle"
          required
          maxLength={120}
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
              { label: 'MLN131', value: '0977136d-d915-4090-8ba1-381ce8fd1f5e' },
              { label: 'ACC101', value: '98de3c86-a9ab-4f07-8408-5aa9287e48cd' },
              { label: 'ACD301', value: 'f3faba7e-4741-43fe-b9fc-1ff4a8ccfd19' },
              { label: 'AGU301', value: '63e3db0f-b100-4dd2-ae01-37e0daefca6e' },
              { label: 'AIL304M', value: 'e4042e75-ccf8-424a-b054-8e5fb083ec36' },
              { label: 'ASP301', value: 'b4bac538-b4fb-4b22-845c-e2e29d8c921d' },
              { label: 'BDI302C', value: '0bdb70c0-2eae-4053-a15b-5bc7aa21298e' },
              { label: 'CEA201', value: '2fae3c84-4b0b-4e25-98f2-1ed2e42796ce' },
              { label: 'CSD201', value: 'd742fe6d-aa22-4b6f-97f6-731da64ddca2' },
              { label: 'CSI104', value: '256ea27e-55b0-4271-b782-bd986028f43b' },
              { label: 'DBI202', value: '9aaaa6ff-748b-4b89-a99d-b8c17141aa55' },
              { label: 'DBM301', value: '306a5448-2fe3-4226-b82d-aadc81a9ed1b' },
              { label: 'DBM302M', value: '84a07801-0c52-4350-820b-ed5e6f3c4993' },
              { label: 'DCD301', value: 'c7288e2f-233b-461d-9f3c-71a86049f9b6' },
              { label: 'DPL303M', value: '96940563-8618-4306-b1d5-f3f10e648de9' },
              { label: 'DSO391', value: 'fad26264-fcf4-4645-bc26-7302605205d8' },
              { label: 'DSR301M', value: '5b1cc1cc-e92e-4a19-b5f6-c110a06ed1a7' },
              { label: 'DSS301', value: 'c09ae6a2-bd52-457a-a117-5113bbe42502' },
              { label: 'DTA301', value: 'ab1fa0e3-ef17-4884-b9a4-c13bbe753e31' },
              { label: 'ECI101', value: '60e1074b-7474-4551-b0e3-1f559c63ecc7' },
              { label: 'ENW492C', value: 'e2751718-fa0f-4a93-900b-dac33cb20b78' },
              { label: 'EXE101', value: '984f7000-2988-46b1-a80c-ff2a34215a53' },
              { label: 'EXE201', value: '1022acf2-1c88-4622-aee2-ae60934ab25b' },
              { label: 'FER202', value: '421c94b4-efc6-4970-8bd9-866d045e3070' },
              { label: 'FGU301', value: 'b49a1280-3a46-4819-8db3-00691135930b' },
              { label: 'GDC301', value: '1ea80e49-c6c0-48a5-a198-3bc6cb5de242' },
              { label: 'GNS301', value: '64583282-40f5-45b4-98eb-98153ff866fd' },
              { label: 'HSF302', value: '91976f02-742b-4c6a-ad3b-9210e40068a1' },
              { label: 'IAO201C', value: '3549383e-9127-4bbf-a0c1-fe51b7cc8403' },
              { label: 'IOT102', value: 'ed30ecab-a33d-42f1-972d-0645dac2be91' },
              { label: 'ISM302', value: 'f1b144c3-58a1-4eed-bab3-8ac2c9e6e4da' },
              { label: 'ISP392', value: '0e2bed9f-5ec7-4c95-baa4-4a0a72c71a02' },
              { label: 'ITA301', value: '26e311eb-40ed-4635-a409-95af0feccbc7' },
              { label: 'ITE302C', value: '7170f8b0-0d81-490a-a09c-abbaf95cfbd8' },
              { label: 'JPD113', value: 'b3f2afba-ab1b-436d-9128-55748a3fb0c6' },
              { label: 'JPD123', value: '12b8b086-90af-46e9-a781-59f74b696e62' },
              { label: 'LAB211', value: 'a316b668-7574-4fbf-8c29-5fe6ac6d2b27' },
              { label: 'MAD101', value: '6cc88cc0-9765-480a-961c-c0e757a5165d' },
              { label: 'MAE101', value: '5ba9f4d2-b54a-4f57-a7d1-920b7a1efc9f' },
              { label: 'MAS291', value: 'd4dac070-6368-47a2-a72a-16c59258be20' },
              { label: 'MIP201', value: '9a948c14-e212-4eb0-86ef-03d7c3ae0b57' },
              { label: 'MLN111', value: 'b891e040-3df7-439f-b047-2890065fde69' },
              { label: 'MLN122', value: '76591f93-96dd-43e2-a293-85aaa18f5d78' },
              { label: 'MMA301', value: 'f6ab03ce-5142-49ff-93af-a1cae912f91c' },
              { label: 'MSS301', value: '16df1465-28c3-461e-abe8-d8f40c7b1649' },
              { label: 'NWC203C', value: '2039c2b7-129b-4522-9f06-c23b37a01d34' },
              { label: 'OJT202', value: 'f3fe08a2-200e-4a6e-8c49-9a875ad2c1c7' },
              { label: 'OSG202', value: 'ea8e7a80-0482-447e-8fe1-967cbef5d024' },
              { label: 'PMG201C', value: 'c8e5427c-c38a-4e52-8903-8689351476d1' },
              { label: 'PRC392M', value: 'c12c29e2-de80-472e-bffd-ee712131fbda' },
              { label: 'PRF192', value: '0d9d7be9-7f92-4316-9787-48f71a4428a7' },
              { label: 'PRJ301', value: 'f88885b4-c4df-439b-8efd-4b2c4b3241df' },
              { label: 'PRM392', value: '811b9c19-bc85-4428-82be-308f55975ed7' },
              { label: 'PRN212', value: 'd9824682-b5ba-4cd2-8015-5a808e899e4e' },
              { label: 'PRN222', value: 'd982ce0e-65bc-475b-9ea4-684a57f00069' },
              { label: 'PRN232', value: 'cc4988ba-dc11-4281-bec3-0fce83ce3acb' },
              { label: 'PRO192', value: '4a0b9a4c-af2b-4b18-ad17-f5f145e5eb44' },
              { label: 'PRP201C', value: '5a7b2919-fd77-4569-becd-160fefea72bd' },
              { label: 'PRU212', value: '62b9c4c3-4d93-4f52-870f-af5216d99d4f' },
              { label: 'SAP311', value: '3c5919e1-b489-4508-bfa0-34051c68b56b' },
              { label: 'SAP321', value: 'fca3ac63-9035-4632-b9a1-9e4d4e99ee3f' },
              { label: 'SAP341', value: '75ed7e48-ff38-4f5b-ac63-05c76cfc6f17' },
              { label: 'SBA301', value: '88862f80-e538-4fd2-8f95-ee7e0d065ae5' },
              { label: 'SDN302', value: '02cb9805-e746-49eb-a6dc-d8f18dfda403' },
              { label: 'SSG104', value: 'c51b17f0-ebf0-4b6d-acd6-f48a851cfca9' },
              { label: 'SSL101C', value: '98f16c9f-ae12-44c0-be0c-043715d65506' },
              { label: 'SWD392', value: '133f3a6b-3ac5-4f60-bc36-f593b39dcf76' },
              { label: 'SWE201C', value: 'be823a5a-abac-4fd6-9a3c-d7ab96be12ae' },
              { label: 'SWP391', value: '8c521bfb-ab33-46ba-a3e5-1151b9998bcc' },
              { label: 'SWR302', value: 'ab5a50f8-8f13-40c7-8f44-ba91d2173cd6' },
              { label: 'SWT301', value: '18f2251f-41db-41c2-a755-57ce9d3049d9' },
              { label: 'WDP301', value: 'b477a88e-aaa1-4df0-be6c-bf520b7c8c00' },
              { label: 'WDU203C', value: 'de979843-22dc-41cb-acbb-d6fb1b96cc78' },
              { label: 'WED201C', value: 'b98f0391-4a53-4323-bea8-869cdbdf1e0c' }
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

        <Form.Item name="promoVideo" label="Video giới thiệu khóa học" valuePropName="value">
          <CloudinaryVideoUpload maxSizeMB={300} />
        </Form.Item>
      </div>
    </div>
  );
};

export default BasicInfoSection;

