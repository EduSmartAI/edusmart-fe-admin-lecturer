'use client';
/* eslint-disable */
import { FC, useRef, useState, useEffect } from 'react';
import { StepTransition } from 'EduSmart/components/Animation/StepTransition';
import { Form } from 'antd';
import { useRouter } from 'next/navigation';

// Layout and Provider
import CreateCourseLayout from './components/common/CreateCourseLayout';
import CreateCourseProvider from './components/common/CreateCourseProvider';

// Step Components
import CourseInformation from './components/steps/CourseInformation';
import Curriculum from './components/steps/Curriculum';
import CourseContent from './components/steps/CourseContent';
import Pricing from './components/steps/Pricing';
import Analytics from './components/steps/Analytics';


// Store
import { useCreateCourseStore } from 'EduSmart/stores/CreateCourse/CreateCourseStore';

// Constants
import { COURSE_CREATION_STEPS } from './constants/steps';

// Utils
import { scrollToTopDeferred } from './utils/scrollUtils';

const CreateCoursePageContent: FC = () => {
    const { currentStep, courseInformation, objectives, requirements, targetAudience, courseTags, courseId, forceResetForCreateMode, isCreateMode, setCreateMode } = useCreateCourseStore();
    const [form] = Form.useForm();
    const prevStepRef = useRef(currentStep);
    const [isClient, setIsClient] = useState(false);
    const [hasCheckedForReset, setHasCheckedForReset] = useState(false);
    const ___unusedProgressData = useRouter();

    // Fix hydration mismatch
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Force reset when component mounts in create mode
    useEffect(() => {
        if (isClient && !hasCheckedForReset) {
            // Ensure we're in create mode
            if (!isCreateMode) {
                setCreateMode(true);
            }
            
            // Always force reset when in create mode to ensure clean state
            const hasAnyData = courseId || 
                              courseInformation.title || 
                              courseInformation.description || 
                              objectives.length > 0 || 
                              requirements.length > 0 || 
                              targetAudience.length > 0 || 
                              currentStep > 0;
            
            if (hasAnyData) {
                forceResetForCreateMode();
                form.resetFields();
                
                // Double-check reset after a delay
                setTimeout(() => {
                    form.resetFields();
                }, 150);
            }
            
            setHasCheckedForReset(true);
        }
    }, [isClient, hasCheckedForReset, courseId, courseInformation.title, courseInformation.description, objectives.length, requirements.length, targetAudience.length, currentStep, forceResetForCreateMode, form, isCreateMode, setCreateMode]);

    // Override any form values that might be set by store restoration
    useEffect(() => {
        if (isClient && hasCheckedForReset) {
            // After reset check, ensure form shows empty values for create mode
            const isCleanState = !courseInformation.title && 
                                !courseInformation.description && 
                                objectives.length === 0 && 
                                requirements.length === 0 && 
                                targetAudience.length === 0 &&
                                !courseId;
            
            if (isCleanState) {
                // Ensure form is showing empty values
                const emptyFormValues = {
                    title: '',
                    subtitle: '',
                    subjectId: '',
                    description: '',
                    courseImageUrl: '',
                    price: 0,
                    dealPrice: undefined,
                    level: 'Beginner',
                    promoVideo: '',
                    learningObjectives: [],
                    requirements: [],
                    targetAudience: [],
                    courseTags: []
                };
                
                form.setFieldsValue(emptyFormValues);
            }
        }
    }, [isClient, hasCheckedForReset, courseInformation.title, courseInformation.description, objectives.length, requirements.length, targetAudience.length, courseId, form]);

    // This effect is to track the previous step and scroll to top when step changes
    useEffect(() => {
        if (prevStepRef.current !== currentStep) {
            prevStepRef.current = currentStep;
            // Scroll to top when step changes
            scrollToTopDeferred(150);
        }
    }, [currentStep]);

    // Sync form values with store data when navigating between steps
    useEffect(() => {
        if (isClient && hasCheckedForReset) {
            const formValues = {
                title: courseInformation.title || '',
                subtitle: courseInformation.shortDescription || '', // Map shortDescription back to subtitle
                subjectId: courseInformation.subjectId || '',
                description: courseInformation.description || '',
                courseImageUrl: courseInformation.courseImageUrl || '',
                price: courseInformation.price || 0,
                dealPrice: courseInformation.dealPrice,
                level: courseInformation.level === 1 ? 'Beginner' : 
                       courseInformation.level === 2 ? 'Intermediate' : 
                       courseInformation.level === 3 ? 'Advanced' : 'Beginner',
                promoVideo: courseInformation.courseIntroVideoUrl || '',
                learningObjectives: objectives.map(obj => obj.content),
                requirements: requirements.map(req => req.content),
                targetAudience: targetAudience.map(aud => aud.content),
                courseTags: courseTags
            };
            
            // Only sync form if we're not on step 0 or if this is the initial load
            // This prevents circular updates when CourseInformation component updates the store
            if (currentStep !== 0 || prevStepRef.current !== currentStep) {
                
                // Use setTimeout to ensure form is ready
                setTimeout(() => {
                    form.setFieldsValue(formValues);
                }, 50);
            } else {
            }
        }
    }, [isClient, hasCheckedForReset, currentStep, courseInformation, objectives, requirements, targetAudience, courseTags, form, courseId]);

    // Force form sync when entering edit mode (courseId becomes available)
    useEffect(() => {
        if (isClient && courseId && !isCreateMode) {
            // This is edit mode, force sync form with store data
            const formValues = {
                title: courseInformation.title || '',
                subtitle: courseInformation.shortDescription || '',
                subjectId: courseInformation.subjectId || '',
                description: courseInformation.description || '',
                courseImageUrl: courseInformation.courseImageUrl || '',
                price: courseInformation.price || 0,
                dealPrice: courseInformation.dealPrice,
                level: courseInformation.level === 1 ? 'Beginner' : 
                       courseInformation.level === 2 ? 'Intermediate' : 
                       courseInformation.level === 3 ? 'Advanced' : 'Beginner',
                promoVideo: courseInformation.courseIntroVideoUrl || '',
                learningObjectives: objectives.map(obj => obj.content),
                requirements: requirements.map(req => req.content),
                targetAudience: targetAudience.map(aud => aud.content),
                courseTags: courseTags
            };
            
            setTimeout(() => {
                form.setFieldsValue(formValues);
            }, 100);
        }
    }, [isClient, courseId, isCreateMode, courseInformation, objectives, requirements, targetAudience, courseTags, form]);

    // Reset form when store is reset (after successful course creation)
    useEffect(() => {
        // Check if store has been reset (all values are empty/default)
        const isStoreReset = !courseInformation.title && 
                            !courseInformation.description && 
                            objectives.length === 0 && 
                            requirements.length === 0 && 
                            targetAudience.length === 0 &&
                            currentStep === 0;
        
        if (isStoreReset && isClient) {
            form.resetFields();
        }
    }, [courseInformation, objectives, requirements, targetAudience, currentStep, form, isClient]);

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
            case 4:
                return <Analytics />;
            default:
                return <div className="text-center py-8">Step not found</div>;
        }
    };


    // Prevent hydration mismatch
    if (!isClient) {
        return (
            <CreateCourseLayout>
                <div id="create-course-content" className="min-h-screen">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                        <div className="space-y-4">
                            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                    </div>
                </div>
            </CreateCourseLayout>
        );
    }

    return (
        <CreateCourseLayout>
            <div id="create-course-content" className="min-h-screen">
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        title: courseInformation.title || '',
                        subtitle: courseInformation.shortDescription || '',
                        subjectId: courseInformation.subjectId || '',
                        description: courseInformation.description || '',
                        courseImageUrl: courseInformation.courseImageUrl || '',
                        price: courseInformation.price || 0,
                        dealPrice: courseInformation.dealPrice,
                        level: courseInformation.level === 1 ? 'Beginner' : 
                               courseInformation.level === 2 ? 'Intermediate' : 
                               courseInformation.level === 3 ? 'Advanced' : 'Beginner',
                        promoVideo: courseInformation.courseIntroVideoUrl || '',
                        learningObjectives: objectives.map(obj => obj.content),
                        requirements: requirements.map(req => req.content),
                        targetAudience: targetAudience.map(aud => aud.content),
                        courseTags: courseTags
                    }}
                    onValuesChange={(changedValues, __allValues) => {
                        // Only log significant form changes to reduce console spam
                        if (changedValues.title || changedValues.subjectId || 
                            changedValues.learningObjectives || changedValues.requirements || changedValues.targetAudience) {
                        }
                    }}
                    className="space-y-6"
                >
                    <StepTransition item={currentStep}>
                        {renderStep()}
                    </StepTransition>
                </Form>
            </div>
        </CreateCourseLayout>
    );
};

const CreateCoursePage: FC = () => {
    return (
        <CreateCourseProvider>
            <CreateCoursePageContent />
        </CreateCourseProvider>
    );
};

export default CreateCoursePage;

