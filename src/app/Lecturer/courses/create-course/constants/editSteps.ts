export interface CourseEditStep {
    id: number;
    title: string;
    description: string;
    component: string;
    isRequired: boolean;
    isCompleted: boolean;
}

export const COURSE_EDIT_STEPS: CourseEditStep[] = [
    {
        id: 0,
        title: 'Thông tin khóa học',
        description: 'Cập nhật thông tin cơ bản về khóa học của bạn.',
        component: 'CourseInformation',
        isRequired: true,
        isCompleted: false,
    },
    {
        id: 1,
        title: 'Giáo trình',
        description: 'Chỉnh sửa chương trình học chi tiết cho khóa học.',
        component: 'Curriculum',
        isRequired: true,
        isCompleted: false,
    },
    {
        id: 2,
        title: 'Nội dung bài học',
        description: 'Cập nhật nội dung bài giảng và tài liệu học tập.',
        component: 'CourseContent',
        isRequired: true,
        isCompleted: false,
    },
    {
        id: 3,
        title: 'Giá khóa học',
        description: 'Chỉnh sửa giá cả và chính sách cho khóa học.',
        component: 'Pricing',
        isRequired: true,
        isCompleted: false,
    },
    {
        id: 4,
        title: 'Xác nhận cập nhật',
        description: 'Kiểm tra lại thông tin và cập nhật khóa học.',
        component: 'ConfirmUpdate',
        isRequired: true,
        isCompleted: false,
    },
];

export const EDIT_STEP_NAMES = {
    COURSE_INFORMATION: 'CourseInformation',
    CURRICULUM: 'Curriculum',
    COURSE_CONTENT: 'CourseContent',
    PRICING: 'Pricing',
    CONFIRM_UPDATE: 'ConfirmUpdate',
} as const;

export type EditStepName = typeof EDIT_STEP_NAMES[keyof typeof EDIT_STEP_NAMES];