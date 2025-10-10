'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useMemo } from 'react';

// Custom debounce function
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export interface ValidationResult {
  isValid: boolean;
  level: 'error' | 'warning' | 'success' | 'info';
  message: string;
  suggestions?: string[];
}

export interface FieldValidation {
  [fieldName: string]: ValidationResult;
}

export const useRealTimeValidation = () => {
  const [validations, setValidations] = useState<FieldValidation>({});

  // Title validation
  const validateTitle = useCallback((title: string): ValidationResult => {
    if (!title?.trim()) {
      return {
        isValid: false,
        level: 'error',
        message: 'Tiêu đề là bắt buộc',
        suggestions: ['Nhập tiêu đề mô tả rõ nội dung khóa học']
      };
    }

    if (title.length < 10) {
      return {
        isValid: false,
        level: 'error',
        message: 'Tiêu đề quá ngắn (tối thiểu 10 ký tự)',
        suggestions: ['Mở rộng tiêu đề để mô tả rõ hơn về khóa học']
      };
    }

    if (title.length < 20) {
      return {
        isValid: true,
        level: 'warning',
        message: 'Tiêu đề nên dài hơn để tối ưu SEO',
        suggestions: [
          'Thêm từ khóa mô tả đối tượng học viên',
          'Bao gồm mức độ (cơ bản, nâng cao)',
          'Đề cập công nghệ/kỹ năng chính'
        ]
      };
    }

    if (title.length > 100) {
      return {
        isValid: false,
        level: 'error',
        message: 'Tiêu đề quá dài (tối đa 100 ký tự)',
        suggestions: ['Rút gọn tiêu đề nhưng giữ thông tin quan trọng']
      };
    }

    // SEO and quality checks
    const hasNumbers = /\d/.test(title);
    const hasTargetAudience = /(người mới|cơ bản|nâng cao|chuyên nghiệp|doanh nghiệp)/i.test(title);
    const hasTechKeywords = /(react|javascript|python|java|web|mobile|ai|machine learning)/i.test(title);

    if (hasNumbers && hasTargetAudience && hasTechKeywords) {
      return {
        isValid: true,
        level: 'success',
        message: 'Tiêu đề tối ưu tốt cho SEO và thu hút học viên',
        suggestions: []
      };
    }

    return {
      isValid: true,
      level: 'info',
      message: 'Tiêu đề hợp lệ',
      suggestions: [
        !hasTargetAudience ? 'Thêm đối tượng học viên (VD: "cho người mới bắt đầu")' : '',
        !hasTechKeywords ? 'Bao gồm công nghệ chính được dạy' : '',
        !hasNumbers ? 'Thêm số lượng bài học hoặc dự án (VD: "30+ bài học")' : ''
      ].filter(Boolean)
    };
  }, []);

  // Description validation
  const validateDescription = useCallback((description: string, type: 'short' | 'detailed' = 'short'): ValidationResult => {
    const minLength = type === 'short' ? 30 : 100;
    const maxLength = type === 'short' ? 200 : 2000;
    const recommendedLength = type === 'short' ? 80 : 300;

    if (!description?.trim()) {
      return {
        isValid: false,
        level: 'error',
        message: `Mô tả ${type === 'short' ? 'ngắn' : 'chi tiết'} là bắt buộc`,
        suggestions: [`Thêm mô tả ${type === 'short' ? 'ngắn gọn' : 'chi tiết'} về khóa học`]
      };
    }

    if (description.length < minLength) {
      return {
        isValid: false,
        level: 'error',
        message: `Mô tả quá ngắn (tối thiểu ${minLength} ký tự)`,
        suggestions: [
          'Mô tả những gì học viên sẽ học được',
          'Đề cập đến dự án thực tế',
          'Nêu rõ lợi ích sau khi hoàn thành'
        ]
      };
    }

    if (description.length > maxLength) {
      return {
        isValid: false,
        level: 'error',
        message: `Mô tả quá dài (tối đa ${maxLength} ký tự)`,
        suggestions: ['Tóm tắt nội dung quan trọng nhất']
      };
    }

    if (description.length < recommendedLength) {
      return {
        isValid: true,
        level: 'warning',
        message: `Nên mở rộng mô tả để thu hút học viên hơn`,
        suggestions: [
          'Thêm thông tin về công cụ sử dụng',
          'Mô tả dự án thực tế sẽ làm',
          'Đề cập prerequisite cần thiết'
        ]
      };
    }

    // Quality checks
    const hasBenefits = /(học được|nắm vững|thành thạo|có thể|sẽ biết)/i.test(description);
    const hasProjects = /(dự án|project|thực hành|ứng dụng)/i.test(description);
    const hasTools = /(công cụ|tool|framework|library)/i.test(description);

    if (hasBenefits && hasProjects && hasTools) {
      return {
        isValid: true,
        level: 'success',
        message: 'Mô tả chất lượng cao, thu hút học viên',
        suggestions: []
      };
    }

    return {
      isValid: true,
      level: 'info',
      message: 'Mô tả hợp lệ',
      suggestions: [
        !hasBenefits ? 'Thêm lợi ích học viên sẽ nhận được' : '',
        !hasProjects ? 'Đề cập đến dự án thực tế' : '',
        !hasTools ? 'Nêu công cụ/công nghệ sử dụng' : ''
      ].filter(Boolean)
    };
  }, []);

  // Learning objectives validation
  const validateLearningObjectives = useCallback((objectives: string): ValidationResult => {
    if (!objectives?.trim()) {
      return {
        isValid: false,
        level: 'error',
        message: 'Mục tiêu học tập là bắt buộc',
        suggestions: ['Liệt kê những gì học viên sẽ đạt được sau khóa học']
      };
    }

    const lines = objectives.split('\n').filter(line => line.trim());
    
    if (lines.length < 3) {
      return {
        isValid: false,
        level: 'warning',
        message: 'Nên có ít nhất 3 mục tiêu học tập',
        suggestions: [
          'Thêm mục tiêu về kiến thức lý thuyết',
          'Thêm mục tiêu về kỹ năng thực hành',
          'Thêm mục tiêu về dự án/ứng dụng'
        ]
      };
    }

    if (lines.length > 10) {
      return {
        isValid: true,
        level: 'warning',
        message: 'Quá nhiều mục tiêu có thể làm học viên choáng ngợp',
        suggestions: ['Gộp các mục tiêu liên quan lại với nhau']
      };
    }

    // Check for action verbs
    const actionVerbs = /(xây dựng|tạo|phát triển|thiết kế|triển khai|sử dụng|áp dụng|phân tích|hiểu|nắm vững)/i;
    const hasActionVerbs = lines.some(line => actionVerbs.test(line));

    if (!hasActionVerbs) {
      return {
        isValid: true,
        level: 'warning',
        message: 'Mục tiêu nên bắt đầu bằng động từ hành động',
        suggestions: [
          'Sử dụng động từ: xây dựng, tạo, phát triển, thiết kế',
          'Tránh từ mơ hồ như "hiểu biết", "nắm được"',
          'Tập trung vào kết quả cụ thể'
        ]
      };
    }

    return {
      isValid: true,
      level: 'success',
      message: 'Mục tiêu học tập rõ ràng và cụ thể',
      suggestions: []
    };
  }, []);

  // Target audience validation
  const validateTargetAudience = useCallback((audience: string): ValidationResult => {
    if (!audience?.trim()) {
      return {
        isValid: false,
        level: 'error',
        message: 'Đối tượng học viên là bắt buộc',
        suggestions: ['Mô tả ai sẽ phù hợp với khóa học này']
      };
    }

    const lines = audience.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return {
        isValid: true,
        level: 'warning',
        message: 'Nên mô tả nhiều nhóm đối tượng để mở rộng thị trường',
        suggestions: [
          'Thêm đối tượng sinh viên',
          'Thêm đối tượng người đi làm',
          'Thêm đối tượng freelancer/entrepreneur'
        ]
      };
    }

    // Check for specific audience types
    const hasStudents = /(sinh viên|học sinh|student)/i.test(audience);
    const hasProfessionals = /(lập trình viên|developer|kỹ sư|nhân viên)/i.test(audience);
    const hasBeginners = /(người mới|mới bắt đầu|beginner|chưa biết)/i.test(audience);

    if (hasStudents && hasProfessionals && hasBeginners) {
      return {
        isValid: true,
        level: 'success',
        message: 'Đối tượng học viên đa dạng, mở rộng thị trường tốt',
        suggestions: []
      };
    }

    return {
      isValid: true,
      level: 'info',
      message: 'Đối tượng học viên hợp lệ',
      suggestions: [
        !hasStudents ? 'Thêm nhóm sinh viên CNTT' : '',
        !hasProfessionals ? 'Thêm nhóm người đi làm muốn chuyển nghề' : '',
        !hasBeginners ? 'Thêm nhóm người mới bắt đầu' : ''
      ].filter(Boolean)
    };
  }, []);

  // Price validation
  const validatePrice = useCallback((price: number, type: 'base' | 'discount' = 'base'): ValidationResult => {
    if (!price || price <= 0) {
      return {
        isValid: false,
        level: 'error',
        message: 'Giá phải lớn hơn 0',
        suggestions: ['Nhập giá hợp lý cho khóa học']
      };
    }

    if (type === 'base') {
      if (price < 50000) {
        return {
          isValid: true,
          level: 'warning',
          message: 'Giá thấp có thể ảnh hưởng đến nhận thức chất lượng',
          suggestions: [
            'Xem xét tăng giá để phản ánh giá trị',
            'So sánh với các khóa học tương tự',
            'Đảm bảo nội dung xứng đáng với giá'
          ]
        };
      }

      if (price > 2000000) {
        return {
          isValid: true,
          level: 'warning',
          message: 'Giá cao có thể hạn chế số lượng học viên',
          suggestions: [
            'Xem xét chia thành nhiều khóa học nhỏ',
            'Cung cấp gói thanh toán trả góp',
            'Đảm bảo nội dung premium xứng đáng'
          ]
        };
      }

      // Sweet spot pricing
      if (price >= 200000 && price <= 800000) {
        return {
          isValid: true,
          level: 'success',
          message: 'Mức giá tối ưu cho thị trường Việt Nam',
          suggestions: []
        };
      }
    }

    return {
      isValid: true,
      level: 'info',
      message: 'Giá hợp lệ',
      suggestions: []
    };
  }, []);

  // Debounced validation function
  const debouncedValidate = useMemo(
    () => debounce((fieldName: string, value: string | number, validationType: string) => {
      let result: ValidationResult;

      switch (validationType) {
        case 'title':
          result = validateTitle(typeof value === 'string' ? value : '');
          break;
        case 'description':
          result = validateDescription(typeof value === 'string' ? value : '', 'short');
          break;
        case 'detailedDescription':
          result = validateDescription(typeof value === 'string' ? value : '', 'detailed');
          break;
        case 'learningObjectives':
          result = validateLearningObjectives(typeof value === 'string' ? value : '');
          break;
        case 'targetAudience':
          result = validateTargetAudience(typeof value === 'string' ? value : '');
          break;
        case 'basePrice':
          result = validatePrice(typeof value === 'number' ? value : 0, 'base');
          break;
        case 'discountPrice':
          result = validatePrice(typeof value === 'number' ? value : 0, 'discount');
          break;
        default:
          result = {
            isValid: true,
            level: 'info',
            message: 'Hợp lệ',
            suggestions: []
          };
      }

      setValidations(prev => ({
        ...prev,
        [fieldName]: result
      }));
    }, 500),
    [validateTitle, validateDescription, validateLearningObjectives, validateTargetAudience, validatePrice]
  );

  const validateField = useCallback((fieldName: string, value: string | number, validationType: string) => {
    debouncedValidate(fieldName, value, validationType);
  }, [debouncedValidate]);

  const clearValidation = useCallback((fieldName: string) => {
    setValidations(prev => {
      const newValidations = { ...prev };
      delete newValidations[fieldName];
      return newValidations;
    });
  }, []);

  const getValidation = useCallback((fieldName: string): ValidationResult | undefined => {
    return validations[fieldName];
  }, [validations]);

  const hasErrors = useCallback(() => {
    return Object.values(validations).some(validation => validation.level === 'error');
  }, [validations]);

  const hasWarnings = useCallback(() => {
    return Object.values(validations).some(validation => validation.level === 'warning');
  }, [validations]);

  return {
    validateField,
    clearValidation,
    getValidation,
    hasErrors,
    hasWarnings,
    validations
  };
};
