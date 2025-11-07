'use client';
import React, { FC, useState, useCallback, useMemo, useEffect } from 'react';
import { ConfigProvider, theme, App, Modal, Form, Input, Button, InputNumber } from 'antd';
import { useTheme } from 'EduSmart/Provider/ThemeProvider';
import { useCreateCourseStore, CourseContentItem } from 'EduSmart/stores/CreateCourse/CreateCourseStore';
import { FadeInUp } from 'EduSmart/components/Animation/FadeInUp';
import { useAutoSave } from '../../hooks/useAutoSave';
import { UtilityFileUpload } from 'EduSmart/components/Common/FileUpload';

import { QuizBuilder } from 'EduSmart/components/Common/QuizBuilder';
import { 
  FaVideo, 
  FaQuestionCircle, 
  FaClipboardList, 
  FaFile, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaGripVertical,
  FaArrowRight,
  FaArrowLeft,
  FaClock
} from 'react-icons/fa';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import StreamingVideoUploader from 'EduSmart/components/Video/StreamingVideoUploader';
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps */

// Content types enum
enum ContentType {
  VIDEO = 'video',
  QUIZ = 'quiz', 
  QUESTION = 'question',
  FILE = 'file'
}



interface OptionMetadata {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  optionsMetadata?: OptionMetadata[]; // Preserve backend IDs
  correctAnswer: string | number;
  explanation?: string;
}

interface QuizSettings {
  timeLimit?: number;
  passingScore?: number;
  shuffleQuestions?: boolean;
  showResults?: boolean;
  allowRetake?: boolean;
}

const resolveQuizIdentifiers = (quiz?: unknown) => {
  if (!quiz || typeof quiz !== 'object') {
    return {
      quizId: undefined as string | undefined,
      backendId: undefined as string | undefined,
    };
  }

  const data = quiz as {
    id?: string;
    quizId?: string;
    moduleQuizId?: string;
    lessonQuizId?: string;
  };

  const quizId = typeof data.quizId === 'string'
    ? data.quizId
    : typeof data.id === 'string'
      ? data.id
      : undefined;

  const backendId = typeof data.moduleQuizId === 'string'
    ? data.moduleQuizId
    : typeof data.lessonQuizId === 'string'
      ? data.lessonQuizId
      : quizId;

  return { quizId, backendId };
};


