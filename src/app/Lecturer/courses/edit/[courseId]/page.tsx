'use client';

import { FC, useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Form, App, Breadcrumb, Button } from 'antd';
import Link from 'next/link';
import { StepTransition } from 'EduSmart/components/Animation/StepTransition';

// Layout and Provider
import CreateCourseLayout from '../../create-course/components/common/CreateCourseLayout';
import CreateCourseProvider from '../../create-course/components/common/CreateCourseProvider';

// Step Components
import CourseInformation from '../../create-course/components/steps/CourseInformation';
import Curriculum from '../../create-course/components/steps/Curriculum';
import CourseContent from '../../create-course/components/steps/CourseContent';
import Pricing from '../../create-course/components/steps/Pricing';
import ConfirmUpdate from '../../create-course/components/steps/ConfirmUpdate';

// Store
import { useCreateCourseStore } from 'EduSmart/stores/CreateCourse/CreateCourseStore';
import { useCourseManagementStore } from 'EduSmart/stores/CourseManagement/CourseManagementStore';

// Constants
import { COURSE_EDIT_STEPS } from '../../create-course/constants/editSteps';

// Utils
import { scrollToTopDeferred } from '../../create-course/utils/scrollUtils';
/* eslint-disable react-hooks/exhaustive-deps */

