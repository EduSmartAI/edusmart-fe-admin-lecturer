'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Card,
  Button,
  Descriptions,
  Tag,
  Space,
  Statistic,
  Row,
  Col,
  Tabs,
  Rate,
  Breadcrumb,
  Typography,
  Dropdown,
  Empty,
  App,
  Modal,
  Input
} from 'antd';
import {
  EditOutlined,
  EyeOutlined,
  UserOutlined,
  BookOutlined,
  ClockCircleOutlined,
  StarOutlined,
  DollarOutlined,
  ShareAltOutlined,
  MoreOutlined,
  PlusOutlined,
  BarChartOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  ExclamationCircleFilled,
  CopyOutlined,
  LinkOutlined,
  FacebookOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  MailOutlined,
  WhatsAppOutlined,
  SendOutlined
} from '@ant-design/icons';
import { FadeInUp } from 'EduSmart/components/Animation/FadeInUp';
import { useCourseManagementStore } from 'EduSmart/stores/CourseManagement/CourseManagementStore';
import { useNotification } from 'EduSmart/Provider/NotificationProvider';
import { CourseDto, ModuleDetailDto, courseServiceAPI, CommentDto } from 'EduSmart/api/api-course-service';
import { useUserProfileStore } from 'EduSmart/stores/User/UserProfileStore';

const { Title, Text, Paragraph } = Typography;

// Helper function to map API course data to UI format
const mapCourseForUI = (course: CourseDto, lecturerName?: string) => {
  return {
    ...course,
    // Add backward compatibility fields
    id: course.courseId, // Map courseId to id for UI compatibility
    studentCount: course.learnerCount,
    currency: 'VND', // Default currency as API doesn't provide this
    duration: course.durationHours,
    lecturerName: lecturerName || 'Giảng viên',
    status: course.isActive ? 'published' : 'draft' as const,
    rating: 0,
    reviewCount: 0,
    coverImage: course.courseImageUrl, // Map courseImageUrl to coverImage
    category: course.subjectCode || 'General', // Use subjectCode as category
  };
};



const CourseDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const { courses, selectedCourse, fetchCourseById, deleteCourse, error, clearError } = useCourseManagementStore();
  const { profile, loadProfile } = useUserProfileStore();
  const messageApi = useNotification();
  const { modal } = App.useApp(); // ← Use App.useApp() for modal

  const [course, setCourse] = useState<ReturnType<typeof mapCourseForUI> | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [reviews, setReviews] = useState<CommentDto[]>([]);
  const [reviewsKey, setReviewsKey] = useState(0); // Force re-render key
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  // Utility function to build comment tree from flat list
  const buildCommentTree = (flatComments: CommentDto[]): CommentDto[] => {
    const commentMap = new Map<string, CommentDto>();
    const rootComments: CommentDto[] = [];

    // First pass: create a map of all comments with empty replies array
    flatComments.forEach(comment => {
      commentMap.set(comment.commentId, { ...comment, replies: [] } as CommentDto);
    });

    // Second pass: build the tree structure
    flatComments.forEach(comment => {
      const commentWithReplies = commentMap.get(comment.commentId)!;

      if (comment.parentCommentId) {
        // This is a reply, add it to parent's replies
        const parent = commentMap.get(comment.parentCommentId);
        if (parent && parent.replies) {
          parent.replies.push(commentWithReplies);
        } else {
          // Parent not found in current batch - add as root
          rootComments.push(commentWithReplies);
        }
      } else {
        // This is a root comment
        rootComments.push(commentWithReplies);
      }
    });

    return rootComments;
  };

  const fetchReviews = useCallback(async (silent = false) => {
    if (!courseId) return;
    if (!silent) setLoadingReviews(true);
    try {
      const res = await courseServiceAPI.comments.get({
        courseId: courseId,
        page: 0,
        size: 50
      });
      if (res.success && res.response) {
        const flatReviews = res.response.items || res.response.data || [];
        const nestedReviews = buildCommentTree(flatReviews);
        // Force new array reference and increment key to trigger re-render
        setReviews([...nestedReviews]);
        setReviewsKey(prev => prev + 1);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      if (!silent) setLoadingReviews(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (activeTab === 'reviews') {
      fetchReviews();
    }
  }, [activeTab, fetchReviews]);

  const handleReplyClick = (commentId: string) => {
    if (activeReplyId === commentId) {
      setActiveReplyId(null);
      setReplyContent("");
    } else {
      setActiveReplyId(commentId);
      setReplyContent("");
    }
  };

  const handleReplySubmit = async (commentId: string) => {
    if (!replyContent.trim()) {
      messageApi.error("Vui lòng nhập nội dung trả lời");
      return;
    }

    const contentToSend = replyContent.trim();

    // Optimistic update - add reply immediately to UI
    const tempReply: CommentDto = {
      commentId: `temp-${Date.now()}`,
      courseId: courseId,
      userId: profile?.userId || '',
      userDisplayName: profile?.name || 'Giảng viên',
      userAvatar: undefined,
      content: contentToSend,
      parentCommentId: commentId,
      isReplied: false,
      createdAt: new Date().toISOString(),
      replies: []
    };

    // Clear input immediately for better UX
    setReplyContent("");
    setActiveReplyId(null);

    // Update UI immediately
    setReviews(prevReviews => {
      const updateComments = (comments: CommentDto[]): CommentDto[] => {
        return comments.map(comment => {
          if (comment.commentId === commentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), tempReply]
            };
          }
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: updateComments(comment.replies)
            };
          }
          return comment;
        });
      };
      const updated = updateComments(prevReviews);
      return [...updated]; // Force new reference
    });
    setReviewsKey(prev => prev + 1); // Force re-render

    try {
      await courseServiceAPI.comments.reply(
        commentId,
        contentToSend,
        courseId
      );
      messageApi.success("Đã gửi câu trả lời thành công!");
      // Keep optimistic update - don't fetch from server immediately
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      messageApi.error((error as Error).message || "Gửi câu trả lời thất bại");
      // Revert optimistic update on error by fetching from server
      await fetchReviews(true);
    }
  };

  const handleDeleteComment = (commentId: string) => {
    // Don't allow deleting temp comments (not yet saved to server)
    if (commentId.startsWith('temp-')) {
      messageApi.warning("Bình luận này đang được lưu, vui lòng đợi...");
      return;
    }

    modal.confirm({
      title: 'Xóa bình luận',
      content: 'Bạn có chắc chắn muốn xóa bình luận này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        // Helper function to recursively remove comment
        const removeComment = (comments: CommentDto[]): CommentDto[] => {
          return comments
            .filter(comment => comment.commentId !== commentId)
            .map(comment => ({
              ...comment,
              replies: comment.replies ? removeComment(comment.replies) : []
            }));
        };

        // Optimistic update - remove from UI immediately
        setReviews(prevReviews => {
          const updated = removeComment(prevReviews);
          return [...updated]; // Force new reference
        });
        setReviewsKey(prev => prev + 1); // Force re-render

        try {
          await courseServiceAPI.comments.delete(commentId, courseId);
          messageApi.success("Đã xóa bình luận thành công");
          // Keep optimistic update - don't fetch from server
        } catch (error: unknown) {
          messageApi.error((error as Error).message || "Xóa bình luận thất bại");
          // Revert on error - refresh from server
          await fetchReviews(true);
        }
      },
    });
  };

  // ... (rest of the component)

  // Inside render loop for reviews:
  /*
    <div key={review.commentId} ...>
      ...
      <Button onClick={() => handleReplyClick(review.commentId)}>Trả lời</Button>
      ...
      {activeReplyId === review.commentId && (
        <div className="mt-3 pl-10">
          <Input.TextArea
            rows={3}
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Nhập câu trả lời của bạn..."
            className="mb-2"
            autoFocus
          />
          <Space>
            <Button 
              type="primary" 
              size="small"
              onClick={() => handleReplySubmit(review.commentId)}
            >
              Gửi trả lời
            </Button>
            <Button 
              size="small"
              onClick={() => setActiveReplyId(null)}
            >
              Hủy
            </Button>
          </Space>
        </div>
      )}
      ...
    </div>
  */


  // Load user profile on mount
  useEffect(() => {
    if (!profile) {
      loadProfile();
    }
  }, [profile, loadProfile]);

  const loadCourseData = useCallback(async () => {
    setLoading(true);

    // Try to fetch specific course by ID first
    await fetchCourseById(courseId);

    // Don't handle selectedCourse here - let the separate useEffect handle it
    setLoading(false);
  }, [courseId, fetchCourseById]);

  // Handle selectedCourse updates separately
  useEffect(() => {
    const lecturerName = profile?.name || 'Giảng viên';

    if (selectedCourse && selectedCourse.courseId === courseId) {
      // Convert CourseDetailDto to UI format
      const uiCourse = {
        ...selectedCourse,
        id: selectedCourse.courseId,
        studentCount: selectedCourse.learnerCount || 0,
        currency: 'VND',
        duration: selectedCourse.durationHours,
        lecturerName: lecturerName, // Use name from token
        status: selectedCourse.isActive ? 'published' : 'draft' as const,
        rating: 4.5, // TODO: Get from reviews API
        reviewCount: 0, // TODO: Get from reviews API
        coverImage: selectedCourse.courseImageUrl,
        category: selectedCourse.subjectCode || 'General',
      };
      setCourse(uiCourse);
    } else if (!selectedCourse) {
      // Fallback to finding from courses list
      const foundCourse = courses.find(c => c.courseId === courseId);
      setCourse(foundCourse ? mapCourseForUI(foundCourse, lecturerName) : null);
    }
  }, [selectedCourse, courseId, courses, profile]);

  useEffect(() => {
    loadCourseData();
  }, [loadCourseData]);

  // Handle error display
  useEffect(() => {
    if (error) {
      messageApi.error(error);
      clearError();
    }
  }, [error, clearError, messageApi]);

  const showDeleteConfirm = useCallback(() => {
    if (!course) return;
    const { courseId: targetCourseId, title } = course;

    modal.confirm({
      title: 'Xóa khóa học',
      icon: <ExclamationCircleFilled className="text-red-500" />,
      content: `Bạn có chắc chắn muốn xóa khóa học "${title || 'Untitled Course'}"? Hành động này không thể hoàn tác.`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      centered: true,
      zIndex: 9999,
      maskClosable: true,
      async onOk() {
        const success = await deleteCourse(targetCourseId);
        if (success) {
          messageApi.success('Đã xóa khóa học thành công');
          router.push('/Lecturer/courses');
        } else {
          messageApi.error('Xóa khóa học thất bại. Vui lòng thử lại.');
        }
      },
    });
  }, [course, deleteCourse, messageApi, router, modal]);

  // Share handler functions
  const getCourseUrl = useCallback(() => {
    if (!course) return '';
    return `${window.location.origin}/course/${course.courseId}`;
  }, [course]);

  const getShareText = useCallback(() => {
    if (!course) return '';
    return `Khám phá khóa học "${course.title || 'Untitled Course'}" trên EduSmart!`;
  }, [course]);

  const handleShareToFacebook = useCallback(() => {
    const url = getCourseUrl();
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  }, [getCourseUrl]);

  const handleShareToMessenger = useCallback(() => {
    const url = getCourseUrl();
    const shareUrl = `fb-messenger://share/?link=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank');
  }, [getCourseUrl]);

  const handleShareToZalo = useCallback(() => {
    const url = getCourseUrl();
    const shareUrl = `https://zalo.me/share?url=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  }, [getCourseUrl]);

  const handleShareToWhatsApp = useCallback(() => {
    const url = getCourseUrl();
    const text = getShareText();
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
    window.open(shareUrl, '_blank');
  }, [getCourseUrl, getShareText]);

  const handleShareToTwitter = useCallback(() => {
    const url = getCourseUrl();
    const text = getShareText();
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  }, [getCourseUrl, getShareText]);

  const handleShareToLinkedIn = useCallback(() => {
    const url = getCourseUrl();
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  }, [getCourseUrl]);

  const handleShareToEmail = useCallback(() => {
    const url = getCourseUrl();
    const text = getShareText();
    const subject = encodeURIComponent(`Chia sẻ khóa học: ${course?.title || 'Untitled Course'}`);
    const body = encodeURIComponent(`${text}\n\n${url}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }, [getCourseUrl, getShareText, course]);

  const handleCopyLink = useCallback(() => {
    const url = getCourseUrl();
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url)
        .then(() => {
          messageApi.success('Đã sao chép liên kết vào clipboard!');
        })
        .catch(() => {
          messageApi.error('Không thể sao chép liên kết');
        });
    } else {
      messageApi.error('Trình duyệt không hỗ trợ sao chép tự động');
    }
  }, [getCourseUrl, messageApi]);

  if (!course) {
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOutlined className="text-2xl text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              Khóa học không tồn tại
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Khóa học với ID &quot;{courseId}&quot; không được tìm thấy hoặc bạn không có quyền truy cập.
            </p>
          </div>
          <div className="space-x-3">
            <Button onClick={() => router.back()}>
              Quay lại
            </Button>
            <Button type="primary" onClick={() => router.push('/Lecturer/courses')}>
              Danh sách khóa học
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // At this point, course is guaranteed to be non-null

  const statusColors: Record<string, string> = {
    published: '#52c41a',
    draft: '#faad14',
    archived: '#f5222d'
  };

  const statusTexts: Record<string, string> = {
    published: 'Đã xuất bản',
    draft: 'Bản nháp',
    archived: 'Đã lưu trữ'
  };

  const levelTexts: Record<number, string> = {
    1: 'Cơ bản',
    2: 'Trung cấp',
    3: 'Nâng cao'
  };

  // Future use: Content and progress columns for analytics
  // const contentColumns = [...];
  // const progressColumns = [...];

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen w-full">
      <FadeInUp className="w-full">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div>
              <Breadcrumb
                className="mb-2"
                items={[
                  {
                    title: (
                      <Link href="/Lecturer/courses" className="text-emerald-600 hover:text-emerald-700">
                        Quản lý khóa học
                      </Link>
                    )
                  },
                  {
                    title: course.title || 'Untitled Course'
                  }
                ]}
              />
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Chi tiết khóa học</h1>
            </div>
            <div className="flex items-center gap-3">
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'edit',
                      label: 'Chỉnh sửa khóa học',
                      icon: <EditOutlined />,
                    },
                    {
                      key: 'preview',
                      label: 'Xem trước',
                      icon: <EyeOutlined />,
                    },
                    {
                      key: 'share',
                      label: 'Chia sẻ',
                      icon: <ShareAltOutlined />,
                    },
                    {
                      key: 'delete',
                      label: 'Xóa khóa học',
                      icon: <DeleteOutlined />,
                      danger: true,
                    },
                  ],
                  onClick: ({ key }) => {
                    if (key === 'edit') {
                      router.push(`/Lecturer/courses/edit/${course.courseId}`);
                    } else if (key === 'preview') {
                      router.push(`/course/${course.courseId}`);
                    } else if (key === 'share') {
                      if (typeof window !== 'undefined' && navigator.clipboard) {
                        navigator.clipboard.writeText(`${window.location.origin}/course/${course.courseId}`);
                      }
                    } else if (key === 'delete') {
                      showDeleteConfirm();
                    }
                  },
                }}
                placement="bottomRight"
                trigger={['click']}
              >
                <Button icon={<MoreOutlined />}>
                  Hành động
                </Button>
              </Dropdown>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            {/* Left Sidebar: Course Preview & Quick Stats */}
            <div className="xl:col-span-3 xl:sticky top-24 space-y-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Thông tin khóa học</h2>

                {/* Course Image */}
                <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4">
                  <Image
                    src={course.coverImage || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400'}
                    alt={course.title || 'Course image'}
                    fill
                    sizes="(max-width: 768px) 100vw, 384px"
                    className="object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <Tag color={statusColors[course.status]} className="font-medium">
                      {statusTexts[course.status]}
                    </Tag>
                  </div>
                </div>

                {/* Course Basic Info */}
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Tag color="blue">{course.category}</Tag>
                    <Tag color="green">{levelTexts[course.level || 1]}</Tag>
                    {course.duration && <Tag color="orange">{course.duration}h</Tag>}
                  </div>

                  <div
                    className="text-sm text-gray-600 dark:text-gray-400 prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: course.description || '' }}
                  />
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Thống kê nhanh</h3>
                <div className="space-y-4">
                  <Statistic
                    title="Học viên"
                    value={course.studentCount}
                    prefix={<UserOutlined />}
                  />
                  <Statistic
                    title="Đánh giá"
                    value={course.rating || 0}
                    suffix={`(${course.reviewCount || 0})`}
                    prefix={<StarOutlined />}
                  />
                  <Statistic
                    title="Giá"
                    value={course.price}
                    suffix={course.currency}
                    prefix={<DollarOutlined />}
                    formatter={(value) => `${Number(value).toLocaleString()}`}
                  />
                  <Statistic
                    title="Doanh thu"
                    value={course.price * course.studentCount}
                    suffix={course.currency}
                    prefix={<DollarOutlined />}
                    formatter={(value) => `${Number(value).toLocaleString()}`}
                  />
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="xl:col-span-9 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="mb-6">
                <Title level={2} className="!mb-2">
                  {course.title || 'Untitled Course'}
                </Title>
                <Text className="text-gray-600 dark:text-gray-400">
                  Ngày tạo: {new Date(course.createdAt).toLocaleDateString('vi-VN')} •
                  Cập nhật: {new Date(course.updatedAt).toLocaleDateString('vi-VN')}
                </Text>
              </div>

              {/* Tabs Content */}
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                  {
                    key: 'overview',
                    label: 'Tổng quan',
                    children: (
                      <div className="space-y-6">
                        {/* Basic Information */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Thông tin cơ bản</h3>
                          <Descriptions column={{ xs: 1, sm: 2 }}>
                            <Descriptions.Item label="Ngày tạo">
                              {new Date(course.createdAt).toLocaleDateString('vi-VN')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Cập nhật cuối">
                              {new Date(course.updatedAt).toLocaleDateString('vi-VN')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Giảng viên">
                              {course.lecturerName}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                              <Tag color={statusColors[course.status]}>
                                {statusTexts[course.status]}
                              </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Danh mục">
                              {course.category}
                            </Descriptions.Item>
                            <Descriptions.Item label="Cấp độ">
                              {levelTexts[course.level || 1]}
                            </Descriptions.Item>
                          </Descriptions>
                        </div>

                        {/* Quick Actions */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Hành động nhanh</h3>
                          <Space wrap>
                            <Button
                              type="primary"
                              icon={<EditOutlined />}
                              onClick={() => router.push(`/Lecturer/courses/edit/${course.courseId}`)}
                            >
                              Chỉnh sửa khóa học
                            </Button>
                            <Button
                              icon={<EyeOutlined />}
                              onClick={() => router.push(`/course/${course.courseId}`)}
                            >
                              Xem trước
                            </Button>
                            <Button
                              icon={<BarChartOutlined />}
                              onClick={() => setActiveTab('analytics')}
                            >
                              Xem thống kê
                            </Button>
                            <Button
                              icon={<ShareAltOutlined />}
                              onClick={() => {
                                const courseUrl = `${window.location.origin}/course/${course.courseId}`;

                                if (typeof window !== 'undefined' && navigator.clipboard) {
                                  navigator.clipboard.writeText(courseUrl)
                                    .then(() => {
                                      messageApi.success('Đã sao chép liên kết khóa học vào clipboard!');
                                    })
                                    .catch(() => {
                                      messageApi.error('Không thể sao chép liên kết');
                                    });
                                } else {
                                  messageApi.error('Trình duyệt không hỗ trợ sao chép tự động');
                                }
                              }}
                            >
                              Chia sẻ
                            </Button>
                            <Button
                              danger
                              icon={<DeleteOutlined />}
                              onClick={showDeleteConfirm}
                            >
                              Xóa khóa học
                            </Button>
                          </Space>
                        </div>
                      </div>
                    )
                  },
                  {
                    key: 'content',
                    label: 'Nội dung',
                    children: (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center mb-6">
                          <Title level={4}>Nội dung khóa học</Title>
                          <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => router.push(`/Lecturer/courses/edit/${course.courseId}?step=2`)}
                          >
                            Chỉnh sửa nội dung
                          </Button>
                        </div>

                        {selectedCourse?.modules && selectedCourse.modules.length > 0 ? (
                          <div className="space-y-4">
                            {/* Course Summary */}
                            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                              <Row gutter={[16, 16]}>
                                <Col xs={12} sm={6}>
                                  <Statistic
                                    title="Tổng chương"
                                    value={selectedCourse.modules.length}
                                    prefix={<BookOutlined />}
                                  />
                                </Col>
                                <Col xs={12} sm={6}>
                                  <Statistic
                                    title="Tổng bài học"
                                    value={selectedCourse.modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)}
                                    prefix={<PlayCircleOutlined />}
                                  />
                                </Col>
                                <Col xs={12} sm={6}>
                                  <Statistic
                                    title="Tổng Quiz"
                                    value={
                                      selectedCourse.modules.filter(m => m.moduleQuiz).length +
                                      selectedCourse.modules.reduce((acc, m) =>
                                        acc + (m.lessons?.filter(l => l.lessonQuiz).length || 0), 0
                                      )
                                    }
                                    prefix={<QuestionCircleOutlined />}
                                  />
                                </Col>
                                <Col xs={12} sm={6}>
                                  <Statistic
                                    title="Thời lượng"
                                    value={Math.round(selectedCourse.durationHours || 0)}
                                    suffix="giờ"
                                    prefix={<ClockCircleOutlined />}
                                  />
                                </Col>
                              </Row>
                            </Card>

                            {/* Modules List */}
                            {selectedCourse.modules.map((module: ModuleDetailDto, index: number) => (
                              <Card
                                key={module.moduleId}
                                className="border-l-4 border-l-emerald-500 hover:shadow-lg transition-shadow duration-300"
                              >
                                <div className="space-y-5">
                                  {/* Module Header */}
                                  <div>
                                    <div className="flex items-start justify-between mb-3">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold text-lg">
                                            {index + 1}
                                          </div>
                                          <Title level={5} className="!mb-0 flex-1">
                                            {module.moduleName}
                                          </Title>
                                        </div>

                                        {module.description && (
                                          <Paragraph className="text-gray-600 dark:text-gray-400 mb-3 ml-13">
                                            {module.description}
                                          </Paragraph>
                                        )}

                                        {/* Modern Module Meta Info */}
                                        <div className="flex flex-wrap gap-2 ml-13">
                                          {/* Duration */}
                                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
                                            <ClockCircleOutlined className="text-blue-600 dark:text-blue-400 text-sm" />
                                            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                              {module.durationMinutes} phút
                                            </span>
                                          </div>

                                          {/* Level */}
                                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800">
                                            <StarOutlined className="text-purple-600 dark:text-purple-400 text-sm" />
                                            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                                              Cấp độ {module.level}
                                            </span>
                                          </div>

                                          {/* Core Module Badge */}
                                          {module.isCore && (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800">
                                              <CheckCircleOutlined className="text-amber-600 dark:text-amber-400 text-sm" />
                                              <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                                                Chương chính
                                              </span>
                                            </div>
                                          )}

                                          {/* Lessons Count */}
                                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
                                            <PlayCircleOutlined className="text-green-600 dark:text-green-400 text-sm" />
                                            <span className="text-sm font-medium text-green-700 dark:text-green-300">
                                              {module.lessons?.length || 0} bài học
                                            </span>
                                          </div>

                                          {/* Module Quiz Badge */}
                                          {module.moduleQuiz && (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800">
                                              <QuestionCircleOutlined className="text-orange-600 dark:text-orange-400 text-sm" />
                                              <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                                                Quiz chương • {module.moduleQuiz.questions?.length || 0} câu
                                              </span>
                                            </div>
                                          )}

                                          {/* Lesson Quizzes Badge */}
                                          {module.lessons && module.lessons.filter(l => l.lessonQuiz).length > 0 && (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-900/30 border border-cyan-200 dark:border-cyan-800">
                                              <QuestionCircleOutlined className="text-cyan-600 dark:text-cyan-400 text-sm" />
                                              <span className="text-sm font-medium text-cyan-700 dark:text-cyan-300">
                                                {module.lessons.filter(l => l.lessonQuiz).length} Quiz bài học
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Lessons */}
                                  {module.lessons && module.lessons.length > 0 && (
                                    <div className="space-y-3">
                                      <div className="flex items-center gap-2 ml-13 mb-3">
                                        <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-700"></div>
                                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                          Bài học
                                        </span>
                                        <div className="h-px flex-1 bg-gradient-to-l from-gray-200 to-transparent dark:from-gray-700"></div>
                                      </div>

                                      {module.lessons.map((lesson) => (
                                        <div
                                          key={lesson.lessonId}
                                          className="ml-13 group hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg p-4 transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                                        >
                                          <div className="flex items-start gap-4">
                                            {/* Lesson Icon */}
                                            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                                              <PlayCircleOutlined className="text-white text-xl" />
                                            </div>

                                            {/* Lesson Content */}
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-start justify-between gap-3 mb-2">
                                                <div className="flex-1">
                                                  <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                                    Bài {lesson.positionIndex}: {lesson.title}
                                                  </h4>
                                                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                    <ClockCircleOutlined className="text-xs" />
                                                    <span>{Math.floor((lesson.videoDurationSec || 0) / 60)} phút</span>
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Lesson Tags */}
                                              <div className="flex flex-wrap gap-2 mt-3">
                                                {lesson.videoUrl && (
                                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-xs font-medium text-green-700 dark:text-green-300">
                                                    <CheckCircleOutlined className="text-green-600 dark:text-green-400" />
                                                    Video đã tải lên
                                                  </span>
                                                )}

                                                {lesson.lessonQuiz && (
                                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 text-xs font-medium text-orange-700 dark:text-orange-300">
                                                    <QuestionCircleOutlined className="text-orange-600 dark:text-orange-400" />
                                                    Quiz • {lesson.lessonQuiz.questions?.length || 0} câu hỏi
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Module Quiz */}
                                  {module.moduleQuiz && (
                                    <div className="mt-4">
                                      <div className="flex items-center gap-2 ml-13 mb-3">
                                        <div className="h-px flex-1 bg-gradient-to-r from-orange-200 to-transparent dark:from-orange-900/50"></div>
                                        <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide">
                                          Kiểm tra chương
                                        </span>
                                        <div className="h-px flex-1 bg-gradient-to-l from-orange-200 to-transparent dark:from-orange-900/50"></div>
                                      </div>

                                      <div className="ml-13 relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-2 border-orange-200 dark:border-orange-800 shadow-md hover:shadow-xl transition-all duration-300">
                                        {/* Decorative Element */}
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-300/20 to-transparent dark:from-orange-600/10 rounded-full -mr-16 -mt-16"></div>

                                        <div className="relative p-5">
                                          <div className="flex items-start gap-4">
                                            {/* Quiz Icon */}
                                            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                                              <QuestionCircleOutlined className="text-white text-2xl" />
                                            </div>

                                            {/* Quiz Content */}
                                            <div className="flex-1">
                                              <div className="flex items-start justify-between gap-3 mb-3">
                                                <div>
                                                  <h4 className="text-lg font-bold text-orange-900 dark:text-orange-100 mb-1 flex items-center gap-2">
                                                    🎯 Quiz Chương
                                                  </h4>
                                                  <p className="text-sm text-orange-700 dark:text-orange-300">
                                                    Kiểm tra kiến thức sau khi hoàn thành chương
                                                  </p>
                                                </div>
                                              </div>

                                              {/* Quiz Stats */}
                                              <div className="flex flex-wrap gap-3 mb-3">
                                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-orange-200 dark:border-orange-800">
                                                  <QuestionCircleOutlined className="text-orange-600 dark:text-orange-400" />
                                                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                    {module.moduleQuiz.questions?.length || 0} câu hỏi
                                                  </span>
                                                </div>

                                                {module.moduleQuiz.quizSettings && (
                                                  <>
                                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-orange-200 dark:border-orange-800">
                                                      <ClockCircleOutlined className="text-orange-600 dark:text-orange-400" />
                                                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                        {module.moduleQuiz.quizSettings.durationMinutes || 0} phút
                                                      </span>
                                                    </div>

                                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-orange-200 dark:border-orange-800">
                                                      <CheckCircleOutlined className="text-orange-600 dark:text-orange-400" />
                                                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                        Đạt {module.moduleQuiz.quizSettings.passingScorePercentage || 0}%
                                                      </span>
                                                    </div>
                                                  </>
                                                )}
                                              </div>

                                              {/* Quiz Settings Tags */}
                                              {module.moduleQuiz.quizSettings && (
                                                <div className="flex flex-wrap gap-2">
                                                  {module.moduleQuiz.quizSettings.allowRetake && (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-100 dark:bg-blue-900/40 text-xs font-medium text-blue-700 dark:text-blue-300">
                                                      <CheckCircleOutlined />
                                                      Cho phép làm lại
                                                    </span>
                                                  )}
                                                  {module.moduleQuiz.quizSettings.showResultsImmediately && (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-100 dark:bg-green-900/40 text-xs font-medium text-green-700 dark:text-green-300">
                                                      <CheckCircleOutlined />
                                                      Hiện kết quả ngay
                                                    </span>
                                                  )}
                                                  {module.moduleQuiz.quizSettings.shuffleQuestions && (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-100 dark:bg-purple-900/40 text-xs font-medium text-purple-700 dark:text-purple-300">
                                                      Xáo trộn câu hỏi
                                                    </span>
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}                                {/* Module Discussion */}
                                  {module.moduleDiscussionDetails && module.moduleDiscussionDetails.length > 0 && (
                                    <div className="mt-4">
                                      <div className="flex items-center gap-2 ml-13 mb-3">
                                        <div className="h-px flex-1 bg-gradient-to-r from-blue-200 to-transparent dark:from-blue-900/50"></div>
                                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                                          Thảo luận
                                        </span>
                                        <div className="h-px flex-1 bg-gradient-to-l from-blue-200 to-transparent dark:from-blue-900/50"></div>
                                      </div>

                                      <div className="ml-13 space-y-3">
                                        {module.moduleDiscussionDetails.map((discussion) => (
                                          <div
                                            key={discussion.discussionId}
                                            className="group rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 p-4 hover:shadow-md transition-all duration-200"
                                          >
                                            <div className="flex items-start gap-4">
                                              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow">
                                                <MessageOutlined className="text-white text-lg" />
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <h5 className="text-base font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                                  {discussion.title}
                                                </h5>
                                                {discussion.description && (
                                                  <p className="text-sm text-blue-700 dark:text-blue-300">
                                                    {discussion.description}
                                                  </p>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Module Materials */}
                                  {module.moduleMaterialDetails && module.moduleMaterialDetails.length > 0 && (
                                    <div className="mt-4">
                                      <div className="flex items-center gap-2 ml-13 mb-3">
                                        <div className="h-px flex-1 bg-gradient-to-r from-amber-200 to-transparent dark:from-amber-900/50"></div>
                                        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                                          Tài liệu
                                        </span>
                                        <div className="h-px flex-1 bg-gradient-to-l from-amber-200 to-transparent dark:from-amber-900/50"></div>
                                      </div>

                                      <div className="ml-13 space-y-3">
                                        {module.moduleMaterialDetails.map((material) => (
                                          <div
                                            key={material.materialId}
                                            className="group rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800 p-4 hover:shadow-md transition-all duration-200"
                                          >
                                            <div className="flex items-center justify-between gap-4">
                                              <div className="flex items-start gap-4 flex-1">
                                                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow">
                                                  <FileTextOutlined className="text-white text-lg" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                  <h5 className="text-base font-semibold text-amber-900 dark:text-amber-100 mb-1">
                                                    {material.title}
                                                  </h5>
                                                  {material.description && (
                                                    <p className="text-sm text-amber-700 dark:text-amber-300">
                                                      {material.description}
                                                    </p>
                                                  )}
                                                </div>
                                              </div>
                                              {material.fileUrl && (
                                                <Button
                                                  type="primary"
                                                  size="small"
                                                  className="bg-amber-500 hover:bg-amber-600 border-amber-500"
                                                  onClick={() => window.open(material.fileUrl, '_blank')}
                                                >
                                                  Xem tài liệu
                                                </Button>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <Empty
                            description="Chưa có nội dung bài học"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                          >
                            <Button
                              type="primary"
                              icon={<PlusOutlined />}
                              onClick={() => router.push(`/Lecturer/courses/edit/${course.courseId}?step=2`)}
                            >
                              Thêm nội dung
                            </Button>
                          </Empty>
                        )}
                      </div>
                    )
                  },
                  {
                    key: 'students',
                    label: 'Học viên',
                    children: (
                      <div className="space-y-4">
                        <Title level={4}>Tiến độ học viên</Title>
                        <Empty
                          description="Chưa có học viên đăng ký"
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                      </div>
                    )
                  },
                  {
                    key: 'reviews',
                    label: 'Đánh giá',
                    children: (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <Title level={4}>Đánh giá từ học viên</Title>
                          <div className="text-right">
                            <div className="text-lg font-bold">
                              {course.rating} / 5.0
                            </div>
                            <Rate disabled value={course.rating} className="text-sm" />
                            <div className="text-sm text-gray-500">
                              {reviews.length} đánh giá
                            </div>
                          </div>
                        </div>

                        {loadingReviews ? (
                          <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                            <p className="mt-2 text-gray-500">Đang tải đánh giá...</p>
                          </div>
                        ) : reviews.length > 0 ? (
                          <div className="space-y-2" key={`reviews-${reviewsKey}`}>
                            {reviews.map((review) => (
                              <div key={review.commentId} className="bg-white dark:bg-gray-800 rounded-lg p-3 hover:shadow-sm transition-shadow duration-200">
                                {/* Main Comment */}
                                <div className="flex gap-2.5">
                                  {/* Avatar */}
                                  <div className="flex-shrink-0">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold shadow-sm">
                                      {review.userAvatar ? (
                                        <Image src={review.userAvatar} alt={review.userDisplayName || 'Avatar'} width={36} height={36} className="w-full h-full rounded-full object-cover" />
                                      ) : (
                                        <span className="text-sm">{(review.userDisplayName || 'A')[0].toUpperCase()}</span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Content */}
                                  <div className="flex-1 min-w-0">
                                    {/* Comment Bubble */}
                                    <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-3 py-2 inline-block max-w-full">
                                      <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                                        {review.userDisplayName || 'Học viên ẩn danh'}
                                      </div>
                                      <p className="text-gray-800 dark:text-gray-200 text-sm leading-snug break-words">
                                        {review.content}
                                      </p>
                                    </div>

                                    {/* Action Buttons & Timestamp */}
                                    <div className="flex items-center gap-3 mt-0.5 px-2.5">
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(review.createdAt).toLocaleDateString('vi-VN', {
                                          day: '2-digit',
                                          month: '2-digit',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </span>
                                      <button
                                        onClick={() => handleReplyClick(review.commentId)}
                                        className="text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors"
                                      >
                                        Trả lời
                                      </button>
                                      <button
                                        onClick={() => handleDeleteComment(review.commentId)}
                                        className="text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:underline transition-colors"
                                      >
                                        Xóa
                                      </button>
                                    </div>

                                    {/* Inline Reply Input */}
                                    {activeReplyId === review.commentId && (
                                      <div className="mt-2 animate-fade-in">
                                        <div className="flex gap-2">
                                          <div className="flex-shrink-0">
                                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold text-xs">
                                              {profile?.name ? profile.name[0].toUpperCase() : 'G'}
                                            </div>
                                          </div>
                                          <div className="flex-1">
                                            <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl overflow-hidden">
                                              <Input.TextArea
                                                rows={2}
                                                value={replyContent}
                                                onChange={(e) => setReplyContent(e.target.value)}
                                                onPressEnter={(e) => {
                                                  // Enter to submit, Shift+Enter for new line
                                                  if (!e.shiftKey && replyContent.trim()) {
                                                    e.preventDefault();
                                                    handleReplySubmit(review.commentId);
                                                  }
                                                }}
                                                placeholder={`Trả lời ${review.userDisplayName || 'học viên'}... (Enter để gửi)`}
                                                className="border-0 bg-transparent resize-none focus:ring-0 text-sm p-2.5"
                                                autoFocus
                                                style={{ boxShadow: 'none' }}
                                              />
                                            </div>
                                            <div className="flex justify-end gap-1.5 mt-1.5">
                                              <Button
                                                size="small"
                                                onClick={() => {
                                                  setActiveReplyId(null);
                                                  setReplyContent("");
                                                }}
                                                className="rounded-full px-3 h-7 text-xs"
                                              >
                                                Hủy
                                              </Button>
                                              <Button
                                                type="primary"
                                                size="small"
                                                icon={<SendOutlined className="text-xs" />}
                                                onClick={() => handleReplySubmit(review.commentId)}
                                                disabled={!replyContent.trim()}
                                                className="rounded-full px-3 h-7 text-xs bg-blue-600 hover:bg-blue-700"
                                              >
                                                Gửi
                                              </Button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Nested Replies */}
                                    {review.replies && review.replies.length > 0 && (
                                      <div className="mt-2 space-y-2">
                                        {review.replies.map(reply => (
                                          <div key={reply.commentId} className="flex gap-2">
                                            {/* Reply Avatar */}
                                            <div className="flex-shrink-0">
                                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold shadow-sm">
                                                {reply.userAvatar ? (
                                                  <Image src={reply.userAvatar} alt={reply.userDisplayName || 'Avatar'} width={28} height={28} className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                  <span className="text-xs">{(reply.userDisplayName || 'G')[0].toUpperCase()}</span>
                                                )}
                                              </div>
                                            </div>

                                            {/* Reply Content */}
                                            <div className="flex-1 min-w-0">
                                              <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-3 py-2 inline-block max-w-full">
                                                <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                                                  {reply.userDisplayName || 'Giảng viên'}
                                                </div>
                                                <p className="text-gray-800 dark:text-gray-200 text-sm leading-snug break-words">
                                                  {reply.content}
                                                </p>
                                              </div>

                                              {/* Reply Actions */}
                                              <div className="flex items-center gap-3 mt-0.5 px-2.5">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                  {new Date(reply.createdAt).toLocaleDateString('vi-VN', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                  })}
                                                </span>
                                                <button
                                                  onClick={() => handleDeleteComment(reply.commentId)}
                                                  className="text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:underline transition-colors"
                                                >
                                                  Xóa
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <Empty
                            description="Chưa có đánh giá nào"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                          />
                        )}
                      </div>
                    )
                  },
                  {
                    key: 'analytics',
                    label: 'Thống kê',
                    children: (
                      <div className="space-y-6">
                        <Row gutter={[16, 16]}>
                          <Col xs={24} sm={12} lg={6}>
                            <Card>
                              <Statistic
                                title="Tổng số học viên"
                                value={course.studentCount}
                                prefix={<UserOutlined />}
                              />
                            </Card>
                          </Col>
                          <Col xs={24} sm={12} lg={6}>
                            <Card>
                              <Statistic
                                title="Tỷ lệ hoàn thành"
                                value={75}
                                suffix="%"
                                prefix={<BookOutlined />}
                              />
                            </Card>
                          </Col>
                          <Col xs={24} sm={12} lg={6}>
                            <Card>
                              <Statistic
                                title="Thời gian học TB"
                                value={28}
                                suffix="phút/ngày"
                                prefix={<ClockCircleOutlined />}
                              />
                            </Card>
                          </Col>
                          <Col xs={24} sm={12} lg={6}>
                            <Card>
                              <Statistic
                                title="Doanh thu"
                                value={course.price * course.studentCount}
                                prefix={<DollarOutlined />}
                                formatter={(value) => `${Number(value).toLocaleString()} VND`}
                              />
                            </Card>
                          </Col>
                        </Row>

                        {/* Learning Progress Chart Placeholder */}
                        <Card title="Thống kê tiến độ học tập">
                          <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="text-center text-gray-500">
                              <BarChartOutlined className="text-4xl mb-2" />
                              <div>Biểu đồ thống kê sẽ được hiển thị tại đây</div>
                            </div>
                          </div>
                        </Card>
                      </div>
                    )
                  }
                ]}
              />
            </div>

            {/* Mobile Preview (for mobile) */}
            <div className="xl:hidden mt-8">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Thông tin khóa học</h3>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4">
                  <Image
                    src={course.coverImage || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400'}
                    alt={course.title || 'Course image'}
                    fill
                    sizes="(max-width: 768px) 100vw, 384px"
                    className="object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <Tag color={statusColors[course.status]} className="font-medium">
                      {statusTexts[course.status]}
                    </Tag>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Statistic
                    title="Học viên"
                    value={course.studentCount}
                    prefix={<UserOutlined />}
                  />
                  <Statistic
                    title="Đánh giá"
                    value={course.rating || 0}
                    suffix={`(${course.reviewCount || 0})`}
                    prefix={<StarOutlined />}
                  />
                  <Statistic
                    title="Giá"
                    value={course.price}
                    suffix={course.currency}
                    prefix={<DollarOutlined />}
                    formatter={(value) => `${Number(value).toLocaleString()}`}
                  />
                  <Statistic
                    title="Doanh thu"
                    value={course.price * course.studentCount}
                    suffix={course.currency}
                    prefix={<DollarOutlined />}
                    formatter={(value) => `${Number(value).toLocaleString()}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeInUp>

      {/* Share Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <ShareAltOutlined className="text-blue-500" />
            <span>Chia sẻ khóa học</span>
          </div>
        }
        open={shareModalOpen}
        onCancel={() => setShareModalOpen(false)}
        footer={null}
        centered
        width={600}
      >
        <div className="py-4">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Chia sẻ khóa học này qua các nền tảng mạng xã hội:
          </p>

          {/* Social Media Share Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button
              size="large"
              icon={<FacebookOutlined />}
              onClick={handleShareToFacebook}
              className="flex items-center justify-center gap-2 h-12"
              style={{ backgroundColor: '#1877f2', color: 'white', border: 'none' }}
            >
              Facebook
            </Button>

            <Button
              size="large"
              icon={<MessageOutlined />}
              onClick={handleShareToMessenger}
              className="flex items-center justify-center gap-2 h-12"
              style={{ backgroundColor: '#0084ff', color: 'white', border: 'none' }}
            >
              Messenger
            </Button>

            <Button
              size="large"
              icon={
                <svg viewBox="0 0 48 48" fill="currentColor" width="1em" height="1em">
                  <path d="M36.3 11.5C36.3 11.5 35 7.8 31.7 6.5c-3.3-1.3-8.4-1.3-11.7 0C16.8 7.8 15.5 11.5 15.5 11.5s-3.3 3.8-3.3 8.5v6c0 4.7 3.3 8.5 3.3 8.5s1.3 3.7 4.5 5c3.2 1.3 8.4 1.3 11.7 0c3.2-1.3 4.5-5 4.5-5s3.3-3.8 3.3-8.5v-6C39.5 15.3 36.3 11.5 36.3 11.5zM24 30.5c-4.1 0-7.5-3.4-7.5-7.5s3.4-7.5 7.5-7.5s7.5 3.4 7.5 7.5S28.1 30.5 24 30.5z" />
                </svg>
              }
              onClick={handleShareToZalo}
              className="flex items-center justify-center gap-2 h-12"
              style={{ backgroundColor: '#0180C7', color: 'white', border: 'none' }}
            >
              Zalo
            </Button>

            <Button
              size="large"
              icon={<WhatsAppOutlined />}
              onClick={handleShareToWhatsApp}
              className="flex items-center justify-center gap-2 h-12"
              style={{ backgroundColor: '#25D366', color: 'white', border: 'none' }}
            >
              WhatsApp
            </Button>

            <Button
              size="large"
              icon={<TwitterOutlined />}
              onClick={handleShareToTwitter}
              className="flex items-center justify-center gap-2 h-12"
              style={{ backgroundColor: '#1DA1F2', color: 'white', border: 'none' }}
            >
              Twitter
            </Button>

            <Button
              size="large"
              icon={<LinkedinOutlined />}
              onClick={handleShareToLinkedIn}
              className="flex items-center justify-center gap-2 h-12"
              style={{ backgroundColor: '#0077b5', color: 'white', border: 'none' }}
            >
              LinkedIn
            </Button>

            <Button
              size="large"
              icon={<MailOutlined />}
              onClick={handleShareToEmail}
              className="flex items-center justify-center gap-2 h-12"
              style={{ backgroundColor: '#EA4335', color: 'white', border: 'none' }}
            >
              Email
            </Button>

            <Button
              size="large"
              icon={<CopyOutlined />}
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 h-12"
              type="default"
            >
              Sao chép link
            </Button>
          </div>

          {/* URL Input */}
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Hoặc sao chép liên kết:
            </p>
            <Input
              value={course ? `${window.location.origin}/Lecturer/courses/${course.courseId}` : ''}
              readOnly
              addonBefore={<LinkOutlined />}
              className="font-mono text-sm"
              onClick={(e) => {
                e.currentTarget.select();
                handleCopyLink();
              }}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CourseDetailPage;
