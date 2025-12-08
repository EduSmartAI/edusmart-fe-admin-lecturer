"use client";

import {
  Modal,
  Descriptions,
  Table,
  Tag,
  Typography,
  Collapse,
  Button,
  Space,
  Spin,
  Empty,
  Badge,
} from "antd";
import {
  CalendarOutlined,
  BookOutlined,
  CopyOutlined,
  CheckCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { Syllabus, SyllabusSemester } from "EduSmart/types/syllabus";
import { useSyllabusStore } from "EduSmart/stores/Admin";

const { Title, Text } = Typography;
const { Panel } = Collapse;

interface SyllabusDetailModalProps {
  open: boolean;
  syllabus: Syllabus | null;
  loading: boolean;
  onClose: () => void;
  onClone: (syllabus: Syllabus) => void;
  onEdit?: (syllabus: Syllabus) => void;
}

export default function SyllabusDetailModal({
  open,
  syllabus,
  loading,
  onClose,
  onClone,
  onEdit,
}: SyllabusDetailModalProps) {
  const { allMajors } = useSyllabusStore();

  if (loading) {
    return (
      <Modal open={open} onCancel={onClose} footer={null} width={800}>
        <div className="flex justify-center items-center py-20">
          <Spin size="large" />
        </div>
      </Modal>
    );
  }

  if (!syllabus) {
    return (
      <Modal open={open} onCancel={onClose} footer={null} width={800}>
        <Empty description="Không tìm thấy thông tin Syllabus" />
      </Modal>
    );
  }

  const major = allMajors.find(m => m.majorId === syllabus.majorId);
  const totalSubjects = syllabus.semesters.reduce(
    (sum, sem) => sum + sem.subjects.length,
    0
  );
  const mandatorySubjects = syllabus.semesters.reduce(
    (sum, sem) => sum + sem.subjects.filter(s => s.isMandatory).length,
    0
  );

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div className="flex items-center gap-3">
          <BookOutlined className="text-blue-600 text-xl" />
          <div>
            <Title level={4} className="!mb-0">
              Syllabus {syllabus.versionLabel}
            </Title>
            {major && (
              <Text type="secondary" className="text-sm">
                {major.majorCode} - {major.majorName}
              </Text>
            )}
          </div>
        </div>
      }
      width={900}
      footer={
        <Space>
          <Button onClick={onClose}>Đóng</Button>
          {onEdit && (
            <Button
              type="default"
              icon={<EditOutlined />}
              onClick={() => onEdit(syllabus)}
            >
              Chỉnh sửa
            </Button>
          )}
          <Button
            type="primary"
            icon={<CopyOutlined />}
            onClick={() => onClone(syllabus)}
          >
            Clone Syllabus này
          </Button>
        </Space>
      }
    >
      {/* Basic Info */}
      <Descriptions bordered size="small" column={2} className="mb-4">
        <Descriptions.Item label="Version Label">
          <Tag color="blue" className="text-base font-bold">
            {syllabus.versionLabel}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Chuyên ngành">
          {major ? `${major.majorCode} - ${major.majorName}` : syllabus.majorId}
        </Descriptions.Item>
        <Descriptions.Item label="Hiệu lực từ">
          <Space>
            <CalendarOutlined />
            {dayjs(syllabus.effectiveFrom).format("DD/MM/YYYY")}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Hiệu lực đến">
          <Space>
            <CalendarOutlined />
            {dayjs(syllabus.effectiveTo).format("DD/MM/YYYY")}
          </Space>
        </Descriptions.Item>
      </Descriptions>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {syllabus.semesters.length}
          </div>
          <Text type="secondary">Học kỳ</Text>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{totalSubjects}</div>
          <Text type="secondary">Môn học</Text>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{mandatorySubjects}</div>
          <Text type="secondary">Môn bắt buộc</Text>
        </div>
      </div>

      {/* Semesters Detail */}
      <Title level={5}>Chi tiết các học kỳ</Title>
      
      <Collapse defaultActiveKey={syllabus.semesters.map(s => s.semesterId)} className="mb-4">
        {syllabus.semesters
          .sort((a, b) => a.positionIndex - b.positionIndex)
          .map(semester => (
            <Panel
              key={semester.semesterId}
              header={
                <div className="flex items-center justify-between w-full pr-4">
                  <Space>
                    <Badge status="processing" />
                    <Text strong>{semester.semesterName}</Text>
                  </Space>
                  <Tag color="blue">{semester.subjects.length} môn</Tag>
                </div>
              }
            >
              <SemesterSubjectsTable semester={semester} />
            </Panel>
          ))}
      </Collapse>
    </Modal>
  );
}

// Sub-component for semester subjects table
function SemesterSubjectsTable({ semester }: { semester: SyllabusSemester }) {
  const columns = [
    {
      title: "#",
      dataIndex: "positionIndex",
      width: 50,
      render: (index: number) => <Tag color="default">{index}</Tag>,
    },
    {
      title: "Mã môn",
      dataIndex: "subjectCode",
      width: 100,
      render: (code: string) => (
        <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
          {code}
        </span>
      ),
    },
    {
      title: "Tên môn học",
      dataIndex: "subjectName",
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: "Tín chỉ",
      dataIndex: "credit",
      width: 80,
      render: (credit: number | null) => (
        <Tag color="blue">{credit || "-"} TC</Tag>
      ),
    },
    {
      title: "Loại",
      dataIndex: "isMandatory",
      width: 100,
      render: (isMandatory: boolean) =>
        isMandatory ? (
          <Tag color="red" icon={<CheckCircleOutlined />}>
            Bắt buộc
          </Tag>
        ) : (
          <Tag color="green">Tự chọn</Tag>
        ),
    },
  ];

  if (semester.subjects.length === 0) {
    return <Empty description="Không có môn học" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }

  return (
    <Table
      dataSource={semester.subjects.sort((a, b) => a.positionIndex - b.positionIndex)}
      columns={columns}
      rowKey="subjectId"
      size="small"
      pagination={false}
    />
  );
}
