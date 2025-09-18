'use client';
import { FadeInUp } from 'EduSmart/components/Animation/FadeInUp';
import AccessibleStepper from '../ui/AccessibleStepper';
import LivePreview from '../ui/LivePreview';
import { ConfigProvider, theme } from 'antd';
import { useTheme } from 'EduSmart/Provider/ThemeProvider';
import { FC, ReactNode } from 'react';
import ScrollToTopButton from 'EduSmart/components/Common/ScrollToTopButton';


interface CreateCourseLayoutProps {
    children: ReactNode;
}

const CreateCourseLayout: FC<CreateCourseLayoutProps> = ({ children }) => {
    const { isDarkMode } = useTheme();

    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen w-full">
            <FadeInUp className="w-full">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Tạo khóa học</h1>
                        <div className="flex items-center gap-3">

                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                        {/* Left Sidebar: Stepper & Preview */}
                        <div className="xl:col-span-3 xl:sticky top-24 space-y-8">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Tiến độ</h2>
                                <ConfigProvider
                                    theme={{
                                        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm
                                    }}
                                >
                                    <AccessibleStepper />
                                </ConfigProvider>
                            </div>

                            <div className="hidden xl:block">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Xem trước khóa học</h3>
                                <LivePreview />
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="xl:col-span-9 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                            {children}
                        </div>

                        {/* Live Preview (for mobile) */}
                        <div className="xl:hidden mt-8">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Xem trước khóa học</h3>
                            <LivePreview />
                        </div>
                    </div>
                </div>
            </FadeInUp>
            <ScrollToTopButton />
        </div>
    );
};

export default CreateCourseLayout;

