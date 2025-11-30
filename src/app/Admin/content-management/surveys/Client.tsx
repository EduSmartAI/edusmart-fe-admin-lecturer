"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Table,
  Space,
  Input,
  Spin,
  Alert,
  Empty,
  Row,
  Col,
  Card,
  Tooltip,
  Badge,
  Popconfirm,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  FileTextOutlined,
  CheckOutlined,
  StopOutlined,
  EyeOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { useSurveyStore } from "EduSmart/stores/Admin";
import type { Survey, SurveyQuestion as ApiSurveyQuestion } from "EduSmart/stores/Admin";
import { formatErrorMessage } from "EduSmart/utils/adminErrorHandling";
import { useDebouncedSearch } from "EduSmart/hooks/useDebounce";
import SurveyFormBuilder, {
  SurveyQuestion as FormQuestion,
} from "EduSmart/components/Admin/Survey/SurveyFormBuilder";

type ViewMode = "list" | "create" | "edit";

// API payload interfaces matching the curl format
interface ApiAnswerPayload {
  answerText: string;
  isCorrect: boolean;
}

interface ApiQuestionPayload {
  questionText: string;
  questionType: number; // 1 = Multiple Choice
  answers: ApiAnswerPayload[];
}

// Convert form questions to API format (following curl format)
const convertToApiFormat = (questions: FormQuestion[]): ApiQuestionPayload[] => {
  return questions.map((q) => ({
    questionText: q.questionText,
    questionType: 1, // Always Multiple Choice = 1
    answers: q.options.map((opt, i) => ({
      answerText: opt.text,
      isCorrect: i === 0, // First option as default correct
    })),
  }));
};

// Convert API questions to form format  
const convertToFormFormat = (questions: ApiSurveyQuestion[]): FormQuestion[] => {
  return questions.map((q) => ({
    id: Math.random().toString(36).substring(2, 11),
    questionText: q.questionText,
    required: false,
    options: q.answers?.map((a) => ({
      id: Math.random().toString(36).substring(2, 11),
      text: a.answerText,
    })) || [
      { id: Math.random().toString(36).substring(2, 11), text: "Lựa chọn 1" },
      { id: Math.random().toString(36).substring(2, 11), text: "Lựa chọn 2" },
    ],
  }));
};

