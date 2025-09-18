'use client';
import { FC, useEffect, useRef } from 'react';
import { StepTransition } from 'EduSmart/components/Animation/StepTransition';
import { Form } from 'antd';

// Layout and Provider
import CreateCourseLayout from './components/common/CreateCourseLayout';
import CreateCourseProvider from './components/common/CreateCourseProvider';

// Step Components
import CourseInformation from './components/steps/CourseInformation';
import Curriculum from './components/steps/Curriculum';
import CourseContent from './components/steps/CourseContent';
import Pricing from './components/steps/Pricing';
import Publish from './components/steps/Publish';


// Store
import { useCreateCourseStore } from 'EduSmart/stores/CreateCourse/CreateCourseStore';

// Constants
import { COURSE_CREATION_STEPS } from './constants/steps';

const CreateCoursePageContent: FC = () => {
    const { currentStep, courseInformation } = useCreateCourseStore();
    const [form] = Form.useForm();
    const prevStepRef = useRef(currentStep);

    // This effect is to track the previous step. Scrolling is handled in each component.
    useEffect(() => {
        if (prevStepRef.current !== currentStep) {
            prevStepRef.current = currentStep;
        }
    }, [currentStep]);

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
                return <Publish />;
            default:
                return <div className="text-center py-8">Step not found</div>;
        }
    };


    return (
        <CreateCourseLayout>
            <div id="create-course-content" className="min-h-screen">
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

