'use client';
import { FC, useEffect, useState, useCallback, useRef } from 'react';
import { useCreateCourseStore } from 'EduSmart/stores/CreateCourse/CreateCourseStore';

import { useTheme } from 'EduSmart/Provider/ThemeProvider';
import { ConfigProvider, Form, theme, message, Button } from 'antd';

import { FaArrowRight, FaCheck, FaSpinner, FaTrash } from 'react-icons/fa';
import { FadeInUp } from 'EduSmart/components/Animation/FadeInUp';

import { CourseFormData } from '../../types';
import BasicInfoSection from './course-information/BasicInfoSection';
import DescriptionSection from './course-information/DescriptionSection';
import ClassificationSection from './course-information/ClassificationSection';

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

    notificationTimeout = setTimeout(() => {
        message[type](content);
        setTimeout(() => {
            lastNotification = '';
        }, 2000); // Reset after 2 seconds to allow future messages
    }, delay);
};



const CourseInformation: FC = () => {
    const { updateCourseInformation, setCurrentStep } = useCreateCourseStore();
    const form = Form.useFormInstance();
    const { isDarkMode } = useTheme();

    // Auto-save state
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isInitialLoadRef = useRef(true);

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

            // Reset status after 3 seconds
            setTimeout(() => {
                setSaveStatus('idle');
            }, 3000);
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
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
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
            showDebouncedNotification('warning', 'Không thể khôi phục dữ liệu đã lưu', 1000);
        }
        return false;
    }, [form, scrollToTop]);

    // Load saved data on component mount
    useEffect(() => {
        if (isInitialLoadRef.current) {
            loadFromLocalStorage();
            isInitialLoadRef.current = false;
        }
    }, [loadFromLocalStorage]);

    const allValues = Form.useWatch([], form);

    useEffect(() => {
        if (!isInitialLoadRef.current) {
            debouncedSave(allValues);
        }
    }, [allValues, debouncedSave]);

    const handleNext = async () => {
        try {
            const values = await form.validateFields();
            updateCourseInformation(values);

            // Clear saved data on successful submission
            localStorage.removeItem(AUTO_SAVE_KEY);

            const container = document.getElementById('create-course-content');
            if (container) {
                container.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            setCurrentStep(1);
        } catch (error) {
            console.log('Validation failed:', error);
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
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
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
                    <AutoSaveStatus />
                </div>

                <BasicInfoSection />

                <hr className="border-gray-200 dark:border-gray-700 my-8" />

                <DescriptionSection />

                <hr className="border-gray-200 dark:border-gray-700 my-8" />

                <ClassificationSection />

                {/* Actions */}
                <div className="flex justify-end items-center gap-4 mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Button type="text" icon={<FaTrash />} onClick={handleResetForm}>Đặt lại</Button>
                    <Button type="primary" icon={<FaArrowRight />} onClick={handleNext} size="large">
                        Tiếp theo: Xây dựng giáo trình
                    </Button>
                </div>
            </FadeInUp>
        </ConfigProvider>
    );
};

export default CourseInformation;

