'use client';
import { FC, useState, useCallback, useMemo, useEffect } from 'react';
import { ConfigProvider, theme, message, Modal, Form, Input, Button, Upload, InputNumber } from 'antd';
import { useTheme } from 'EduSmart/Provider/ThemeProvider';
import { useCreateCourseStore, CourseContentItem } from 'EduSmart/stores/CreateCourse/CreateCourseStore';
import { FadeInUp } from 'EduSmart/components/Animation/FadeInUp';

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
import { courseServiceAPI } from 'EduSmart/api/api-course-service';
import { CloudinaryVideoUpload } from 'EduSmart/components/Common/FileUpload';

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
  const store = useCreateCourseStore();
  const { setCurrentStep, modules, updateModule, addLesson, updateLesson, removeLesson } = store;
  
  // State management
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Force re-render trigger

  // Helper to get lessons for a module (mapped from new store structure)
  const getModuleItems = useCallback((moduleIndex: number): CourseContentItem[] => {
    const courseModule = modules[moduleIndex];
    if (!courseModule) return [];
    
    // Convert lessons to CourseContentItem format for backward compatibility
    return courseModule.lessons.map((lesson, index) => {
      // Determine content type based on lesson properties
      let contentType: ContentType = ContentType.VIDEO; // Default
      
      if (lesson.title.toLowerCase().includes('kiểm tra') || lesson.title.toLowerCase().includes('quiz')) {
        contentType = ContentType.QUIZ;
      } else if (lesson.title.toLowerCase().includes('thảo luận') || lesson.title.toLowerCase().includes('câu hỏi')) {
        contentType = ContentType.QUESTION;
      } else if (lesson.title.toLowerCase().includes('tài liệu') || lesson.title.toLowerCase().includes('file')) {
        contentType = ContentType.FILE;
      } else if (lesson.videoUrl && lesson.videoUrl.trim() !== '') {
        contentType = ContentType.VIDEO;
      }
      
      return {
        id: lesson.id || `lesson-${index}`,
        type: contentType,
        title: lesson.title,
        description: '',
        duration: lesson.videoDurationSec ? Math.round(lesson.videoDurationSec / 60) : undefined,
        url: lesson.videoUrl,
        order: lesson.positionIndex || index,
        metadata: {}
      };
    });
  }, [modules, refreshKey]);

  const totalContentCount = useMemo(() => 
    modules.reduce((acc, module) => acc + module.lessons.length, 0)
  , [modules]);
  const [selectedType, setSelectedType] = useState<ContentType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuizBuilderOpen, setIsQuizBuilderOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CourseContentItem | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{moduleId: string, itemId: string} | null>(null);
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

      const newLesson = {
        id: editingItem?.id,
        title: values.title,
        videoUrl: values.url || '',
        videoDurationSec: values.duration ? values.duration * 60 : undefined, // Convert minutes to seconds
        positionIndex: editingItem?.order ?? modules[moduleIndex].lessons.length,
        isActive: true
      };

      if (editingItem) {
        // Find lesson index and update
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

      setIsModalOpen(false);
      setEditingItem(null);
      form.resetFields();
      message.success(`Bài học đã được ${editingItem ? 'cập nhật' : 'thêm'} thành công!`);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  }, [form, activeModuleId, modules, editingItem, updateLesson, addLesson]);

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

    // Create quiz title that will be detected as quiz type
    const quizCount = modules[moduleIndex].lessons.filter(l => 
      l.title.toLowerCase().includes('kiểm tra') || l.title.toLowerCase().includes('quiz')
    ).length + 1;

    const newQuizLesson = {
      id: editingItem?.id || `quiz-${Date.now()}`, // Ensure unique ID for quizzes
      title: editingItem ? editingItem.title : `Bài kiểm tra ${quizCount}`,
      videoUrl: '', // Quiz doesn't have video
      videoDurationSec: settings.timeLimit ? settings.timeLimit * 60 : undefined,
      positionIndex: editingItem?.order ?? modules[moduleIndex].lessons.length,
      isActive: true
    };

    if (editingItem) {
      // Update existing quiz
      const lessonIndex = modules[moduleIndex].lessons.findIndex((l, index) => 
        l.id === editingItem.id || `lesson-${index}` === editingItem.id
      );
      if (lessonIndex !== -1) {
        updateLesson(moduleIndex, lessonIndex, newQuizLesson);
        message.success('Bài kiểm tra đã được cập nhật thành công!');
      }
    } else {
      // Add new quiz
      addLesson(moduleIndex, newQuizLesson);
      message.success('Bài kiểm tra đã được tạo thành công!');
    }

    setIsQuizBuilderOpen(false);
    setSelectedType(null);
    setEditingItem(null);
  }, [activeModuleId, modules, addLesson, editingItem, updateLesson]);

  // Handle quiz builder cancel
  const handleQuizCancel = useCallback(() => {
    setIsQuizBuilderOpen(false);
    setSelectedType(null);
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

    // Find the lesson index from itemId  
    const lessonIndex = targetModule.lessons.findIndex((l, index) => {
      const currentLessonId = l.id || `lesson-${index}`;
      return currentLessonId === itemId;
    });
    
    if (lessonIndex === -1) {
      message.error('Không tìm thấy bài học');
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      return;
    }

    // Call the store method
    removeLesson(moduleIndex, lessonIndex);
    
    // Force component re-render
    setRefreshKey(prev => prev + 1);
    
    message.success('Đã xóa nội dung thành công');
    
    // Close modal
    setDeleteModalOpen(false);
    setDeleteTarget(null);
  }, [deleteTarget, modules, removeLesson]);

  // Handle content editing
  const handleEditContent = useCallback((moduleId: string, item: CourseContentItem) => {
    setEditingItem(item);
    setActiveModuleId(moduleId);
    
    const contentType = item.type as ContentType;
    setSelectedType(contentType);
    
    // Handle quiz editing differently
    if (contentType === ContentType.QUIZ) {
      setIsQuizBuilderOpen(true);
      // TODO: Load existing quiz data into QuizBuilder if needed
    } else {
      setIsModalOpen(true);
      form.setFieldsValue({
        title: item.title,
        description: item.description,
        duration: item.duration,
        url: item.url,
        question: item.metadata?.question || ''
      });
    }
  }, [form]);

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
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex-shrink-0 flex items-center gap-2 opacity-100 transition-opacity duration-200">
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

        {/* Type-specific fields */}
        {selectedType === ContentType.VIDEO && (
          <>
            <Form.Item
              name="duration"
              label="Thời lượng (phút)"
              rules={[{ required: true, message: 'Vui lòng nhập thời lượng!' }]}
            >
              <InputNumber 
                placeholder="30"
                min={1}
                max={480}
                style={{ width: '100%' }}
                size="large"
              />
            </Form.Item>
            
            <Form.Item name="url" label="Upload Video" valuePropName="value">
              <CloudinaryVideoUpload maxSizeMB={512} dragger />
            </Form.Item>
          </>
        )}

        {selectedType === ContentType.FILE && (
          <Form.Item label="Upload File">
            <Upload.Dragger
              name="file"
              multiple
              className="hover:border-blue-400 transition-colors duration-200"
            >
              <p className="ant-upload-drag-icon">
                <FaFile className="text-4xl text-purple-500" />
              </p>
              <p className="ant-upload-text text-lg font-medium">
                Kéo thả file vào đây hoặc click để chọn
              </p>
              <p className="ant-upload-hint text-gray-500">
                Hỗ trợ: PDF, DOC, PPT, XLS, TXT, ZIP
              </p>
            </Upload.Dragger>
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
          onCancel={() => { setIsModalOpen(false); setEditingItem(null); form.resetFields(); setSelectedType(null); }}
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
                        <Button onClick={() => { setIsModalOpen(false); setEditingItem(null); form.resetFields(); setSelectedType(null); }}>Hủy</Button>
                        <Button type="primary" htmlType="submit">{editingItem ? 'Cập nhật' : 'Thêm nội dung'}</Button>
                    </div>
                </Form>
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
          <QuizBuilder onSave={handleQuizSave} onCancel={handleQuizCancel} />
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