const CourseContent: FC = () => {
  const { isDarkMode } = useTheme();
  
  // Subscribe to modules separately to ensure re-renders when it changes
  const modules = useCreateCourseStore((state) => state.modules);
  const setCurrentStep = useCreateCourseStore((state) => state.setCurrentStep);
  const updateModule = useCreateCourseStore((state) => state.updateModule);
  const addLesson = useCreateCourseStore((state) => state.addLesson);
  const updateLesson = useCreateCourseStore((state) => state.updateLesson);
  const removeLesson = useCreateCourseStore((state) => state.removeLesson);
  const markQuizAsEdited = useCreateCourseStore((state) => state.markQuizAsEdited);
  
  const { message } = App.useApp();
  
  // State management
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Force re-render trigger

  // Auto-save functionality
  const { debouncedSave } = useAutoSave({
    step: '2'
  });

  // Auto-save when modules/lessons change
  useEffect(() => {
    const hasContent = modules.some(module => module.lessons && module.lessons.length > 0);
    if (hasContent) {
      debouncedSave({ modules });
    }
  }, [modules, debouncedSave]);

  // Cleanup effect when component unmounts
  useEffect(() => {
    return () => {
      // Reset local state when component unmounts
      setActiveModuleId(null);
      setRefreshKey(0);
    };
  }, []);

  // Helper to get lessons for a module (mapped from new store structure)
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
          // A lesson can have BOTH video and quiz - the video is the primary content
          if (lesson.videoUrl && typeof lesson.videoUrl === 'string' && lesson.videoUrl.trim() !== '') {
            // Has video URL - it's a VIDEO lesson (may also have a quiz attached)
            contentType = ContentType.VIDEO;
          } else if (lesson.lessonQuiz && lesson.lessonQuiz.questions && lesson.lessonQuiz.questions.length > 0) {
            // No video, but has quiz - it's a standalone QUIZ
            contentType = ContentType.QUIZ;
          } else if (lesson.title && (lesson.title.toLowerCase().includes('kiểm tra') || lesson.title.toLowerCase().includes('quiz'))) {
            // No video or quiz data, but title suggests it's a quiz
            contentType = ContentType.QUIZ;
          }
        
          return {
            id: lesson.id || `lesson-${index}`,
            type: contentType,
            title: lesson.title || 'Untitled Lesson',
            description: '', // No metadata available, use empty string
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
    
    // Add discussions
    if (courseModule.discussions) {
      const discussionItems = courseModule.discussions
        .filter(discussion => discussion && typeof discussion === 'object')
        .map((discussion, index) => ({
          id: discussion.id || `discussion-${index}`,
          type: ContentType.QUESTION,
          title: discussion.title || 'Untitled Discussion',
          description: discussion.description || '',
          duration: undefined,
          url: '',
          order: 1000 + index, // Place discussions after lessons
          metadata: {
            contentType: ContentType.QUESTION,
            question: discussion.discussionQuestion
          }
        }));
      items.push(...discussionItems);
    }
    
    // Add materials
    if (courseModule.materials) {
      const materialItems = courseModule.materials
        .filter(material => material && typeof material === 'object')
        .map((material, index) => ({
          id: material.id || `material-${index}`,
          type: ContentType.FILE,
          title: material.title || 'Untitled Material',
          description: material.description || '',
          duration: undefined,
          url: material.fileUrl,
          order: 2000 + index, // Place materials after discussions
          metadata: {
            contentType: ContentType.FILE,
            fileUrl: material.fileUrl
          }
        }));
      items.push(...materialItems);
    }
    
    // Add module quiz (if exists)
    if (courseModule.moduleQuiz && courseModule.moduleQuiz.questions && courseModule.moduleQuiz.questions.length > 0) {
      const questionCount = courseModule.moduleQuiz.questions.length;
      const moduleQuizItem = {
        id: courseModule.moduleQuiz.id || `module-quiz-${courseModule.id}`,
        type: ContentType.QUIZ,
        title: `Quiz Chương`,
        description: `${questionCount} câu hỏi${courseModule.moduleQuiz.quizSettings?.durationMinutes ? ` • ${courseModule.moduleQuiz.quizSettings.durationMinutes} phút` : ''}`,
        duration: courseModule.moduleQuiz.quizSettings?.durationMinutes,
        url: '',
        order: 3000, // Place module quiz at the end
        metadata: {
          contentType: ContentType.QUIZ,
          isModuleQuiz: true, // Flag to identify this as a module quiz
          quizData: courseModule.moduleQuiz
        }
      };
      items.push(moduleQuizItem);
    }
    
    // Sort by order
    const sortedItems = items.sort((a, b) => a.order - b.order);
    
    
    return sortedItems;
  }, [modules, refreshKey]);

  // Helper functions to convert between store format and QuizBuilder format
  const convertStoreQuizToBuilderFormat = useCallback((lessonQuiz: any) => {
    if (!lessonQuiz || !lessonQuiz.questions) return { questions: [], settings: {} };

    const convertQuestionTypeToString = (type: number): 'multiple-choice' | 'true-false' | 'short-answer' => {
      switch (type) {
        case 1: return 'multiple-choice';
        case 2: return 'true-false';
        case 3: return 'short-answer';
        default: return 'multiple-choice';
      }
    };

    const questions = lessonQuiz.questions.map((q: any, index: number) => {
      console.log(`🔍 [convertStoreQuizToBuilderFormat] Question ${index}:`, {
        id: q.id,
        questionText: q.questionText,
        options: q.options
      });
      
      return {
        id: q.id || `question-${index}`,
        question: q.questionText || '',
        type: convertQuestionTypeToString(q.questionType),
        options: q.options ? q.options.map((opt: any) => opt.text) : [],
        optionsMetadata: q.options ? q.options.map((opt: any, optIdx: number) => {
          console.log(`  📝 [Option ${optIdx}]:`, { id: opt.id, text: opt.text, isCorrect: opt.isCorrect });
          return {
            id: opt.id,
            text: opt.text,
            isCorrect: opt.isCorrect,
          };
        }) : [],
        correctAnswer: q.options ? 
          (q.questionType === 1 ? // Multiple choice - can have MULTIPLE correct answers
            (() => {
              // Find all correct option indices
              const correctIndices = q.options
                .map((opt: any, idx: number) => opt.isCorrect ? idx : -1)
                .filter((idx: number) => idx !== -1);
              console.log(`  ✅ [Correct indices]:`, correctIndices);
              // Return array if multiple, single index if one, or first correct if any
              return correctIndices.length > 1 ? correctIndices : (correctIndices[0] ?? 0);
            })() :
            q.questionType === 2 ? // True/False  
            (q.options[0]?.isCorrect ? 'true' : 'false') :
            q.options.find((opt: any) => opt.isCorrect)?.text || '') : '',
        explanation: q.explanation || '',
        points: 1
      };
    });

    const settings = {
      timeLimit: lessonQuiz.quizSettings?.durationMinutes || 30,
      passingScore: lessonQuiz.quizSettings?.passingScorePercentage || 70,
      shuffleQuestions: lessonQuiz.quizSettings?.shuffleQuestions || false,
      showResults: lessonQuiz.quizSettings?.showResultsImmediately || true,
      allowRetake: lessonQuiz.quizSettings?.allowRetake || true
    };

    return { questions, settings };
  }, []);

  const totalContentCount = useMemo(() => 
    modules.reduce((acc, module) => acc + module.lessons.length, 0)
  , [modules]);
  const [selectedType, setSelectedType] = useState<ContentType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuizBuilderOpen, setIsQuizBuilderOpen] = useState(false);
  // State for quiz builder initial data
  const [quizInitialData, setQuizInitialData] = useState<{
    questions: any[];
    settings: any;
  } | null>(null);
  const [editingItem, setEditingItem] = useState<CourseContentItem | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{moduleId: string, itemId: string} | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [form] = Form.useForm();
  
  // Create a form key that changes when content type changes to force complete recreation
  const formKey = `form-${selectedType || 'none'}`;

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Content type configurations - Enhanced with distinctive colors
  const contentTypes = [
    {
      type: ContentType.VIDEO,
      icon: FaVideo,
      title: 'Video Bài Học',
      description: 'Tải lên hoặc liên kết video bài giảng',
      color: 'bg-red-600',
      gradient: 'from-red-500 to-red-700',
      lightBg: 'bg-red-50',
      darkBg: 'dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800'
    },
    {
      type: ContentType.QUIZ,
      icon: FaClipboardList,
      title: 'Bài Kiểm Tra',
      description: 'Tạo câu hỏi trắc nghiệm và bài kiểm tra',
      color: 'bg-emerald-600',
      gradient: 'from-emerald-500 to-emerald-700',
      lightBg: 'bg-emerald-50',
      darkBg: 'dark:bg-emerald-900/20',
      borderColor: 'border-emerald-200 dark:border-emerald-800'
    },
    {
      type: ContentType.QUESTION,
      icon: FaQuestionCircle,
      title: 'Câu Hỏi Thảo Luận',
      description: 'Thêm câu hỏi để học viên thảo luận',
      color: 'bg-blue-600',
      gradient: 'from-blue-500 to-blue-700',
      lightBg: 'bg-blue-50',
      darkBg: 'dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800'
    },
    {
      type: ContentType.FILE,
      icon: FaFile,
      title: 'Tài Liệu Học Tập',
      description: 'Tải lên tài liệu, PDF, hình ảnh',
      color: 'bg-amber-600',
      gradient: 'from-amber-500 to-amber-700',
      lightBg: 'bg-amber-50',
      darkBg: 'dark:bg-amber-900/20',
      borderColor: 'border-amber-200 dark:border-amber-800'
    }
  ];


  // Comprehensive form reset function
  const resetFormCompletely = useCallback(() => {
    // First, reset all fields using Antd's method
    form.resetFields();
    
    // Then, explicitly set all possible fields to empty/undefined
    const emptyValues = {
      title: '',
      description: '',
      duration: undefined,
      url: '',
      fileUrl: '',
      question: ''
    };
    
    form.setFieldsValue(emptyValues);
    
    // Reset uploaded file name state and uploading state
    setUploadedFileName(null);
    setIsUploading(false);
  }, [form]);

  // Clear form when switching content types - more aggressive approach
  useEffect(() => {
    if (selectedType && !editingItem) {
      // Force clear all fields immediately when switching types
      setTimeout(() => {
        resetFormCompletely();
      }, 0); // Use setTimeout to ensure it runs after render
    }
  }, [selectedType, editingItem, resetFormCompletely]);

  // Handle content type selection
  const handleTypeSelection = useCallback((type: ContentType) => {
    // First reset everything
    resetFormCompletely();
    // Then set the new type
    setSelectedType(type);
    setEditingItem(null);
    
    if (type === ContentType.QUIZ) {
      setIsQuizBuilderOpen(true);
      setQuizInitialData(null); // Clear initial data for new quiz
    } else {
      setIsModalOpen(true);
      // Reset again to be sure
      setTimeout(() => {
        resetFormCompletely();
      }, 100);
    }
  }, [resetFormCompletely]);

  // Handle drag and drop reordering
  const handleDragEnd = useCallback((event: DragEndEvent, moduleIndex: number) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const items = getModuleItems(moduleIndex);
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over?.id);
      
      // Use the new store method to reorder lessons
      // Note: This maps from CourseContentItem back to lesson structure
      const courseModule = modules[moduleIndex];
      if (courseModule && oldIndex !== -1 && newIndex !== -1) {
        const lessons = [...courseModule.lessons];
        const [movedLesson] = lessons.splice(oldIndex, 1);
        lessons.splice(newIndex, 0, movedLesson);
        
        // Update position indexes
        const updatedLessons = lessons.map((lesson, index) => ({
          ...lesson,
          positionIndex: index
        }));
        
        updateModule(moduleIndex, { lessons: updatedLessons });
      }
    }
  }, [getModuleItems, modules, updateModule]);

  // Handle content creation/editing
  const handleSubmitContent = useCallback(async (values: Record<string, any>) => {
    try {
      const formValues = values || {};

      // Additional validation for different content types
      if (selectedType === ContentType.FILE && !formValues.fileUrl) {
        message.error('Vui lòng tải lên file!');
        return;
      }
      
      // For video content, check if there's actually a video URL in the component state
      // even if the form field is empty
      if (selectedType === ContentType.VIDEO) {
        const videoUploadComponent = document.querySelector('video');
        if (videoUploadComponent && videoUploadComponent.src) {
          // If video is in the DOM but not in form values, use the DOM source
          if (!formValues.url) {
            formValues.url = videoUploadComponent.src;
          }
        }
      }
      
      if (activeModuleId === null) {
        message.warning('Vui lòng chọn chương để thêm nội dung');
        return;
      }

      // Find the module index from activeModuleId
      const moduleIndex = modules.findIndex((m, index) => 
        m.id === activeModuleId || `module-${index}` === activeModuleId
      );
      if (moduleIndex === -1) {
        message.error('Không tìm thấy chương');
        return;
      }

      const currentModule = modules[moduleIndex];

      // Handle different content types according to API structure
      if (selectedType === ContentType.VIDEO) {
        // Video lessons go to lessons array
        const newLesson = {
          id: editingItem?.id,
          title: formValues.title,
          videoUrl: formValues.url || '',
          videoDurationSec: formValues.duration ? formValues.duration * 60 : 0,
          positionIndex: editingItem?.order ?? currentModule.lessons.length,
          isActive: true,
          // Store metadata for UI purposes
          metadata: {
            contentType: selectedType,
            description: formValues.description || undefined
          }
        };

        if (editingItem) {
          // Find existing lesson to preserve any quiz data
          const lessonIndex = currentModule.lessons.findIndex((l, index) => 
            l.id === editingItem.id || `lesson-${index}` === editingItem.id
          );
          if (lessonIndex !== -1) {
            const existingLesson = currentModule.lessons[lessonIndex];
            const updatedLesson = {
              ...newLesson,
              ...(existingLesson.lessonQuiz && { lessonQuiz: existingLesson.lessonQuiz })
            };
            updateLesson(moduleIndex, lessonIndex, updatedLesson);
          }
        } else {
          addLesson(moduleIndex, newLesson);
        }
      } 
      else if (selectedType === ContentType.QUESTION) {
        // Discussions go to discussions array
        const existingDiscussions = currentModule.discussions || [];
        const existingDiscussion = editingItem
          ? existingDiscussions.find(d => d.id === editingItem.id)
          : undefined;
        const timestamp = new Date().toISOString();

        const newDiscussion = {
          id: existingDiscussion?.id || editingItem?.id || `discussion-${Date.now()}`,
          title: formValues.title,
          description: formValues.description || '',
          discussionQuestion: formValues.question || '',
          isActive: existingDiscussion?.isActive ?? true,
          createdAt: existingDiscussion?.createdAt || timestamp,
          updatedAt: timestamp,
          // Store metadata for UI purposes
          metadata: {
            ...(existingDiscussion?.metadata || {}),
            contentType: selectedType
          }
        };

        const updatedDiscussions = [...existingDiscussions];

        if (editingItem) {
          // Find and update existing discussion
          const discussionIndex = updatedDiscussions.findIndex(d => 
            d.id === editingItem.id
          );
          if (discussionIndex !== -1) {
            updatedDiscussions[discussionIndex] = newDiscussion;
          } else {
            updatedDiscussions.push(newDiscussion);
          }
        } else {
          updatedDiscussions.push(newDiscussion);
        }

        updateModule(moduleIndex, {
          ...currentModule,
          discussions: updatedDiscussions
        });
      }
      else if (selectedType === ContentType.FILE) {
        // Materials go to materials array
        const existingMaterials = currentModule.materials || [];
        const existingMaterial = editingItem
          ? existingMaterials.find(m => m.id === editingItem.id)
          : undefined;
        const timestamp = new Date().toISOString();

        const newMaterial = {
          id: existingMaterial?.id || editingItem?.id || `material-${Date.now()}`,
          title: formValues.title,
          description: formValues.description || '',
          fileUrl: formValues.fileUrl || existingMaterial?.fileUrl || '',
          isActive: existingMaterial?.isActive ?? true,
          createdAt: existingMaterial?.createdAt || timestamp,
          updatedAt: timestamp,
          // Store metadata for UI purposes
          metadata: {
            ...(existingMaterial?.metadata || {}),
            contentType: selectedType
          }
        };

        const updatedMaterials = [...existingMaterials];

        if (editingItem) {
          // Find and update existing material
          const materialIndex = updatedMaterials.findIndex(m => 
            m.id === editingItem.id
          );
          if (materialIndex !== -1) {
            updatedMaterials[materialIndex] = newMaterial;
          } else {
            updatedMaterials.push(newMaterial);
          }
        } else {
          updatedMaterials.push(newMaterial);
        }

        updateModule(moduleIndex, {
          ...currentModule,
          materials: updatedMaterials
        });
      }

      setIsModalOpen(false);
      setEditingItem(null);
      resetFormCompletely(); // Use comprehensive reset
      setSelectedType(null); // Also reset selected type
      message.success(`Nội dung đã được ${editingItem ? 'cập nhật' : 'thêm'} thành công!`);
    } catch (error) {
      message.error('Có lỗi xảy ra khi lưu nội dung');
    }
  }, [activeModuleId, modules, editingItem, updateLesson, addLesson, selectedType, resetFormCompletely, updateModule]);

  // Handle quiz creation from QuizBuilder
  const handleQuizSave = useCallback((questions: QuizQuestion[], settings: QuizSettings) => {
    if (activeModuleId === null) {
      message.warning('Vui lòng chọn chương để thêm nội dung');
      return;
    }

    // Find the module index from activeModuleId
    const moduleIndex = modules.findIndex((m, index) => 
      m.id === activeModuleId || `module-${index}` === activeModuleId
    );
    if (moduleIndex === -1) {
      message.error('Không tìm thấy chương');
      return;
    }

    // Convert QuizBuilder format to store format
    const convertQuestionType = (type: string): number => {
      switch (type) {
        case 'multiple-choice': return 1; // MultipleChoice
        case 'true-false': return 2; // TrueFalse  
        case 'short-answer': return 3; // SingleChoice
        default: return 1;
      }
    };

    const convertedQuestions = questions.map(q => ({
      id: q.id,
      questionType: convertQuestionType(q.type),
      questionText: q.question,
      explanation: q.explanation || '',
      options: q.options ? q.options.map((text, index) => {
        const metadataOptions = Array.isArray((q as any).optionsMetadata) ? (q as any).optionsMetadata : [];
        const originalOption = metadataOptions[index];
        return {
          id: originalOption?.id || `option-${q.id}-${index}`,
          text: text,
          isCorrect: q.type === 'multiple-choice' ? 
            (Array.isArray(q.correctAnswer) ? q.correctAnswer.includes(index) : q.correctAnswer === index) :
            q.type === 'true-false' ?
            (index === 0 ? q.correctAnswer === 'true' : q.correctAnswer === 'false') :
            q.correctAnswer === text
        };
      }) : []
    }));

    const convertedSettings = {
      durationMinutes: settings.timeLimit || 30,
      passingScorePercentage: settings.passingScore || 70,
      shuffleQuestions: settings.shuffleQuestions || false,
      showResultsImmediately: settings.showResults || true,
      allowRetake: settings.allowRetake || true
    };

    if (editingItem) {
      // We're editing an existing item
      if (editingItem.type === 'module-quiz') {
        // Update existing module quiz - PRESERVE THE EXISTING QUIZ ID!
        const existingQuiz = modules[moduleIndex].moduleQuiz;
        const { quizId: existingModuleQuizId, backendId: existingModuleBackendId } = resolveQuizIdentifiers(existingQuiz);
        const persistentQuizId = existingModuleQuizId || `module-quiz-${Date.now()}`;
        const moduleQuiz = {
          id: persistentQuizId,
          quizId: persistentQuizId,
          moduleQuizId: existingModuleBackendId || persistentQuizId,
          quizSettings: convertedSettings,
          questions: convertedQuestions
        };

        const updatedModule = {
          ...modules[moduleIndex],
          moduleQuiz
        };
        updateModule(moduleIndex, updatedModule);
        message.success('Bài kiểm tra chương đã được cập nhật thành công!');
      }
  else if (editingItem.type === ContentType.QUIZ) {
        // Check if this is a MODULE QUIZ (by checking metadata flag)
  if (editingItem.metadata?.isModuleQuiz) {
          // This is a module quiz - update the moduleQuiz data with preserved IDs
          const existingQuiz = modules[moduleIndex].moduleQuiz;
          const { quizId: existingModuleQuizId, backendId: existingModuleBackendId } = resolveQuizIdentifiers(existingQuiz);
          const persistentQuizId = existingModuleQuizId || `module-quiz-${Date.now()}`;
          // Track this quiz as edited in THIS session
          markQuizAsEdited(persistentQuizId);
          
          const moduleQuiz = {
            id: persistentQuizId,
            quizId: persistentQuizId,
            moduleQuizId: existingModuleBackendId || persistentQuizId,
            quizSettings: {
              durationMinutes: settings.timeLimit || 30,
              passingScorePercentage: settings.passingScore || 70,
              shuffleQuestions: settings.shuffleQuestions || false,
              showResultsImmediately: settings.showResults || true,
              allowRetake: settings.allowRetake || true
            },
            lastModified: Date.now(), // Mark as modified NOW
            questions: questions.map(q => {
              console.log(`💾 [handleQuizSave] Saving question:`, {
                id: q.id,
                question: q.question,
                type: q.type,
                options: q.options,
                optionsMetadata: (q as any).optionsMetadata,
                correctAnswer: q.correctAnswer
              });
              
              return {
                id: q.id,
                questionType: convertQuestionType(q.type),
                questionText: q.question,
                explanation: q.explanation || '',
                options: q.options ? q.options.map((text, index) => {
                  const metadataOptions = Array.isArray((q as any).optionsMetadata) ? (q as any).optionsMetadata : [];
                  const originalOption = metadataOptions[index];
                  
                  const optionData = {
                    id: originalOption?.id || `option-${q.id}-${index}`,
                    text: text,
                    isCorrect: q.type === 'multiple-choice' ? 
                      (Array.isArray(q.correctAnswer) ? q.correctAnswer.includes(index) : q.correctAnswer === index) :
                      q.type === 'true-false' ?
                      (index === 0 ? q.correctAnswer === 'true' : q.correctAnswer === 'false') :
                      q.correctAnswer === text
                  };
                  
                  console.log(`  💾 [Option ${index}]:`, optionData, 
                    `| metadata: ${originalOption ? 'exists' : 'MISSING'}`,
                    `| text match: ${text === originalOption?.text}`);
                  
                  return optionData;
                }) : []
              };
            })
          };

          const updatedModule = {
            ...modules[moduleIndex],
            moduleQuiz
          };
          updateModule(moduleIndex, updatedModule);
          message.success('Bài kiểm tra chương đã được cập nhật thành công!');
        } else {
          // Regular lesson quiz editing - this handles the case where lesson has lessonQuiz
          const lesson = modules[moduleIndex].lessons.find(l => l.id === editingItem.id);
          const existingLessonQuiz = lesson?.lessonQuiz;
          const { quizId: existingLessonQuizId, backendId: existingLessonBackendId } = resolveQuizIdentifiers(existingLessonQuiz);
          const persistentLessonQuizId = existingLessonQuizId || `lesson-quiz-${Date.now()}`;

          const quizCount = modules[moduleIndex].lessons.filter(l => 
            l.title && (l.title.toLowerCase().includes('kiểm tra') || l.title.toLowerCase().includes('quiz'))
          ).length;
          
          // Track this quiz as edited in THIS session
          markQuizAsEdited(persistentLessonQuizId);
          
          const newQuizLesson = {
            id: editingItem?.id || `quiz-${Date.now()}`,
            title: editingItem ? editingItem.title : `Bài kiểm tra ${quizCount}`,
            videoUrl: '',
            videoDurationSec: settings.timeLimit ? settings.timeLimit * 60 : 1800,
            positionIndex: editingItem?.order ?? modules[moduleIndex].lessons.length,
            isActive: true,
            lessonQuiz: {
              id: persistentLessonQuizId,
              quizId: persistentLessonQuizId,
              lessonQuizId: existingLessonBackendId || persistentLessonQuizId,
              quizSettings: convertedSettings,
              lastModified: Date.now(), // Mark as modified NOW
              questions: convertedQuestions
            }
          };

          const lessonIndex = modules[moduleIndex].lessons.findIndex((l, index) => 
            l.id === editingItem.id || `lesson-${index}` === editingItem.id
          );
          if (lessonIndex !== -1) {
            updateLesson(moduleIndex, lessonIndex, newQuizLesson);
            message.success('Bài kiểm tra đã được cập nhật thành công!');
          } else {
            console.warn('⚠️ Lesson index not found for quiz update');
          }
        }
      }
      else if (editingItem.type === ContentType.VIDEO) {
        // Adding quiz to existing video lesson
        const lessonIndex = modules[moduleIndex].lessons.findIndex((l, index) => 
          l.id === editingItem.id || `lesson-${index}` === editingItem.id
        );
        if (lessonIndex !== -1) {
          const existingLesson = modules[moduleIndex].lessons[lessonIndex];
          const existingLessonQuiz = existingLesson.lessonQuiz;
          const { quizId: existingLessonQuizId, backendId: existingLessonBackendId } = resolveQuizIdentifiers(existingLessonQuiz);
          const persistentLessonQuizId = existingLessonQuizId || `lesson-quiz-${Date.now()}`;

          // Track this quiz as edited in THIS session
          markQuizAsEdited(persistentLessonQuizId);
          
          const updatedLesson = {
            ...existingLesson,
            lessonQuiz: {
              id: persistentLessonQuizId,
              quizId: persistentLessonQuizId,
              lessonQuizId: existingLessonBackendId || persistentLessonQuizId,
              quizSettings: convertedSettings,
              lastModified: Date.now(), // Mark as modified NOW
              questions: convertedQuestions
            }
          };
          updateLesson(moduleIndex, lessonIndex, updatedLesson);
          
          // Force a re-render by updating refreshKey
          setRefreshKey(prev => prev + 1);
          
          message.success('Quiz đã được thêm vào bài học thành công!');
        }
      }
    } else {
      // Create NEW module quiz when using "Thêm nội dung" → "Bài Kiểm Tra"
      // Only create the moduleQuiz, NOT a lesson
      const newQuizId = `module-quiz-${Date.now()}`;
      const moduleQuiz = {
        id: newQuizId,
        quizId: newQuizId,
        moduleQuizId: newQuizId,
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
            isCorrect: q.type === 'multiple-choice' ? 
              (Array.isArray(q.correctAnswer) ? q.correctAnswer.includes(index) : q.correctAnswer === index) :
              q.type === 'true-false' ?
              (index === 0 ? q.correctAnswer === 'true' : q.correctAnswer === 'false') :
              q.correctAnswer === text
          })) : []
        }))
      };

      // Update module with the moduleQuiz only (no lesson)
      const updatedModule = {
        ...modules[moduleIndex],
        moduleQuiz
      };
      
      updateModule(moduleIndex, updatedModule);
      message.success('Bài kiểm tra đã được tạo thành công!');
    }

    setIsQuizBuilderOpen(false);
    setSelectedType(null);
    setEditingItem(null);
    setQuizInitialData(null); // Clear initial data
  }, [activeModuleId, modules, updateLesson, addLesson, editingItem, updateModule]);  // Handle quiz builder cancel
  const handleQuizCancel = useCallback(() => {
    setIsQuizBuilderOpen(false);
    setSelectedType(null);
    setQuizInitialData(null); // Clear initial data
    setEditingItem(null); // Clear editing item
  }, []);

  // Handle content deletion
  const handleDeleteContent = useCallback((moduleId: string, itemId: string) => {
    setDeleteTarget({ moduleId, itemId });
    setDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    
    const { moduleId, itemId } = deleteTarget;
    
    // Find the module index from moduleId
    const moduleIndex = modules.findIndex((m, index) => {
      const currentModuleId = m.id || `module-${index}`;
      return currentModuleId === moduleId;
    });
    
    if (moduleIndex === -1) {
      message.error('Không tìm thấy chương');
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      return;
    }

    const targetModule = modules[moduleIndex];
    let deleted = false;

    // Try to find and delete module quiz
    if (targetModule.moduleQuiz && (targetModule.moduleQuiz.id === itemId || `module-quiz-${targetModule.id}` === itemId)) {
      const updatedModule = {
        ...targetModule,
        moduleQuiz: undefined
      };
      updateModule(moduleIndex, updatedModule);
      deleted = true;
    }

    // Try to find and delete from lessons
    if (!deleted && targetModule.lessons) {
      const lessonIndex = targetModule.lessons.findIndex((l, index) => {
        const currentLessonId = l.id || `lesson-${index}`;
        return currentLessonId === itemId;
      });
      
      if (lessonIndex !== -1) {
        removeLesson(moduleIndex, lessonIndex);
        deleted = true;
      }
    }

    // Try to find and delete from discussions
    if (!deleted && targetModule.discussions) {
      const discussionIndex = targetModule.discussions.findIndex(d => d.id === itemId);
      if (discussionIndex !== -1) {
        const updatedModule = {
          ...targetModule,
          discussions: targetModule.discussions.filter(d => d.id !== itemId)
        };
        updateModule(moduleIndex, updatedModule);
        deleted = true;
      }
    }

    // Try to find and delete from materials  
    if (!deleted && targetModule.materials) {
      const materialIndex = targetModule.materials.findIndex(m => m.id === itemId);
      if (materialIndex !== -1) {
        const updatedModule = {
          ...targetModule,
          materials: targetModule.materials.filter(m => m.id !== itemId)
        };
        updateModule(moduleIndex, updatedModule);
        deleted = true;
      }
    }

    if (!deleted) {
      message.error('Không tìm thấy nội dung để xóa');
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      return;
    }
    
    // Force component re-render
    setRefreshKey(prev => prev + 1);
    
    message.success('Đã xóa nội dung thành công');
    
    // Close modal
    setDeleteModalOpen(false);
    setDeleteTarget(null);
  }, [deleteTarget, modules, removeLesson, updateModule]);

  // Handle content editing
  const handleEditContent = useCallback((moduleId: string, item: CourseContentItem) => {
    setEditingItem(item);
    setActiveModuleId(moduleId);
    
    const contentType = item.type as ContentType;
    setSelectedType(contentType);
    
    // Handle quiz editing differently
    if (contentType === ContentType.QUIZ) {
      // Find the module
      const moduleIndex = modules.findIndex((m, index) => 
        m.id === moduleId || `module-${index}` === moduleId
      );
      
      if (moduleIndex !== -1) {
        // Check if this is a MODULE QUIZ (not a lesson quiz)
        if (item.metadata?.isModuleQuiz && modules[moduleIndex].moduleQuiz) {
          // Convert module quiz format to builder format
          const convertModuleQuizToBuilderFormat = (moduleQuiz: any) => {
            if (!moduleQuiz || !moduleQuiz.questions) return { questions: [], settings: {} };

            const questions = moduleQuiz.questions.map((q: any, index: number) => ({
              id: q.id || `question-${index}`,
              question: q.questionText || '',
              type: q.questionType === 1 ? 'multiple-choice' : q.questionType === 2 ? 'true-false' : 'short-answer',
              options: q.options ? q.options.map((opt: any) => opt.text) : [],
              // Store original option data in metadata so we can preserve IDs
              optionsMetadata: q.options ? q.options.map((opt: any) => ({ id: opt.id, text: opt.text, isCorrect: opt.isCorrect })) : [],
              correctAnswer: q.options ? 
                (q.questionType === 1 ? // Multiple choice - can have MULTIPLE correct answers
                  (() => {
                    // Find all correct option indices
                    const correctIndices = q.options
                      .map((opt: any, idx: number) => opt.isCorrect ? idx : -1)
                      .filter((idx: number) => idx !== -1);
                    // Return array if multiple, single index if one, or first correct if any
                    return correctIndices.length > 1 ? correctIndices : (correctIndices[0] ?? 0);
                  })() :
                  q.questionType === 2 ? // True/False  
                  (q.options[0]?.isCorrect ? 'true' : 'false') :
                  q.options.find((opt: any) => opt.isCorrect)?.text || '') : '',
              explanation: q.explanation || '',
              points: 1
            }));

            const settings = {
              timeLimit: moduleQuiz.quizSettings?.durationMinutes || 30,
              passingScore: moduleQuiz.quizSettings?.passingScorePercentage || 70,
              shuffleQuestions: moduleQuiz.quizSettings?.shuffleQuestions || false,
              showResults: moduleQuiz.quizSettings?.showResultsImmediately || true,
              allowRetake: moduleQuiz.quizSettings?.allowRetake || true
            };

            return { questions, settings };
          };

          const quizData = convertModuleQuizToBuilderFormat(modules[moduleIndex].moduleQuiz);
          setQuizInitialData(quizData);
        } else {
          // This is a LESSON QUIZ - find the lesson
          const lesson = modules[moduleIndex].lessons?.find(l => 
            l.id === item.id || `lesson-${modules[moduleIndex].lessons.findIndex(le => le === l)}` === item.id
          );
          
          if (lesson && lesson.lessonQuiz) {
            const quizData = convertStoreQuizToBuilderFormat(lesson.lessonQuiz);
            setQuizInitialData(quizData);
          } else {
            setQuizInitialData(null);
          }
        }
      }
      setIsQuizBuilderOpen(true);
    } else {
      setIsModalOpen(true);
      
      // Set form values based on content type
      if (contentType === ContentType.QUESTION) {
        // For discussions, get data from metadata
        form.setFieldsValue({
          title: item.title,
          description: item.description || '',
          question: item.metadata?.question || ''
        });
        setUploadedFileName(null);
      } else if (contentType === ContentType.FILE) {
        // For materials, get data from metadata
        form.setFieldsValue({
          title: item.title,
          description: item.description || '',
          fileUrl: item.metadata?.fileUrl || item.url || ''
        });
        
        // Set uploaded file name
        const fileUrl = item.metadata?.fileUrl || item.url || '';
        if (fileUrl && typeof fileUrl === 'string') {
          const fileName = fileUrl.split('/').pop() || '';
          setUploadedFileName(fileName);
        }
      } else {
        // For video lessons
        form.setFieldsValue({
          title: item.title,
          description: item.description || '',
          duration: item.duration,
          url: item.url || ''
        });
        setUploadedFileName(null);
      }
    }
  }, [form, modules, convertStoreQuizToBuilderFormat]);

  // Handle adding quiz to existing video lesson
  const handleAddQuizToLesson = useCallback((moduleId: string, item: CourseContentItem) => {
    setEditingItem(item); // Set the lesson we're adding quiz to
    setActiveModuleId(moduleId);
    setSelectedType(ContentType.QUIZ);
    
    // Check if lesson already has quiz data (shouldn't happen with UI logic, but just in case)
    const moduleIndex = modules.findIndex((m, index) => 
      m.id === moduleId || `module-${index}` === moduleId
    );
    if (moduleIndex !== -1) {
      const lesson = modules[moduleIndex].lessons.find(l => 
        l.id === item.id || `lesson-${modules[moduleIndex].lessons.findIndex(le => le === l)}` === item.id
      );
      if (lesson && lesson.lessonQuiz) {
        const quizData = convertStoreQuizToBuilderFormat(lesson.lessonQuiz);
        setQuizInitialData(quizData);
      } else {
        setQuizInitialData(null); // No existing quiz data
      }
    }
    
    setIsQuizBuilderOpen(true);
  }, [modules, convertStoreQuizToBuilderFormat]);



  // Render content type selector
  const renderContentTypeSelector = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {contentTypes.map((type, index) => {
        const IconComponent = type.icon;
        return (
          <FadeInUp key={type.type} delay={index * 100}>
            <div
              onClick={() => handleTypeSelection(type.type)}
              className={`
                group relative overflow-hidden rounded-xl border-2 transition-all duration-300 h-56
                cursor-pointer hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1
                ${selectedType === type.type 
                  ? `${type.borderColor} shadow-xl scale-[1.02] -translate-y-1 ${type.lightBg} ${type.darkBg}` 
                  : `border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:${type.borderColor}`
                }
              `}
            >
              {/* Background gradient overlay on selection */}
              {selectedType === type.type && (
                <div className={`absolute inset-0 bg-gradient-to-br ${type.gradient} opacity-5`} />
              )}
              
              <div className="relative flex flex-col items-center justify-center h-full text-center p-6">
                {/* Enhanced icon with better colors and effects */}
                <div className={`
                  inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4
                  bg-gradient-to-br ${type.gradient} text-white shadow-lg
                  group-hover:scale-110 group-hover:rotate-3 transition-all duration-300
                  ring-4 ring-white/20
                `}>
                  <IconComponent className="text-3xl drop-shadow-sm" />
                </div>
                
                {/* Enhanced title with color coding */}
                <h3 className={`
                  text-lg font-bold mb-2 line-clamp-1 transition-colors duration-300
                  ${selectedType === type.type 
                    ? `text-${type.gradient.split('-')[1]}-700 dark:text-${type.gradient.split('-')[1]}-300`
                    : 'text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white'
                  }
                `}>
                  {type.title}
                </h3>
                
                {/* Enhanced description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 flex-1 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                  {type.description}
                </p>
                
                {/* Enhanced call-to-action */}
                <div className={`
                  opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0
                  ${selectedType === type.type ? 'opacity-100 translate-y-0' : ''}
                `}>
                                                      <div className={`
                    inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                    bg-gradient-to-r ${type.gradient} text-white shadow-md
                    hover:shadow-lg transition-shadow duration-300 whitespace-nowrap
                  `}>
                    <FaPlus className="text-xs" />
                    <span>Thêm ngay</span>
                  </div>
                </div>
              </div>
            </div>
          </FadeInUp>
        );
      })}
    </div>
  );

  // Sortable content item component
  const SortableContentItem: FC<{ item: CourseContentItem; moduleId: string }> = ({ item, moduleId }) => {
    
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: item.id });


    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    const typeConfig = contentTypes.find(t => t.type === item.type);
    const IconComponent = typeConfig?.icon || FaFile;

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`
          group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700
          p-6 mb-4 transition-all duration-300 hover:shadow-md
          ${isDragging ? 'shadow-2xl opacity-80 scale-105' : ''}
        `}
      >
        <div className="flex items-start gap-4">
          {/* Drag handle */}
          <div
            {...attributes}
            {...listeners}
            className="flex-shrink-0 cursor-grab active:cursor-grabbing mt-1 group/handle relative"
          >
            <FaGripVertical className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl" />
            <span className="absolute left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover/handle:opacity-100 text-xs text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-0.5 rounded shadow-sm">Kéo để sắp xếp</span>
          </div>

          {/* Content icon */}
          <div className={`
            flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br ${typeConfig?.gradient}
            flex items-center justify-center text-white
          `}>
            <IconComponent className="text-lg" />
          </div>

          {/* Content details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 truncate">
                {item.title}
              </h4>
              <div className="flex items-center gap-2 ml-4">
                {item.duration && (
                  <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                    <FaClock className="text-xs" />
                    {item.duration} phút
                  </span>
                )}
              </div>
            </div>

            {item.description && (
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                {item.description}
              </p>
            )}

            <div className="flex items-center gap-2">
              <span className={`
                inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                ${typeConfig?.color} text-white
              `}>
                {typeConfig?.title}
              </span>
              {/* Show quiz indicator for video lessons with quiz */}
              {item.type === ContentType.VIDEO && (item.metadata?.hasQuiz as boolean) && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                  <FaClipboardList className="mr-1 text-xs" />
                  Có Quiz
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex-shrink-0 flex items-center gap-2 opacity-100 transition-opacity duration-200">
            {/* Quiz button for video lessons - add or edit quiz */}
            {item.type === ContentType.VIDEO && (
              <button
                onClick={() => handleAddQuizToLesson(moduleId, item)}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  (item.metadata?.hasQuiz as boolean)
                    ? 'text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30'
                    : 'text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30'
                }`}
                title={(item.metadata?.hasQuiz as boolean) ? "Chỉnh sửa Quiz" : "Thêm Quiz cho bài học"}
              >
                <FaClipboardList />
              </button>
            )}
            <button
              onClick={() => handleEditContent(moduleId, item)}
              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-200"
              title="Chỉnh sửa"
            >
              <FaEdit />
            </button>
            <button
              onClick={() => {
                handleDeleteContent(moduleId, item.id);
              }}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200"
              title="Xóa"
            >
              <FaTrash />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render modal content based on type
  const renderModalContent = () => {
    const typeConfig = contentTypes.find(t => t.type === selectedType);
    
    return (
      <Form
        form={form}
        layout="vertical"
        key={formKey} // Use dynamic key to force complete re-render
        id="course-content-modal-form"
        onFinish={handleSubmitContent}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className={`
              inline-flex items-center justify-center w-16 h-16 rounded-full mb-4
              bg-gradient-to-br ${typeConfig?.gradient} text-white
            `}>
              {typeConfig?.icon && <typeConfig.icon className="text-2xl" />}
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              {editingItem ? 'Chỉnh sửa' : 'Thêm'} {typeConfig?.title}
            </h3>
          </div>

          {/* Common fields */}
          <Form.Item
            name="title"
            label={<span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tiêu đề <span className="text-red-500">*</span></span>}
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
          >
            <Input 
              placeholder="Nhập tiêu đề nội dung..." 
              size="large"
            />
          </Form.Item>

          {/* Description field - Only for Discussion and Material */}
          {(selectedType === ContentType.QUESTION || selectedType === ContentType.FILE) && (
            <Form.Item
              name="description"
              label={<span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mô tả <span className="text-red-500">*</span></span>}
              rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
            >
              <Input.TextArea 
                placeholder={selectedType === ContentType.QUESTION ? "Nhập mô tả cho thảo luận..." : "Nhập mô tả cho tài liệu..."}
                rows={3}
                showCount
                maxLength={500}
              />
            </Form.Item>
          )}

        {/* Type-specific fields */}
        {selectedType === ContentType.VIDEO && (
          <>
            {/* Hidden field to store auto-calculated duration in minutes */}
            <Form.Item name="duration" hidden>
              <InputNumber />
            </Form.Item>

            {/* Hidden field to store duration in seconds for display */}
            <Form.Item name="videoDurationSec" hidden>
              <InputNumber />
            </Form.Item>

            {/* Show video duration after upload */}
            {form.getFieldValue('videoDurationSec') && (
              <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-300 dark:border-emerald-700 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🎬</div>
                    <div>
                      <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                        Thời lượng video:
                      </div>
                      <div className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                        {Math.floor(form.getFieldValue('videoDurationSec') / 60)} phút {form.getFieldValue('videoDurationSec') % 60} giây
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    Tự động tính
                  </div>
                </div>
              </div>
            )}
            
            <Form.Item
              name="url"
              label={<span className="text-sm font-medium text-gray-700 dark:text-gray-300">Upload Video Bài Học</span>}
              valuePropName="value"
              getValueFromEvent={(value) => {                return value;
              }}
            >
              <StreamingVideoUploader
                placeholder="Chọn hoặc kéo thả video bài học vào đây"
                maxSizeMB={512}
                compact={true}
                onVideoDurationExtracted={(durationInSeconds) => {
                  // Store both seconds (for display) and minutes (for course duration calculation)
                  const durationInMinutes = Math.round(durationInSeconds / 60);
                  // Use setTimeout to avoid circular reference warning by deferring the update
                  setTimeout(() => {
                    form.setFieldsValue({ 
                      duration: durationInMinutes,
                      videoDurationSec: durationInSeconds
                    });
                  }, 0);
                }}
              />
            </Form.Item>
          </>
        )}

        {selectedType === ContentType.FILE && (
          <>
            <Form.Item
              name="fileUrl"
              label={<span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tài liệu <span className="text-red-500">*</span></span>}
              rules={[{ required: true, message: 'Vui lòng tải lên tài liệu!' }]}
              valuePropName="value"
              getValueFromEvent={(value) => value}
            >
              <UtilityFileUpload
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip"
                maxSizeMB={50}
                buttonText="Chọn file"
                dragger={true}
              />
            </Form.Item>
            {uploadedFileName && !isUploading && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2">
                  <FaFile className="text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    File đã tải lên thành công:
                  </span>
                </div>
                <div className="mt-1 text-sm text-green-600 dark:text-green-400 font-mono bg-green-100 dark:bg-green-800/20 px-2 py-1 rounded">
                  {uploadedFileName}
                </div>
              </div>
            )}
          </>
        )}

        {selectedType === ContentType.QUESTION && (
          <Form.Item
            name="question"
            label={<span className="text-sm font-medium text-gray-700 dark:text-gray-300">Câu hỏi thảo luận <span className="text-red-500">*</span></span>}
            rules={[{ required: true, message: 'Vui lòng nhập câu hỏi!' }]}
          >
            <Input.TextArea 
              placeholder="Đặt một câu hỏi để học viên thảo luận..."
              rows={4}
              showCount
              maxLength={1000}
            />
          </Form.Item>
        )}
        </div>
      </Form>
    );
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
        }
      }}
    >
      <FadeInUp>
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Nội dung khóa học</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Thêm video, quiz, và tài liệu để hoàn thiện khóa học của bạn.</p>
            </div>
        </div>

        {/* Modules Collapse */}
        <div className="space-y-4" key={refreshKey}>
            {modules.map((module, moduleIndex) => {
                const items = getModuleItems(moduleIndex);
                
                
                return (
                    <div key={`${module.id || `module-${moduleIndex}`}-${refreshKey}`} className="bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 transition-shadow hover:shadow-sm">
                        <div className="p-4 flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">{module.moduleName}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {items.length} nội dung
                                  {module.moduleQuiz && (
                                    <span className="ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">
                                      Có quiz chương ({module.moduleQuiz.questions?.length || 0} câu hỏi)
                                    </span>
                                  )}
                                </p>
                            </div>
                            <Button 
                              icon={<FaPlus />} 
                              onClick={() => { 
                                const moduleId = module.id || `module-${moduleIndex}`;
                                setActiveModuleId(moduleId); 
                                setIsModalOpen(true); 
                                setSelectedType(null); 
                              }}
                            >
                              Thêm nội dung
                            </Button>
                        </div>
                        <div className="px-4 pb-4">
                            {items.length > 0 ? (
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, moduleIndex)}>
                                    <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                                        <div className="space-y-2">
                                            {items.sort((a,b)=>a.order-b.order).map((it) => (
                                                <SortableContentItem key={`${it.id}-${refreshKey}`} item={it} moduleId={module.id || `module-${moduleIndex}`} />
                                            ))}
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            ) : (
                                <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-md">
                                    <p className="text-gray-500 dark:text-gray-400">Chưa có nội dung nào. Bấm &quot;Thêm nội dung&quot; để bắt đầu.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button icon={<FaArrowLeft />} htmlType="button" onClick={() => {
                const container = document.getElementById('create-course-content');
                if (container) {
                    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
                setCurrentStep(1);
            }} size="large">Quay lại</Button>
            <Button type="primary" htmlType="button" icon={<FaArrowRight />} onClick={() => {
                const container = document.getElementById('create-course-content');
                if (container) {
                    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
                setCurrentStep(3);
            }} size="large" disabled={totalContentCount === 0}>
                Tiếp theo: Giá & Khuyến mãi
            </Button>
        </div>

        {/* Modal for adding/editing content */}
        <Modal
          key={`modal-${selectedType || 'none'}-${editingItem?.id || 'new'}`} // Force re-render when type/item changes
          title={editingItem ? 'Chỉnh sửa nội dung' : 'Thêm nội dung mới'}
          open={isModalOpen}
          onCancel={() => { 
            setIsModalOpen(false); 
            setEditingItem(null); 
            resetFormCompletely(); 
            setSelectedType(null); 
          }}
          footer={null}
          width={selectedType ? 600 : 800}
          destroyOnHidden={true} // Destroy modal contents when closed
        >
            {!selectedType ? (
                <div className="p-4">
                    <h3 className="text-center text-lg font-semibold mb-6">Chọn loại nội dung bạn muốn thêm</h3>
                    {renderContentTypeSelector()}
                </div>
            ) : (
                <div>
                    {renderModalContent()}
                    <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <Button onClick={() => { 
                          setIsModalOpen(false); 
                          setEditingItem(null); 
                          resetFormCompletely(); 
                          setSelectedType(null); 
                        }}>Hủy</Button>
                        <Button type="primary" htmlType="submit" form="course-content-modal-form">{editingItem ? 'Cập nhật' : 'Thêm nội dung'}</Button>
                    </div>
                </div>
            )}
        </Modal>

        {/* Quiz Builder Modal */}
        <Modal
          title="Tạo Bài Kiểm Tra"
          open={isQuizBuilderOpen}
          onCancel={handleQuizCancel}
          footer={null}
          width={900}
          destroyOnHidden
        >
          <QuizBuilder 
            initialQuestions={quizInitialData?.questions || []}
            initialSettings={quizInitialData?.settings || {}}
            onSave={handleQuizSave} 
            onCancel={handleQuizCancel} 
          />
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          title="Xác nhận xóa"
          open={deleteModalOpen}
          onOk={handleConfirmDelete}
          onCancel={() => {
            setDeleteModalOpen(false);
            setDeleteTarget(null);
          }}
          okText="Xóa"
          cancelText="Hủy"
          okType="danger"
          centered
        >
          <p>Bạn có chắc chắn muốn xóa nội dung này không?</p>
        </Modal>
      </FadeInUp>
    </ConfigProvider>
  );
};

export default CourseContent;

