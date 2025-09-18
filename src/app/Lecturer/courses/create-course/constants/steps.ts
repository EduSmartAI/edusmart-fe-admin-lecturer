export interface CourseCreationStep {
    id: number;
    title: string;
    description: string;
    component: string;
    isRequired: boolean;
    isCompleted: boolean;
}

export const COURSE_CREATION_STEPS: CourseCreationStep[] = [
    {
        id: 0,
        title: 'Thông tin',
        description: 'Cung cấp thông tin cơ bản về khóa học của bạn.',
        component: 'CourseInformation',
        isRequired: true,
        isCompleted: false,
    },
    {
        id: 1,
        title: 'Giáo trình',
        description: 'Xây dựng chương trình học chi tiết cho khóa học.',
        component: 'Curriculum',
        isRequired: true,
        isCompleted: false,
    },
    {
        id: 2,
        title: 'Nội dung',
        description: 'Thêm nội dung bài giảng và tài liệu học tập.',
        component: 'CourseContent',
        isRequired: true,
        isCompleted: false,
    },
    {
        id: 3,
        title: 'Giá',
        description: 'Thiết lập giá và các tùy chọn thanh toán.',
        component: 'Pricing',
        isRequired: true,
        isCompleted: false,
    },

    {
        id: 4,
        title: 'Xuất bản',
        description: 'Hoàn tất và xuất bản khóa học của bạn.',
        component: 'Publish',
        isRequired: true,
        isCompleted: false,
    },
];

export const STEP_NAMES = {
    COURSE_INFORMATION: 'CourseInformation',
    CURRICULUM: 'Curriculum',
    COURSE_CONTENT: 'CourseContent',
    PRICING: 'Pricing',

    PUBLISH: 'Publish',
} as const;

export type StepName = typeof STEP_NAMES[keyof typeof STEP_NAMES];
