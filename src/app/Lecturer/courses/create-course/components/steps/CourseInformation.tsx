'use client';
import { FC, useState, useCallback, useRef, useEffect } from 'react';
import { useCreateCourseStore } from 'EduSmart/stores/CreateCourse/CreateCourseStore';

import { useTheme } from 'EduSmart/Provider/ThemeProvider';
import { ConfigProvider, Form, theme, Button } from 'antd';

import { FaArrowRight, FaCheck, FaSpinner, FaTrash } from 'react-icons/fa';
import { FadeInUp } from 'EduSmart/components/Animation/FadeInUp';

import { CourseFormData } from '../../types';
import { scheduleAutoClear } from '../../utils/autoSave';
import BasicInfoSection from './course-information/BasicInfoSection';
import DescriptionSection from './course-information/DescriptionSection';
import ClassificationSection from './course-information/ClassificationSection';
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

// Auto-save configuration
const AUTO_SAVE_KEY = 'course_creation_draft';
const AUTO_SAVE_DELAY = 2000; // 2 seconds

// Save status types
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// Debounced notification function
let notificationTimeout: NodeJS.Timeout | null = null;
let lastNotification: string = '';

const showDebouncedNotification = (type: 'success' | 'error' | 'warning', content: string, delay: number = 1000) => {
    if (lastNotification === content) {
        return; // Prevent duplicate notifications
    }

    if (notificationTimeout) {
        clearTimeout(notificationTimeout);
    }

    lastNotification = content;

    // Just log for now - will be replaced with proper App notification
    notificationTimeout = setTimeout(() => {
        setTimeout(() => {
            lastNotification = '';
        }, 2000); // Reset after 2 seconds to allow future messages
    }, delay);
};



