'use client';
import { FC } from 'react';
import { useCreateCourseStore } from 'EduSmart/stores/CreateCourse/CreateCourseStore';
import { Button, App } from 'antd';
import { FaArrowLeft, FaPaperPlane } from 'react-icons/fa';

const Publish: FC = () => {
  const { courseInformation, modules, objectives, requirements, setCurrentStep, createCourse } = useCreateCourseStore();
  const { message } = App.useApp();

  const onBack = () => {
    const container = document.getElementById('create-course-content');
    if (container) {
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setCurrentStep(3);
  };

  const handleConfirmSubmit = async () => {
    try {
      const courseId = await createCourse();
      if (courseId) {
        message.success('Course published successfully!');
        // After successful submission, you might want to redirect the user or reset the form
        // resetForm();
        // setCurrentStep(0);
      } else {
        message.error('Failed to publish course. Please try again.');
      }
    } catch (error) {
      console.error('Error publishing course:', error);
      message.error('Failed to publish course. Please try again.');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Publish Course</h2>

      {/* Course Information Preview */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Course Information</h3>
        <p><strong>Title:</strong> {courseInformation.title}</p>
        <p><strong>Description:</strong> {courseInformation.description}</p>
        <p><strong>Subject Code:</strong> {courseInformation.subjectCode}</p>
        <p><strong>Level:</strong> {courseInformation.level}</p>
        <p><strong>Duration:</strong> {courseInformation.durationMinutes} minutes</p>
        <p><strong>Price:</strong> {courseInformation.price?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
        {courseInformation.dealPrice && <p><strong>Deal Price:</strong> {courseInformation.dealPrice?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>}
        <p><strong>Active:</strong> {courseInformation.isActive ? 'Yes' : 'No'}</p>
      </div>

      {/* Learning Objectives Preview */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Learning Objectives</h3>
        {objectives.map((objective, index) => (
          <div key={index} className="mb-2 p-2 border-b border-gray-200 dark:border-gray-700">
            <p>{objective.content}</p>
          </div>
        ))}
      </div>

      {/* Requirements Preview */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Requirements</h3>
        {requirements.map((requirement, index) => (
          <div key={index} className="mb-2 p-2 border-b border-gray-200 dark:border-gray-700">
            <p>{requirement.content}</p>
          </div>
        ))}
      </div>

      {/* Modules Preview */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Course Modules</h3>
        {modules.map((module, index) => (
          <div key={module.id || index} className="mb-4 p-2 border-b border-gray-200 dark:border-gray-700">
            <p><strong>Module:</strong> {module.moduleName}</p>
            <p><strong>Description:</strong> {module.description}</p>
            <p><strong>Duration:</strong> {module.durationMinutes} minutes</p>
            <p><strong>Position:</strong> {module.positionIndex}</p>
            {module.lessons && module.lessons.length > 0 && (
              <div className="mt-2">
                <p><strong>Lessons:</strong></p>
                <ul className="ml-4">
                  {module.lessons.map((lesson, lessonIndex) => (
                    <li key={lesson.id || lessonIndex} className="mb-1">
                      {lesson.title} - {lesson.videoDurationSec ? Math.round(lesson.videoDurationSec / 60) : 0} minutes
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>


      <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button icon={<FaArrowLeft />} onClick={onBack} size="large">Quay lại</Button>
        <Button type="primary" icon={<FaPaperPlane />} onClick={handleConfirmSubmit} size="large">Publish Course</Button>
      </div>
    </div>
  );
};

export default Publish;

