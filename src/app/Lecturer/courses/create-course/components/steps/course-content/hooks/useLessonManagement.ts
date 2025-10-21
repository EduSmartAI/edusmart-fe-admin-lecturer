/**
 * Lesson Management Hook
 * 
 * Handles all lesson-related operations including:
 * - Getting lessons for a module
 * - Adding new lessons
 * - Updating lessons
 * - Deleting lessons
 * - Reordering lessons
 */

import { useCallback } from 'react';
import { App } from 'antd';
import { useCreateCourseStore, CourseContentItem } from 'EduSmart/stores/CreateCourse/CreateCourseStore';
/* eslint-disable @typescript-eslint/no-unused-vars, @next/next/no-assign-module-variable */

enum ContentType {
  VIDEO = 'video',
  QUIZ = 'quiz',
  QUESTION = 'question',
  FILE = 'file'
}

export interface LessonFormData {
  title: string;
  description?: string;
  duration?: number;
  url?: string;
  fileUrl?: string;
  question?: string;
}

export const useLessonManagement = () => {
  const { message } = App.useApp();
  const { modules, addLesson, updateLesson, removeLesson } = useCreateCourseStore();

  /**
   * Get all content items (lessons) for a specific module
   */
  const getModuleItems = useCallback((moduleIndex: number): CourseContentItem[] => {
    const courseModule = modules[moduleIndex];
    if (!courseModule) {      return [];
    }

    const items: CourseContentItem[] = [];

    // Add lessons (videos and quizzes)
    if (courseModule.lessons) {
      const lessonItems = courseModule.lessons
        .filter(lesson => lesson && typeof lesson === 'object')
        .map((lesson, index) => {
          let contentType: ContentType = ContentType.VIDEO;

          // Determine content type - prioritize VIDEO if videoUrl exists
          if (lesson.videoUrl && typeof lesson.videoUrl === 'string' && lesson.videoUrl.trim() !== '') {
            contentType = ContentType.VIDEO;
          } else if (lesson.lessonQuiz && lesson.lessonQuiz.questions && lesson.lessonQuiz.questions.length > 0) {
            contentType = ContentType.QUIZ;
          } else if (lesson.title && (lesson.title.toLowerCase().includes('kiểm tra') || lesson.title.toLowerCase().includes('quiz'))) {
            contentType = ContentType.QUIZ;
          }

          return {
            id: lesson.id || `lesson-${index}`,
            type: contentType,
            title: lesson.title || 'Untitled Lesson',
            description: '',
            duration: lesson.videoDurationSec ? Math.round(lesson.videoDurationSec / 60) : undefined,
            url: lesson.videoUrl,
            order: lesson.positionIndex || index,
            metadata: {
              hasQuiz: !!(lesson.lessonQuiz && lesson.lessonQuiz.questions && lesson.lessonQuiz.questions.length > 0),
              contentType: contentType
            }
          };
        });

      items.push(...lessonItems);
    }

    return items;
  }, [modules]);

  /**
   * Add a new lesson to a module
   */
  const handleAddLesson = useCallback((
    moduleId: string,
    lessonData: LessonFormData,
    contentType: ContentType
  ) => {
    try {
      const moduleIndex = modules.findIndex(m => m.id === moduleId);
      if (moduleIndex === -1) {
        message.error('Không tìm thấy module');
        return false;
      }

      const newLesson = {
        title: lessonData.title,
        videoUrl: contentType === ContentType.VIDEO ? lessonData.url : undefined,
        videoDurationSec: lessonData.duration ? lessonData.duration * 60 : undefined,
        isActive: true,
      };

      addLesson(moduleIndex, newLesson);
      message.success('Đã thêm bài học thành công!');
      return true;
    } catch (error) {
      message.error('Có lỗi khi thêm bài học');
      return false;
    }
  }, [modules, addLesson, message]);

  /**
   * Update an existing lesson
   */
  const handleUpdateLesson = useCallback((
    moduleId: string,
    lessonId: string,
    lessonData: LessonFormData,
    contentType: ContentType
  ) => {
    try {
      const moduleIndex = modules.findIndex(m => m.id === moduleId);
      if (moduleIndex === -1) {
        message.error('Không tìm thấy module');
        return false;
      }

      const lessonIndex = modules[moduleIndex].lessons.findIndex(l => l.id === lessonId);
      if (lessonIndex === -1) {
        message.error('Không tìm thấy bài học');
        return false;
      }

      const updatedLesson = {
        ...modules[moduleIndex].lessons[lessonIndex],
        title: lessonData.title,
        videoUrl: contentType === ContentType.VIDEO ? lessonData.url : undefined,
        videoDurationSec: lessonData.duration ? lessonData.duration * 60 : undefined,
      };

      updateLesson(moduleIndex, lessonIndex, updatedLesson);
      message.success('Đã cập nhật bài học thành công!');
      return true;
    } catch (error) {
      message.error('Có lỗi khi cập nhật bài học');
      return false;
    }
  }, [modules, updateLesson, message]);

  /**
   * Delete a lesson
   */
  const handleDeleteLesson = useCallback((moduleId: string, lessonId: string) => {
    try {
      const moduleIndex = modules.findIndex(m => m.id === moduleId);
      if (moduleIndex === -1) {
        message.error('Không tìm thấy module');
        return false;
      }

      const lessonIndex = modules[moduleIndex].lessons.findIndex(l => l.id === lessonId);
      if (lessonIndex === -1) {
        message.error('Không tìm thấy bài học');
        return false;
      }

      removeLesson(moduleIndex, lessonIndex);
      message.success('Đã xóa bài học thành công!');
      return true;
    } catch (error) {
      message.error('Có lỗi khi xóa bài học');
      return false;
    }
  }, [modules, removeLesson, message]);

  /**
   * Get a specific lesson by ID
   */
  const getLessonById = useCallback((moduleId: string, lessonId: string) => {
    const moduleIndex = modules.findIndex(m => m.id === moduleId);
    if (moduleIndex === -1) return null;

    const lesson = modules[moduleIndex].lessons.find(l => l.id === lessonId);
    return lesson || null;
  }, [modules]);

  /**
   * Check if a module has lessons
   */
  const hasLessons = useCallback((moduleId: string): boolean => {
    const module = modules.find(m => m.id === moduleId);
    return !!(module && module.lessons && module.lessons.length > 0);
  }, [modules]);

  /**
   * Get lesson count for a module
   */
  const getLessonCount = useCallback((moduleId: string): number => {
    const module = modules.find(m => m.id === moduleId);
    return module?.lessons?.length || 0;
  }, [modules]);

  return {
    // Data
    modules,
    
    // Methods
    getModuleItems,
    handleAddLesson,
    handleUpdateLesson,
    handleDeleteLesson,
    getLessonById,
    hasLessons,
    getLessonCount,
  };
};
