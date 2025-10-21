'use client';
import Image from 'next/image';
import { FC } from 'react';
import { useCreateCourseStore } from 'EduSmart/stores/CreateCourse/CreateCourseStore';
import { FaBook, FaCheckCircle, FaClock, FaList, FaPlayCircle, FaUserGraduate } from 'react-icons/fa';

// CSS styles for rich text content
const richTextStyles = `
  .rich-text-content p { margin-bottom: 0.75rem; }
  .rich-text-content strong { font-weight: 600; color: inherit; }
  .rich-text-content em { font-style: italic; }
  .rich-text-content u { text-decoration: underline; }
  .rich-text-content ul, .rich-text-content ol { margin: 0.5rem 0; padding-left: 1.25rem; }
  .rich-text-content ul li { list-style-type: disc; margin-bottom: 0.25rem; }
  .rich-text-content ol li { list-style-type: decimal; margin-bottom: 0.25rem; }
  .rich-text-content blockquote { 
    border-left: 4px solid #d1d5db; 
    padding-left: 1rem; 
    margin: 0.75rem 0; 
    font-style: italic; 
  }
  .rich-text-content h1, .rich-text-content h2, .rich-text-content h3 { 
    font-weight: 600; 
    margin: 0.75rem 0 0.5rem 0; 
  }
  .rich-text-content a { color: #2563eb; text-decoration: underline; }
`;

const LivePreview: FC = () => {
  const { courseInformation, modules, objectives } = useCreateCourseStore();

  const totalModules = modules.length;
  const totalDurationMinutes = modules.reduce((acc, module) => acc + (module.durationMinutes || 0), 0);
  const totalDurationHours = (totalDurationMinutes / 60).toFixed(1);

  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: richTextStyles }} />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 w-full max-w-md mx-auto overflow-hidden">
      {/* Course Image */}
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
        {courseInformation.courseImageUrl ? (
          <Image
            src={courseInformation.courseImageUrl}
            alt={courseInformation.title || 'Course Cover'}
            fill
            sizes="(max-width: 768px) 100vw, 384px"
            className="object-cover"
          />
        ) : (
          <FaPlayCircle className="text-5xl text-gray-400 dark:text-gray-500" />
        )}
      </div>

      <div className="p-6 space-y-4">
        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
          {courseInformation.title || 'Tiêu đề khóa học của bạn'}
        </h1>

        {/* Description */}
        {courseInformation.description ? (
          <div className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            <div 
              className="rich-text-content"
              dangerouslySetInnerHTML={{ __html: courseInformation.description }}
              style={{
                lineHeight: '1.6',
              }}
            />
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Mô tả chi tiết về những gì học viên sẽ học được trong khóa học này.
          </p>
        )}

        {/* Instructor Info (Placeholder) */}
        <div className="flex items-center gap-2 text-sm">
          <Image src="/assets/teacher.png" alt="Instructor" width={24} height={24} className="rounded-full" />
          <span className="font-medium text-gray-700 dark:text-gray-300">Tên giảng viên</span>
        </div>

        {/* Course Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-1.5"><FaClock /><span>{totalDurationHours} giờ</span></div>
          <div className="flex items-center gap-1.5"><FaList /><span>{totalModules} chương</span></div>
          <div className="flex items-center gap-1.5"><FaUserGraduate /><span>{courseInformation.level || 'Mọi cấp độ'}</span></div>
        </div>

        {/* Learning Objectives */}
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg space-y-2">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2"><FaCheckCircle className="text-green-500"/><span>Bạn sẽ học được gì?</span></h2>
          <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-400 space-y-1">
            {(objectives && objectives.length > 0
              ? objectives
              : [{ content: 'Kỹ năng A' }, { content: 'Kỹ năng B' }, { content: 'Kỹ năng C' }]
            ).map((obj, i) => (
              <li key={i}>{obj.content}</li>
            ))}
          </ul>
        </div>

        {/* Pricing */}
        <div className="pt-4 space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{formatPrice(courseInformation.dealPrice || courseInformation.price)}</span>
            {courseInformation.dealPrice && (
              <span className="text-lg text-gray-400 line-through">{formatPrice(courseInformation.price)}</span>
            )}
          </div>
          <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Đăng ký học
          </button>
        </div>

        {/* Curriculum Preview */}
        <div className="pt-4">
          <h2 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2"><FaBook /><span>Nội dung khóa học</span></h2>
          <div className="space-y-2">
            {modules.slice(0, 3).map((module, index) => (
              <div key={module.id || index} className="text-sm bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md flex justify-between">
                <span><strong>Chương {index + 1}:</strong> {module.moduleName}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{module.durationMinutes || 0} phút</span>
              </div>
            ))}
            {modules.length > 3 && (
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">... và {modules.length - 3} chương nữa</div>
            )}
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default LivePreview;