const CourseInformation: FC = () => {
    const { 
        updateCourseInformation, 
        setCurrentStep, 
        currentStep, 
        isCreateMode,
        courseInformation,
        objectives,
        requirements,
        targetAudience,
        courseTags
    } = useCreateCourseStore();
    const form = Form.useFormInstance(); // Use the parent form instance instead of creating a new one
    const { isDarkMode } = useTheme();

    // Auto-save state
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isInitialLoadRef = useRef(true);
    const listOperationRef = useRef(false); // Track if list operations are happening
    const isProgrammaticSetRef = useRef(false); // Guard to ignore programmatic form sets
    const isUpdatingStoreRef = useRef(false); // Track if we're updating the store to prevent sync
    
    // Add effect to handle returning to this step OR edit mode initial load
    useEffect(() => {
        // Skip if list operations are in progress
        if (listOperationRef.current || isUpdatingStoreRef.current) {
            return;
        }
        
        // ONLY sync in CREATE MODE when returning to step 0
        // In EDIT MODE, the parent page handles all form syncing
        if (isCreateMode && currentStep === 0 && !isInitialLoadRef.current) {
            // Build a lightweight snapshot from current hook values
            const storeState = {
                courseInformation,
                objectives,
                requirements,
                targetAudience,
                courseTags
            };
            
            // Preserve current form value for promoVideo to avoid overwriting freshly uploaded URL
            const currentPromo = form.getFieldValue('promoVideo');
            const formData = {
                title: storeState.courseInformation.title,
                subtitle: storeState.courseInformation.shortDescription,
                subjectId: storeState.courseInformation.subjectId,
                description: storeState.courseInformation.description,
                courseImageUrl: storeState.courseInformation.courseImageUrl,
                price: storeState.courseInformation.price,
                dealPrice: storeState.courseInformation.dealPrice,
                level: storeState.courseInformation.level === 1 ? 'Beginner' : 
                       storeState.courseInformation.level === 2 ? 'Intermediate' : 
                       storeState.courseInformation.level === 3 ? 'Advanced' : 
                       (storeState.courseInformation.level ? 'Beginner' : 'Beginner'), // Fallback to Beginner if undefined
                promoVideo: currentPromo ?? storeState.courseInformation.courseIntroVideoUrl,
                learningObjectives: storeState.objectives.map(obj => obj.content),
                requirements: storeState.requirements.map(req => req.content),
                targetAudience: storeState.targetAudience.map(aud => aud.content),
                courseTags: storeState.courseTags,
            };
            
            isProgrammaticSetRef.current = true;
            setTimeout(() => {
                form.setFieldsValue(formData);
                isProgrammaticSetRef.current = false;
            }, 50);
        }
        
        // Mark as not initial load after first run
        if (isInitialLoadRef.current) {
            isInitialLoadRef.current = false;
        }
    }, [currentStep, form, isCreateMode, courseInformation, objectives, requirements, targetAudience, courseTags]);

    // Additional effect to sync form when store data changes (for both create and edit mode)
    // This effect is DISABLED to prevent UI jerking when store updates
    // The form is the source of truth for list fields, and store updates should not override user input
    useEffect(() => {
        // SKIP in edit mode - parent page handles form sync
        if (!isCreateMode) {
            return;
        }
        
        // Skip sync if we're actively updating the store or doing list operations
        if (isUpdatingStoreRef.current || listOperationRef.current) {
            return;
        }
        
        // Only sync non-list fields from store to prevent UI jerking (CREATE MODE ONLY)
        if (currentStep === 0 && !isProgrammaticSetRef.current) {
            // Preserve current form values that might have been just updated by user interaction
            const currentPromo = form.getFieldValue('promoVideo');
            const currentCoverImage = form.getFieldValue('courseImageUrl');
            
            // Get current list values - DO NOT override these from store
            const currentLearningObjectives = form.getFieldValue('learningObjectives');
            const currentRequirements = form.getFieldValue('requirements');
            const currentTargetAudience = form.getFieldValue('targetAudience');
            
            // Only update non-list fields to prevent jerking
            const formData = {
                title: courseInformation.title,
                subtitle: courseInformation.shortDescription,
                subjectId: courseInformation.subjectId,
                description: courseInformation.description,
                courseImageUrl: currentCoverImage || courseInformation.courseImageUrl,
                price: courseInformation.price,
                dealPrice: courseInformation.dealPrice,
                level: courseInformation.level === 1 ? 'Beginner' : 
                       courseInformation.level === 2 ? 'Intermediate' : 
                       courseInformation.level === 3 ? 'Advanced' : 'Beginner',
                promoVideo: currentPromo || courseInformation.courseIntroVideoUrl,
                // ALWAYS preserve current form values for list fields to prevent UI jerking
                learningObjectives: currentLearningObjectives,
                requirements: currentRequirements,
                targetAudience: currentTargetAudience,
                courseTags: courseTags,
            };
            
            // Set form values without triggering the programmatic flag to avoid loops
            form.setFieldsValue(formData);
        }
    }, [courseInformation, courseTags, currentStep, form, isCreateMode]); // Removed objectives, requirements, targetAudience from deps

    // Effect to handle immediate field updates (for file uploads and dropdowns)
    useEffect(() => {
        if (currentStep === 0) {
            // Force update specific fields that might not be syncing properly
            const currentValues = form.getFieldsValue();
            
            // Update courseImageUrl if it's different from store
            if (courseInformation.courseImageUrl && currentValues.courseImageUrl !== courseInformation.courseImageUrl) {
                form.setFieldValue('courseImageUrl', courseInformation.courseImageUrl);
            }
            
            // Update subjectId if it's different from store
            if (courseInformation.subjectId && currentValues.subjectId !== courseInformation.subjectId) {
                form.setFieldValue('subjectId', courseInformation.subjectId);
            }
        }
    }, [courseInformation.courseImageUrl, courseInformation.subjectId, currentStep, form]);

    // Auto-save functions
    const saveToLocalStorage = useCallback((formData: CourseFormData) => {
        try {
            // Filter out empty values to reduce storage size
            const filteredData = Object.entries(formData).reduce((acc, [key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    acc[key] = value;
                }
                return acc;
            }, {} as Record<string, unknown>);

            const dataToSave = {
                ...filteredData,
                timestamp: new Date().toISOString(),
                version: '1.0',
                formStep: 'courseInformation'
            };

            localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(dataToSave));
            setSaveStatus('saved');
            setLastSaved(new Date());
            
            // Set up auto-clear after 10 minutes
            scheduleAutoClear();

            // Reset status after 3 seconds
            setTimeout(() => {
                setSaveStatus('idle');
            }, 3000);
        } catch (e) {
            setSaveStatus('error');
            showDebouncedNotification('error', 'Không thể lưu dữ liệu tự động', 2000);

            // Reset error status after 5 seconds
            setTimeout(() => {
                setSaveStatus('idle');
            }, 5000);
        }
    }, []);

    const debouncedSave = useCallback((formData: CourseFormData) => {
        // Clear existing timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Don't save during initial load
        if (isInitialLoadRef.current) {
            return;
        }

        setSaveStatus('saving');

        // Set new timeout
        saveTimeoutRef.current = setTimeout(() => {
            saveToLocalStorage(formData);
        }, AUTO_SAVE_DELAY);
    }, [saveToLocalStorage]);

    // Smooth scroll to top function
    const scrollToTop = useCallback(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }, []);

    const loadFromLocalStorage = useCallback(() => {
        try {
            const savedData = localStorage.getItem(AUTO_SAVE_KEY);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                const savedTimestamp = new Date(parsedData.timestamp);
                const now = new Date();
                const diffMinutes = (now.getTime() - savedTimestamp.getTime()) / (1000 * 60);

                if (diffMinutes > 10) {
                    localStorage.removeItem(AUTO_SAVE_KEY);
                    showDebouncedNotification('warning', 'Dữ liệu đã lưu đã quá 10 phút và đã bị xóa.', 1000);
                    return false;
                }

                // Remove metadata before setting form values
                const { timestamp, ...formData } = parsedData;
                // Remove metadata fields
                delete formData.version;
                delete formData.formStep;

                // Set form values
                form.setFieldsValue(formData);
                setLastSaved(new Date(timestamp));

                showDebouncedNotification('success', 'Đã khôi phục dữ liệu đã lưu trước đó', 500);
                // Scroll to top after loading data
                setTimeout(() => scrollToTop(), 100);
                return true;
            }
        } catch (e) {
            showDebouncedNotification('warning', 'Không thể khôi phục dữ liệu đã lưu', 1000);
        }
        return false;
    }, [form, scrollToTop]);

    // Load saved data on component mount - prioritize Zustand store over localStorage
    useEffect(() => {
        if (isInitialLoadRef.current) {
            // First, try to load from current values (adapter-backed store)
            const storeState = {
                courseInformation,
                objectives,
                requirements,
                targetAudience,
                courseTags
            };
            
            if (storeState.courseInformation && (
                storeState.courseInformation.title ||
                storeState.courseInformation.subjectId ||
                storeState.courseInformation.shortDescription
            )) {
                
                // Sync data back to form, but preserve current form promoVideo if user just uploaded
                const currentPromo = form.getFieldValue('promoVideo');
                const formData = {
                    title: storeState.courseInformation.title,
                    subtitle: storeState.courseInformation.shortDescription, // Map back to form field name
                    subjectId: storeState.courseInformation.subjectId,
                    description: storeState.courseInformation.description,
                    courseImageUrl: storeState.courseInformation.courseImageUrl,
                    price: storeState.courseInformation.price,
                    dealPrice: storeState.courseInformation.dealPrice,
                    level: storeState.courseInformation.level === 1 ? 'Beginner' : 
                           storeState.courseInformation.level === 2 ? 'Intermediate' : 
                           storeState.courseInformation.level === 3 ? 'Advanced' : 'Beginner',
                    promoVideo: currentPromo ?? storeState.courseInformation.courseIntroVideoUrl,
                    // Map arrays back to form format
                    learningObjectives: storeState.objectives.map(obj => obj.content),
                    requirements: storeState.requirements.map(req => req.content),
                    targetAudience: storeState.targetAudience.map(aud => aud.content),
                    courseTags: storeState.courseTags,
                };
                
                isProgrammaticSetRef.current = true;
                // Use setTimeout to ensure form is ready before setting values
                setTimeout(() => {
                    form.setFieldsValue(formData);
                    isProgrammaticSetRef.current = false;
                    setLastSaved(new Date());
                    showDebouncedNotification('success', 'Đã khôi phục dữ liệu từ phiên trước', 500);
                }, 100);
            } else {
                // Fallback to localStorage if no data
                setTimeout(() => {
                    loadFromLocalStorage();
                }, 100);
            }
            
            isInitialLoadRef.current = false;
        }
    }, [loadFromLocalStorage, form, courseInformation, objectives, requirements, targetAudience, courseTags]);

    const allValues = Form.useWatch([], form);
    const prevValuesRef = useRef<unknown>(null);
    const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!isInitialLoadRef.current && allValues) {
            // Ignore programmatic updates
            if (isProgrammaticSetRef.current) {
                prevValuesRef.current = { ...allValues };
                return;
            }

            // Skip update if values haven't actually changed
            if (prevValuesRef.current && JSON.stringify(prevValuesRef.current) === JSON.stringify(allValues)) {
                return;
            }

            // Normalize video field before saving locally to avoid losing value on sync
            const normalizedForSave = {
                ...(allValues as any),
                courseIntroVideoUrl: (allValues as any)?.promoVideo ?? (allValues as any)?.courseIntroVideoUrl,
            };
            debouncedSave(normalizedForSave as any);

            try {
                // Helper function to check if HTML content is empty or different
                const normalizeHtml = (html: string): string => {
                    if (!html) return '';
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = html;
                    return tempDiv.innerHTML;
                };

                // Only update store if values have actually changed
                const currentStoreState = useCreateCourseStore.getState();
                const hasChanges = (
                    currentStoreState.courseInformation.title !== ((allValues as any).title || '') ||
                    currentStoreState.courseInformation.shortDescription !== ((allValues as any).subtitle || '') ||
                    normalizeHtml(currentStoreState.courseInformation.description) !== normalizeHtml((allValues as any).description || '') ||
                    currentStoreState.courseInformation.subjectId !== ((allValues as any).subjectId || '') ||
                    currentStoreState.courseInformation.courseImageUrl !== ((allValues as any).courseImageUrl || '') ||
                    currentStoreState.objectives.length !== (((allValues as any).learningObjectives || []).length) ||
                    currentStoreState.requirements.length !== (((allValues as any).requirements || []).length) ||
                    currentStoreState.targetAudience.length !== (((allValues as any).targetAudience || []).length) ||
                    // Include video intro field compare to ensure store sync on upload
                    (currentStoreState.courseInformation.courseIntroVideoUrl || '') !== (((allValues as any).promoVideo || (allValues as any).courseIntroVideoUrl || '') as string)
                );

                if (hasChanges) {
                    // Set flag to prevent sync effect from running during store update
                    isUpdatingStoreRef.current = true;

                    // Normalize form values → store shape to prevent UI clearing
                    const normalized = {
                        ...(allValues as any),
                        courseIntroVideoUrl: (allValues as any)?.promoVideo ?? (allValues as any)?.courseIntroVideoUrl,
                    };
                    updateCourseInformation(normalized as any);

                    // Reset flag immediately (fully immediate updates)
                    isUpdatingStoreRef.current = false;
                }

                // Store current values for next comparison
                prevValuesRef.current = { ...(allValues as any) };
            } catch (e) {
            }
        }
    }, [allValues, debouncedSave, updateCourseInformation]);

    const handleNext = async () => {
        try {
            // Get current form values (don't validate yet to allow checking what's there)
            const _currentValues = form.getFieldsValue();
            
            // Validate all form fields
            const values = await form.validateFields();
            
            // Custom validation for array fields
            const errors: string[] = [];
            
            if (!values.learningObjectives || values.learningObjectives.length < 4) {
                errors.push('Mục tiêu học tập cần có ít nhất 4 mục');
            }
            
            if (!values.targetAudience || values.targetAudience.length < 3) {
                errors.push('Đối tượng học viên cần có ít nhất 3 mục');
            }
            
            if (!values.requirements || values.requirements.length < 2) {
                errors.push('Yêu cầu trước khi học cần có ít nhất 2 mục');
            }
            
            if (errors.length > 0) {
                showDebouncedNotification('error', errors[0], 100);
                return;
            }
            
            
            // Update the store with the form data
            updateCourseInformation(values);
            
            // Small delay to ensure store is updated before navigation
            setTimeout(() => {
                const container = document.getElementById('create-course-content');
                if (container) {
                    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
                setCurrentStep(1);
            }, 100);
        } catch {
            // Scroll to first error field if validation fails
            const errorField = document.querySelector('.ant-form-item-has-error');
            if (errorField) {
                errorField.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }
    };

    const handleResetForm = useCallback(() => {
        form.resetFields();
        const container = document.getElementById('create-course-content');
        if (container) {
            container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        showDebouncedNotification('success', 'Đã đặt lại form thành công', 500);
    }, [form]);

    // Cleanup timeout on unmount
    useEffect(() => {
        const saveTimeout = saveTimeoutRef.current;
        const updateTimeout = updateTimeoutRef.current;
        return () => {
            if (saveTimeout) {
                clearTimeout(saveTimeout);
            }
            if (updateTimeout) {
                clearTimeout(updateTimeout);
            }
        };
    }, []);

    // Auto-save status component
    const AutoSaveStatus = () => {
        if (saveStatus === 'idle' && !lastSaved) return null;

        const getStatusIcon = () => {
            switch (saveStatus) {
                case 'saving':
                    return <FaSpinner className="animate-spin text-blue-500" />;
                case 'saved':
                    return <FaCheck className="text-green-500" />;
                case 'error':
                    return <span className="text-red-500">⚠</span>;
                default:
                    return lastSaved ? <FaCheck className="text-gray-400" /> : null;
            }
        };

        const getStatusText = () => {
            switch (saveStatus) {
                case 'saving':
                    return 'Đang lưu...';
                case 'saved':
                    return 'Đã lưu';
                case 'error':
                    return 'Lỗi lưu';
                default:
                    return lastSaved ? `Lưu lần cuối: ${lastSaved.toLocaleTimeString()}` : '';
            }
        };

        return (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                {getStatusIcon()}
                <span>{getStatusText()}</span>
            </div>
        );
    };

    return (
        <ConfigProvider
            theme={{
                algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
                token: {
                    colorText: isDarkMode ? "#E5E7EB" : "#1F2937",
                    colorTextPlaceholder: isDarkMode ? "#9CA3AF" : "#6B7280",
                    colorBgContainer: isDarkMode ? "#374151" : "#FFFFFF",
                    colorBorder: isDarkMode ? "#4B5563" : "#D1D5DB",
                },
            }}
        >
            <FadeInUp>
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Thông tin khóa học</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Tạo ấn tượng đầu tiên tuyệt vời cho khóa học của bạn.</p>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                        <AutoSaveStatus />
                    </div>
                </div>

                <BasicInfoSection />

                <hr className="border-gray-200 dark:border-gray-700 my-8" />

                <DescriptionSection />

                <hr className="border-gray-200 dark:border-gray-700 my-8" />

                <ClassificationSection />

                {/* Actions */}
                <div className="flex justify-end items-center gap-4 mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Button type="text" htmlType="button" icon={<FaTrash />} onClick={handleResetForm}>Đặt lại</Button>
                    <Button type="primary" htmlType="button" icon={<FaArrowRight />} onClick={handleNext} size="large">
                        Tiếp theo: Xây dựng giáo trình
                    </Button>
                </div>
            </FadeInUp>
        </ConfigProvider>
    );
};

export default CourseInformation;

