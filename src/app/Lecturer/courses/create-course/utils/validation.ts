import { CourseFormData } from '../types';
import { CourseContentItem, CourseModule } from 'EduSmart/stores/CreateCourse/CreateCourseStore';

export const validateCourseInformation = (data: Partial<CourseFormData>): string[] => {
    const errors: string[] = [];

    if (!data.title || data.title.trim().length === 0) {
        errors.push('Tên khóa học là bắt buộc');
    }

    if (data.title && data.title.length > 200) {
        errors.push('Tên khóa học không được vượt quá 200 ký tự');
    }

    if (!data.description || data.description.trim().length === 0) {
        errors.push('Mô tả ngắn là bắt buộc');
    }

    if (data.description && data.description.length > 500) {
        errors.push('Mô tả ngắn không được vượt quá 500 ký tự');
    }

    // Helper function to get plain text from HTML
    const getPlainText = (html: string): string => {
        if (typeof window !== 'undefined') {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            return tempDiv.textContent || '';
        }
        // Server-side fallback: simple HTML tag removal
        return html.replace(/<[^>]*>/g, '').trim();
    };

    if (!data.detailedDescription || getPlainText(data.detailedDescription).trim().length === 0) {
        errors.push('Mô tả chi tiết là bắt buộc');
    }

    if (data.detailedDescription && getPlainText(data.detailedDescription).length > 2000) {
        errors.push('Mô tả chi tiết không được vượt quá 2000 ký tự');
    }

    if (!data.learningObjectives || data.learningObjectives.length === 0) {
        errors.push('Mục tiêu học tập là bắt buộc');
    }

    if (!data.targetAudience || data.targetAudience.length === 0) {
        errors.push('Đối tượng học viên là bắt buộc');
    }

    if (!data.requirements || data.requirements.length === 0) {
        errors.push('Yêu cầu khóa học là bắt buộc');
    }

    if (!data.level) {
        errors.push('Trình độ là bắt buộc');
    }

    if (!data.category) {
        errors.push('Danh mục công nghệ là bắt buộc');
    }

    if (!data.subjectCode) {
        errors.push('Mã môn học là bắt buộc');
    }

    if (!data.coverImage) {
        errors.push('Ảnh bìa khóa học là bắt buộc');
    }

    return errors;
};

export const validateCurriculum = (modules: CourseModule[]): string[] => {
    const errors: string[] = [];

    if (!modules || modules.length === 0) {
        errors.push('Khóa học phải có ít nhất một chương');
    }

    if (modules) {
        modules.forEach((module, index: number) => {
            if (!module.moduleName || module.moduleName.trim().length === 0) {
                errors.push(`Chương ${index + 1}: Tên chương là bắt buộc`);
            }
        });
    }

    return errors;
};

export const validateCourseContent = (data: Record<string, CourseContentItem[]>): string[] => {
    const errors: string[] = [];
    const totalContent = Object.values(data).reduce((acc, val) => acc + val.length, 0);

    if (totalContent === 0) {
        errors.push('Khóa học phải có ít nhất một nội dung');
    }

    return errors;
};

export const validatePricing = (price: number, dealPrice?: number): string[] => {
    const errors: string[] = [];

    if (price === undefined || price === null) {
        errors.push('Giá khóa học là bắt buộc');
    }

    if (price !== undefined && price !== null && price <= 0) {
        errors.push('Giá khóa học phải lớn hơn 0');
    }

    if (dealPrice && dealPrice >= price) {
        errors.push('Giá giảm phải nhỏ hơn giá gốc');
    }

    return errors;
};

export const isStepValid = (step: number, courseData: Partial<CourseFormData>, modules?: CourseModule[], courseContent?: Record<string, CourseContentItem[]>, price?: number, dealPrice?: number): boolean => {
    switch (step) {
        case 0:
            return validateCourseInformation(courseData).length === 0;
        case 1:
            return modules ? validateCurriculum(modules).length === 0 : false;
        case 2:
            return courseContent ? validateCourseContent(courseContent).length === 0 : false;
        case 3:
            return price ? validatePricing(price, dealPrice).length === 0 : false;
        default:
            return true;
    }
};
