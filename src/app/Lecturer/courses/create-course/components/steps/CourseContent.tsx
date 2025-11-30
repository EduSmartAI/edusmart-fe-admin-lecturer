'use client';
import { FC, useState, useCallback, useMemo, useRef } from 'react';
import { ConfigProvider, theme, message, Modal, Form, Input, Button, Upload, Progress, App } from 'antd';
import { useTheme } from 'EduSmart/Provider/ThemeProvider';
import { useCreateCourseStore, CourseContentItem, Lesson, Discussion, Material } from 'EduSmart/stores/CreateCourse/CreateCourseStore';
import { FadeInUp } from 'EduSmart/components/Animation/FadeInUp';

// Import markQuizAsEdited for tracking quiz edits
const { markQuizAsEdited } = useCreateCourseStore.getState();

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
  FaUpload,
  FaArrowRight,
  FaArrowLeft,
  FaClock,
  FaCheckCircle,
  FaTimes,
  FaPlay,
  FaRedo
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
import { courseServiceAPI } from 'EduSmart/api/api-course-service';

// Content types enum
enum ContentType {
  VIDEO = 'video',
  QUIZ = 'quiz',
  QUESTION = 'question',
  FILE = 'file'
}



interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
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


const CourseContent: FC = () => {
  const { isDarkMode } = useTheme();
  const { setCurrentStep, modules, updateModule, addLesson, updateLesson, removeLesson } = useCreateCourseStore();

  // Use App hook for modal
  const { modal } = App.useApp();

  // State management
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  
  // Video upload state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>('');
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [autoDetectedDuration, setAutoDetectedDuration] = useState<number | null>(null); // Duration in seconds
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Material file upload state
  const [uploadedMaterialUrl, setUploadedMaterialUrl] = useState<string>('');
  const [isMaterialUploading, setIsMaterialUploading] = useState(false);
  const [materialUploadProgress, setMaterialUploadProgress] = useState(0);

  // Helper function to extract video duration from file
  const extractVideoDuration = useCallback((file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        const durationInSeconds = Math.ceil(video.duration);
        resolve(durationInSeconds);
      };
      
      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        reject(new Error('Không thể đọc thông tin video'));
      };
      
      video.src = URL.createObjectURL(file);
    });
  }, []);

  // Video upload constants
  const MAX_VIDEO_SIZE_MB = 300;
  const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;
  const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/avi'];

  // Helper to get lessons for a module (mapped from new store structure)
  const getModuleItems = useCallback((moduleIndex: number): CourseContentItem[] => {
    const courseModule = modules[moduleIndex];
    if (!courseModule) return [];

    const items: CourseContentItem[] = [];

    // Convert lessons to CourseContentItem format
    courseModule.lessons.forEach((lesson: Lesson, index: number) => {
      items.push({
        id: lesson.id || `lesson-${index}`,
        type: lesson.type || 'video', // Use lesson type or default to video
        title: lesson.title,
        description: '', // Lessons don't have description field
        duration: lesson.videoDurationSec ? Math.round(lesson.videoDurationSec / 60) : undefined,
        url: lesson.videoUrl,
        order: lesson.positionIndex,
        question: '',
        metadata: {
          lessonQuiz: lesson.lessonQuiz,
          sourceType: 'lesson',
          sourceIndex: index
        }
      });
    });

    // Convert discussions to CourseContentItem format
    if (courseModule.discussions && courseModule.discussions.length > 0) {
      courseModule.discussions.forEach((discussion: Discussion, index: number) => {
        items.push({
          id: discussion.id || `discussion-${index}`,
          type: 'question', // Map to QUESTION type
          title: discussion.title,
          description: discussion.description || '',
          question: discussion.discussionQuestion || '',
          order: courseModule.lessons.length + index, // Discussion doesn't have positionIndex
          metadata: {
            sourceType: 'discussion',
            sourceIndex: index
          }
        });
      });
    }

    // Convert materials to CourseContentItem format
    if (courseModule.materials && courseModule.materials.length > 0) {
      courseModule.materials.forEach((material: Material, index: number) => {
        items.push({
          id: material.id || `material-${index}`,
          type: 'file', // Map to FILE type
          title: material.title,
          description: material.description || '',
          url: material.fileUrl,
          order: courseModule.lessons.length + (courseModule.discussions?.length || 0) + index, // Material doesn't have positionIndex
          metadata: {
            fileUrl: material.fileUrl,
            sourceType: 'material',
            sourceIndex: index
          }
        });
      });
    }

    // Add moduleQuiz as an item if it exists
    if (courseModule.moduleQuiz && courseModule.moduleQuiz.questions && courseModule.moduleQuiz.questions.length > 0) {
      items.push({
        id: courseModule.moduleQuiz.id || `module-quiz-${moduleIndex}`,
        type: 'quiz', // Quiz type
        title: 'Bài kiểm tra chương',
        description: `${courseModule.moduleQuiz.questions.length} câu hỏi`,
        duration: courseModule.moduleQuiz.quizSettings?.durationMinutes,
        order: 9999, // Put at the end
        metadata: {
          sourceType: 'moduleQuiz',
          moduleQuiz: courseModule.moduleQuiz
        }
      });
    }

    // Sort by order
    items.sort((a, b) => (a.order || 0) - (b.order || 0));

    return items;
  }, [modules]);

  const totalContentCount = useMemo(() =>
    modules.reduce((acc, module) => 
      acc + module.lessons.length + (module.discussions?.length || 0) + (module.materials?.length || 0) + (module.moduleQuiz ? 1 : 0)
    , 0)
    , [modules]);
  const [selectedType, setSelectedType] = useState<ContentType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuizBuilderOpen, setIsQuizBuilderOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CourseContentItem | null>(null);
  const [editingVideoQuiz, setEditingVideoQuiz] = useState<{moduleIndex: number; lessonIndex: number; lessonId: string} | null>(null);
  const [editingModuleQuiz, setEditingModuleQuiz] = useState<{moduleIndex: number} | null>(null);
  const [form] = Form.useForm();

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


  // Handle content type selection
  const handleTypeSelection = useCallback((type: ContentType) => {
    setSelectedType(type);
    setEditingItem(null);

    if (type === ContentType.QUIZ) {
      setIsQuizBuilderOpen(true);
    } else {
      setIsModalOpen(true);
      form.resetFields();
    }
  }, [form]);

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
  const handleSubmitContent = useCallback(async () => {
    try {
      const values = await form.validateFields();

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

      const courseModule = modules[moduleIndex];

      // Handle different content types - save to appropriate arrays
      if (selectedType === ContentType.QUESTION) {
        // Discussion type - save to discussions array
        const newDiscussion = {
          id: editingItem?.id || `discussion-${Date.now()}`,
          title: values.title,
          description: values.description || '',
          discussionQuestion: values.question || '',
          isActive: true,
        };

        const discussions = [...(courseModule.discussions || [])];
        
        if (editingItem && editingItem.metadata?.sourceType === 'discussion') {
          // Update existing discussion
          const discussionIndex = editingItem.metadata.sourceIndex as number;
          if (discussionIndex !== undefined && discussionIndex >= 0) {
            discussions[discussionIndex] = { ...discussions[discussionIndex], ...newDiscussion };
          }
        } else {
          // Add new discussion
          discussions.push(newDiscussion);
        }

        updateModule(moduleIndex, { discussions });
        
      } else if (selectedType === ContentType.FILE) {
        // Material type - save to materials array
        const newMaterial = {
          id: editingItem?.id || `material-${Date.now()}`,
          title: values.title,
          description: values.description || '',
          fileUrl: uploadedMaterialUrl || values.url || '',
          isActive: true,
        };

        const materials = [...(courseModule.materials || [])];
        
        if (editingItem && editingItem.metadata?.sourceType === 'material') {
          // Update existing material
          const materialIndex = editingItem.metadata.sourceIndex as number;
          if (materialIndex !== undefined && materialIndex >= 0) {
            materials[materialIndex] = { ...materials[materialIndex], ...newMaterial };
          }
        } else {
          // Add new material
          materials.push(newMaterial);
        }

        updateModule(moduleIndex, { materials });

      } else {
        // VIDEO type - save to lessons array
        const newLesson: Omit<Lesson, 'positionIndex'> = {
          id: editingItem?.id || `lesson-${Date.now()}`,
          title: values.title,
          isActive: true,
          type: selectedType || 'video',
          videoUrl: uploadedVideoUrl || values.url || '',
          videoDurationSec: autoDetectedDuration || undefined
        };

        if (editingItem && editingItem.metadata?.sourceType === 'lesson') {
          // Find lesson index and update
          const lessonIndex = editingItem.metadata.sourceIndex as number;
          if (lessonIndex !== undefined && lessonIndex >= 0) {
            updateLesson(moduleIndex, lessonIndex, newLesson);
          }
        } else if (editingItem) {
          // Fallback: try to find by id
          const lessonIndex = modules[moduleIndex].lessons.findIndex((l, index) =>
            l.id === editingItem.id || `lesson-${index}` === editingItem.id
          );
          if (lessonIndex !== -1) {
            updateLesson(moduleIndex, lessonIndex, newLesson);
          }
        } else {
          // Add new lesson
          addLesson(moduleIndex, newLesson);
        }
      }

      setIsModalOpen(false);
      setEditingItem(null);
      setAutoDetectedDuration(null); // Reset auto-detected duration
      setUploadedVideoUrl(''); // Reset video URL
      setVideoFile(null);
      setVideoPreviewUrl('');
      setUploadedMaterialUrl(''); // Reset material URL
      form.resetFields();
      message.success(`Nội dung đã được ${editingItem ? 'cập nhật' : 'thêm'} thành công!`);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  }, [form, activeModuleId, modules, editingItem, updateLesson, addLesson, updateModule, autoDetectedDuration, selectedType, uploadedVideoUrl, uploadedMaterialUrl]);

  // Handle quiz creation from QuizBuilder - saves to lesson or module quiz
  const handleQuizSave = useCallback((questions: QuizQuestion[], settings: QuizSettings) => {
    // If editing quiz for a specific video (lessonQuiz)
    if (editingVideoQuiz) {
      const { moduleIndex, lessonIndex } = editingVideoQuiz;
      const lesson = modules[moduleIndex]?.lessons[lessonIndex];
      
      if (!lesson) {
        message.error('Không tìm thấy bài học');
        return;
      }

      // Convert QuizBuilder format to store format for lessonQuiz
      // IMPORTANT: Preserve quizId from server for update API to work
      const existingQuiz = lesson.lessonQuiz as { id?: string; quizId?: string; lessonQuizId?: string; quizSettings?: { id?: string } } | undefined;
      const quizId = existingQuiz?.quizId || existingQuiz?.lessonQuizId || existingQuiz?.id;
      
      const lessonQuiz = {
        id: quizId || `quiz-${Date.now()}`,
        quizId: quizId, // Preserve the real UUID from server
        lessonQuizId: existingQuiz?.lessonQuizId,
        quizSettings: {
          id: existingQuiz?.quizSettings?.id,
          durationMinutes: settings.timeLimit,
          passingScorePercentage: settings.passingScore,
          shuffleQuestions: settings.shuffleQuestions,
          showResultsImmediately: settings.showResults,
          allowRetake: settings.allowRetake
        },
        questions: questions.map((q, idx) => ({
          id: q.id || `question-${idx}`,
          questionType: q.type === 'multiple-choice' ? 1 : q.type === 'true-false' ? 2 : 3,
          questionText: q.question,
          options: q.type === 'multiple-choice' ? q.options?.map((opt, optIdx) => ({
            id: `option-${idx}-${optIdx}`,
            text: opt,
            isCorrect: optIdx === q.correctAnswer
          })) : q.type === 'true-false' ? [
            { id: `option-${idx}-0`, text: 'Đúng', isCorrect: q.correctAnswer === 'true' },
            { id: `option-${idx}-1`, text: 'Sai', isCorrect: q.correctAnswer === 'false' }
          ] : undefined,
          explanation: q.explanation
        })),
        lastModified: Date.now()
      };

      // Update the lesson with quiz
      updateLesson(moduleIndex, lessonIndex, {
        ...lesson,
        lessonQuiz
      });

      // Mark quiz as edited so it will be sent in update API
      // Use quizId (the real UUID) for tracking
      const trackingId = lessonQuiz.quizId || lessonQuiz.id;
      if (trackingId) {
        markQuizAsEdited(trackingId);
      }

      setIsQuizBuilderOpen(false);
      setEditingVideoQuiz(null);
      setEditingModuleQuiz(null);
      message.success('Quiz đã được lưu vào video!');
      return;
    }

    // Create or edit module quiz (chapter quiz) - save to module.moduleQuiz
    // Use editingModuleQuiz if editing, otherwise use activeModuleId for new quiz
    let moduleIndex: number;
    
    if (editingModuleQuiz) {
      moduleIndex = editingModuleQuiz.moduleIndex;
    } else {
      if (activeModuleId === null) {
        message.warning('Vui lòng chọn chương để thêm nội dung');
        return;
      }
      
      // Find the module index from activeModuleId
      moduleIndex = modules.findIndex((m, index) =>
        m.id === activeModuleId || `module-${index}` === activeModuleId
      );
      
      if (moduleIndex === -1) {
        message.error('Không tìm thấy chương');
        return;
      }
    }

    const courseModule = modules[moduleIndex];

    // Convert QuizBuilder format to store format for moduleQuiz
    // IMPORTANT: Preserve quizId from server for update API to work
    const existingModuleQuiz = courseModule.moduleQuiz as { id?: string; quizId?: string; moduleQuizId?: string; quizSettings?: { id?: string } } | undefined;
    const moduleQuizId = existingModuleQuiz?.quizId || existingModuleQuiz?.moduleQuizId || existingModuleQuiz?.id;
    
    const moduleQuiz = {
      id: moduleQuizId || `module-quiz-${Date.now()}`,
      quizId: moduleQuizId, // Preserve the real UUID from server
      moduleQuizId: existingModuleQuiz?.moduleQuizId,
      quizSettings: {
        id: existingModuleQuiz?.quizSettings?.id,
        durationMinutes: settings.timeLimit,
        passingScorePercentage: settings.passingScore,
        shuffleQuestions: settings.shuffleQuestions,
        showResultsImmediately: settings.showResults,
        allowRetake: settings.allowRetake
      },
      questions: questions.map((q, idx) => ({
        id: q.id || `question-${idx}`,
        questionType: q.type === 'multiple-choice' ? 1 : q.type === 'true-false' ? 2 : 3,
        questionText: q.question,
        options: q.type === 'multiple-choice' ? q.options?.map((opt, optIdx) => ({
          id: `option-${idx}-${optIdx}`,
          text: opt,
          isCorrect: optIdx === q.correctAnswer
        })) : q.type === 'true-false' ? [
          { id: `option-${idx}-0`, text: 'Đúng', isCorrect: q.correctAnswer === 'true' },
          { id: `option-${idx}-1`, text: 'Sai', isCorrect: q.correctAnswer === 'false' }
        ] : undefined,
        explanation: q.explanation
      })),
      lastModified: Date.now()
    };

    // Save to module.moduleQuiz
    updateModule(moduleIndex, { moduleQuiz });
    
    // Mark quiz as edited so it will be sent in update API
    // Use quizId (the real UUID) for tracking
    const trackingModuleQuizId = moduleQuiz.quizId || moduleQuiz.id;
    if (trackingModuleQuizId) {
      markQuizAsEdited(trackingModuleQuizId);
    }
    
    setIsQuizBuilderOpen(false);
    setSelectedType(null);
    setEditingModuleQuiz(null);
    message.success('Bài kiểm tra chương đã được lưu thành công!');
  }, [activeModuleId, modules, editingVideoQuiz, editingModuleQuiz, updateLesson, updateModule]);

  // Handle quiz builder cancel
  const handleQuizCancel = useCallback(() => {
    setIsQuizBuilderOpen(false);
    setSelectedType(null);
    setEditingVideoQuiz(null);
    setEditingModuleQuiz(null);
  }, []);

  // Handle content editing
  const handleEditContent = useCallback((moduleId: string, item: CourseContentItem, moduleIndex?: number, lessonIndex?: number) => {
    // If editing a Quiz type
    if (item.type === ContentType.QUIZ) {
      // Check if it's a module quiz or lesson quiz
      if (item.metadata?.sourceType === 'moduleQuiz') {
        // Editing module quiz - find module index from moduleId
        const modIndex = modules.findIndex(m => m.id === moduleId);
        if (modIndex !== -1) {
          setEditingModuleQuiz({ moduleIndex: modIndex });
          setEditingVideoQuiz(null);
          setIsQuizBuilderOpen(true);
        }
      } else if (moduleIndex !== undefined && lessonIndex !== undefined) {
        // Editing lesson quiz
        setEditingVideoQuiz({ moduleIndex, lessonIndex, lessonId: item.id });
        setEditingModuleQuiz(null);
        setIsQuizBuilderOpen(true);
      }
      return;
    }

    setEditingItem(item);
    setSelectedType(item.type as ContentType);
    setIsModalOpen(true);
    setActiveModuleId(moduleId);
    
    // Set form values including description and question
    form.setFieldsValue({
      title: item.title,
      description: item.description || '',
      url: item.url || '',
      question: item.question || '' // For discussion type
    });
    
    // If editing a video, set the uploaded video URL to show the existing video
    if (item.type === ContentType.VIDEO && item.url) {
      setUploadedVideoUrl(item.url);
      // Set duration if available
      if (item.duration) {
        setAutoDetectedDuration(item.duration * 60); // Convert minutes to seconds
      }
    }
    
    // If editing a file/material, set the uploaded file URL
    if (item.type === ContentType.FILE && item.url) {
      setUploadedMaterialUrl(item.url);
    }
  }, [form, modules]);

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
  const SortableContentItem: FC<{ item: CourseContentItem; moduleId: string; moduleIndex: number; lessonIndex: number }> = ({ item, moduleId, moduleIndex, lessonIndex }) => {
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

    // Check if this video has a quiz
    const lesson = modules[moduleIndex]?.lessons[lessonIndex];
    const hasQuiz = lesson?.lessonQuiz && lesson.lessonQuiz.questions && lesson.lessonQuiz.questions.length > 0;

    // Handle opening quiz builder for this video
    const handleOpenQuizBuilder = (e: React.MouseEvent) => {
      e.stopPropagation();
      setEditingVideoQuiz({ moduleIndex, lessonIndex, lessonId: item.id });
      setIsQuizBuilderOpen(true);
    };

    // Handle delete with direct indices - supports lessons, discussions, materials, moduleQuiz
    const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      const sourceType = item.metadata?.sourceType;
      const sourceIndex = item.metadata?.sourceIndex as number | undefined;
      
      modal.confirm({
        title: 'Xác nhận xóa',
        content: 'Bạn có chắc chắn muốn xóa nội dung này?',
        okText: 'Xóa',
        cancelText: 'Hủy',
        okButtonProps: { danger: true },
        onOk: () => {
          const courseModule = modules[moduleIndex];
          
          if (sourceType === 'discussion' && sourceIndex !== undefined) {
            // Delete from discussions array
            const discussions = [...(courseModule.discussions || [])];
            discussions.splice(sourceIndex, 1);
            updateModule(moduleIndex, { discussions });
            message.success('Đã xóa câu hỏi thảo luận thành công!');
          } else if (sourceType === 'material' && sourceIndex !== undefined) {
            // Delete from materials array
            const materials = [...(courseModule.materials || [])];
            materials.splice(sourceIndex, 1);
            updateModule(moduleIndex, { materials });
            message.success('Đã xóa tài liệu thành công!');
          } else if (sourceType === 'moduleQuiz') {
            // Delete moduleQuiz
            updateModule(moduleIndex, { moduleQuiz: undefined });
            message.success('Đã xóa bài kiểm tra chương thành công!');
          } else {
            // Delete from lessons array (default for video/quiz)
            removeLesson(moduleIndex, lessonIndex);
            message.success('Đã xóa nội dung thành công!');
          }
        }
      });
    };

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
            flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br ${typeConfig?.gradient || 'from-gray-400 to-gray-600'}
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
                ${typeConfig?.color || 'bg-gray-500'} text-white
              `}>
                {typeConfig?.title || item.type}
              </span>
              {/* Show quiz badge if video has quiz */}
              {hasQuiz && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500 text-white">
                  <FaQuestionCircle className="mr-1 text-xs" />
                  Có Quiz
                </span>
              )}
            </div>
          </div>

          {/* Action buttons - always visible */}
          <div className="flex-shrink-0 flex items-center gap-1">
            {/* Quiz button for video - shows different color if has quiz */}
            {item.type === ContentType.VIDEO && (
              <button
                onClick={handleOpenQuizBuilder}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  hasQuiz 
                    ? 'text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30' 
                    : 'text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30'
                }`}
                title={hasQuiz ? "Xem/Sửa Quiz" : "Thêm Quiz"}
              >
                <FaQuestionCircle />
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); handleEditContent(moduleId, item, moduleIndex, lessonIndex); }}
              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-200"
              title="Chỉnh sửa"
            >
              <FaEdit />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200"
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
          label="Tiêu đề"
          rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
        >
          <Input placeholder="Nhập tiêu đề nội dung..." size="large" />
        </Form.Item>

        {/* Description - only show for non-video types */}
        {selectedType !== ContentType.VIDEO && (
          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea
              placeholder="Mô tả chi tiết về nội dung này..."
              rows={3}
              showCount
              maxLength={500}
            />
          </Form.Item>
        )}

        {/* Type-specific fields */}
        {selectedType === ContentType.VIDEO && (
          <>
            {/* Auto-detected duration display */}
            {autoDetectedDuration && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <FaClock className="text-sm" />
                  <span className="font-medium">
                    Thời lượng video: {Math.floor(autoDetectedDuration / 60)} phút {autoDetectedDuration % 60} giây
                  </span>
                </div>
              </div>
            )}

            <Form.Item label="Upload Video">
              {/* Hidden file input */}
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/x-msvideo,.mp4,.mov,.avi"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  // Validate file type
                  if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
                    message.error('Định dạng không hỗ trợ! Vui lòng chọn file MP4, MOV hoặc AVI.');
                    return;
                  }

                  // Validate file size
                  if (file.size > MAX_VIDEO_SIZE_BYTES) {
                    message.error(`Video quá lớn! Kích thước tối đa cho phép là ${MAX_VIDEO_SIZE_MB}MB.`);
                    return;
                  }

                  // Create preview URL
                  const previewUrl = URL.createObjectURL(file);
                  setVideoFile(file);
                  setVideoPreviewUrl(previewUrl);
                  setUploadedVideoUrl('');
                  setUploadProgress(0);

                  // Auto-extract video duration
                  try {
                    const duration = await extractVideoDuration(file);
                    setAutoDetectedDuration(duration);
                  } catch (error) {
                    console.error('Failed to extract video duration:', error);
                    setAutoDetectedDuration(null);
                  }
                }}
              />

              {/* Show upload area or preview */}
              {!videoFile && !uploadedVideoUrl && !videoPreviewUrl ? (
                <div
                  onClick={() => videoInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files[0];
                    if (file) {
                      if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
                        message.error('Định dạng không hỗ trợ! Vui lòng chọn file MP4, MOV hoặc AVI.');
                        return;
                      }
                      if (file.size > MAX_VIDEO_SIZE_BYTES) {
                        message.error(`Video quá lớn! Kích thước tối đa cho phép là ${MAX_VIDEO_SIZE_MB}MB.`);
                        return;
                      }
                      const previewUrl = URL.createObjectURL(file);
                      setVideoFile(file);
                      setVideoPreviewUrl(previewUrl);

                      // Auto-extract video duration
                      try {
                        const duration = await extractVideoDuration(file);
                        setAutoDetectedDuration(duration);
                      } catch (error) {
                        console.error('Failed to extract video duration:', error);
                        setAutoDetectedDuration(null);
                      }
                    }
                  }}
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-300"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <FaUpload className="text-2xl text-white" />
                    </div>
                    <div>
                      <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                        Kéo thả video vào đây hoặc click để chọn
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Hỗ trợ: MP4, MOV, AVI (tối đa {MAX_VIDEO_SIZE_MB}MB)
                      </p>
                    </div>
                  </div>
                </div>
              ) : isUploading ? (
                /* Uploading state */
                <div className="border-2 border-solid border-blue-300 dark:border-blue-700 rounded-xl p-6 bg-blue-50 dark:bg-blue-900/20">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <FaVideo className="text-2xl text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      Đang tải video lên...
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {videoFile?.name}
                    </p>
                    <Progress
                      percent={uploadProgress}
                      status="active"
                      strokeColor={{
                        '0%': '#3b82f6',
                        '100%': '#10b981',
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-3">
                      Vui lòng không đóng trang trong khi upload
                    </p>
                  </div>
                </div>
              ) : uploadedVideoUrl ? (
                /* Upload success state with video preview */
                <div className="border-2 border-solid border-green-300 dark:border-green-700 rounded-xl overflow-hidden bg-green-50 dark:bg-green-900/20">
                  <div className="p-4 border-b border-green-200 dark:border-green-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                        <FaCheckCircle className="text-white text-lg" />
                      </div>
                      <div>
                        <p className="font-semibold text-green-800 dark:text-green-200">
                          Video đã tải lên thành công!
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400 truncate max-w-xs">
                          {videoFile?.name}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="text"
                      danger
                      icon={<FaTimes />}
                      onClick={() => {
                        setVideoFile(null);
                        setVideoPreviewUrl('');
                        setUploadedVideoUrl('');
                        setAutoDetectedDuration(null);
                        form.setFieldsValue({ url: '' });
                        if (videoInputRef.current) {
                          videoInputRef.current.value = '';
                        }
                      }}
                    >
                      Xóa
                    </Button>
                  </div>
                  <div className="p-4">
                    <video
                      src={uploadedVideoUrl}
                      controls
                      className="w-full rounded-lg max-h-64 bg-black"
                      preload="metadata"
                    >
                      Trình duyệt không hỗ trợ video.
                    </video>
                  </div>
                </div>
              ) : videoPreviewUrl ? (
                /* Preview before upload state */
                <div className="border-2 border-solid border-orange-300 dark:border-orange-700 rounded-xl overflow-hidden bg-orange-50 dark:bg-orange-900/20">
                  <div className="p-4 border-b border-orange-200 dark:border-orange-800">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                          <FaPlay className="text-white text-sm ml-0.5" />
                        </div>
                        <div>
                          <p className="font-semibold text-orange-800 dark:text-orange-200">
                            Xem trước video
                          </p>
                          <p className="text-xs text-orange-600 dark:text-orange-400">
                            {videoFile?.name} ({(videoFile?.size || 0 / 1024 / 1024).toFixed(1)}MB)
                          </p>
                        </div>
                      </div>
                      <Button
                        type="text"
                        danger
                        icon={<FaTimes />}
                        onClick={() => {
                          if (videoPreviewUrl) {
                            URL.revokeObjectURL(videoPreviewUrl);
                          }
                          setVideoFile(null);
                          setVideoPreviewUrl('');
                          setAutoDetectedDuration(null);
                          if (videoInputRef.current) {
                            videoInputRef.current.value = '';
                          }
                        }}
                      >
                        Hủy
                      </Button>
                    </div>
                    {/* Video Preview */}
                    <video
                      src={videoPreviewUrl}
                      controls
                      className="w-full rounded-lg max-h-48 bg-black"
                      preload="metadata"
                    >
                      Trình duyệt không hỗ trợ video.
                    </video>
                  </div>
                  <div className="p-4 flex gap-3">
                    <Button
                      type="default"
                      icon={<FaRedo />}
                      onClick={() => videoInputRef.current?.click()}
                      className="flex-1"
                    >
                      Chọn video khác
                    </Button>
                    <Button
                      type="primary"
                      icon={<FaUpload />}
                      loading={isUploading}
                      onClick={async () => {
                        if (!videoFile) return;
                        
                        setIsUploading(true);
                        setUploadProgress(0);
                        
                        // Simulate progress
                        const progressInterval = setInterval(() => {
                          setUploadProgress(prev => {
                            if (prev >= 90) {
                              clearInterval(progressInterval);
                              return prev;
                            }
                            return prev + Math.random() * 10;
                          });
                        }, 500);
                        
                        try {
                          // Use uploadVideosUtility for streaming video format (.m3u8)
                          const url = await courseServiceAPI.uploadVideosUtility(videoFile);
                          clearInterval(progressInterval);
                          setUploadProgress(100);
                          
                          // Cleanup preview URL
                          if (videoPreviewUrl) {
                            URL.revokeObjectURL(videoPreviewUrl);
                          }
                          
                          setUploadedVideoUrl(url);
                          setVideoPreviewUrl('');
                          form.setFieldsValue({ url });
                          message.success('Tải video thành công! Video đang được xử lý để phát streaming.');
                        } catch (error) {
                          clearInterval(progressInterval);
                          console.error('[CourseContent] Video upload failed:', error);
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          const e = error as any;
                          if (e?.response?.status === 413 || e?.message?.includes('413')) {
                            message.error('Video quá lớn. Vui lòng chọn file nhỏ hơn 300MB.');
                          } else {
                            message.error(`Tải video thất bại: ${e?.message || 'Vui lòng thử lại.'}`);
                          }
                        } finally {
                          setIsUploading(false);
                        }
                      }}
                      className="flex-1"
                    >
                      Tải lên
                    </Button>
                  </div>
                </div>
              ) : null}
            </Form.Item>
          </>
        )}

        {selectedType === ContentType.FILE && (
          <Form.Item label="Upload File">
            {/* Show uploaded file if exists */}
            {uploadedMaterialUrl ? (
              <div className="border-2 border-solid border-green-300 dark:border-green-700 rounded-xl p-4 bg-green-50 dark:bg-green-900/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                      <FaCheckCircle className="text-white text-lg" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-800 dark:text-green-200">
                        File đã được tải lên
                      </p>
                      <a 
                        href={uploadedMaterialUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-green-600 dark:text-green-400 hover:underline truncate max-w-xs block"
                      >
                        {uploadedMaterialUrl.split('/').pop() || 'Xem file'}
                      </a>
                    </div>
                  </div>
                  <Button
                    type="text"
                    danger
                    icon={<FaTimes />}
                    onClick={() => {
                      setUploadedMaterialUrl('');
                    }}
                  >
                    Xóa
                  </Button>
                </div>
              </div>
            ) : isMaterialUploading ? (
              <div className="border-2 border-solid border-blue-300 dark:border-blue-700 rounded-xl p-6 bg-blue-50 dark:bg-blue-900/20">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-3 animate-pulse">
                    <FaFile className="text-xl text-white" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Đang tải file lên...
                  </p>
                  <Progress percent={materialUploadProgress} status="active" />
                </div>
              </div>
            ) : (
              <Upload.Dragger
                name="file"
                multiple={false}
                showUploadList={false}
                className="hover:border-blue-400 transition-colors duration-200"
                beforeUpload={async (file) => {
                  setIsMaterialUploading(true);
                  setMaterialUploadProgress(0);
                  
                  // Simulate progress
                  const progressInterval = setInterval(() => {
                    setMaterialUploadProgress(prev => {
                      if (prev >= 90) {
                        clearInterval(progressInterval);
                        return prev;
                      }
                      return prev + Math.random() * 15;
                    });
                  }, 300);
                  
                  try {
                    // Use uploadDocuments API
                    const url = await courseServiceAPI.uploadDocuments(file);
                    clearInterval(progressInterval);
                    setMaterialUploadProgress(100);
                    setUploadedMaterialUrl(url);
                    message.success('Tải file thành công!');
                  } catch (error) {
                    clearInterval(progressInterval);
                    console.error('File upload failed:', error);
                    message.error('Tải file thất bại. Vui lòng thử lại.');
                  } finally {
                    setIsMaterialUploading(false);
                  }
                  
                  return false; // Prevent default upload
                }}
              >
                <p className="ant-upload-drag-icon">
                  <FaFile className="text-4xl text-purple-500 mx-auto" />
                </p>
                <p className="ant-upload-text text-lg font-medium">
                  Kéo thả file vào đây hoặc click để chọn
                </p>
                <p className="ant-upload-hint text-gray-500">
                  Hỗ trợ: PDF, DOC, PPT, XLS, TXT, ZIP
                </p>
              </Upload.Dragger>
            )}
          </Form.Item>
        )}



        {selectedType === ContentType.QUESTION && (
          <Form.Item
            name="question"
            label="Câu hỏi thảo luận"
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
      <App>
      <FadeInUp>
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Nội dung khóa học</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Thêm video, quiz, và tài liệu để hoàn thiện khóa học của bạn.</p>
          </div>
        </div>

        {/* Modules Collapse */}
        <div className="space-y-4">
          {modules.map((module, moduleIndex) => {
            const items = getModuleItems(moduleIndex);
            return (
              <div key={module.id || `module-${moduleIndex}`} className="bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 transition-shadow hover:shadow-sm">
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">{module.moduleName}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{items.length} nội dung</p>
                  </div>
                  <Button icon={<FaPlus />} onClick={() => { setActiveModuleId(module.id || `module-${moduleIndex}`); setIsModalOpen(true); setSelectedType(null); }}>
                    Thêm nội dung
                  </Button>
                </div>
                <div className="px-4 pb-4">
                  {items.length > 0 ? (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, moduleIndex)}>
                      <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
                          {items.sort((a, b) => a.order - b.order).map((it, idx) => {
                            // Find actual lesson index in the module
                            const lessonIdx = modules[moduleIndex].lessons.findIndex(l => 
                              l.id === it.id || `lesson-${modules[moduleIndex].lessons.indexOf(l)}` === it.id
                            );
                            return (
                              <SortableContentItem 
                                key={it.id} 
                                item={it} 
                                moduleId={module.id || `module-${moduleIndex}`}
                                moduleIndex={moduleIndex}
                                lessonIndex={lessonIdx !== -1 ? lessonIdx : idx}
                              />
                            );
                          })}
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
          <Button icon={<FaArrowLeft />} onClick={() => {
            const container = document.getElementById('create-course-content');
            if (container) {
              container.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            setCurrentStep(1);
          }} size="large">Quay lại</Button>
          <Button type="primary" icon={<FaArrowRight />} onClick={() => {
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
          title={editingItem ? 'Chỉnh sửa nội dung' : 'Thêm nội dung mới'}
          open={isModalOpen}
          onCancel={() => { 
            setIsModalOpen(false); 
            setEditingItem(null); 
            form.resetFields(); 
            setSelectedType(null);
            // Reset video upload state
            if (videoPreviewUrl) {
              URL.revokeObjectURL(videoPreviewUrl);
            }
            setVideoFile(null);
            setVideoPreviewUrl('');
            setUploadedVideoUrl('');
            setUploadProgress(0);
            setIsUploading(false);
            setAutoDetectedDuration(null);
            // Reset material upload state
            setUploadedMaterialUrl('');
            setMaterialUploadProgress(0);
            setIsMaterialUploading(false);
          }}
          footer={null}
          width={selectedType ? 600 : 800}
          destroyOnHidden
        >
          {!selectedType ? (
            <div className="p-4">
              <h3 className="text-center text-lg font-semibold mb-6">Chọn loại nội dung bạn muốn thêm</h3>
              {renderContentTypeSelector()}
            </div>
          ) : (
            <Form form={form} layout="vertical" onFinish={handleSubmitContent}>
              {renderModalContent()}
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button onClick={() => { 
                  setIsModalOpen(false); 
                  setEditingItem(null); 
                  form.resetFields(); 
                  setSelectedType(null);
                  // Reset video upload state
                  if (videoPreviewUrl) {
                    URL.revokeObjectURL(videoPreviewUrl);
                  }
                  setVideoFile(null);
                  setVideoPreviewUrl('');
                  setUploadedVideoUrl('');
                  setUploadProgress(0);
                  setIsUploading(false);
                  setAutoDetectedDuration(null);
                  // Reset material upload state
                  setUploadedMaterialUrl('');
                  setMaterialUploadProgress(0);
                  setIsMaterialUploading(false);
                }}>Hủy</Button>
                <Button type="primary" htmlType="submit">{editingItem ? 'Cập nhật' : 'Thêm nội dung'}</Button>
              </div>
            </Form>
          )}
        </Modal>

        {/* Quiz Builder Modal */}
        <Modal
          title={editingVideoQuiz ? "Quiz cho Video" : editingModuleQuiz ? "Bài Kiểm Tra Chương" : "Tạo Bài Kiểm Tra"}
          open={isQuizBuilderOpen}
          onCancel={handleQuizCancel}
          footer={null}
          width={900}
          destroyOnHidden
        >
          <QuizBuilder 
            key={editingVideoQuiz ? `quiz-${editingVideoQuiz.lessonId}` : editingModuleQuiz ? `module-quiz-${editingModuleQuiz.moduleIndex}` : 'new-quiz'}
            initialQuestions={editingVideoQuiz ? (() => {
              const lesson = modules[editingVideoQuiz.moduleIndex]?.lessons[editingVideoQuiz.lessonIndex];
              if (!lesson?.lessonQuiz?.questions) return [];
              return lesson.lessonQuiz.questions.map(q => ({
                id: q.id || `q-${Date.now()}`,
                question: q.questionText || '',
                type: q.questionType === 1 ? 'multiple-choice' as const : q.questionType === 2 ? 'true-false' as const : 'short-answer' as const,
                options: q.options?.map(o => o.text || '') || [],
                correctAnswer: q.questionType === 2 
                  ? (q.options?.find(o => o.isCorrect)?.text === 'Đúng' ? 'true' : 'false')
                  : (q.options?.findIndex(o => o.isCorrect) ?? 0),
                explanation: q.explanation,
                points: 1
              }));
            })() : editingModuleQuiz ? (() => {
              const courseModule = modules[editingModuleQuiz.moduleIndex];
              if (!courseModule?.moduleQuiz?.questions) return [];
              return courseModule.moduleQuiz.questions.map(q => ({
                id: q.id || `q-${Date.now()}`,
                question: q.questionText || '',
                type: q.questionType === 1 ? 'multiple-choice' as const : q.questionType === 2 ? 'true-false' as const : 'short-answer' as const,
                options: q.options?.map(o => o.text || '') || [],
                correctAnswer: q.questionType === 2 
                  ? (q.options?.find(o => o.isCorrect)?.text === 'Đúng' ? 'true' : 'false')
                  : (q.options?.findIndex(o => o.isCorrect) ?? 0),
                explanation: q.explanation,
                points: 1
              }));
            })() : []}
            initialSettings={editingVideoQuiz ? (() => {
              const lesson = modules[editingVideoQuiz.moduleIndex]?.lessons[editingVideoQuiz.lessonIndex];
              const settings = lesson?.lessonQuiz?.quizSettings;
              return {
                timeLimit: settings?.durationMinutes,
                passingScore: settings?.passingScorePercentage,
                shuffleQuestions: settings?.shuffleQuestions,
                showResults: settings?.showResultsImmediately,
                allowRetake: settings?.allowRetake
              };
            })() : editingModuleQuiz ? (() => {
              const courseModule = modules[editingModuleQuiz.moduleIndex];
              const settings = courseModule?.moduleQuiz?.quizSettings;
              return {
                timeLimit: settings?.durationMinutes,
                passingScore: settings?.passingScorePercentage,
                shuffleQuestions: settings?.shuffleQuestions,
                showResults: settings?.showResultsImmediately,
                allowRetake: settings?.allowRetake
              };
            })() : {}}
            onSave={handleQuizSave} 
            onCancel={handleQuizCancel} 
          />
        </Modal>
      </FadeInUp>
      </App>
    </ConfigProvider>
  );
};

export default CourseContent;