const EditCoursePageContent: FC = () => {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const { message } = App.useApp();
  
  const { 
    currentStep, 
    loadCourseData, 
    courseInformation, 
    updateCourse, 
    error: createError, 
    clearError: clearCreateError,
    objectives,
    requirements,
    targetAudience,
    courseTags,
    isCreateMode,
    setCreateMode
  } = useCreateCourseStore();
  
  const { error: managementError, clearError: clearManagementError } = useCourseManagementStore();
  
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [hasDataLoaded, setHasDataLoaded] = useState(false);
  const prevStepRef = useRef(currentStep);

  // Auto-scroll when step changes
  useEffect(() => {
    if (prevStepRef.current !== currentStep) {
      prevStepRef.current = currentStep;
      // Scroll to top when step changes
      scrollToTopDeferred(150);
    }
  }, [currentStep]);

  // Load course data for editing
  useEffect(() => {
    const loadData = async () => {
      // Set edit mode first
      setCreateMode(false);
      
      const loaded = await loadCourseData(courseId);
      if (loaded) {
        message.success('Đã tải dữ liệu khóa học để chỉnh sửa');
        
        setTimeout(() => {
          setHasDataLoaded(true);
        }, 100);
      } else {
        message.error('Không thể tải dữ liệu khóa học');
        router.push('/Lecturer/courses');
      }
      setLoading(false);
    };

    if (courseId) {
      loadData();
    }
  }, [courseId, loadCourseData, router, setCreateMode]);

  // Sync form values when course data is loaded - Enhanced for edit mode
  useEffect(() => {
    if (!loading && hasDataLoaded && courseInformation.title && !isCreateMode) {
      const levelValue = courseInformation.level === 1 ? 'Beginner' : 
                        courseInformation.level === 2 ? 'Intermediate' : 
                        courseInformation.level === 3 ? 'Advanced' : 'Beginner';
      
      const formValues = {
        title: courseInformation.title || '',
        subtitle: courseInformation.shortDescription || '',
        subjectId: courseInformation.subjectId || '',
        description: courseInformation.description || '',
        courseImageUrl: courseInformation.courseImageUrl || '',
        price: courseInformation.price || 0,
        dealPrice: courseInformation.dealPrice,
        level: levelValue,
        promoVideo: courseInformation.courseIntroVideoUrl || '',
        learningObjectives: objectives.map(obj => obj.content),
        requirements: requirements.map(req => req.content),
        targetAudience: targetAudience.map(aud => aud.content),
        courseTags: courseTags
      };

      // Use setTimeout to ensure form is ready
      setTimeout(() => {
        form.setFieldsValue(formValues);
      }, 100);
    }
  }, [loading, hasDataLoaded, courseInformation, objectives, requirements, targetAudience, courseTags, form, isCreateMode]);

  // Force sync form when step changes in edit mode
  useEffect(() => {
    if (!loading && !isCreateMode && courseInformation.title) {
      const levelValue = courseInformation.level === 1 ? 'Beginner' : 
                        courseInformation.level === 2 ? 'Intermediate' : 
                        courseInformation.level === 3 ? 'Advanced' : 'Beginner';
      
      const formValues = {
        title: courseInformation.title || '',
        subtitle: courseInformation.shortDescription || '',
        subjectId: courseInformation.subjectId || '',
        description: courseInformation.description || '',
        courseImageUrl: courseInformation.courseImageUrl || '',
        price: courseInformation.price || 0,
        dealPrice: courseInformation.dealPrice,
        level: levelValue,
        promoVideo: courseInformation.courseIntroVideoUrl || '',
        learningObjectives: objectives.map(obj => obj.content),
        requirements: requirements.map(req => req.content),
        targetAudience: targetAudience.map(aud => aud.content),
        courseTags: courseTags
      };
      
      // Short delay to ensure step component is mounted
      setTimeout(() => {
        form.setFieldsValue(formValues);
      }, 50);
    }
  }, [currentStep, loading, isCreateMode, courseInformation, objectives, requirements, targetAudience, courseTags, form]);

  // Additional effect to force sync when any store data changes in edit mode
  useEffect(() => {
    if (!loading && !isCreateMode && courseInformation.title) {
      const levelValue = courseInformation.level === 1 ? 'Beginner' : 
                        courseInformation.level === 2 ? 'Intermediate' : 
                        courseInformation.level === 3 ? 'Advanced' : 'Beginner';
      
      const formValues = {
        title: courseInformation.title || '',
        subtitle: courseInformation.shortDescription || '',
        subjectId: courseInformation.subjectId || '',
        description: courseInformation.description || '',
        courseImageUrl: courseInformation.courseImageUrl || '',
        price: courseInformation.price || 0,
        dealPrice: courseInformation.dealPrice,
        level: levelValue,
        promoVideo: courseInformation.courseIntroVideoUrl || '',
        learningObjectives: objectives.map(obj => obj.content),
        requirements: requirements.map(req => req.content),
        targetAudience: targetAudience.map(aud => aud.content),
        courseTags: courseTags
      };
      
      // Use immediate update
      form.setFieldsValue(formValues);
    }
  }, [courseInformation.courseIntroVideoUrl, targetAudience, courseTags, courseInformation.level, objectives, requirements, loading, isCreateMode, courseInformation.title, form]);

  // Handle errors from both stores
  useEffect(() => {
    if (createError) {
      message.error(createError);
      clearCreateError();
    }
  }, [createError, clearCreateError]);

  useEffect(() => {
    if (managementError) {
      message.error(managementError);
      clearManagementError();
    }
  }, [managementError, clearManagementError]);

  const renderStep = () => {
    const currentStepData = COURSE_EDIT_STEPS[currentStep];

    if (!currentStepData) {
      return <div className="text-center py-8">Step not found</div>;
    }

    // Force re-render of step components by passing key with edit data
    const stepKey = `edit-step-${currentStep}-${courseInformation.title}-${targetAudience.length}-${objectives.length}`;

    switch (currentStep) {
      case 0:
        return <CourseInformation key={stepKey} />;
      case 1:
        return <Curriculum key={stepKey} />;
      case 2:
        return <CourseContent key={stepKey} />;
      case 3:
        return <Pricing key={stepKey} />;
      case 4:
        return <ConfirmUpdate key={stepKey} />;
      default:
        return <div className="text-center py-8">Step not found</div>;
    }
  };

  const handleSave = async () => {
    try {
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
        <div className="flex justify-between items-center mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div>
            <Breadcrumb 
              className="mb-2"
              items={[
                {
                  title: (
                    <Link href="/Lecturer/courses" className="text-emerald-600 hover:text-emerald-700">
                      Quản lý khóa học
                    </Link>
                  )
                },
                {
                  title: (
                    <Link href={`/Lecturer/courses/${courseId}`} className="text-emerald-600 hover:text-emerald-700">
                      Chi tiết khóa học
                    </Link>
                  )
                },
                {
                  title: 'Chỉnh sửa'
                }
              ]}
            />
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

      <CreateCourseLayout isEditMode={true}>
        <div id="edit-course-content" className="min-h-screen">
          <Form
            form={form}
            layout="vertical"
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

const EditCoursePage: FC = () => {
  return (
    <CreateCourseProvider>
      <EditCoursePageContent />
    </CreateCourseProvider>
  );
};

export default EditCoursePage;