export default function SurveysClient() {
  const [searchValue, setSearchValue, debouncedSearch] = useDebouncedSearch("", 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  
  // Form builder state
  const [surveyTitle, setSurveyTitle] = useState("");
  const [surveyDescription, setSurveyDescription] = useState("");
  const [surveyCode, setSurveyCode] = useState("");
  const [questions, setQuestions] = useState<FormQuestion[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const {
    surveys,
    isLoading,
    error,
    total,
    pageSize,
    fetchSurveys,
    createSurvey,
    updateSurvey,
    publishSurvey,
    deleteSurvey,
    clearError,
  } = useSurveyStore();

  // Load surveys on mount and when search/page changes
  useEffect(() => {
    fetchSurveys(currentPage, 20, debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedSearch]);

  // Reset form state
  const resetFormState = () => {
    setSurveyTitle("");
    setSurveyDescription("");
    setSurveyCode("");
    setQuestions([]);
    setSelectedSurvey(null);
  };

  // Generate survey code
  const generateSurveyCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "SV-";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreate = () => {
    resetFormState();
    setSurveyCode(generateSurveyCode());
    setViewMode("create");
  };

  const handleEdit = (survey: Survey) => {
    setSelectedSurvey(survey);
    setSurveyTitle(survey.title);
    setSurveyDescription(survey.description || "");
    setSurveyCode(survey.code);
    setQuestions(convertToFormFormat(survey.questions || []));
    setViewMode("edit");
  };

  const handleBackToList = () => {
    resetFormState();
    setViewMode("list");
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSave = async (publish: boolean = false) => {
    if (!surveyTitle.trim()) {
      message.error("Vui lòng nhập tiêu đề khảo sát");
      return;
    }
    if (!surveyCode.trim()) {
      message.error("Vui lòng nhập mã khảo sát");
      return;
    }
    if (questions.length === 0) {
      message.error("Vui lòng thêm ít nhất một câu hỏi");
      return;
    }

    setIsSaving(true);
    try {
      const apiQuestions = convertToApiFormat(questions);
      
      if (viewMode === "create") {
        const payload = {
          title: surveyTitle.trim(),
          description: surveyDescription.trim(),
          surveyCode: surveyCode.trim().toUpperCase(),
          questions: apiQuestions,
        };

        console.log("[SurveysClient] Creating survey with payload:", JSON.stringify(payload, null, 2));

        const result = await createSurvey(payload);
        if (result) {
          message.success("Tạo khảo sát thành công!");
          
          // TODO: Enable publish when API endpoint is confirmed
          // if (publish && result.id) {
          //   try {
          //     await publishSurvey(result.id);
          //     message.success("Đã xuất bản khảo sát!");
          //   } catch (publishError) {
          //     console.error("Publish error:", publishError);
          //     message.warning("Khảo sát đã được tạo nhưng không thể xuất bản. Vui lòng xuất bản sau.");
          //   }
          // }
          
          handleBackToList();
        }
      } else if (viewMode === "edit" && selectedSurvey) {
        const result = await updateSurvey({
          id: selectedSurvey.id,
          code: surveyCode.trim().toUpperCase(),
          title: surveyTitle.trim(),
          description: surveyDescription.trim(),
          status: selectedSurvey.status,
          questions: apiQuestions as unknown as ApiSurveyQuestion[],
        });

        if (result) {
          message.success("Cập nhật khảo sát thành công!");
          handleBackToList();
        }
      }
    } catch (err) {
      message.error(formatErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };



  const handlePublish = async (surveyId: string) => {
    try {
      const result = await publishSurvey(surveyId);
      if (result) {
        message.success("Xuất bản khảo sát thành công!");
      }
    } catch (err) {
      message.error(formatErrorMessage(err));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const success = await deleteSurvey(id);
      if (success) {
        message.success("Xóa khảo sát thành công!");
        if (surveys.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchSurveys(currentPage, pageSize, debouncedSearch);
        }
      }
    } catch (err) {
      message.error(formatErrorMessage(err));
    }
  };

  const getStatusColor = (
    status: string
  ): "success" | "processing" | "default" | "error" => {
    switch (status) {
      case "DRAFT":
        return "default";
      case "PUBLISHED":
        return "success";
      case "CLOSED":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "Nháp";
      case "PUBLISHED":
        return "Đã xuất bản";
      case "CLOSED":
        return "Đã đóng";
      default:
        return status;
    }
  };

  const columns = [
    {
      title: "Mã",
      dataIndex: "code",
      key: "code",
      width: "15%",
      render: (text: string) => (
        <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
          {text}
        </span>
      ),
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      width: "30%",
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: "15%",
      render: (status: string) => (
        <Badge
          status={getStatusColor(status)}
          text={getStatusLabel(status)}
        />
      ),
    },
    {
      title: "Câu hỏi",
      dataIndex: "questionCount",
      key: "questionCount",
      width: "12%",
      render: (count: number) => (
        <span className="font-semibold text-blue-600">{count || 0}</span>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: "20%",
      render: (_: unknown, record: Survey) => (
        <Space size="small" wrap>
          {record.status === "DRAFT" && (
            <Tooltip title="Xuất bản">
              <Button
                type="text"
                icon={<CheckOutlined />}
                size="small"
                onClick={() => handlePublish(record.id)}
                className="text-green-600"
              />
            </Tooltip>
          )}
          {record.status === "PUBLISHED" && (
            <Tooltip title="Đóng">
              <Button
                type="text"
                icon={<StopOutlined />}
                size="small"
                onClick={() => {
                  message.info("Tính năng đóng sẽ có sớm");
                }}
                className="text-orange-600"
              />
            </Tooltip>
          )}
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
              className="text-blue-600"
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
              className="text-blue-600"
              disabled={record.status !== "DRAFT"}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa khảo sát?"
            description="Hành động này không thể hoàn tác."
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                size="small"
                danger
                loading={isLoading}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Render Create/Edit View (Google Form Style)
  if (viewMode === "create" || viewMode === "edit") {
    return (
      <div className="min-h-screen bg-purple-50">
        {/* Top Header Bar */}
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  type="text"
                  icon={<ArrowLeftOutlined />}
                  onClick={handleBackToList}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Quay lại
                </Button>
                <div className="h-6 w-px bg-gray-300" />
                <div className="flex items-center gap-2">
                  <FileTextOutlined className="text-purple-600 text-xl" />
                  <span className="font-semibold text-gray-800">
                    {viewMode === "create" ? "Tạo khảo sát mới" : "Chỉnh sửa khảo sát"}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Survey Code Input */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Mã:</span>
                  <Input
                    value={surveyCode}
                    onChange={(e) => setSurveyCode(e.target.value.toUpperCase())}
                    placeholder="SV-XXXXXX"
                    className="w-32 font-mono text-center"
                    maxLength={12}
                  />
                </div>
                
                <Button
                  icon={<SaveOutlined />}
                  onClick={() => handleSave(false)}
                  loading={isSaving}
                  disabled={isSaving}
                >
                  Lưu nháp
                </Button>
                
                {viewMode === "create" && (
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={() => handleSave(true)}
                    loading={isSaving}
                    disabled={isSaving}
                    className="bg-purple-600 hover:bg-purple-700 border-0"
                  >
                    Lưu & Xuất bản
                  </Button>
                )}
                
                {viewMode === "edit" && (
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={() => handleSave(false)}
                    loading={isSaving}
                    disabled={isSaving}
                    className="bg-purple-600 hover:bg-purple-700 border-0"
                  >
                    Cập nhật
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Survey Form Builder */}
        <SurveyFormBuilder
          questions={questions}
          onChange={setQuestions}
          surveyTitle={surveyTitle}
          onTitleChange={setSurveyTitle}
          surveyDescription={surveyDescription}
          onDescriptionChange={setSurveyDescription}
        />
      </div>
    );
  }

  // Render List View
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <FileTextOutlined className="text-2xl text-purple-600" />
              <h1 className="text-3xl font-bold text-gray-900">Khảo Sát</h1>
            </div>
          </div>
          <p className="text-gray-600">
            Tạo và quản lý khảo sát phản hồi khóa học theo phong cách Google Form
          </p>
        </div>

        {/* Stats Cards */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-purple-500">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{total}</div>
                <div className="text-gray-600 text-sm mt-1">Tổng số</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-gray-400">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-600">
                  {(surveys || []).filter((s) => s.status === "DRAFT").length}
                </div>
                <div className="text-gray-600 text-sm mt-1">Nháp</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-green-500">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {(surveys || []).filter((s) => s.status === "PUBLISHED").length}
                </div>
                <div className="text-gray-600 text-sm mt-1">Đã xuất bản</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-red-500">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">
                  {(surveys || []).filter((s) => s.status === "CLOSED").length}
                </div>
                <div className="text-gray-600 text-sm mt-1">Đã đóng</div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Error Alert */}
        {error && (
          <Alert
            message="Lỗi"
            description={error}
            type="error"
            closable
            onClose={() => clearError()}
            className="mb-6"
          />
        )}

        {/* Toolbar */}
        <Card className="mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            <Input
              placeholder="Tìm kiếm khảo sát theo tiêu đề hoặc mã..."
              prefix={<SearchOutlined />}
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                setCurrentPage(1);
              }}
              allowClear
              className="w-full md:w-80"
            />
            <Space>
              <Tooltip title="Làm mới">
                <Button
                  icon={<ReloadOutlined />}
                  loading={isLoading}
                  onClick={() => fetchSurveys(currentPage, pageSize, debouncedSearch)}
                />
              </Tooltip>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
                size="large"
                className="bg-purple-600 hover:bg-purple-700 border-0"
              >
                Tạo khảo sát
              </Button>
            </Space>
          </div>
        </Card>

        {/* Table */}
        <Card className="shadow-sm">
          {isLoading && surveys.length === 0 ? (
            <div className="flex justify-center py-12">
              <Spin size="large">
                <div className="p-12" />
              </Spin>
            </div>
          ) : surveys.length === 0 ? (
            <Empty
              description="Chưa có khảo sát nào"
              style={{ paddingTop: 48, paddingBottom: 48 }}
            >
              <Button
                type="primary"
                onClick={handleCreate}
                icon={<PlusOutlined />}
                className="bg-purple-600 hover:bg-purple-700 border-0"
              >
                Tạo khảo sát đầu tiên
              </Button>
            </Empty>
          ) : (
            <Table
              columns={columns}
              dataSource={surveys}
              rowKey="id"
              loading={isLoading}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: total,
                onChange: setCurrentPage,
                showSizeChanger: false,
                showTotal: (total, range) =>
                  `${range[0]} đến ${range[1]} trong tổng ${total} khảo sát`,
              }}
              bordered
            />
          )}
        </Card>
      </div>
    </div>
  );
}
