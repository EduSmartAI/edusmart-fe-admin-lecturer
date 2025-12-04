'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Avatar,
  Upload,
  message,
  Spin,
  Typography,
  Row,
  Col,
  Space,
  Tabs,
  Empty,
  Tag,
  Modal,
  DatePicker,
  InputNumber,
  Switch,
  Tooltip,
} from 'antd';
import {
  UserOutlined,
  CameraOutlined,
  SaveOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
  BankOutlined,
  BookOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LinkOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { useUserProfileStore } from 'EduSmart/stores/User/UserProfileStore';
import type { 
  UpdateTeacherProfileDto,
  CertificateDto,
  ExperienceDto,
  QualificationDto,
} from 'EduSmart/api/api-teacher-service';
import { useTheme } from 'EduSmart/Provider/ThemeProvider';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const LecturerProfilePage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const {
    profile,
    isLoading,
    isUpdating,
    loadProfile,
    updateTeacherProfile,
    uploadProfilePicture,
  } = useUserProfileStore();

  const [form] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [isFormInitialized, setIsFormInitialized] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  
  // Local state for display in header (updated after successful save)
  const [displayName, setDisplayName] = useState<string>('');
  const [bio, setBio] = useState<string>('');

  // Modal states
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [expModalOpen, setExpModalOpen] = useState(false);
  const [qualModalOpen, setQualModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<CertificateDto | null>(null);
  const [editingExp, setEditingExp] = useState<ExperienceDto | null>(null);
  const [editingQual, setEditingQual] = useState<QualificationDto | null>(null);

  // Form instances for modals
  const [certForm] = Form.useForm();
  const [expForm] = Form.useForm();
  const [qualForm] = Form.useForm();

  // Local state for managing items
  const [certificates, setCertificates] = useState<CertificateDto[]>([]);
  const [experiences, setExperiences] = useState<ExperienceDto[]>([]);
  const [qualifications, setQualifications] = useState<QualificationDto[]>([]);

  useEffect(() => {
    if (!profile) {
      loadProfile();
    }
  }, [profile, loadProfile]);

  useEffect(() => {
    if (profile && !isFormInitialized) {
      form.setFieldsValue({
        displayName: profile.displayName || profile.name || '',
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        bio: profile.bio || '',
      });
      setAvatarUrl(profile.profilePictureUrl || null);
      setDisplayName(profile.displayName || profile.name || '');
      setBio(profile.bio || '');
      setCertificates(profile.certificates || []);
      setExperiences(profile.experiences || []);
      setQualifications(profile.qualifications || []);
      setIsFormInitialized(true);
    }
  }, [profile, form, isFormInitialized]);

  const handleUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    setUploading(true);
    try {
      const url = await uploadProfilePicture(file as File);
      if (url) {
        setAvatarUrl(url);
        message.success('Tải ảnh lên thành công');
        onSuccess?.(url);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      message.error('Tải ảnh lên thất bại');
      onError?.(error as Error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (values: UpdateTeacherProfileDto) => {
    const updateData: UpdateTeacherProfileDto = {
      displayName: values.displayName,
      firstName: values.firstName,
      lastName: values.lastName,
      bio: values.bio,
      profilePictureUrl: avatarUrl || undefined,
    };

    const success = await updateTeacherProfile(updateData);
    if (success) {
      // Update local display state
      setDisplayName(values.displayName || '');
      setBio(values.bio || '');
      message.success('Cập nhật hồ sơ thành công');
      
      // Reload profile from API to sync with server
      setIsReloading(true);
      setIsFormInitialized(false);
      await loadProfile();
      setIsReloading(false);
    } else {
      message.error('Cập nhật hồ sơ thất bại');
    }
  };

  const initialsFrom = (name: string) =>
    (name || 'U')
      .split(' ')
      .filter(Boolean)
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

  // Certificate handlers
  const openCertModal = (cert?: CertificateDto) => {
    if (cert) {
      setEditingCert(cert);
      certForm.setFieldsValue({
        ...cert,
        issueDate: cert.issueDate ? dayjs(cert.issueDate) : null,
        expirationDate: cert.expirationDate ? dayjs(cert.expirationDate) : null,
      });
    } else {
      setEditingCert(null);
      certForm.resetFields();
    }
    setCertModalOpen(true);
  };

  const handleCertSubmit = (values: CertificateDto & { issueDate?: { format: (f: string) => string }; expirationDate?: { format: (f: string) => string } }) => {
    const newCert: CertificateDto = {
      ...values,
      issueDate: values.issueDate?.format('YYYY-MM-DD'),
      expirationDate: values.expirationDate?.format('YYYY-MM-DD'),
      certificateId: editingCert?.certificateId || `temp-${Date.now()}`,
    };

    if (editingCert) {
      setCertificates(prev => prev.map(c => 
        c.certificateId === editingCert.certificateId ? newCert : c
      ));
    } else {
      setCertificates(prev => [...prev, newCert]);
    }
    setCertModalOpen(false);
    certForm.resetFields();
    message.success(editingCert ? 'Cập nhật chứng chỉ thành công' : 'Thêm chứng chỉ thành công');
  };

  const deleteCert = (certId: string) => {
    setCertificates(prev => prev.filter(c => c.certificateId !== certId));
    message.success('Xóa chứng chỉ thành công');
  };

  // Experience handlers
  const openExpModal = (exp?: ExperienceDto) => {
    if (exp) {
      setEditingExp(exp);
      expForm.setFieldsValue({
        ...exp,
        startDate: exp.startDate ? dayjs(exp.startDate) : null,
        endDate: exp.endDate ? dayjs(exp.endDate) : null,
      });
    } else {
      setEditingExp(null);
      expForm.resetFields();
    }
    setExpModalOpen(true);
  };

  const handleExpSubmit = (values: ExperienceDto & { startDate?: { format: (f: string) => string }; endDate?: { format: (f: string) => string } }) => {
    const newExp: ExperienceDto = {
      ...values,
      startDate: values.startDate?.format('YYYY-MM-DD'),
      endDate: values.isCurrent ? undefined : values.endDate?.format('YYYY-MM-DD'),
      experienceId: editingExp?.experienceId || `temp-${Date.now()}`,
    };

    if (editingExp) {
      setExperiences(prev => prev.map(e => 
        e.experienceId === editingExp.experienceId ? newExp : e
      ));
    } else {
      setExperiences(prev => [...prev, newExp]);
    }
    setExpModalOpen(false);
    expForm.resetFields();
    message.success(editingExp ? 'Cập nhật kinh nghiệm thành công' : 'Thêm kinh nghiệm thành công');
  };

  const deleteExp = (expId: string) => {
    setExperiences(prev => prev.filter(e => e.experienceId !== expId));
    message.success('Xóa kinh nghiệm thành công');
  };

  // Qualification handlers
  const openQualModal = (qual?: QualificationDto) => {
    if (qual) {
      setEditingQual(qual);
      qualForm.setFieldsValue(qual);
    } else {
      setEditingQual(null);
      qualForm.resetFields();
    }
    setQualModalOpen(true);
  };

  const handleQualSubmit = (values: QualificationDto) => {
    const newQual: QualificationDto = {
      ...values,
      qualificationId: editingQual?.qualificationId || `temp-${Date.now()}`,
    };

    if (editingQual) {
      setQualifications(prev => prev.map(q => 
        q.qualificationId === editingQual.qualificationId ? newQual : q
      ));
    } else {
      setQualifications(prev => [...prev, newQual]);
    }
    setQualModalOpen(false);
    qualForm.resetFields();
    message.success(editingQual ? 'Cập nhật học vấn thành công' : 'Thêm học vấn thành công');
  };

  const deleteQual = (qualId: string) => {
    setQualifications(prev => prev.filter(q => q.qualificationId !== qualId));
    message.success('Xóa học vấn thành công');
  };

  if (isLoading && !profile) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  const cardBg = isDarkMode ? 'bg-gray-800/50' : 'bg-white';
  const cardBorder = isDarkMode ? 'border-gray-700' : 'border-gray-200';

  return (
    <Spin spinning={isUpdating || isReloading} tip={isReloading ? "Đang tải lại..." : "Đang cập nhật..."}>
    <div className="max-w-6xl mx-auto pb-8">
      {/* Header Section */}
      <div className={`${cardBg} rounded-2xl p-8 mb-6 border ${cardBorder}`}>
        <Row gutter={[32, 24]} align="middle">
          <Col xs={24} md={8} className="text-center">
            <div style={{ position: 'relative', display: 'inline-block', width: 160, height: 160 }}>
              <Avatar
                size={160}
                src={avatarUrl}
                icon={!avatarUrl && <UserOutlined />}
                className="border-4 border-blue-500/20 shadow-xl"
                style={{ backgroundColor: avatarUrl ? undefined : '#1890ff' }}
              >
                {!avatarUrl && initialsFrom(profile?.name || 'User')}
              </Avatar>
              <Upload
                showUploadList={false}
                customRequest={handleUpload}
                accept="image/*"
                disabled={uploading}
              >
                <Tooltip title="Thay đổi ảnh đại diện">
                  <Button
                    type="primary"
                    shape="circle"
                    icon={uploading ? <Spin size="small" /> : <CameraOutlined />}
                    size="large"
                    style={{ 
                      position: 'absolute', 
                      bottom: 4, 
                      right: 4,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                    disabled={uploading}
                  />
                </Tooltip>
              </Upload>
            </div>
          </Col>
          <Col xs={24} md={16}>
            <Title level={2} className="mb-2" style={{ marginBottom: 8 }}>
              {displayName || profile?.name || 'Giảng viên'}
            </Title>
            <div className="flex items-center gap-2 text-gray-500 mb-4">
              <MailOutlined />
              <Text type="secondary">{profile?.email}</Text>
            </div>
            {bio && (
              <Paragraph 
                type="secondary" 
                className="text-base mb-4"
                ellipsis={{ rows: 3, expandable: true }}
              >
                {bio}
              </Paragraph>
            )}
            <Space wrap>
              <Tag color="blue" icon={<SafetyCertificateOutlined />}>
                {certificates.length} Chứng chỉ
              </Tag>
              <Tag color="green" icon={<BankOutlined />}>
                {experiences.length} Kinh nghiệm
              </Tag>
              <Tag color="purple" icon={<BookOutlined />}>
                {qualifications.length} Bằng cấp
              </Tag>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Tabs Section */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        size="large"
        items={[
          {
            key: 'basic',
            label: (
              <span className="flex items-center gap-2">
                <UserOutlined />
                Thông tin cơ bản
              </span>
            ),
            children: (
              <Card className={`${cardBg} border ${cardBorder}`} bordered={false}>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                  size="large"
                >
                  <Row gutter={24}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="firstName"
                        label="Họ"
                        rules={[{ required: true, message: 'Vui lòng nhập họ' }]}
                      >
                        <Input 
                          placeholder="Nhập họ của bạn" 
                          prefix={<UserOutlined className="text-gray-400" />}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="lastName"
                        label="Tên"
                        rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                      >
                        <Input 
                          placeholder="Nhập tên của bạn"
                          prefix={<UserOutlined className="text-gray-400" />}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="displayName"
                    label="Tên hiển thị"
                    rules={[{ required: true, message: 'Vui lòng nhập tên hiển thị' }]}
                    tooltip="Tên này sẽ được hiển thị cho học viên"
                  >
                    <Input 
                      placeholder="Tên sẽ hiển thị trên hệ thống"
                      prefix={<UserOutlined className="text-gray-400" />}
                    />
                  </Form.Item>

                  <Form.Item
                    name="bio"
                    label="Giới thiệu bản thân"
                    rules={[
                      { max: 1000, message: 'Giới thiệu không được vượt quá 1000 ký tự' },
                    ]}
                    tooltip="Mô tả ngắn gọn về bản thân, chuyên môn và kinh nghiệm của bạn"
                  >
                    <TextArea
                      placeholder="Viết một vài dòng giới thiệu về bản thân, chuyên môn và kinh nghiệm giảng dạy..."
                      rows={5}
                      showCount
                      maxLength={1000}
                    />
                  </Form.Item>

                  <Form.Item className="mb-0 mt-6">
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SaveOutlined />}
                      loading={isUpdating}
                      size="large"
                    >
                      Lưu thay đổi
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            ),
          },
          {
            key: 'certificates',
            label: (
              <span className="flex items-center gap-2">
                <SafetyCertificateOutlined />
                Chứng chỉ ({certificates.length})
              </span>
            ),
            children: (
              <Card className={`${cardBg} border ${cardBorder}`} bordered={false}>
                <div className="flex justify-between items-center mb-6">
                  <Title level={4} style={{ margin: 0 }}>Chứng chỉ & Chứng nhận</Title>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => openCertModal()}
                  >
                    Thêm chứng chỉ
                  </Button>
                </div>
                
                {certificates.length === 0 ? (
                  <Empty 
                    description="Chưa có chứng chỉ nào"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  >
                    <Button type="primary" onClick={() => openCertModal()}>
                      Thêm chứng chỉ đầu tiên
                    </Button>
                  </Empty>
                ) : (
                  <Row gutter={[16, 16]}>
                    {certificates.map((cert, index) => (
                      <Col xs={24} md={12} key={cert.certificateId || index}>
                        <Card 
                          size="small" 
                          className={`h-full ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}
                          actions={[
                            <Tooltip title="Chỉnh sửa" key="edit">
                              <EditOutlined onClick={() => openCertModal(cert)} />
                            </Tooltip>,
                            <Tooltip title="Xóa" key="delete">
                              <DeleteOutlined 
                                onClick={() => deleteCert(cert.certificateId!)} 
                                className="text-red-500"
                              />
                            </Tooltip>,
                          ]}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                              <SafetyCertificateOutlined className="text-blue-500 text-xl" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <Text strong className="block truncate">{cert.name}</Text>
                              <Text type="secondary" className="text-sm block">
                                {cert.issuingOrganization}
                              </Text>
                              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                <CalendarOutlined />
                                <span>
                                  {cert.issueDate ? dayjs(cert.issueDate).format('MM/YYYY') : 'N/A'}
                                  {cert.expirationDate && ` - ${dayjs(cert.expirationDate).format('MM/YYYY')}`}
                                </span>
                              </div>
                              {cert.credentialUrl && (
                                <a 
                                  href={cert.credentialUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs flex items-center gap-1 mt-1 text-blue-500"
                                >
                                  <LinkOutlined /> Xem chứng chỉ
                                </a>
                              )}
                            </div>
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </Card>
            ),
          },
          {
            key: 'experiences',
            label: (
              <span className="flex items-center gap-2">
                <BankOutlined />
                Kinh nghiệm ({experiences.length})
              </span>
            ),
            children: (
              <Card className={`${cardBg} border ${cardBorder}`} bordered={false}>
                <div className="flex justify-between items-center mb-6">
                  <Title level={4} style={{ margin: 0 }}>Kinh nghiệm làm việc</Title>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => openExpModal()}
                  >
                    Thêm kinh nghiệm
                  </Button>
                </div>
                
                {experiences.length === 0 ? (
                  <Empty 
                    description="Chưa có kinh nghiệm nào"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  >
                    <Button type="primary" onClick={() => openExpModal()}>
                      Thêm kinh nghiệm đầu tiên
                    </Button>
                  </Empty>
                ) : (
                  <div className="space-y-4">
                    {experiences.map((exp, index) => (
                      <Card 
                        key={exp.experienceId || index}
                        size="small" 
                        className={`${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}
                        extra={
                          <Space>
                            <Button 
                              type="text" 
                              icon={<EditOutlined />} 
                              size="small"
                              onClick={() => openExpModal(exp)}
                            />
                            <Button 
                              type="text" 
                              icon={<DeleteOutlined />} 
                              size="small"
                              danger
                              onClick={() => deleteExp(exp.experienceId!)}
                            />
                          </Space>
                        }
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                            <BankOutlined className="text-green-500 text-2xl" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Text strong className="text-lg">{exp.title}</Text>
                              {exp.isCurrent && <Tag color="green">Đang làm việc</Tag>}
                            </div>
                            <Text className="block">{exp.company}</Text>
                            {exp.location && (
                              <Text type="secondary" className="text-sm flex items-center gap-1">
                                <EnvironmentOutlined /> {exp.location}
                              </Text>
                            )}
                            <Text type="secondary" className="text-sm flex items-center gap-1 mt-1">
                              <CalendarOutlined />
                              {exp.startDate ? dayjs(exp.startDate).format('MM/YYYY') : 'N/A'}
                              {' - '}
                              {exp.isCurrent ? 'Hiện tại' : (exp.endDate ? dayjs(exp.endDate).format('MM/YYYY') : 'N/A')}
                            </Text>
                            {exp.description && (
                              <Paragraph type="secondary" className="mt-2 mb-0" ellipsis={{ rows: 2 }}>
                                {exp.description}
                              </Paragraph>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Card>
            ),
          },
          {
            key: 'qualifications',
            label: (
              <span className="flex items-center gap-2">
                <BookOutlined />
                Học vấn ({qualifications.length})
              </span>
            ),
            children: (
              <Card className={`${cardBg} border ${cardBorder}`} bordered={false}>
                <div className="flex justify-between items-center mb-6">
                  <Title level={4} style={{ margin: 0 }}>Bằng cấp & Học vấn</Title>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => openQualModal()}
                  >
                    Thêm bằng cấp
                  </Button>
                </div>
                
                {qualifications.length === 0 ? (
                  <Empty 
                    description="Chưa có bằng cấp nào"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  >
                    <Button type="primary" onClick={() => openQualModal()}>
                      Thêm bằng cấp đầu tiên
                    </Button>
                  </Empty>
                ) : (
                  <Row gutter={[16, 16]}>
                    {qualifications.map((qual, index) => (
                      <Col xs={24} md={12} key={qual.qualificationId || index}>
                        <Card 
                          size="small" 
                          className={`h-full ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}
                          actions={[
                            <Tooltip title="Chỉnh sửa" key="edit">
                              <EditOutlined onClick={() => openQualModal(qual)} />
                            </Tooltip>,
                            <Tooltip title="Xóa" key="delete">
                              <DeleteOutlined 
                                onClick={() => deleteQual(qual.qualificationId!)} 
                                className="text-red-500"
                              />
                            </Tooltip>,
                          ]}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                              <BookOutlined className="text-purple-500 text-xl" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <Text strong className="block">{qual.degree}</Text>
                              <Text className="block text-sm">{qual.fieldOfStudy}</Text>
                              <Text type="secondary" className="text-sm block">
                                {qual.institution}
                              </Text>
                              <div className="flex items-center gap-2 mt-1">
                                <Tag color="purple">{qual.graduationYear}</Tag>
                                {qual.grade && <Tag>{qual.grade}</Tag>}
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </Card>
            ),
          },
        ]}
      />

      {/* Certificate Modal */}
      <Modal
        title={editingCert ? 'Chỉnh sửa chứng chỉ' : 'Thêm chứng chỉ mới'}
        open={certModalOpen}
        onCancel={() => {
          setCertModalOpen(false);
          certForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={certForm}
          layout="vertical"
          onFinish={handleCertSubmit}
          className="mt-4"
        >
          <Form.Item
            name="name"
            label="Tên chứng chỉ"
            rules={[{ required: true, message: 'Vui lòng nhập tên chứng chỉ' }]}
          >
            <Input placeholder="VD: AWS Certified Solutions Architect" />
          </Form.Item>

          <Form.Item
            name="issuingOrganization"
            label="Tổ chức cấp"
            rules={[{ required: true, message: 'Vui lòng nhập tổ chức cấp' }]}
          >
            <Input placeholder="VD: Amazon Web Services" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="issueDate"
                label="Ngày cấp"
                rules={[{ required: true, message: 'Vui lòng chọn ngày cấp' }]}
              >
                <DatePicker 
                  className="w-full" 
                  picker="month" 
                  placeholder="Chọn tháng/năm"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="expirationDate"
                label="Ngày hết hạn"
              >
                <DatePicker 
                  className="w-full" 
                  picker="month" 
                  placeholder="Không có hạn"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="credentialId"
            label="Mã chứng chỉ"
          >
            <Input placeholder="VD: ABC123XYZ" />
          </Form.Item>

          <Form.Item
            name="credentialUrl"
            label="Link xác thực"
          >
            <Input placeholder="https://..." prefix={<LinkOutlined />} />
          </Form.Item>

          <Form.Item className="mb-0 mt-6 flex justify-end">
            <Space>
              <Button onClick={() => setCertModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {editingCert ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Experience Modal */}
      <Modal
        title={editingExp ? 'Chỉnh sửa kinh nghiệm' : 'Thêm kinh nghiệm mới'}
        open={expModalOpen}
        onCancel={() => {
          setExpModalOpen(false);
          expForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={expForm}
          layout="vertical"
          onFinish={handleExpSubmit}
          className="mt-4"
        >
          <Form.Item
            name="title"
            label="Chức danh"
            rules={[{ required: true, message: 'Vui lòng nhập chức danh' }]}
          >
            <Input placeholder="VD: Giảng viên Công nghệ thông tin" />
          </Form.Item>

          <Form.Item
            name="company"
            label="Công ty / Tổ chức"
            rules={[{ required: true, message: 'Vui lòng nhập tên công ty' }]}
          >
            <Input placeholder="VD: Đại học FPT" />
          </Form.Item>

          <Form.Item
            name="location"
            label="Địa điểm"
          >
            <Input placeholder="VD: Hà Nội, Việt Nam" prefix={<EnvironmentOutlined />} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label="Ngày bắt đầu"
                rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
              >
                <DatePicker 
                  className="w-full" 
                  picker="month" 
                  placeholder="Chọn tháng/năm"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                noStyle
                shouldUpdate={(prev, curr) => prev.isCurrent !== curr.isCurrent}
              >
                {({ getFieldValue }) => (
                  <Form.Item
                    name="endDate"
                    label="Ngày kết thúc"
                  >
                    <DatePicker 
                      className="w-full" 
                      picker="month" 
                      placeholder="Chọn tháng/năm"
                      disabled={getFieldValue('isCurrent')}
                    />
                  </Form.Item>
                )}
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="isCurrent"
            valuePropName="checked"
          >
            <Switch checkedChildren="Đang làm việc" unCheckedChildren="Đã kết thúc" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả công việc"
          >
            <TextArea 
              rows={4} 
              placeholder="Mô tả các nhiệm vụ và thành tựu đạt được..."
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item className="mb-0 mt-6 flex justify-end">
            <Space>
              <Button onClick={() => setExpModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {editingExp ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Qualification Modal */}
      <Modal
        title={editingQual ? 'Chỉnh sửa học vấn' : 'Thêm học vấn mới'}
        open={qualModalOpen}
        onCancel={() => {
          setQualModalOpen(false);
          qualForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={qualForm}
          layout="vertical"
          onFinish={handleQualSubmit}
          className="mt-4"
        >
          <Form.Item
            name="degree"
            label="Bằng cấp"
            rules={[{ required: true, message: 'Vui lòng nhập bằng cấp' }]}
          >
            <Input placeholder="VD: Thạc sĩ, Cử nhân, Tiến sĩ..." />
          </Form.Item>

          <Form.Item
            name="fieldOfStudy"
            label="Chuyên ngành"
            rules={[{ required: true, message: 'Vui lòng nhập chuyên ngành' }]}
          >
            <Input placeholder="VD: Khoa học Máy tính" />
          </Form.Item>

          <Form.Item
            name="institution"
            label="Trường / Tổ chức đào tạo"
            rules={[{ required: true, message: 'Vui lòng nhập tên trường' }]}
          >
            <Input placeholder="VD: Đại học Bách khoa Hà Nội" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="graduationYear"
                label="Năm tốt nghiệp"
                rules={[{ required: true, message: 'Vui lòng nhập năm tốt nghiệp' }]}
              >
                <InputNumber 
                  className="w-full"
                  min={1950} 
                  max={2030} 
                  placeholder="VD: 2020"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="grade"
                label="Xếp loại"
              >
                <Input placeholder="VD: Xuất sắc, Giỏi, Khá..." />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item className="mb-0 mt-6 flex justify-end">
            <Space>
              <Button onClick={() => setQualModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {editingQual ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
    </Spin>
  );
};

export default LecturerProfilePage;
