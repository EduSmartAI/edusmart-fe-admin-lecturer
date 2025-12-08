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
  Modal,
  Descriptions,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  FileTextOutlined,
  CheckOutlined,
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
import { quizAdminServiceApi, type AdminSurvey, type AdminSurveyDetail } from "EduSmart/api/api-quiz-admin-service";

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
// const convertToFormFormat = (questions: ApiSurveyQuestion[]): FormQuestion[] => {
//   return questions.map((q) => ({
//     id: Math.random().toString(36).substring(2, 11),
//     questionText: q.questionText,
//     required: false,
//     options: q.answers?.map((a) => ({
//       id: Math.random().toString(36).substring(2, 11),
//       text: a.answerText,
//     })) || [
//       { id: Math.random().toString(36).substring(2, 11), text: "Lựa chọn 1" },
//       { id: Math.random().toString(36).substring(2, 11), text: "Lựa chọn 2" },
//     ],
//   }));
// };

export default function SurveysClient() {
  const [searchValue, setSearchValue, debouncedSearch] = useDebouncedSearch("", 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  
  // New API integration state
  const [adminSurveys, setAdminSurveys] = useState<AdminSurvey[]>([]);
  const [totalSurveys, setTotalSurveys] = useState(0);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [surveyDetailData, setSurveyDetailData] = useState<AdminSurveyDetail | null>(null);
  
  // Form builder state
  const [surveyTitle, setSurveyTitle] = useState("");
  const [surveyDescription, setSurveyDescription] = useState("");
  const [surveyCode, setSurveyCode] = useState("");
  const [questions, setQuestions] = useState<FormQuestion[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const {
    createSurvey,
    updateSurvey,
  } = useSurveyStore();

  // Load surveys from NEW API on mount and when search/page changes
  useEffect(() => {
    loadSurveysFromApi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedSearch]);

  const loadSurveysFromApi = async () => {
    setIsLoadingApi(true);
    setApiError(null);
    try {
      const response = await quizAdminServiceApi.getSurveys({
        pageNumber: currentPage,
        pageSize: 20,
        search: debouncedSearch,
      });

      if (response.success && response.data) {
        setAdminSurveys(response.data.data);
        setTotalSurveys(response.data.totalCount);
      } else {
        setApiError(response.message || 'Failed to load surveys');
      }
    } catch (err) {
      setApiError(formatErrorMessage(err));
      console.error('[SurveysClient] Error loading surveys:', err);
    } finally {
      setIsLoadingApi(false);
    }
  };

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

  // const handleEdit = (survey: Survey) => {
  //   setSelectedSurvey(survey);
  //   setSurveyTitle(survey.title);
  //   setSurveyDescription(survey.description || "");
  //   setSurveyCode(survey.code);
  //   setQuestions(convertToFormFormat(survey.questions || []));
  //   setViewMode("edit");
  // };

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



  // const handlePublish = async (surveyId: string) => {
  //   try {
  //     const result = await publishSurvey(surveyId);
  //     if (result) {
  //       message.success("Xuất bản khảo sát thành công!");
  //     }
  //   } catch (err) {
  //     message.error(formatErrorMessage(err));
  //   }
  // };

  const handleDelete = async (id: string) => {
    try {
      const response = await quizAdminServiceApi.deleteSurvey(id);
      if (response.success) {
        message.success("Xóa khảo sát thành công!");
        if (adminSurveys.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          loadSurveysFromApi();
        }
      } else {
        message.error(response.message || "Xóa khảo sát thất bại");
      }
    } catch (err) {
      message.error(formatErrorMessage(err));
    }
  };

  const handleViewDetail = async (surveyId: string) => {
    setIsLoadingApi(true);
    try {
      console.log('[SurveysClient] Fetching detail for surveyId:', surveyId);
      
      const response = await quizAdminServiceApi.getSurveysWithQuestions({
        pageNumber: 1,
        pageSize: 100,
        search: '',
      });

      console.log('[SurveysClient] API Response:', response);

      if (response.success && response.response) {
        console.log('[SurveysClient] Response data:', response.response);
        console.log('[SurveysClient] Surveys array:', response.response.surveys);
        
        // Find the specific survey in the response
        const survey = response.response.surveys?.find((s: AdminSurveyDetail) => {
          console.log('[SurveysClient] Checking survey:', s.surveyId, 'against', surveyId);
          return s.surveyId === surveyId;
        });
        
        console.log('[SurveysClient] Found survey:', survey);
        
        if (survey) {
          setSurveyDetailData(survey);
          setDetailModalVisible(true);
        } else {
          console.error('[SurveysClient] Survey not found in response. Available IDs:', 
            response.response.surveys?.map((s: AdminSurveyDetail) => s.surveyId));
          message.error('Không tìm thấy khảo sát');
        }
      } else {
        console.error('[SurveysClient] API response failed:', response);
        message.error(response.message || 'Không thể tải chi tiết khảo sát');
      }
    } catch (err) {
      console.error('[SurveysClient] Error in handleViewDetail:', err);
      message.error(formatErrorMessage(err));
    } finally {
      setIsLoadingApi(false);
    }
  };

  // const handleEditSurvey = (survey: AdminSurvey) => {
  //   // For now, show message that edit is coming soon
  //   // TODO: Implement edit form with survey data
  //   message.info(`Chỉnh sửa khảo sát: ${survey.title} (Tính năng đang phát triển)`);
  // };

  // const getStatusColor = (
  //   status: string
  // ): "success" | "processing" | "default" | "error" => {
  //   switch (status) {
  //     case "DRAFT":
  //       return "default";
  //     case "PUBLISHED":
  //       return "success";
  //     case "CLOSED":
  //       return "error";
  //     default:
  //       return "default";
  //   }
  // };

  // const getStatusLabel = (status: string) => {
  //   switch (status) {
  //     case "DRAFT":
  //       return "Nháp";
  //     case "PUBLISHED":
  //       return "Đã xuất bản";
  //     case "CLOSED":
  //       return "Đã đóng";
  //     default:
  //       return status;
  //   }
  // };

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
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: "25%",
      render: (text: string) => (
        <span className="text-gray-600 text-sm">{text || "—"}</span>
      ),
    },
    {
      title: "Câu hỏi",
      dataIndex: "totalQuestions",
      key: "totalQuestions",
      width: "10%",
      align: "center" as const,
      render: (count: number) => (
        <span className="font-semibold text-blue-600">{count || 0}</span>
      ),
    },
    {
      title: "Học viên",
      dataIndex: "totalStudentsTaken",
      key: "totalStudentsTaken",
      width: "10%",
      align: "center" as const,
      render: (count: number) => (
        <span className="font-semibold text-green-600">{count || 0}</span>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: "15%",
      align: "center" as const,
      render: (_: unknown, record: AdminSurvey) => (
        <Space size="small" wrap>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewDetail(record.id)}
              className="text-blue-600 hover:text-blue-700"
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => message.info('Chức năng chỉnh sửa đang phát triển')}
              className="text-orange-600 hover:text-orange-700"
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
                loading={isLoadingApi}
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
          <Col xs={24} sm={12} lg={8}>
            <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-purple-500">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{totalSurveys}</div>
                <div className="text-gray-600 text-sm mt-1">Tổng số khảo sát</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {adminSurveys.filter((s) => s.isActive).length}
                </div>
                <div className="text-gray-600 text-sm mt-1">Đang hoạt động</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-green-500">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {adminSurveys.reduce((sum, s) => sum + (s.totalStudentsTaken || 0), 0)}
                </div>
                <div className="text-gray-600 text-sm mt-1">Tổng lượt làm</div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Error Alert */}
        {apiError && (
          <Alert
            message="Lỗi"
            description={apiError}
            type="error"
            closable
            onClose={() => setApiError(null)}
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
                  loading={isLoadingApi}
                  onClick={() => loadSurveysFromApi()}
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
          {isLoadingApi && adminSurveys.length === 0 ? (
            <div className="flex justify-center py-12">
              <Spin size="large">
                <div className="p-12" />
              </Spin>
            </div>
          ) : adminSurveys.length === 0 ? (
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
              dataSource={adminSurveys}
              rowKey="id"
              loading={isLoadingApi}
              pagination={{
                current: currentPage,
                pageSize: 20,
                total: totalSurveys,
                onChange: setCurrentPage,
                showSizeChanger: false,
                showTotal: (total, range) =>
                  `${range[0]} đến ${range[1]} trong tổng ${total} khảo sát`,
              }}
              bordered
            />
          )}
        </Card>

        {/* Detail Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2">
              <FileTextOutlined className="text-purple-600" />
              <span>Chi tiết khảo sát</span>
            </div>
          }
          open={detailModalVisible}
          onCancel={() => {
            setDetailModalVisible(false);
            setSurveyDetailData(null);
          }}
          footer={[
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              Đóng
            </Button>,
          ]}
          width={800}
        >
          {surveyDetailData ? (
            <div className="space-y-4">
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Mã khảo sát" span={2}>
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                    {surveyDetailData.surveyQuizSetting.surveyCode}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Tiêu đề" span={2}>
                  {surveyDetailData.surveyQuizSetting.title || '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Mô tả" span={2}>
                  {surveyDetailData.surveyQuizSetting.description || '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Loại khảo sát">
                  {surveyDetailData.surveyQuizSetting.surveyTypeName}
                </Descriptions.Item>
                <Descriptions.Item label="Số câu hỏi">
                  <span className="font-semibold text-blue-600">
                    {surveyDetailData.totalQuestions}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Số học viên">
                  <span className="font-semibold text-green-600">
                    {surveyDetailData.totalStudentsTaken}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Badge
                    status={surveyDetailData.isActive ? "success" : "default"}
                    text={surveyDetailData.isActive ? "Hoạt động" : "Không hoạt động"}
                  />
                </Descriptions.Item>
              </Descriptions>

              <div className="mt-6">
                <h4 className="font-semibold mb-3 text-gray-700">
                  Danh sách câu hỏi ({surveyDetailData.questions.length})
                </h4>
                <div className="space-y-4">
                  {surveyDetailData.questions.map((q, index) => (
                    <Card key={q.questionId} size="small" className="bg-gray-50">
                      <div className="font-medium text-gray-800 mb-2">
                        {index + 1}. {q.questionText}
                      </div>
                      <div className="ml-4 space-y-1">
                        {q.answers.map((a, aIndex) => (
                          <div
                            key={a.answerId}
                            className={`flex items-center gap-2 ${
                              a.isCorrect ? 'text-green-600 font-medium' : 'text-gray-600'
                            }`}
                          >
                            <span className="text-xs">
                              {String.fromCharCode(65 + aIndex)}.
                            </span>
                            <span>{a.answerText}</span>
                            {a.isCorrect && (
                              <CheckOutlined className="text-green-600 text-xs" />
                            )}
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Spin />
          )}
        </Modal>
      </div>
    </div>
  );
}
