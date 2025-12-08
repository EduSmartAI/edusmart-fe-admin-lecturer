"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  InputNumber,
  Switch,
  Button,
  Space,
  Collapse,
  Typography,
  Tag,
  message,
  Table,
  Spin,
  Alert,
  Select,
  Popconfirm,
  Divider,
} from "antd";
import {
  SaveOutlined,
  CloseOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import type { Syllabus, UpdateSyllabusDto } from "EduSmart/types/syllabus";
import { updateSyllabus, getAllSubjects } from "EduSmart/api/api-syllabus-service";
import { useSyllabusStore } from "EduSmart/stores/Admin";
import type { SubjectDto } from "EduSmart/api/api-syllabus-service";

const { Title, Text } = Typography;
const { Panel } = Collapse;

interface SyllabusEditModalProps {
  open: boolean;
  syllabus: Syllabus | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface SubjectEditForm {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  credit: number;
  isMandatory: boolean;
}

interface SemesterEditForm {
  semesterId: string;
  semesterName: string;
  subjects: SubjectEditForm[];
}

export default function SyllabusEditModal({
  open,
  syllabus,
  onClose,
  onSuccess,
}: SyllabusEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [semesters, setSemesters] = useState<SemesterEditForm[]>([]);
  const [allSubjects, setAllSubjects] = useState<SubjectDto[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<Record<string, string | undefined>>({});
  const { allMajors } = useSyllabusStore();

  // Load all subjects for dropdown
  useEffect(() => {
    const loadSubjects = async () => {
      setLoadingSubjects(true);
      try {
        const subjects = await getAllSubjects(1, 500);
        setAllSubjects(subjects);
      } catch (error) {
        console.error("Error loading subjects:", error);
        message.error("Không thể tải danh sách môn học");
      } finally {
        setLoadingSubjects(false);
      }
    };
    
    if (open) {
      loadSubjects();
    }
  }, [open]);

  // Initialize form data when syllabus changes
  useEffect(() => {
    if (syllabus && open) {
      const initialSemesters: SemesterEditForm[] = syllabus.semesters.map(sem => ({
        semesterId: sem.semesterId,
        semesterName: sem.semesterName,
        subjects: sem.subjects.map(subj => ({
          subjectId: subj.subjectId,
          subjectCode: subj.subjectCode,
          subjectName: subj.subjectName,
          credit: subj.credit || 0,
          isMandatory: subj.isMandatory,
        })),
      }));
      setSemesters(initialSemesters);
    }
  }, [syllabus, open]);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (!syllabus) {
        message.error("Không tìm thấy thông tin syllabus");
        return;
      }

      // Transform to API payload
      const payload: UpdateSyllabusDto = {
        syllabusId: syllabus.syllabusId,
        semesters: semesters.map(sem => ({
          semesterId: sem.semesterId,
          subjects: sem.subjects.map(subj => ({
            subjectId: subj.subjectId,
            credit: subj.credit,
            isMandatory: subj.isMandatory,
          })),
        })),
      };

      const success = await updateSyllabus(payload);

      if (success) {
        message.success("Cập nhật syllabus thành công!");
        onSuccess();
        onClose();
      } else {
        message.error("Cập nhật syllabus thất bại. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error updating syllabus:", error);
      message.error("Có lỗi xảy ra khi cập nhật syllabus");
    } finally {
      setLoading(false);
    }
  };

  const updateSubjectCredit = (semesterIndex: number, subjectIndex: number, credit: number) => {
    const newSemesters = [...semesters];
    newSemesters[semesterIndex].subjects[subjectIndex].credit = credit;
    setSemesters(newSemesters);
  };

  const updateSubjectMandatory = (semesterIndex: number, subjectIndex: number, isMandatory: boolean) => {
    const newSemesters = [...semesters];
    newSemesters[semesterIndex].subjects[subjectIndex].isMandatory = isMandatory;
    setSemesters(newSemesters);
  };

  const addSubjectToSemester = (semesterIndex: number, subjectId: string) => {
    const subject = allSubjects.find(s => s.subjectId === subjectId);
    if (!subject) {
      message.error("Không tìm thấy môn học");
      return;
    }

    // Check if subject already exists in this semester
    const exists = semesters[semesterIndex].subjects.some(s => s.subjectId === subjectId);
    if (exists) {
      message.warning("Môn học đã tồn tại trong học kỳ này");
      return;
    }

    const newSemesters = [...semesters];
    newSemesters[semesterIndex].subjects.push({
      subjectId: subject.subjectId,
      subjectCode: subject.subjectCode,
      subjectName: subject.subjectName,
      credit: 3, // Default credit
      isMandatory: true,
    });
    setSemesters(newSemesters);
    
    // Clear selection for this semester
    const semesterId = semesters[semesterIndex].semesterId;
    setSelectedSubjects(prev => ({ ...prev, [semesterId]: undefined }));
    
    message.success(`Đã thêm môn ${subject.subjectName}`);
  };

  const removeSubjectFromSemester = (semesterIndex: number, subjectIndex: number) => {
    const newSemesters = [...semesters];
    const removedSubject = newSemesters[semesterIndex].subjects[subjectIndex];
    newSemesters[semesterIndex].subjects.splice(subjectIndex, 1);
    setSemesters(newSemesters);
    message.success(`Đã xóa môn ${removedSubject.subjectName}`);
  };

  if (!syllabus) {
    return null;
  }

  const major = allMajors.find(m => m.majorId === syllabus.majorId);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div className="flex items-center gap-3">
          <EditOutlined className="text-blue-600 text-xl" />
          <div>
            <Title level={4} className="!mb-0">
              Chỉnh sửa Syllabus {syllabus.versionLabel}
            </Title>
            {major && (
              <Text type="secondary" className="text-sm">
                {major.majorCode} - {major.majorName}
              </Text>
            )}
          </div>
        </div>
      }
      width={1000}
      footer={
        <Space>
          <Button onClick={onClose} icon={<CloseOutlined />}>
            Hủy
          </Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={loading}
            icon={<SaveOutlined />}
          >
            Lưu thay đổi
          </Button>
        </Space>
      }
    >
      <Alert
        message="Hướng dẫn"
        description={
          <ul className="ml-4 mt-2 space-y-1">
            <li>• Chỉnh sửa số tín chỉ và loại môn học (bắt buộc/tự chọn)</li>
            <li>• Thêm môn học mới vào từng học kỳ</li>
            <li>• Xóa môn học khỏi học kỳ</li>
            <li>• Thay đổi sẽ được lưu khi bạn nhấn &ldquo;Lưu thay đổi&rdquo;</li>
          </ul>
        }
        type="info"
        showIcon
        className="mb-4"
      />

      <Spin spinning={loading || loadingSubjects}>
        <Collapse defaultActiveKey={semesters.map(s => s.semesterId)}>
          {semesters
            .sort((a, b) => {
              const semA = syllabus.semesters.find(s => s.semesterId === a.semesterId);
              const semB = syllabus.semesters.find(s => s.semesterId === b.semesterId);
              return (semA?.positionIndex || 0) - (semB?.positionIndex || 0);
            })
            .map((semester, semesterIndex) => {
              const totalCredits = semester.subjects.reduce((sum, s) => sum + s.credit, 0);
              const availableSubjects = allSubjects.filter(
                subject => !semester.subjects.some(s => s.subjectId === subject.subjectId)
              );
              
              return (
                <Panel
                  key={semester.semesterId}
                  header={
                    <div className="flex items-center justify-between w-full pr-4">
                      <Space>
                        <Text strong>{semester.semesterName}</Text>
                      </Space>
                      <Space>
                        <Tag color="blue">{semester.subjects.length} môn</Tag>
                        <Tag color="orange">{totalCredits} tín chỉ</Tag>
                      </Space>
                    </div>
                  }
                >
                  {/* Add Subject Section */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <Space.Compact style={{ width: '100%' }}>
                      <Select
                        placeholder="Chọn môn học để thêm vào học kỳ này"
                        style={{ width: '100%' }}
                        showSearch
                        filterOption={(input, option) =>
                          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={availableSubjects.map(subject => ({
                          value: subject.subjectId,
                          label: `${subject.subjectCode} - ${subject.subjectName}`,
                        }))}
                        onChange={(value) => setSelectedSubjects(prev => ({ ...prev, [semester.semesterId]: value }))}
                        value={selectedSubjects[semester.semesterId]}
                      />
                      <Button 
                        type="primary" 
                        icon={<PlusOutlined />}
                        onClick={() => {
                          const subjectId = selectedSubjects[semester.semesterId];
                          if (subjectId) {
                            addSubjectToSemester(semesterIndex, subjectId);
                          } else {
                            message.warning("Vui lòng chọn môn học");
                          }
                        }}
                        disabled={!selectedSubjects[semester.semesterId]}
                      >
                        Thêm
                      </Button>
                    </Space.Compact>
                  </div>

                  <Divider className="my-3" />

                  {/* Subjects Table */}
                  <Table
                    dataSource={semester.subjects}
                    rowKey="subjectId"
                    pagination={false}
                    size="small"
                    columns={[
                      {
                        title: "Mã môn",
                        dataIndex: "subjectCode",
                        width: 120,
                        render: (code: string) => (
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
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
                        width: 150,
                        render: (credit: number, record, subjectIndex) => (
                          <InputNumber
                            min={0}
                            max={10}
                            value={credit}
                            onChange={(value) =>
                              updateSubjectCredit(semesterIndex, subjectIndex, value || 0)
                            }
                            className="w-full"
                          />
                        ),
                      },
                      {
                        title: "Bắt buộc",
                        dataIndex: "isMandatory",
                        width: 120,
                        render: (isMandatory: boolean, record, subjectIndex) => (
                          <Switch
                            checked={isMandatory}
                            onChange={(checked) =>
                              updateSubjectMandatory(semesterIndex, subjectIndex, checked)
                            }
                            checkedChildren="Có"
                            unCheckedChildren="Không"
                          />
                        ),
                      },
                      {
                        title: "Thao tác",
                        width: 100,
                        align: "center" as const,
                        render: (_: unknown, record: SubjectEditForm, subjectIndex: number) => (
                          <Popconfirm
                            title="Xóa môn học?"
                            description={`Bạn có chắc muốn xóa môn "${record.subjectName}" khỏi học kỳ này?`}
                            onConfirm={() => removeSubjectFromSemester(semesterIndex, subjectIndex)}
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                          >
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              size="small"
                            />
                          </Popconfirm>
                        ),
                      },
                    ]}
                  />
                </Panel>
              );
            })}
        </Collapse>
      </Spin>
    </Modal>
  );
}
