'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Form, message, Breadcrumb, Button } from 'antd';
import Link from 'next/link';

// Import create course components and infrastructure
import CreateCourseLayout from '../../create-course/components/common/CreateCourseLayout';
import CreateCourseProvider from '../../create-course/components/common/CreateCourseProvider';
import { StepTransition } from 'EduSmart/components/Animation/StepTransition';

// Import step components
import CourseInformation from '../../create-course/components/steps/CourseInformation';
import Curriculum from '../../create-course/components/steps/Curriculum';
import CourseContent from '../../create-course/components/steps/CourseContent';
import Pricing from '../../create-course/components/steps/Pricing';

// Store and types
import { useCreateCourseStore } from 'EduSmart/stores/CreateCourse/CreateCourseStore';
import { useCourseManagementStore } from 'EduSmart/stores/CourseManagement/CourseManagementStore';
import { COURSE_CREATION_STEPS } from '../../create-course/constants/steps';

const EditCoursePageContent: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  
  const { currentStep, loadCourseData, courseInformation, updateCourse, error: createError, clearError: clearCreateError } = useCreateCourseStore();
  const { error: managementError, clearError: clearManagementError } = useCourseManagementStore();
  
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      // Load course data into the create course store for editing
      const loaded = await loadCourseData(courseId);
      if (loaded) {
        message.success('Đã tải dữ liệu khóa học để chỉnh sửa');
      } else {
        message.error('Không thể tải dữ liệu khóa học');
        router.push('/Lecturer/courses');
      }
      
      setLoading(false);
    };

    loadData();
  }, [courseId]); // Remove loadCourseData and router from dependencies to prevent infinite loop

  // Handle errors from both stores
  useEffect(() => {
    if (createError) {
      message.error(createError);
      clearCreateError();
    }
  }, [createError]); // Remove clearCreateError from dependencies to prevent infinite loop

  useEffect(() => {
    if (managementError) {
      message.error(managementError);
      clearManagementError();
    }
  }, [managementError]); // Remove clearManagementError from dependencies to prevent infinite loop

  const renderStep = () => {
    const currentStepData = COURSE_CREATION_STEPS[currentStep];

    if (!currentStepData) {
      return <div className="text-center py-8">Step not found</div>;
    }

    switch (currentStep) {
      case 0:
        return <CourseInformation />;
      case 1:
        return <Curriculum />;
      case 2:
        return <CourseContent />;
      case 3:
        return <Pricing />;
      default:
        return <div className="text-center py-8">Step not found</div>;
    }
  };

  const handleSave = async () => {
    try {
      // For now, we'll use the updateCourse from CreateCourseStore
      const updateResult = await updateCourse();
      if (updateResult) {
        message.success('Cập nhật khóa học thành công!');
        router.push(`/Lecturer/courses/${courseId}`);
      } else {
        message.error('Có lỗi xảy ra khi cập nhật khóa học');
      }
    } catch {
      message.error('Có lỗi xảy ra khi cập nhật khóa học');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen w-full">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div>
            <Breadcrumb className="mb-2">
              <Breadcrumb.Item>
                <Link href="/Lecturer/courses" className="text-emerald-600 hover:text-emerald-700">
                  Quản lý khóa học
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href={`/Lecturer/courses/${courseId}`} className="text-emerald-600 hover:text-emerald-700">
                  Chi tiết khóa học
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Chỉnh sửa</Breadcrumb.Item>
            </Breadcrumb>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Chỉnh sửa khóa học</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => router.push(`/Lecturer/courses/${courseId}`)}>
              Xem chi tiết
            </Button>
            <Button type="primary" onClick={handleSave}>
              Lưu thay đổi
            </Button>
          </div>
        </div>
      </div>

      <CreateCourseLayout>
        <div id="edit-course-content" className="min-h-screen">
          {/* Edit mode header */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r-lg">
            <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-1">
              Chế độ chỉnh sửa khóa học
            </h2>
            <p className="text-blue-600 dark:text-blue-300 text-sm">
              Bạn đang chỉnh sửa khóa học &quot;{courseInformation.title}&quot;. 
              Các thay đổi sẽ được lưu tự động.
            </p>
          </div>

          <Form
            form={form}
            layout="vertical"
            initialValues={courseInformation}
            className="space-y-6"
          >
            <StepTransition item={currentStep}>
              {renderStep()}
            </StepTransition>
          </Form>
        </div>
      </CreateCourseLayout>
    </div>
  );
};

const EditCoursePage: React.FC = () => {
  return (
    <CreateCourseProvider>
      <EditCoursePageContent />
    </CreateCourseProvider>
  );
};

export default EditCoursePage;
