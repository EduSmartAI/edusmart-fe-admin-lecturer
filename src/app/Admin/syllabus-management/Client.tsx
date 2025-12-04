"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Button,
  Card,
  Row,
  Col,
  Select,
  Tabs,
  Typography,
  Tooltip,
  Alert,
  Empty,
  Tag,
  message,
  Input,
  Table,
  Space,
  Popconfirm,
  Spin,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  BookOutlined,
  CopyOutlined,
  ForkOutlined,
  EyeOutlined,
  ScheduleOutlined,
  EditOutlined,
  DeleteOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { useSyllabusStore } from "EduSmart/stores/Admin";
import SyllabusCreateWizard from "./components/SyllabusCreateWizard";
import SyllabusDetailModal from "./components/SyllabusDetailModal";
import CloneSyllabusModal from "./components/CloneSyllabusModal";
import CreateMajorModal from "./components/CreateMajorModal";
import CreateSubjectModal from "./components/CreateSubjectModal";
import MajorDetailModal from "./components/MajorDetailModal";
import SubjectDetailModal from "./components/SubjectDetailModal";
import type { Syllabus } from "EduSmart/types/syllabus";
import type { MajorDto, SubjectDto } from "EduSmart/api/api-syllabus-service";
import {
  getAllMajors,
  getAllSubjects,
  getMajorDetail,
  getSubjectDetail,
  deleteMajor,
  deleteSubject,
} from "EduSmart/api/api-syllabus-service";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

// Danh sách các khóa phổ biến (có thể mở rộng)
const VERSION_LABELS = ["K17", "K18", "K19", "K20", "K21", "K22", "K23", "K24", "K25"];

