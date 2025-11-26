"use client";

import React, { useState, useEffect } from "react";
import { Button, Modal, Input, message, Tag, Card, Typography, Select, Empty, Avatar } from "antd";
import { UserOutlined, SendOutlined, DeleteOutlined } from "@ant-design/icons";
import { courseServiceAPI, CommentDto, CourseDto, DiscussionThreadDto, ModuleDetailDto } from "EduSmart/api/api-course-service";
import { useNotification } from "EduSmart/Provider/NotificationProvider";
import { useUserProfileStore } from "EduSmart/stores/User/UserProfileStore";
import Image from "next/image";

const { TextArea } = Input;
const { Title, Text } = Typography;

// Utility function to build comment tree from flat list
const buildCommentTree = <T extends CommentDto | DiscussionThreadDto>(flatComments: T[]): T[] => {
    const commentMap = new Map<string, T>();
    const rootComments: T[] = [];

    // First pass: create a map of all comments with empty replies array
    flatComments.forEach(comment => {
        commentMap.set(comment.commentId, { ...comment, replies: [] } as T);
    });

    // Second pass: build the tree structure
    flatComments.forEach(comment => {
        const commentWithReplies = commentMap.get(comment.commentId)!;

        if (comment.parentCommentId) {
            // This is a reply, add it to parent's replies
            const parent = commentMap.get(comment.parentCommentId);
            if (parent && parent.replies) {
                (parent.replies as T[]).push(commentWithReplies);
            }
        } else {
            // This is a root comment
            rootComments.push(commentWithReplies);
        }
    });

    return rootComments;
};

