'use client';
import { FC, useEffect } from 'react';
import { useCreateCourseStore } from 'EduSmart/stores/CreateCourse/CreateCourseStore';
import { useTheme } from 'EduSmart/Provider/ThemeProvider';
import { Button, ConfigProvider, Form, InputNumber, theme, message } from 'antd';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { FadeInUp } from 'EduSmart/components/Animation/FadeInUp';

const Pricing: FC = () => {
    const { isDarkMode } = useTheme();
    const { courseInformation, updateCourseInformation, setCurrentStep } = useCreateCourseStore();
    const form = Form.useFormInstance();

    useEffect(() => {
        form.setFieldsValue({
            basePrice: courseInformation.price || undefined,
            discountPrice: courseInformation.dealPrice,
        });
    }, [form, courseInformation]);

    const onBack = () => {
        const container = document.getElementById('create-course-content');
        if (container) {
            container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        setCurrentStep(2);
    };
    const onNext = async () => {
        try {
            const values = await form.validateFields();
            // Validation: discount price should be less than base price
            if (values.discountPrice && values.basePrice && values.discountPrice >= values.basePrice) {
                message.error('Giá khuyến mãi phải nhỏ hơn giá gốc');
                return;
            }
            updateCourseInformation({
                price: values.basePrice,
                dealPrice: values.discountPrice,
            });
            const container = document.getElementById('create-course-content');
            if (container) {
                container.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            setCurrentStep(4);
        } catch {
            const errorField = document.querySelector('.ant-form-item-has-error');
            if (errorField) errorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
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
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Giá & Khuyến mãi</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Thiết lập giá và các chương trình ưu đãi cho khóa học của bạn.</p>
                    </div>
                </div>

                <div>
                    {/* Section 1: Base Price */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">Giá gốc</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Giá bán chính thức của khóa học.</p>
                        <Form.Item name="basePrice" rules={[{ required: true, message: 'Vui lòng nhập giá gốc!' }]}>
                            <InputNumber
                                className="w-full"
                                min={0}
                                addonAfter="VND"
                                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                parser={(v) => Number(v!.replace(/\s?VND|,/g, '')) as any}
                                placeholder="VD: 500,000"
                                size="large"
                            />
                        </Form.Item>
                    </div>

                    <hr className="border-gray-200 dark:border-gray-700 my-8" />

                    {/* Section 2: Discount */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">Giá khuyến mãi (Tùy chọn)</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Thiết lập giá ưu đãi để thu hút học viên.</p>
                        <Form.Item name="discountPrice" label="Giá khuyến mãi (VND)">
                            <InputNumber 
                                className="w-full" 
                                min={0} 
                                addonAfter="VND" 
                                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                parser={(v) => Number(v!.replace(/\s?VND|,/g, '')) as any} 
                                placeholder="VD: 299,000" 
                                size="large" 
                            />
                        </Form.Item>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <Button icon={<FaArrowLeft />} onClick={onBack} size="large">Quay lại</Button>
                        <Button type="primary" icon={<FaArrowRight />} onClick={onNext} size="large">Tiếp theo: Xuất bản</Button>
                    </div>
                </div>
            </FadeInUp>
        </ConfigProvider>
    );
};

export default Pricing;




