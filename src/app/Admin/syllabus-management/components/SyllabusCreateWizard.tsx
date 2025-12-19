"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Steps,
  Button,
  Form,
  Select,
  DatePicker,
  Input,
  Checkbox,
  Card,
  Row,
  Col,
  Table,
  Tag,
  Typography,
  Alert,
  message,
  InputNumber,
  Divider,
  Empty,
} from "antd";
import type { DefaultOptionType } from "antd/es/select";
import {
  PlusOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useSyllabusStore } from "EduSmart/stores/Admin";
import type { 
  SyllabusWizardStep1, 
  SyllabusWizardStep2,
  CreateSyllabusSubjectDto,
} from "EduSmart/types/syllabus";

const { Title, Text } = Typography;
const { Option } = Select;

interface SyllabusCreateWizardProps {
  open: boolean;
  onClose: (success?: boolean) => void;
}

const steps = [
  { title: "Thông tin cơ bản", description: "Chuyên ngành & thời gian" },
  { title: "Chọn học kỳ", description: "Các kỳ trong syllabus" },
  { title: "Thêm môn học", description: "Môn học cho từng kỳ" },
  { title: "Xác nhận", description: "Xem lại & hoàn thành" },
];

export default function SyllabusCreateWizard({ open, onClose }: SyllabusCreateWizardProps) {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [step1Data, setStep1Data] = useState<SyllabusWizardStep1 | null>(null);
  const [step2Data, setStep2Data] = useState<SyllabusWizardStep2 | null>(null);
  const [semesterSubjects, setSemesterSubjects] = useState<Record<string, CreateSyllabusSubjectDto[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    allMajors,
    semesters,
    allSubjects,
    syllabusesLoading,
    createFullSyllabus,
    fetchAllMajors,
    fetchSemesters,
    fetchAllSubjects,
  } = useSyllabusStore();

  const selectedMajorId = step1Data?.majorId ?? form.getFieldValue("majorId");
  const selectedMajor = useMemo(() => {
    if (!selectedMajorId) return null;
    return allMajors.find(m => m.majorId === selectedMajorId) ?? null;
  }, [allMajors, selectedMajorId]);

  const isFoundationMajor = useMemo(() => {
    const name = selectedMajor?.majorName ?? "";
    return name.toLowerCase().includes("foundation");
  }, [selectedMajor?.majorName]);

  const visibleSemesters = useMemo(() => {
    if (isFoundationMajor) {
      // Foundation majors: only show semesters 1-4
      return semesters.filter(s => {
        const semNum = s.semesterNumber ?? 0;
        return semNum >= 1 && semNum <= 4;
      });
    }
    // Regular majors: show semesters 5 and above
    return semesters.filter(s => (s.semesterNumber ?? 0) >= 5);
  }, [isFoundationMajor, semesters]);

  // Load data on mount
  useEffect(() => {
    if (open) {
      if (allMajors.length === 0) fetchAllMajors();
      if (semesters.length === 0) fetchSemesters();
      if (allSubjects.length === 0) fetchAllSubjects();
    }
  }, [open, allMajors.length, semesters.length, allSubjects.length, fetchAllMajors, fetchSemesters, fetchAllSubjects]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setCurrentStep(0);
      setStep1Data(null);
      setStep2Data(null);
      setSemesterSubjects({});
      form.resetFields();
    }
  }, [open, form]);

  // Handle step 1 submit
  const handleStep1Submit = async () => {
    try {
      const values = await form.validateFields();
      const data: SyllabusWizardStep1 = {
        majorId: values.majorId,
        versionLabel: values.versionLabel.toUpperCase(),
        effectiveFrom: values.effectiveRange[0].format("YYYY-MM-DD"),
        effectiveTo: values.effectiveRange[1].format("YYYY-MM-DD"),
      };

      // If major changes, clear any step-2/3 selections to avoid mixing semesters/subjects
      if (step1Data?.majorId && step1Data.majorId !== data.majorId) {
        setStep2Data(null);
        setSemesterSubjects({});
        form.setFieldsValue({ selectedSemesters: [] });
      }

      setStep1Data(data);
      setCurrentStep(1);
    } catch {
      // Validation error
    }
  };

  // When major/visibility changes while on step 2, ensure selected semesters remain valid
  useEffect(() => {
    if (currentStep !== 1) return;

    const allowedIds = new Set(visibleSemesters.map(s => s.semesterId));
    const selectedIds: string[] = form.getFieldValue("selectedSemesters") || [];
    const filtered = selectedIds.filter(id => allowedIds.has(id));

    if (filtered.length !== selectedIds.length) {
      form.setFieldsValue({ selectedSemesters: filtered });
    }
  }, [currentStep, form, visibleSemesters]);

  // Handle step 2 submit
  const handleStep2Submit = () => {
    const selectedIds = form.getFieldValue("selectedSemesters") || [];
    if (selectedIds.length === 0) {
      message.warning("Vui lòng chọn ít nhất một học kỳ");
      return;
    }
    
    // Sort by semester number
    const sortedIds = [...selectedIds].sort((a, b) => {
      const semA = semesters.find(s => s.semesterId === a);
      const semB = semesters.find(s => s.semesterId === b);
      return (semA?.semesterNumber || 0) - (semB?.semesterNumber || 0);
    });

    setStep2Data({ selectedSemesterIds: sortedIds });
    
    // Initialize subjects for each semester if not already done
    const newSemesterSubjects = { ...semesterSubjects };
    sortedIds.forEach(id => {
      if (!newSemesterSubjects[id]) {
        newSemesterSubjects[id] = [];
      }
    });
    setSemesterSubjects(newSemesterSubjects);
    
    setCurrentStep(2);
  };

  // Handle step 3 submit
  const handleStep3Submit = () => {
    // Validate that at least one subject is added
    const hasSubjects = Object.values(semesterSubjects).some(subjects => subjects.length > 0);
    if (!hasSubjects) {
      message.warning("Vui lòng thêm ít nhất một môn học");
      return;
    }
    setCurrentStep(3);
  };

  // Add subject to semester
  const handleAddSubject = (semesterId: string, subjectId: string) => {
    const subject = allSubjects.find(s => s.subjectId === subjectId);
    if (!subject) return;

    setSemesterSubjects(prev => {
      const currentSubjects = prev[semesterId] || [];

      // Check if already added
      if (currentSubjects.some(s => s.subjectId === subjectId)) {
        message.warning("Môn học này đã được thêm vào kỳ học");
        return prev;
      }

      const newSubject: CreateSyllabusSubjectDto = {
        subjectId: subject.subjectId,
        credit: 3, // Default credit
        isMandatory: true,
        positionIndex: currentSubjects.length + 1,
      };

      return {
        ...prev,
        [semesterId]: [...currentSubjects, newSubject],
      };
    });
  };

  // Remove subject from semester
  const handleRemoveSubject = (semesterId: string, subjectId: string) => {
    setSemesterSubjects(prev => {
      const currentSubjects = prev[semesterId] || [];
      const filtered = currentSubjects.filter(s => s.subjectId !== subjectId);
      // Re-index
      const reindexed = filtered.map((s, idx) => ({ ...s, positionIndex: idx + 1 }));
      return {
        ...prev,
        [semesterId]: reindexed,
      };
    });
  };

  // Update subject properties
  const handleUpdateSubject = (
    semesterId: string, 
    subjectId: string, 
    field: 'credit' | 'isMandatory',
    value: number | boolean
  ) => {
    setSemesterSubjects(prev => {
      const currentSubjects = prev[semesterId] || [];
      const updated = currentSubjects.map(s => 
        s.subjectId === subjectId ? { ...s, [field]: value } : s
      );
      return {
        ...prev,
        [semesterId]: updated,
      };
    });
  };

  // Final submit
  const handleFinalSubmit = async () => {
    if (!step1Data || !step2Data) return;

    setIsSubmitting(true);
    try {
      const payload = {
        createFullSyllabusDto: {
          majorId: step1Data.majorId,
          versionLabel: step1Data.versionLabel,
          effectiveFrom: step1Data.effectiveFrom,
          effectiveTo: step1Data.effectiveTo,
          semesters: step2Data.selectedSemesterIds
            .map((semesterId, index) => ({
              semesterId,
              positionIndex: index + 1,
              subjects: (semesterSubjects[semesterId] || []).map((s, idx) => ({
                ...s,
                positionIndex: idx + 1,
              })),
            }))
            .filter(s => s.subjects.length > 0),
        },
      };

      const success = await createFullSyllabus(payload);
      if (success) {
        onClose(true);
      } else {
        message.error("Tạo Syllabus thất bại. Vui lòng thử lại.");
      }
    } catch {
      message.error("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get subject name by ID
  const getSubjectName = (subjectId: string) => {
    const subject = allSubjects.find(s => s.subjectId === subjectId);
    return subject ? `${subject.subjectCode} - ${subject.subjectName}` : subjectId;
  };

  // Get major name by ID
  const getMajorName = (majorId: string) => {
    const major = allMajors.find(m => m.majorId === majorId);
    return major ? `${major.majorCode} - ${major.majorName}` : majorId;
  };

  // Get semester name by ID
  const getSemesterName = (semesterId: string) => {
    const semester = semesters.find(s => s.semesterId === semesterId);
    return semester?.semesterName || semesterId;
  };

  // Calculate total subjects
  const totalSubjects = Object.values(semesterSubjects).reduce(
    (sum, subjects) => sum + subjects.length, 
    0
  );

  return (
    <Modal
      open={open}
      onCancel={() => onClose()}
      title={
        <div className="flex items-center gap-2">
          <PlusOutlined className="text-blue-600" />
          <span>Tạo Chương trình Đào tạo Mới</span>
        </div>
      }
      width={900}
      footer={null}
      destroyOnClose
    >
      {/* Steps indicator */}
      <Steps
        current={currentStep}
        items={steps.map(s => ({ title: s.title, description: s.description }))}
        className="mb-6"
        size="small"
      />

      {/* Step 1: Basic Info */}
      {currentStep === 0 && (
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="majorId"
                label="Chuyên ngành"
                rules={[{ required: true, message: "Vui lòng chọn chuyên ngành" }]}
              >
                <Select
                  placeholder="Chọn chuyên ngành"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input: string, option?: DefaultOptionType) => {
                    const raw = (option?.label ?? (option as unknown as { children?: unknown })?.children ?? "") as unknown;
                    return String(raw).toLowerCase().includes(input.toLowerCase());
                  }}
                >
                  {allMajors.map(major => (
                    <Option key={major.majorId} value={major.majorId}>
                      {major.majorCode} - {major.majorName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="versionLabel"
                label="Version Label"
                rules={[
                  { required: true, message: "Vui lòng nhập version label" },
                  { pattern: /^[A-Za-z0-9]+$/, message: "Chỉ chứa chữ và số" },
                ]}
                tooltip="VD: K20, K21, K22..."
              >
                <Input 
                  placeholder="VD: K21" 
                  style={{ textTransform: 'uppercase' }}
                  maxLength={10}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="effectiveRange"
            label="Thời gian hiệu lực"
            rules={[{ required: true, message: "Vui lòng chọn thời gian hiệu lực" }]}
          >
            <DatePicker.RangePicker 
              className="w-full"
              format="DD/MM/YYYY"
              placeholder={["Từ ngày", "Đến ngày"]}
            />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={() => onClose()}>Hủy</Button>
            <Button type="primary" onClick={handleStep1Submit}>
              Tiếp theo
            </Button>
          </div>
        </Form>
      )}

      {/* Step 2: Select Semesters */}
      {currentStep === 1 && (
        <div>
          <Alert
            message={
              isFoundationMajor
                ? "Chọn các học kỳ sẽ có trong chương trình đào tạo"
                : "Chọn các học kỳ sẽ có trong chương trình đào tạo (bắt đầu từ kỳ 5)"
            }
            type="info"
            showIcon
            className="mb-4"
          />

          <Form form={form}>
            <Form.Item name="selectedSemesters" initialValue={step2Data?.selectedSemesterIds || []}>
              <Checkbox.Group className="w-full">
                <Row gutter={[16, 16]}>
                  {visibleSemesters.map(semester => (
                    <Col span={8} key={semester.semesterId}>
                      <Card
                        hoverable
                        size="small"
                        className="text-center"
                      >
                        <Checkbox value={semester.semesterId}>
                          <div>
                            <Text strong>{semester.semesterName}</Text>
                            <br />
                            <Text type="secondary" className="text-xs">
                              {semester.semesterCode}
                            </Text>
                          </div>
                        </Checkbox>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Checkbox.Group>
            </Form.Item>
          </Form>

          <div className="flex justify-between mt-6">
            <Button onClick={() => setCurrentStep(0)}>Quay lại</Button>
            <Button type="primary" onClick={handleStep2Submit}>
              Tiếp theo
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Add Subjects */}
      {currentStep === 2 && step2Data && (
        <div>
          <Alert
            message={`Thêm môn học cho ${step2Data.selectedSemesterIds.length} học kỳ đã chọn`}
            type="info"
            showIcon
            className="mb-4"
          />

          <div className="max-h-[400px] overflow-y-auto pr-2">
            {step2Data.selectedSemesterIds.map(semesterId => {
              const semester = semesters.find(s => s.semesterId === semesterId);
              const subjects = semesterSubjects[semesterId] || [];
              const addedSubjectIds = subjects.map(s => s.subjectId);

              return (
                <Card
                  key={semesterId}
                  title={
                    <div className="flex items-center justify-between">
                      <span>{semester?.semesterName || semesterId}</span>
                      <Tag color="blue">{subjects.length} môn</Tag>
                    </div>
                  }
                  className="mb-4"
                  size="small"
                >
                  {/* Add subject select */}
                  <Select
                    key={`${semesterId}-${subjects.length}`}
                    placeholder="Chọn môn học để thêm..."
                    showSearch
                    className="w-full mb-3"
                    optionFilterProp="children"
                    filterOption={(input: string, option?: DefaultOptionType) => {
                      const raw = (option?.label ?? (option as unknown as { children?: unknown })?.children ?? "") as unknown;
                      return String(raw).toLowerCase().includes(input.toLowerCase());
                    }}
                    onChange={(value: string) => {
                      if (value) {
                        handleAddSubject(semesterId, value);
                      }
                    }}
                    value={undefined}
                  >
                    {allSubjects
                      .filter(s => !addedSubjectIds.includes(s.subjectId))
                      .map(subject => (
                        <Option key={subject.subjectId} value={subject.subjectId}>
                          {subject.subjectCode} - {subject.subjectName}
                        </Option>
                      ))}
                  </Select>

                  {/* Subject list */}
                  {subjects.length === 0 ? (
                    <Empty 
                      description="Chưa có môn học" 
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  ) : (
                    <Table
                      dataSource={subjects}
                      rowKey="subjectId"
                      size="small"
                      pagination={false}
                      columns={[
                        {
                          title: "#",
                          dataIndex: "positionIndex",
                          width: 50,
                        },
                        {
                          title: "Môn học",
                          dataIndex: "subjectId",
                          render: (id) => getSubjectName(id),
                        },
                        {
                          title: "Tín chỉ",
                          dataIndex: "credit",
                          width: 80,
                          render: (credit, record) => (
                            <InputNumber
                              min={1}
                              max={10}
                              value={credit}
                              size="small"
                              onChange={(value) => 
                                handleUpdateSubject(semesterId, record.subjectId, 'credit', value || 3)
                              }
                            />
                          ),
                        },
                        {
                          title: "Bắt buộc",
                          dataIndex: "isMandatory",
                          width: 80,
                          render: (isMandatory, record) => (
                            <Checkbox
                              checked={isMandatory}
                              onChange={(e) =>
                                handleUpdateSubject(semesterId, record.subjectId, 'isMandatory', e.target.checked)
                              }
                            />
                          ),
                        },
                        {
                          title: "",
                          width: 50,
                          render: (_, record) => (
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              size="small"
                              onClick={() => handleRemoveSubject(semesterId, record.subjectId)}
                            />
                          ),
                        },
                      ]}
                    />
                  )}
                </Card>
              );
            })}
          </div>

          <div className="flex justify-between mt-6">
            <Button onClick={() => setCurrentStep(1)}>Quay lại</Button>
            <Button type="primary" onClick={handleStep3Submit}>
              Tiếp theo ({totalSubjects} môn)
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Review & Submit */}
      {currentStep === 3 && step1Data && step2Data && (
        <div>
          <Alert
            message="Xem lại thông tin trước khi tạo Syllabus"
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
            className="mb-4"
          />

          <Card className="mb-4">
            <Title level={5}>Thông tin cơ bản</Title>
            <Row gutter={16}>
              <Col span={12}>
                <Text type="secondary">Chuyên ngành:</Text>
                <br />
                <Text strong>{getMajorName(step1Data.majorId)}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">Version Label:</Text>
                <br />
                <Tag color="blue" className="text-lg">{step1Data.versionLabel}</Tag>
              </Col>
            </Row>
            <Row gutter={16} className="mt-3">
              <Col span={12}>
                <Text type="secondary">Từ ngày:</Text>
                <br />
                <Text strong>{dayjs(step1Data.effectiveFrom).format("DD/MM/YYYY")}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">Đến ngày:</Text>
                <br />
                <Text strong>{dayjs(step1Data.effectiveTo).format("DD/MM/YYYY")}</Text>
              </Col>
            </Row>
          </Card>

          <Card>
            <Title level={5}>
              Danh sách môn học ({totalSubjects} môn / {step2Data.selectedSemesterIds.length} kỳ)
            </Title>
            
            <div className="max-h-[250px] overflow-y-auto">
              {step2Data.selectedSemesterIds.map(semesterId => {
                const subjects = semesterSubjects[semesterId] || [];
                if (subjects.length === 0) return null;

                return (
                  <div key={semesterId} className="mb-3">
                    <Text strong className="text-blue-600">
                      {getSemesterName(semesterId)} ({subjects.length} môn)
                    </Text>
                    <div className="pl-4 mt-1">
                      {subjects.map((subject, idx) => (
                        <div key={subject.subjectId} className="flex items-center gap-2 py-1">
                          <Tag color="default">{idx + 1}</Tag>
                          <Text>{getSubjectName(subject.subjectId)}</Text>
                          <Tag color="blue">{subject.credit} TC</Tag>
                          {subject.isMandatory && <Tag color="red">Bắt buộc</Tag>}
                        </div>
                      ))}
                    </div>
                    <Divider className="my-2" />
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="flex justify-between mt-6">
            <Button onClick={() => setCurrentStep(2)}>Quay lại</Button>
            <Button 
              type="primary" 
              onClick={handleFinalSubmit}
              loading={isSubmitting || syllabusesLoading}
              icon={<CheckCircleOutlined />}
            >
              Tạo Syllabus
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