export default function LecturerCommentsPage() {
    const [comments, setComments] = useState<CommentDto[]>([]);
    const [discussionThreads, setDiscussionThreads] = useState<DiscussionThreadDto[]>([]);
    const [courses, setCourses] = useState<CourseDto[]>([]);
    const [modules, setModules] = useState<ModuleDetailDto[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

    const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState("");
    const [newCommentContent, setNewCommentContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [loadingComments, setLoadingComments] = useState(false);

    const notification = useNotification();
    const { profile } = useUserProfileStore();

    // Fetch courses on mount
    // Fetch courses on mount
    useEffect(() => {
        const fetchCourses = async () => {
            if (!profile?.userId) {
                console.log("Profile not ready yet");
                return;
            }

            console.log("Fetching courses for lecturer:", profile.userId);
            try {
                const res = await courseServiceAPI.courses.getByLecturer({
                    lectureId: profile.userId,
                    pageIndex: 0,
                    pageSize: 100
                });
                console.log("Courses response:", res);

                if (res.success && res.response) {
                    const courseList = res.response.items || res.response.data || [];
                    console.log("Parsed course list:", courseList);
                    setCourses(courseList);
                    if (courseList.length > 0) {
                        console.log("Auto-selecting first course:", courseList[0].courseId);
                        setSelectedCourseId(courseList[0].courseId);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch courses:", error);
                message.error("Không thể tải danh sách khóa học");
            }
        };

        fetchCourses();
    }, [profile?.userId]);

    // Fetch modules when course is selected
    useEffect(() => {
        const fetchModules = async () => {
            if (!selectedCourseId) {
                setModules([]);
                setSelectedModuleId(null);
                setDiscussionThreads([]);
                setComments([]);
                return;
            }

            // Clear previous state to avoid stale data
            // Clear previous state to avoid stale data
            setModules([]);
            setSelectedModuleId('ALL'); // Reset to ALL immediately to prevent fetching old module
            setDiscussionThreads([]);
            setComments([]);

            try {
                const res = await courseServiceAPI.courses.getById(selectedCourseId);
                if (res.success && res.response?.modules) {
                    setModules(res.response.modules);
                    if (res.response.modules.length > 0) {
                        setSelectedModuleId('ALL');
                    }
                } else {
                    setModules([]);
                }
            } catch (error) {
                console.error("Failed to fetch modules:", error);
                setModules([]);
            }
        };

        fetchModules();
    }, [selectedCourseId]);

    const fetchIdRef = React.useRef(0);

    // Fetch comments or discussion threads based on selection
    const fetchComments = React.useCallback(async (silent = false) => {
        if (!selectedCourseId) return;

        const currentFetchId = ++fetchIdRef.current;
        if (!silent) setLoadingComments(true);
        console.log(`[Fetch ${currentFetchId}] Starting fetch for Course: ${selectedCourseId}, Module: ${selectedModuleId}, Modules Count: ${modules.length}`);

        try {
            if (selectedModuleId) {
                if (selectedModuleId === 'ALL') {
                    console.log(`[Fetch ${currentFetchId}] Fetching threads for ALL modules`);
                    const promises = modules.map(m =>
                        courseServiceAPI.moduleDiscussions.getThread({
                            moduleId: m.moduleId,
                            page: 0,
                            size: 10
                        })
                    );

                    const results = await Promise.all(promises);

                    // Check if this is still the latest fetch
                    if (currentFetchId !== fetchIdRef.current) {
                        console.log(`[Fetch ${currentFetchId}] Ignored stale response`);
                        return;
                    }

                    const allThreads: DiscussionThreadDto[] = [];

                    results.forEach(res => {
                        if (res.success && res.response) {
                            const items = res.response.items || res.response.data || [];
                            allThreads.push(...items);
                        }
                    });

                    const nestedThreads = buildCommentTree<DiscussionThreadDto>(allThreads);
                    setDiscussionThreads(nestedThreads);
                    setComments([]);
                } else {
                    // Validate if selectedModuleId exists in current modules
                    // This prevents fetching threads for a module that belongs to the previous course
                    const isValidModule = modules.some(m => m.moduleId === selectedModuleId);
                    if (!isValidModule) {
                        console.log(`[Fetch ${currentFetchId}] Module ${selectedModuleId} not found in current modules. Skipping.`);
                        return;
                    }

                    console.log(`[Fetch ${currentFetchId}] Fetching threads for module:`, selectedModuleId);
                    // Fetch module discussion threads
                    const res = await courseServiceAPI.moduleDiscussions.getThread({
                        moduleId: selectedModuleId,
                        page: 0,
                        size: 50
                    });

                    // Check if this is still the latest fetch
                    if (currentFetchId !== fetchIdRef.current) {
                        console.log(`[Fetch ${currentFetchId}] Ignored stale response`);
                        return;
                    }

                    console.log(`[Fetch ${currentFetchId}] Thread response:`, res);

                    if (res.success && res.response) {
                        const flatThreads = res.response.items || res.response.data || [];
                        const nestedThreads = buildCommentTree<DiscussionThreadDto>(flatThreads);
                        setDiscussionThreads(nestedThreads);
                        setComments([]);
                    } else {
                        setDiscussionThreads([]);
                    }
                }
            } else {
                // Fetch course comments
                const res = await courseServiceAPI.comments.get({
                    courseId: selectedCourseId,
                    page: 0,
                    size: 50
                });

                // Check if this is still the latest fetch
                if (currentFetchId !== fetchIdRef.current) {
                    console.log(`[Fetch ${currentFetchId}] Ignored stale response`);
                    return;
                }

                if (res.success && res.response) {
                    const flatComments = res.response.items || res.response.data || [];
                    const nestedComments = buildCommentTree<CommentDto>(flatComments);
                    setComments(nestedComments);
                    setDiscussionThreads([]);
                } else {
                    setComments([]);
                }
            }
        } catch (error) {
            if (currentFetchId === fetchIdRef.current) {
                console.error(`[Fetch ${currentFetchId}] Failed to fetch comments:`, error);
            }
        } finally {
            if (currentFetchId === fetchIdRef.current && !silent) {
                setLoadingComments(false);
            }
        }
    }, [selectedCourseId, selectedModuleId, modules]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

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
            message.error("Vui lòng nhập nội dung trả lời");
            return;
        }

        const contentToSend = replyContent.trim();

        // Optimistic update - add reply immediately to UI
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tempReply: any = {
            commentId: `temp-${Date.now()}`,
            userId: profile?.userId || '',
            userDisplayName: profile?.name || 'Giảng viên',
            userAvatar: undefined,
            content: contentToSend,
            parentCommentId: commentId,
            isReplied: false,
            createdAt: new Date().toISOString(),
            replies: []
        };

        // Add courseId or moduleId based on context
        if (selectedModuleId) {
            tempReply.moduleId = selectedModuleId;
        } else if (selectedCourseId) {
            tempReply.courseId = selectedCourseId;
        }

        // Clear input immediately
        setReplyContent("");
        setActiveReplyId(null);

        // Update UI immediately
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateComments = (items: any[]): any[] => {
            return items.map(item => {
                if (item.commentId === commentId) {
                    return {
                        ...item,
                        replies: [...(item.replies || []), tempReply]
                    };
                }
                if (item.replies && item.replies.length > 0) {
                    return {
                        ...item,
                        replies: updateComments(item.replies)
                    };
                }
                return item;
            });
        };

        if (selectedModuleId) {
            setDiscussionThreads(prev => updateComments(prev));
        } else {
            setComments(prev => updateComments(prev));
        }

        try {
            if (selectedModuleId) {
                let targetModuleId = selectedModuleId;
                if (selectedModuleId === 'ALL') {
                    // Find module ID for the comment
                    const findModuleId = (threads: DiscussionThreadDto[]): string | undefined => {
                        for (const thread of threads) {
                            if (thread.commentId === commentId) return thread.moduleId;
                            if (thread.replies) {
                                const found = findModuleId(thread.replies);
                                if (found) return found;
                            }
                        }
                        return undefined;
                    };

                    // Flatten the grouped threads or search in discussionThreads directly
                    // discussionThreads contains all root threads when ALL is selected
                    const foundId = findModuleId(discussionThreads);
                    if (foundId) {
                        targetModuleId = foundId;
                    } else {
                        console.error("Could not find module ID for comment:", commentId);
                        message.error("Không thể xác định module của thảo luận này");
                        return;
                    }
                }

                // Reply to module discussion
                await courseServiceAPI.moduleDiscussions.replyToComment(
                    targetModuleId,
                    commentId,
                    contentToSend
                );
            } else if (selectedCourseId) {
                // Reply to course comment
                await courseServiceAPI.comments.reply(
                    commentId,
                    contentToSend,
                    selectedCourseId
                );
            }

            notification.success("Đã gửi câu trả lời thành công!");
            // Keep optimistic update - don't fetch from server (server may have cache/delay)
        } catch (error: unknown) {
            console.error("Reply error:", error);
            notification.error((error as Error).message || "Gửi câu trả lời thất bại");
            // Revert on error
            await fetchComments(true);
        }
    };

    const handleDeleteComment = (commentId: string) => {
        // Don't allow deleting temp comments (not yet saved to server)
        if (commentId.startsWith('temp-')) {
            message.warning("Bình luận này đang được lưu, vui lòng đợi...");
            return;
        }

        Modal.confirm({
            title: 'Xóa bình luận',
            content: 'Bạn có chắc chắn muốn xóa bình luận này?',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                // Helper function to recursively remove comment
                const removeComment = (items: CommentDto[]): CommentDto[] => {
                    return items
                        .filter(item => item.commentId !== commentId)
                        .map(item => ({
                            ...item,
                            replies: item.replies ? removeComment(item.replies) : []
                        }));
                };

                // Optimistic update - remove from UI immediately
                setComments(prev => removeComment(prev));
                setDiscussionThreads(prev => removeComment(prev as unknown as CommentDto[]) as unknown as typeof prev);

                try {
                    if (selectedCourseId) {
                        await courseServiceAPI.comments.delete(commentId, selectedCourseId);
                        message.success("Đã xóa bình luận thành công");
                        // Keep optimistic update - don't fetch from server
                    }
                } catch (error: unknown) {
                    message.error((error as Error).message || "Xóa bình luận thất bại");
                    // Revert on error - refresh from server
                    await fetchComments(true);
                }
            }
        });
    };

    const handleCreateComment = async () => {
        if (!newCommentContent.trim()) {
            message.error("Vui lòng nhập nội dung bình luận");
            return;
        }

        const contentToSend = newCommentContent.trim();
        setIsSubmitting(true);

        // Optimistic update
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tempComment: any = {
            commentId: `temp-${Date.now()}`,
            userId: profile?.userId || '',
            userDisplayName: profile?.name || 'Giảng viên',
            userAvatar: undefined,
            content: contentToSend,
            createdAt: new Date().toISOString(),
            replies: [],
            isReplied: false
        };

        if (selectedModuleId) {
            tempComment.moduleId = selectedModuleId;
            setDiscussionThreads(prev => [tempComment, ...prev]);
        } else {
            tempComment.courseId = selectedCourseId;
            setComments(prev => [tempComment, ...prev]);
        }

        setNewCommentContent("");

        try {
            if (selectedModuleId) {
                await courseServiceAPI.moduleDiscussions.createComment(
                    selectedModuleId,
                    contentToSend
                );
            } else if (selectedCourseId) {
                await courseServiceAPI.comments.create(
                    selectedCourseId,
                    contentToSend
                );
            }

            notification.success("Đã tạo bình luận thành công!");
            // Keep optimistic update - don't fetch from server
        } catch (error: unknown) {
            console.error("Create comment error:", error);
            notification.error((error as Error).message || "Tạo bình luận thất bại");
            await fetchComments(true);
        } finally {
            setIsSubmitting(false);
        }
    };


    const renderCommentItem = (item: CommentDto | DiscussionThreadDto) => (
        <div key={item.commentId} className="bg-white dark:bg-gray-800 rounded-lg p-3 hover:shadow-sm transition-shadow duration-200 mb-2">
            {/* Main Comment */}
            <div className="flex gap-2.5">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold shadow-sm">
                        {item.userAvatar ? (
                            <Image src={item.userAvatar} alt={item.userDisplayName || 'Avatar'} width={36} height={36} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <span className="text-sm">{(item.userDisplayName || 'A')[0].toUpperCase()}</span>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Comment Bubble */}
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-3 py-2 inline-block max-w-full">
                        <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                            {item.userDisplayName || 'Người dùng ẩn danh'}
                        </div>
                        <p className="text-gray-800 dark:text-gray-200 text-sm leading-snug break-words">
                            {item.content}
                        </p>
                    </div>

                    {/* Action Buttons & Timestamp */}
                    <div className="flex items-center gap-3 mt-0.5 px-2.5">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(item.createdAt).toLocaleDateString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>
                        <button
                            onClick={() => handleReplyClick(item.commentId)}
                            className="text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors"
                        >
                            Trả lời
                        </button>

                        {/* Delete Button - Only for course comments (not module discussions yet) and if user owns it?
                            Actually, lecturer can delete any comment on their course usually.
                            For now, only showing for course comments as API only supports that.
                        */}
                        {!selectedModuleId && (
                            <button
                                onClick={() => handleDeleteComment(item.commentId)}
                                className="text-xs font-semibold text-gray-400 hover:text-red-600 transition-colors"
                                title="Xóa bình luận"
                            >
                                <DeleteOutlined />
                            </button>
                        )}
                    </div>

                    {/* Inline Reply Input */}
                    {activeReplyId === item.commentId && (
                        <div className="mt-2 animate-fade-in">
                            <div className="flex gap-2">
                                <div className="flex-shrink-0">
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold text-xs">
                                        {profile?.name ? profile.name[0].toUpperCase() : 'G'}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl overflow-hidden">
                                        <TextArea
                                            rows={2}
                                            value={replyContent}
                                            onChange={(e) => setReplyContent(e.target.value)}
                                            onPressEnter={(e) => {
                                                // Enter to submit, Shift+Enter for new line
                                                if (!e.shiftKey && replyContent.trim()) {
                                                    e.preventDefault();
                                                    handleReplySubmit(item.commentId);
                                                }
                                            }}
                                            placeholder={`Trả lời ${item.userDisplayName || 'người dùng'}... (Enter để gửi)`}
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
                                            onClick={() => handleReplySubmit(item.commentId)}
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
                    {item.replies && item.replies.length > 0 && (
                        <div className="mt-2 space-y-2">
                            {item.replies.map(reply => (
                                <div key={reply.commentId} className="flex gap-2">
                                    {/* Reply Avatar */}
                                    <div className="flex-shrink-0">
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold shadow-sm">
                                            {reply.userAvatar ? (
                                                <Image
                                                    src={reply.userAvatar}
                                                    alt={reply.userDisplayName || 'Avatar'}
                                                    width={28}
                                                    height={28}
                                                    className="w-full h-full rounded-full object-cover"
                                                />
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
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <Title level={2} className="mb-1">Thảo luận & Hỏi đáp</Title>
                        <Text type="secondary">Trao đổi với học viên và giải đáp thắc mắc.</Text>
                    </div>
                </div>

                <Card className="shadow-sm">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <Text strong>Chọn khóa học:</Text>
                            <Select
                                className="flex-1 max-w-md"
                                placeholder="Chọn khóa học"
                                value={selectedCourseId}
                                onChange={setSelectedCourseId}
                                options={courses.map(c => ({ label: c.title, value: c.courseId }))}
                                loading={courses.length === 0 && !selectedCourseId}
                            />
                        </div>
                        {selectedCourseId && modules.length > 0 && (
                            <div className="flex items-center gap-3">
                                <Text strong>Chọn module:</Text>
                                <Select
                                    className="flex-1 max-w-md"
                                    placeholder="Chọn module để xem thảo luận"
                                    value={selectedModuleId}
                                    onChange={setSelectedModuleId}
                                    options={[
                                        { label: "Tất cả Module", value: "ALL" },
                                        ...modules.map(m => ({ label: m.moduleName, value: m.moduleId }))
                                    ]}
                                    allowClear
                                    onClear={() => setSelectedModuleId(null)}
                                />
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {!selectedCourseId ? (
                <Empty description="Vui lòng chọn khóa học để xem thảo luận" className="mt-12" />
            ) : (
                <div className="space-y-2">
                    {/* Create Comment Input - Hide if ALL is selected */}
                    {selectedModuleId !== 'ALL' && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 shadow-sm border border-gray-100">
                            <div className="flex gap-3">
                                <Avatar src={undefined} icon={<UserOutlined />} size="large" className="flex-shrink-0" />
                                <div className="flex-1">
                                    <TextArea
                                        placeholder={selectedModuleId ? "Viết thảo luận mới..." : "Viết bình luận mới..."}
                                        autoSize={{ minRows: 2, maxRows: 6 }}
                                        value={newCommentContent}
                                        onChange={e => setNewCommentContent(e.target.value)}
                                        onPressEnter={e => {
                                            if (!e.shiftKey) {
                                                e.preventDefault();
                                                handleCreateComment();
                                            }
                                        }}
                                        className="mb-2"
                                    />
                                    <div className="flex justify-end">
                                        <Button
                                            type="primary"
                                            onClick={handleCreateComment}
                                            loading={isSubmitting}
                                            disabled={!newCommentContent.trim()}
                                            icon={<SendOutlined />}
                                        >
                                            Đăng
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {loadingComments ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-2 text-gray-500">Đang tải bình luận...</p>
                        </div>
                    ) : (selectedModuleId ? discussionThreads : comments).length === 0 ? (
                        <Empty description="Chưa có thảo luận nào" className="mt-12" />
                    ) : (
                        <div className="space-y-2">
                            {selectedModuleId === 'ALL' ? (
                                Object.entries(discussionThreads.reduce((acc, thread) => {
                                    const mId = thread.moduleId;
                                    if (!acc[mId]) acc[mId] = [];
                                    acc[mId].push(thread);
                                    return acc;
                                }, {} as Record<string, DiscussionThreadDto[]>)).map(([moduleId, threads]) => {
                                    const moduleName = modules.find(m => m.moduleId === moduleId)?.moduleName || "Module khác";
                                    return (
                                        <div key={moduleId} className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
                                            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600 font-semibold text-gray-700 dark:text-gray-200 flex justify-between items-center">
                                                <span>{moduleName}</span>
                                                <Tag color="blue">{threads.length} thảo luận</Tag>
                                            </div>
                                            <div className="p-4 bg-gray-50/30">
                                                {threads.map(renderCommentItem)}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                (selectedModuleId ? discussionThreads : comments).map(renderCommentItem)
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
