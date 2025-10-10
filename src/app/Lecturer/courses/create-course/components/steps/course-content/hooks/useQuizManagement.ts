/**
 * Quiz Management Hook
 * 
 * Handles all quiz-related operations including:
 * - Creating new quizzes
 * - Updating quizzes
 * - Adding quiz to lesson
 * - Converting quiz formats
 * - Managing quiz settings
 */

import { useCallback } from 'react';
import { App } from 'antd';
import { useCreateCourseStore } from 'EduSmart/stores/CreateCourse/CreateCourseStore';
/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-assign-module-variable */

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer: string | number | (string | number)[];
  explanation?: string;
}

export interface QuizSettings {
  timeLimit?: number;
  passingScore?: number;
  shuffleQuestions?: boolean;
  showResults?: boolean;
  allowRetake?: boolean;
}

export const useQuizManagement = () => {
  const { message } = App.useApp();
  const { modules, updateModule, updateLesson } = useCreateCourseStore();

  /**
   * Convert QuizBuilder question type to API format
   */
  const convertQuestionType = useCallback((type: string): number => {
    switch (type) {
      case 'multiple-choice': return 1; // MultipleChoice
      case 'true-false': return 2; // TrueFalse
      case 'short-answer': return 3; // SingleChoice
      default: return 1;
    }
  }, []);

  /**
   * Convert store quiz format to QuizBuilder format
   */
  const convertStoreQuizToBuilderFormat = useCallback((lessonQuiz: any) => {
    if (!lessonQuiz || !lessonQuiz.questions) {
      return { questions: [], settings: {} };
    }

    const questions: QuizQuestion[] = lessonQuiz.questions.map((q: any) => {
      let type: 'multiple-choice' | 'true-false' | 'short-answer' = 'multiple-choice';
      if (q.questionType === 2) type = 'true-false';
      else if (q.questionType === 3) type = 'short-answer';

      let correctAnswer: string | number | string[] | number[];
      if (type === 'multiple-choice') {
        const correctIndices = (q.options || [])
          .map((opt: any, index: number) => opt.isCorrect ? index : -1)
          .filter((index: number) => index !== -1);
        correctAnswer = correctIndices.length > 1 ? correctIndices : correctIndices[0] ?? 0;
      } else if (type === 'true-false') {
        const trueOption = q.options?.find((opt: any) => opt.text?.toLowerCase() === 'true' || opt.text?.toLowerCase() === 'đúng');
        correctAnswer = trueOption?.isCorrect ? 'true' : 'false';
      } else {
        const correctOption = q.options?.find((opt: any) => opt.isCorrect);
        correctAnswer = correctOption?.text || '';
      }

      return {
        id: q.id || `question-${Date.now()}-${Math.random()}`,
        question: q.questionText || '',
        type,
        options: q.options ? q.options.map((opt: any) => opt.text || '') : [],
        correctAnswer,
        explanation: q.explanation || ''
      };
    });

    const settings: QuizSettings = {
      timeLimit: lessonQuiz.quizSettings?.durationMinutes || 30,
      passingScore: lessonQuiz.quizSettings?.passingScorePercentage || 70,
      shuffleQuestions: lessonQuiz.quizSettings?.shuffleQuestions || false,
      showResults: lessonQuiz.quizSettings?.showResultsImmediately ?? true,
      allowRetake: lessonQuiz.quizSettings?.allowRetake ?? true
    };

    return { questions, settings };
  }, []);

  /**
   * Create a new module quiz
   */
  const handleCreateModuleQuiz = useCallback((
    moduleId: string,
    questions: QuizQuestion[],
    settings: QuizSettings
  ) => {
    try {
      const moduleIndex = modules.findIndex(m => m.id === moduleId);
      if (moduleIndex === -1) {
        message.error('Không tìm thấy chương');
        return false;
      }

      const convertedQuestions = questions.map(q => ({
        id: q.id,
        questionType: convertQuestionType(q.type),
        questionText: q.question,
        explanation: q.explanation || '',
        options: q.options ? q.options.map((text, index) => ({
          id: `option-${q.id}-${index}`,
          text: text,
          isCorrect: q.type === 'multiple-choice'
            ? (Array.isArray(q.correctAnswer) ? q.correctAnswer.includes(index) : q.correctAnswer === index)
            : q.type === 'true-false'
            ? (index === 0 ? q.correctAnswer === 'true' : q.correctAnswer === 'false')
            : q.correctAnswer === text
        })) : []
      }));

      const convertedSettings = {
        id: `settings-${Date.now()}`,
        durationMinutes: settings.timeLimit || 30,
        passingScorePercentage: settings.passingScore || 70,
        shuffleQuestions: settings.shuffleQuestions || false,
        showResultsImmediately: settings.showResults || true,
        allowRetake: settings.allowRetake || true
      };

      const moduleQuiz = {
        id: `module-quiz-${Date.now()}`,
        quizSettings: convertedSettings,
        questions: convertedQuestions
      };

      // Also create a display lesson for the quiz
      const quizCount = modules[moduleIndex].lessons.filter(l =>
        l.title && (l.title.toLowerCase().includes('kiểm tra') || l.title.toLowerCase().includes('quiz'))
      ).length + 1;

      const quizLesson = {
        id: `quiz-${Date.now()}`,
        title: `Bài kiểm tra ${quizCount}`,
        videoUrl: '',
        videoDurationSec: settings.timeLimit ? settings.timeLimit * 60 : 1800,
        positionIndex: modules[moduleIndex].lessons.length,
        isActive: true,
        type: 'quiz'
      };

      const updatedModule = {
        ...modules[moduleIndex],
        moduleQuiz,
        lessons: [...modules[moduleIndex].lessons, quizLesson]
      };

      updateModule(moduleIndex, updatedModule);
      message.success('Bài kiểm tra đã được tạo thành công!');
      return true;
    } catch {
      message.error('Có lỗi khi tạo bài kiểm tra');
      return false;
    }
  }, [modules, updateModule, convertQuestionType, message]);

  /**
   * Update an existing module quiz
   */
  const handleUpdateModuleQuiz = useCallback((
    moduleId: string,
    questions: QuizQuestion[],
    settings: QuizSettings
  ) => {
    try {
      const moduleIndex = modules.findIndex(m => m.id === moduleId);
      if (moduleIndex === -1) {
        message.error('Không tìm thấy chương');
        return false;
      }

      const moduleQuiz = {
        quizSettings: {
          durationMinutes: settings.timeLimit || 30,
          passingScorePercentage: settings.passingScore || 70,
          shuffleQuestions: settings.shuffleQuestions || false,
          showResultsImmediately: settings.showResults || true,
          allowRetake: settings.allowRetake || true
        },
        questions: questions.map(q => ({
          questionType: convertQuestionType(q.type),
          questionText: q.question,
          explanation: q.explanation || '',
          options: q.options ? q.options.map((text, index) => ({
            text: text,
            isCorrect: q.type === 'multiple-choice'
              ? (Array.isArray(q.correctAnswer) ? q.correctAnswer.includes(index) : q.correctAnswer === index)
              : q.type === 'true-false'
              ? (index === 0 ? q.correctAnswer === 'true' : q.correctAnswer === 'false')
              : q.correctAnswer === text
          })) : []
        }))
      };

      const updatedModule = {
        ...modules[moduleIndex],
        moduleQuiz
      };

      updateModule(moduleIndex, updatedModule);
      message.success('Bài kiểm tra chương đã được cập nhật thành công!');
      return true;
    } catch {
      message.error('Có lỗi khi cập nhật bài kiểm tra');
      return false;
    }
  }, [modules, updateModule, convertQuestionType, message]);

  /**
   * Add quiz to an existing video lesson
   */
  const handleAddQuizToLesson = useCallback((
    moduleId: string,
    lessonId: string,
    questions: QuizQuestion[],
    settings: QuizSettings
  ) => {
    try {
      const moduleIndex = modules.findIndex(m => m.id === moduleId);
      if (moduleIndex === -1) {
        message.error('Không tìm thấy chương');
        return false;
      }

      const lessonIndex = modules[moduleIndex].lessons.findIndex(l => l.id === lessonId);
      if (lessonIndex === -1) {
        message.error('Không tìm thấy bài học');
        return false;
      }

      const convertedQuestions = questions.map(q => ({
        id: q.id,
        questionType: convertQuestionType(q.type),
        questionText: q.question,
        explanation: q.explanation || '',
        options: q.options ? q.options.map((text, index) => ({
          id: `option-${q.id}-${index}`,
          text: text,
          isCorrect: q.type === 'multiple-choice'
            ? (Array.isArray(q.correctAnswer) ? q.correctAnswer.includes(index) : q.correctAnswer === index)
            : q.type === 'true-false'
            ? (index === 0 ? q.correctAnswer === 'true' : q.correctAnswer === 'false')
            : q.correctAnswer === text
        })) : []
      }));

      const convertedSettings = {
        id: `settings-${Date.now()}`,
        durationMinutes: settings.timeLimit || 30,
        passingScorePercentage: settings.passingScore || 70,
        shuffleQuestions: settings.shuffleQuestions || false,
        showResultsImmediately: settings.showResults || true,
        allowRetake: settings.allowRetake || true
      };

      const existingLesson = modules[moduleIndex].lessons[lessonIndex];
      const updatedLesson = {
        ...existingLesson,
        lessonQuiz: {
          id: `lesson-quiz-${Date.now()}`,
          quizSettings: convertedSettings,
          questions: convertedQuestions
        }
      };

      updateLesson(moduleIndex, lessonIndex, updatedLesson);
      message.success('Quiz đã được thêm vào bài học thành công!');
      return true;
    } catch {
      message.error('Có lỗi khi thêm quiz');
      return false;
    }
  }, [modules, updateLesson, convertQuestionType, message]);

  /**
   * Update lesson quiz
   */
  const handleUpdateLessonQuiz = useCallback((
    moduleId: string,
    lessonId: string,
    questions: QuizQuestion[],
    settings: QuizSettings
  ) => {
    try {
      const moduleIndex = modules.findIndex(m => m.id === moduleId);
      if (moduleIndex === -1) {
        message.error('Không tìm thấy chương');
        return false;
      }

      const lessonIndex = modules[moduleIndex].lessons.findIndex(l => l.id === lessonId);
      if (lessonIndex === -1) {
        message.error('Không tìm thấy bài học');
        return false;
      }

      const convertedQuestions = questions.map(q => ({
        id: q.id,
        questionType: convertQuestionType(q.type),
        questionText: q.question,
        explanation: q.explanation || '',
        options: q.options ? q.options.map((text, index) => ({
          id: `option-${q.id}-${index}`,
          text: text,
          isCorrect: q.type === 'multiple-choice'
            ? (Array.isArray(q.correctAnswer) ? q.correctAnswer.includes(index) : q.correctAnswer === index)
            : q.type === 'true-false'
            ? (index === 0 ? q.correctAnswer === 'true' : q.correctAnswer === 'false')
            : q.correctAnswer === text
        })) : []
      }));

      const convertedSettings = {
        id: `settings-${Date.now()}`,
        durationMinutes: settings.timeLimit || 30,
        passingScorePercentage: settings.passingScore || 70,
        shuffleQuestions: settings.shuffleQuestions || false,
        showResultsImmediately: settings.showResults || true,
        allowRetake: settings.allowRetake || true
      };

      const newQuizLesson = {
        id: lessonId,
        title: modules[moduleIndex].lessons[lessonIndex].title,
        videoUrl: '',
        videoDurationSec: settings.timeLimit ? settings.timeLimit * 60 : 1800,
        positionIndex: modules[moduleIndex].lessons[lessonIndex].positionIndex,
        isActive: true,
        lessonQuiz: {
          id: `lesson-quiz-${Date.now()}`,
          quizSettings: convertedSettings,
          questions: convertedQuestions
        }
      };

      updateLesson(moduleIndex, lessonIndex, newQuizLesson);
      message.success('Bài kiểm tra đã được cập nhật thành công!');
      return true;
    } catch {
      message.error('Có lỗi khi cập nhật bài kiểm tra');
      return false;
    }
  }, [modules, updateLesson, convertQuestionType, message]);

  /**
   * Check if a module has a quiz
   */
  const hasModuleQuiz = useCallback((moduleId: string): boolean => {
    const module = modules.find(m => m.id === moduleId);
    return !!(module && module.moduleQuiz && module.moduleQuiz.questions && module.moduleQuiz.questions.length > 0);
  }, [modules]);

  /**
   * Check if a lesson has a quiz
   */
  const hasLessonQuiz = useCallback((moduleId: string, lessonId: string): boolean => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return false;

    const lesson = module.lessons.find(l => l.id === lessonId);
    return !!(lesson && lesson.lessonQuiz && lesson.lessonQuiz.questions && lesson.lessonQuiz.questions.length > 0);
  }, [modules]);

  return {
    // Data
    modules,

    // Methods
    convertStoreQuizToBuilderFormat,
    handleCreateModuleQuiz,
    handleUpdateModuleQuiz,
    handleAddQuizToLesson,
    handleUpdateLessonQuiz,
    hasModuleQuiz,
    hasLessonQuiz,
  };
};