export default function SyllabusManagementClient() {
  const [activeTab, setActiveTab] = useState("guide");
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewedSyllabus, setViewedSyllabus] = useState<Syllabus | null>(null);
  
  // Search state với 2 trường
  const [selectedMajorCode, setSelectedMajorCode] = useState<string | undefined>(undefined);
  const [selectedVersionLabel, setSelectedVersionLabel] = useState<string | undefined>(undefined);

  // Major management state
  const [majorsData, setMajorsData] = useState<MajorDto[]>([]);
  const [majorsLoading, setMajorsLoading] = useState(false);
  const [isCreateMajorOpen, setIsCreateMajorOpen] = useState(false);
  const [selectedMajorDetail, setSelectedMajorDetail] = useState<MajorDto | null>(null);
  const [isMajorDetailOpen, setIsMajorDetailOpen] = useState(false);

  // Subject management state
  const [subjectsData, setSubjectsData] = useState<SubjectDto[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [isCreateSubjectOpen, setIsCreateSubjectOpen] = useState(false);
  const [selectedSubjectDetail, setSelectedSubjectDetail] = useState<SubjectDto | null>(null);
  const [isSubjectDetailOpen, setIsSubjectDetailOpen] = useState(false);

  const {
    allMajors,
    syllabusesError,
    syllabusDetailLoading,
    cloneModalState,
    fetchAllMajors,
    fetchSemesters,
    fetchAllSubjects,
    getSyllabusDetail,
    clearSyllabusError,
    clearSelectedSyllabus,
    openCloneModal,
    closeCloneModal,
  } = useSyllabusStore();

  // Load initial data
  useEffect(() => {
    fetchAllMajors();
    fetchSemesters();
    fetchAllSubjects();
  }, [fetchAllMajors, fetchSemesters, fetchAllSubjects]);

  // Load majors and subjects data from API
  const loadMajorsData = useCallback(async () => {
    setMajorsLoading(true);
    try {
      const data = await getAllMajors();
      setMajorsData(data);
    } catch (error) {
      console.error("Error loading majors:", error);
      message.error("Không thể tải danh sách chuyên ngành");
    } finally {
      setMajorsLoading(false);
    }
  }, []);

  const loadSubjectsData = useCallback(async () => {
    setSubjectsLoading(true);
    try {
      const data = await getAllSubjects();
      setSubjectsData(data);
    } catch (error) {
      console.error("Error loading subjects:", error);
      message.error("Không thể tải danh sách môn học");
    } finally {
      setSubjectsLoading(false);
    }
  }, []);

  // Load data when switching to management tabs
  useEffect(() => {
    if (activeTab === "major-management") {
      loadMajorsData();
    } else if (activeTab === "subject-management") {
      loadSubjectsData();
    }
  }, [activeTab, loadMajorsData, loadSubjectsData]);

  // Handle view major detail
  const handleViewMajorDetail = useCallback(async (majorId: string) => {
    try {
      const detail = await getMajorDetail(majorId);
      if (detail) {
        setSelectedMajorDetail(detail);
        setIsMajorDetailOpen(true);
      }
    } catch (error) {
      console.error("Error fetching major detail:", error);
      message.error("Không thể tải chi tiết chuyên ngành");
    }
  }, []);

  // Handle view subject detail
  const handleViewSubjectDetail = useCallback(async (subjectId: string) => {
    try {
      const detail = await getSubjectDetail(subjectId);
      if (detail) {
        setSelectedSubjectDetail(detail);
        setIsSubjectDetailOpen(true);
      }
    } catch (error) {
      console.error("Error fetching subject detail:", error);
      message.error("Không thể tải chi tiết môn học");
    }
  }, []);

  // Handle delete major
  const handleDeleteMajor = useCallback(async (majorId: string) => {
    try {
      await deleteMajor(majorId);
      message.success("Xóa chuyên ngành thành công!");
      loadMajorsData();
    } catch (error) {
      console.error("Error deleting major:", error);
      message.error("Không thể xóa chuyên ngành");
    }
  }, [loadMajorsData]);

  // Handle delete subject
  const handleDeleteSubject = useCallback(async (subjectId: string) => {
    try {
      await deleteSubject(subjectId);
      message.success("Xóa môn học thành công!");
      loadSubjectsData();
    } catch (error) {
      console.error("Error deleting subject:", error);
      message.error("Không thể xóa môn học");
    }
  }, [loadSubjectsData]);

  // Handle view syllabus detail - sử dụng cả versionLabel và majorCode
  const handleViewSyllabus = useCallback(async (versionLabel: string, majorCode: string) => {
    const syllabus = await getSyllabusDetail(versionLabel, majorCode);
    if (syllabus) {
      setViewedSyllabus(syllabus);
      setIsDetailModalOpen(true);
    } else {
      message.error(`Không tìm thấy Syllabus ${versionLabel} cho chuyên ngành ${majorCode}`);
    }
  }, [getSyllabusDetail]);

  // Handle clone syllabus
  const handleCloneCascade = useCallback((syllabus?: Syllabus) => {
    openCloneModal('cascade', syllabus);
  }, [openCloneModal]);

  const handleCloneFoundation = useCallback(() => {
    openCloneModal('foundation');
  }, [openCloneModal]);

  // Handle wizard close
  const handleWizardClose = useCallback((success?: boolean) => {
    setIsWizardOpen(false);
    if (success) {
      message.success("Tạo Syllabus thành công!");
    }
  }, []);

  // Handle clone modal close
  const handleCloneModalClose = useCallback((success?: boolean) => {
    closeCloneModal();
    if (success) {
      message.success("Clone Syllabus thành công!");
    }
  }, [closeCloneModal]);

  // Quick search handler
  const handleQuickSearch = useCallback(async () => {
    if (selectedMajorCode && selectedVersionLabel) {
      await handleViewSyllabus(selectedVersionLabel, selectedMajorCode);
    } else {
      message.warning("Vui lòng chọn cả chuyên ngành và khóa học");
    }
  }, [selectedMajorCode, selectedVersionLabel, handleViewSyllabus]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <ScheduleOutlined className="text-3xl text-blue-600" />
              <div>
                <Title level={2} className="!mb-0">
                  Quản lý Chương trình Đào tạo
                </Title>
                <Text type="secondary">
                  Tạo và quản lý Syllabus cho các khoá sinh viên
                </Text>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {syllabusesError && (
          <Alert
            message="Lỗi"
            description={syllabusesError}
            type="error"
            closable
            onClose={clearSyllabusError}
            className="mb-6"
          />
        )}

        {/* Quick Actions */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} sm={12} md={8}>
            <Card
              hoverable
              className="h-full cursor-pointer transition-all hover:shadow-lg border-2 border-transparent hover:border-blue-400"
              onClick={() => setIsWizardOpen(true)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <PlusOutlined className="text-xl text-blue-600" />
                </div>
                <div>
                  <Text strong className="text-lg block">Tạo Syllabus Mới</Text>
                  <Text type="secondary" className="text-sm">
                    Tạo thủ công từng môn học cho từng kỳ
                  </Text>
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Card
              hoverable
              className="h-full cursor-pointer transition-all hover:shadow-lg border-2 border-transparent hover:border-green-400"
              onClick={() => handleCloneCascade()}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CopyOutlined className="text-xl text-green-600" />
                </div>
                <div>
                  <Text strong className="text-lg block">Clone Toàn bộ</Text>
                  <Text type="secondary" className="text-sm">
                    Sao chép syllabus khoá trước cho khoá mới
                  </Text>
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Card
              hoverable
              className="h-full cursor-pointer transition-all hover:shadow-lg border-2 border-transparent hover:border-purple-400"
              onClick={handleCloneFoundation}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <ForkOutlined className="text-xl text-purple-600" />
                </div>
                <div>
                  <Text strong className="text-lg block">Clone Nền tảng</Text>
                  <Text type="secondary" className="text-sm">
                    Clone môn nền tảng cho chuyên ngành mới
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Search Section - Tìm kiếm Syllabus */}
        <Card className="mb-6 shadow-sm">
          <div className="mb-3">
            <Text strong className="text-base">🔍 Tìm kiếm Syllabus</Text>
            <Text type="secondary" className="ml-2 text-sm">
              Chọn chuyên ngành và khóa học để xem chi tiết chương trình đào tạo
            </Text>
          </div>
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-end">
            <div className="flex-1">
              <Text type="secondary" className="text-xs mb-1 block">Chuyên ngành</Text>
              <Select
                placeholder="Chọn chuyên ngành..."
                value={selectedMajorCode}
                onChange={(value: string) => setSelectedMajorCode(value)}
                showSearch
                optionFilterProp="children"
                className="w-full"
                allowClear
                filterOption={(input, option) =>
                  (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {allMajors.map(major => (
                  <Option key={major.majorCode} value={major.majorCode}>
                    {major.majorCode} - {major.majorName}
                  </Option>
                ))}
              </Select>
            </div>
            
            <div className="w-full md:w-40">
              <Text type="secondary" className="text-xs mb-1 block">Khóa học</Text>
              <Select
                placeholder="Chọn khóa..."
                value={selectedVersionLabel}
                onChange={(value: string) => setSelectedVersionLabel(value)}
                className="w-full"
                allowClear
              >
                {VERSION_LABELS.map(version => (
                  <Option key={version} value={version}>
                    {version}
                  </Option>
                ))}
              </Select>
            </div>

            <div className="flex gap-2">
              <Tooltip title="Xem Syllabus">
                <Button
                  type="primary"
                  icon={<EyeOutlined />}
                  onClick={handleQuickSearch}
                  loading={syllabusDetailLoading}
                  disabled={!selectedMajorCode || !selectedVersionLabel}
                >
                  Xem chi tiết
                </Button>
              </Tooltip>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t">
            <Tag color="blue" className="text-sm px-3 py-1">
              <BookOutlined className="mr-1" />
              {allMajors.length} Chuyên ngành
            </Tag>
            <Tag color="green" className="text-sm px-3 py-1">
              <ScheduleOutlined className="mr-1" />
              {VERSION_LABELS.length} Khóa học
            </Tag>
          </div>
        </Card>

        {/* Main Content Tabs */}
        <Card className="shadow-sm">
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane
              tab={
                <span>
                  <ScheduleOutlined />
                  Hướng dẫn
                </span>
              }
              key="guide"
            >
              <GuideContent
                onCreateNew={() => setIsWizardOpen(true)}
                onCloneCascade={() => handleCloneCascade()}
                onCloneFoundation={handleCloneFoundation}
              />
            </TabPane>

            <TabPane
              tab={
                <span>
                  <BookOutlined />
                  Chuyên ngành
                </span>
              }
              key="majors"
            >
              <MajorsList majors={allMajors} onViewSyllabus={handleViewSyllabus} />
            </TabPane>

            <TabPane
              tab={
                <span>
                  <EditOutlined />
                  Quản lý Chuyên ngành
                </span>
              }
              key="major-management"
            >
              <MajorManagement
                majors={majorsData}
                loading={majorsLoading}
                onCreateNew={() => setIsCreateMajorOpen(true)}
                onViewDetail={handleViewMajorDetail}
                onDelete={handleDeleteMajor}
              />
            </TabPane>

            <TabPane
              tab={
                <span>
                  <AppstoreOutlined />
                  Quản lý Môn học
                </span>
              }
              key="subject-management"
            >
              <SubjectManagement
                subjects={subjectsData}
                loading={subjectsLoading}
                onCreateNew={() => setIsCreateSubjectOpen(true)}
                onViewDetail={handleViewSubjectDetail}
                onDelete={handleDeleteSubject}
              />
            </TabPane>
          </Tabs>
        </Card>

        {/* Modals */}
        <SyllabusCreateWizard
          open={isWizardOpen}
          onClose={handleWizardClose}
        />

        <SyllabusDetailModal
          open={isDetailModalOpen}
          syllabus={viewedSyllabus}
          loading={syllabusDetailLoading}
          onClose={() => {
            setIsDetailModalOpen(false);
            setViewedSyllabus(null);
            clearSelectedSyllabus();
          }}
          onClone={(syllabus: Syllabus) => {
            setIsDetailModalOpen(false);
            handleCloneCascade(syllabus);
          }}
        />

        <CloneSyllabusModal
          open={cloneModalState.isOpen}
          cloneType={cloneModalState.cloneType}
          sourceSyllabus={cloneModalState.sourceSyllabus}
          onClose={handleCloneModalClose}
        />

        {/* Major & Subject Management Modals */}
        <CreateMajorModal
          open={isCreateMajorOpen}
          onClose={() => setIsCreateMajorOpen(false)}
          onSuccess={() => {
            loadMajorsData();
            fetchAllMajors(); // Refresh store data too
          }}
        />

        <CreateSubjectModal
          open={isCreateSubjectOpen}
          onClose={() => setIsCreateSubjectOpen(false)}
          onSuccess={() => {
            loadSubjectsData();
            fetchAllSubjects(); // Refresh store data too
          }}
        />

        <MajorDetailModal
          open={isMajorDetailOpen}
          major={selectedMajorDetail}
          onClose={() => {
            setIsMajorDetailOpen(false);
            setSelectedMajorDetail(null);
          }}
          onEdit={() => {
            // TODO: Implement edit functionality
            message.info("Chức năng chỉnh sửa đang được phát triển");
          }}
          onDelete={() => {
            if (selectedMajorDetail) {
              handleDeleteMajor(selectedMajorDetail.majorId);
              setIsMajorDetailOpen(false);
              setSelectedMajorDetail(null);
            }
          }}
        />

        <SubjectDetailModal
          open={isSubjectDetailOpen}
          subject={selectedSubjectDetail}
          allSubjects={subjectsData}
          onClose={() => {
            setIsSubjectDetailOpen(false);
            setSelectedSubjectDetail(null);
          }}
          onEdit={() => {
            // TODO: Implement edit functionality
            message.info("Chức năng chỉnh sửa đang được phát triển");
          }}
          onDelete={() => {
            if (selectedSubjectDetail) {
              handleDeleteSubject(selectedSubjectDetail.subjectId);
              setIsSubjectDetailOpen(false);
              setSelectedSubjectDetail(null);
            }
          }}
        />
      </div>
    </div>
  );
}

// Guide Content Component
function GuideContent({
  onCreateNew,
  onCloneCascade,
  onCloneFoundation,
}: {
  onCreateNew: () => void;
  onCloneCascade: () => void;
  onCloneFoundation: () => void;
}) {
  return (
    <div className="p-4">
      <Title level={4}>Hướng dẫn sử dụng</Title>
      
      <Row gutter={[24, 24]} className="mt-6">
        <Col xs={24} lg={8}>
          <Card className="h-full bg-blue-50 border-blue-200">
            <div className="text-center mb-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                <PlusOutlined className="text-2xl text-blue-600" />
              </div>
              <Text strong className="text-lg">Tạo Syllabus Mới</Text>
            </div>
            <Paragraph className="text-gray-600 mb-4">
              Sử dụng wizard 4 bước để tạo chương trình đào tạo mới từ đầu:
            </Paragraph>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
              <li>Bước 1: Chọn chuyên ngành & version</li>
              <li>Bước 2: Chọn các học kỳ</li>
              <li>Bước 3: Thêm môn học cho từng kỳ</li>
              <li>Bước 4: Xem lại & hoàn thành</li>
            </ul>
            <Button type="primary" block onClick={onCreateNew}>
              Bắt đầu tạo mới
            </Button>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card className="h-full bg-green-50 border-green-200">
            <div className="text-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <CopyOutlined className="text-2xl text-green-600" />
              </div>
              <Text strong className="text-lg">Clone Toàn bộ Syllabus</Text>
            </div>
            <Paragraph className="text-gray-600 mb-4">
              Sao chép nguyên vẹn syllabus của khoá trước cho khoá mới cùng chuyên ngành:
            </Paragraph>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
              <li>VD: K20 .NET → K21 .NET</li>
              <li>Giữ nguyên tất cả môn học</li>
              <li>Chỉ cần đổi version label</li>
              <li>Tiết kiệm thời gian tối đa</li>
            </ul>
            <Button type="default" block className="border-green-500 text-green-600" onClick={onCloneCascade}>
              Clone Cascade
            </Button>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card className="h-full bg-purple-50 border-purple-200">
            <div className="text-center mb-4">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                <ForkOutlined className="text-2xl text-purple-600" />
              </div>
              <Text strong className="text-lg">Clone Môn Nền tảng</Text>
            </div>
            <Paragraph className="text-gray-600 mb-4">
              Clone các môn học nền tảng (kỳ 1-4) cho chuyên ngành mới:
            </Paragraph>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
              <li>Dùng khi thêm chuyên ngành mới</li>
              <li>Clone các môn chung từ kỳ 1-4</li>
              <li>Sau đó thêm môn chuyên ngành (kỳ 5+)</li>
              <li>VD: Tạo chuyên ngành Blockchain</li>
            </ul>
            <Button type="default" block className="border-purple-500 text-purple-600" onClick={onCloneFoundation}>
              Clone Foundation
            </Button>
          </Card>
        </Col>
      </Row>

      <Card className="mt-6 bg-yellow-50 border-yellow-200">
        <Title level={5} className="!text-yellow-700">
          💡 Mẹo sử dụng
        </Title>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>
            <strong>Tìm kiếm nhanh:</strong> Chọn chuyên ngành và khóa học từ dropdown, sau đó nhấn &quot;Xem chi tiết&quot; để xem Syllabus.
          </li>
          <li>
            <strong>Xem từ danh sách:</strong> Vào tab &quot;Chuyên ngành&quot;, click vào các nút K19/K20/K21 trên mỗi thẻ chuyên ngành.
          </li>
          <li>
            <strong>Quy ước đặt tên version:</strong> Sử dụng format K + số khoá (VD: K19, K20, K21) để dễ quản lý.
          </li>
          <li>
            <strong>Kiểm tra trước khi clone:</strong> Luôn xem chi tiết syllabus nguồn trước khi clone để đảm bảo dữ liệu chính xác.
          </li>
        </ul>
      </Card>
    </div>
  );
}

// Majors List Component
function MajorsList({
  majors,
  onViewSyllabus,
}: {
  majors: { majorId: string; majorCode: string; majorName: string; description?: string | null }[];
  onViewSyllabus: (versionLabel: string, majorCode: string) => void;
}) {
  const [searchMajor, setSearchMajor] = useState("");

  const filteredMajors = majors.filter((m) => {
    if (!searchMajor) return true;
    const search = searchMajor.toLowerCase();
    return (
      m.majorCode.toLowerCase().includes(search) ||
      m.majorName.toLowerCase().includes(search)
    );
  });

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Title level={5} className="!mb-0">
          Danh sách Chuyên ngành ({majors.length})
        </Title>
        <Input
          placeholder="Tìm chuyên ngành..."
          prefix={<SearchOutlined />}
          value={searchMajor}
          onChange={(e) => setSearchMajor(e.target.value)}
          allowClear
          className="w-64"
        />
      </div>

      {filteredMajors.length === 0 ? (
        <Empty description="Không tìm thấy chuyên ngành" />
      ) : (
        <Row gutter={[16, 16]}>
          {filteredMajors.map((major) => (
            <Col xs={24} sm={12} lg={8} key={major.majorId}>
              <Card
                hoverable
                className="h-full"
                actions={[
                  <Tooltip title={`Xem Syllabus K19 - ${major.majorCode}`} key="k19">
                    <Button
                      type="link"
                      size="small"
                      onClick={() => onViewSyllabus("K19", major.majorCode)}
                    >
                      K19
                    </Button>
                  </Tooltip>,
                  <Tooltip title={`Xem Syllabus K20 - ${major.majorCode}`} key="k20">
                    <Button
                      type="link"
                      size="small"
                      onClick={() => onViewSyllabus("K20", major.majorCode)}
                    >
                      K20
                    </Button>
                  </Tooltip>,
                  <Tooltip title={`Xem Syllabus K21 - ${major.majorCode}`} key="k21">
                    <Button
                      type="link"
                      size="small"
                      onClick={() => onViewSyllabus("K21", major.majorCode)}
                    >
                      K21
                    </Button>
                  </Tooltip>,
                ]}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                    {major.majorCode.substring(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Tag color="blue" className="mb-1">{major.majorCode}</Tag>
                    <Text strong className="block truncate">{major.majorName}</Text>
                    {major.description && (
                      <Text type="secondary" className="text-xs truncate block">
                        {major.description}
                      </Text>
                    )}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}

// Major Management Component
function MajorManagement({
  majors,
  loading,
  onCreateNew,
  onViewDetail,
  onDelete,
}: {
  majors: MajorDto[];
  loading: boolean;
  onCreateNew: () => void;
  onViewDetail: (majorId: string) => void;
  onDelete: (majorId: string) => void;
}) {
  const [searchText, setSearchText] = useState("");

  const filteredMajors = majors.filter((m) => {
    if (!searchText) return true;
    const search = searchText.toLowerCase();
    return (
      m.majorCode.toLowerCase().includes(search) ||
      m.majorName.toLowerCase().includes(search)
    );
  });

  const columns = [
    {
      title: "Mã chuyên ngành",
      dataIndex: "majorCode",
      key: "majorCode",
      width: 150,
      render: (code: string) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: "Tên chuyên ngành",
      dataIndex: "majorName",
      key: "majorName",
      ellipsis: true,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (desc: string) => desc || <Text type="secondary">-</Text>,
    },
    {
      title: "Số tín chỉ yêu cầu",
      dataIndex: "creditRequired",
      key: "creditRequired",
      width: 150,
      align: "center" as const,
      render: (credit: number) => credit || <Text type="secondary">-</Text>,
    },
    {
      title: "Hành động",
      key: "actions",
      width: 150,
      render: (_: unknown, record: MajorDto) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => onViewDetail(record.majorId)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa chuyên ngành"
            description="Bạn có chắc chắn muốn xóa chuyên ngành này?"
            onConfirm={() => onDelete(record.majorId)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Title level={5} className="!mb-0">
          Quản lý Chuyên ngành ({majors.length})
        </Title>
        <Space>
          <Input
            placeholder="Tìm kiếm..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            className="w-64"
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={onCreateNew}>
            Thêm chuyên ngành
          </Button>
        </Space>
      </div>

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={filteredMajors}
          rowKey="majorId"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} chuyên ngành`,
          }}
          locale={{ emptyText: <Empty description="Chưa có chuyên ngành nào" /> }}
        />
      </Spin>
    </div>
  );
}

// Subject Management Component
function SubjectManagement({
  subjects,
  loading,
  onCreateNew,
  onViewDetail,
  onDelete,
}: {
  subjects: SubjectDto[];
  loading: boolean;
  onCreateNew: () => void;
  onViewDetail: (subjectId: string) => void;
  onDelete: (subjectId: string) => void;
}) {
  const [searchText, setSearchText] = useState("");

  const filteredSubjects = subjects.filter((s) => {
    if (!searchText) return true;
    const search = searchText.toLowerCase();
    return (
      s.subjectCode.toLowerCase().includes(search) ||
      s.subjectName.toLowerCase().includes(search)
    );
  });

  const columns = [
    {
      title: "Mã môn học",
      dataIndex: "subjectCode",
      key: "subjectCode",
      width: 150,
      render: (code: string) => <Tag color="green">{code}</Tag>,
    },
    {
      title: "Tên môn học",
      dataIndex: "subjectName",
      key: "subjectName",
      ellipsis: true,
    },
    {
      title: "Mô tả",
      dataIndex: "subjectDescription",
      key: "subjectDescription",
      ellipsis: true,
      render: (desc: string) => desc || <Text type="secondary">-</Text>,
    },
    {
      title: "Số môn tiên quyết",
      dataIndex: "prerequisiteSubjects",
      key: "prerequisiteSubjects",
      width: 150,
      align: "center" as const,
      render: (prerequisites: SubjectDto["prerequisiteSubjects"]) => 
        prerequisites?.length || 0,
    },
    {
      title: "Hành động",
      key: "actions",
      width: 150,
      render: (_: unknown, record: SubjectDto) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => onViewDetail(record.subjectId)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa môn học"
            description="Bạn có chắc chắn muốn xóa môn học này?"
            onConfirm={() => onDelete(record.subjectId)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Title level={5} className="!mb-0">
          Quản lý Môn học ({subjects.length})
        </Title>
        <Space>
          <Input
            placeholder="Tìm kiếm..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            className="w-64"
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={onCreateNew}>
            Thêm môn học
          </Button>
        </Space>
      </div>

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={filteredSubjects}
          rowKey="subjectId"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} môn học`,
          }}
          locale={{ emptyText: <Empty description="Chưa có môn học nào" /> }}
        />
      </Spin>
    </div>
  );
}