/**
 * Lesson List Component
 * 
 * Displays a list of lessons with drag-and-drop reordering
 * Supports video lessons, quizzes, and other content types
 */

import React, { FC } from 'react';
import {
  FaVideo,
  FaQuestionCircle,
  FaClipboardList,
  FaFile,
  FaEdit,
  FaTrash,
  FaGripVertical,
  FaClock,
  FaCheckCircle
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
import { CourseContentItem } from 'EduSmart/stores/CreateCourse/CreateCourseStore';

enum ContentType {
  VIDEO = 'video',
  QUIZ = 'quiz',
  QUESTION = 'question',
  FILE = 'file'
}

interface ContentTypeConfig {
  type: ContentType;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: string;
  gradient: string;
  lightBg: string;
  darkBg: string;
  borderColor: string;
}

const contentTypes: ContentTypeConfig[] = [
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

interface SortableItemProps {
  item: CourseContentItem;
  moduleId: string;
  onEdit: (moduleId: string, item: CourseContentItem) => void;
  onDelete: (moduleId: string, itemId: string) => void;
  onAddQuiz: (moduleId: string, item: CourseContentItem) => void;
}

const SortableContentItem: FC<SortableItemProps> = ({ 
  item, 
  moduleId, 
  onEdit, 
  onDelete,
  onAddQuiz 
}) => {
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
          <span className="absolute left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover/handle:opacity-100 text-xs text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
            Kéo để sắp xếp
          </span>
        </div>

        {/* Content icon */}
        <div className={`
          flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br ${typeConfig?.gradient}
          flex items-center justify-center text-white
        `}>
          <IconComponent className="text-lg" />
        </div>

        {/* Content info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1 truncate">
            {item.title}
          </h4>
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <IconComponent className="text-xs" />
              {typeConfig?.title || 'Nội dung'}
            </span>
            {item.duration && (
              <span className="flex items-center gap-1">
                <FaClock className="text-xs" />
                {item.duration} phút
              </span>
            )}
            {item.metadata && 
             typeof item.metadata === 'object' && 
             'hasQuiz' in item.metadata && 
             Boolean(item.metadata.hasQuiz) && (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <FaCheckCircle className="text-xs" />
                Có quiz
              </span>
            )}
          </div>
          {item.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
              {item.description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {item.type === ContentType.VIDEO && 
           !(item.metadata && typeof item.metadata === 'object' && 'hasQuiz' in item.metadata && item.metadata.hasQuiz) && (
            <button
              onClick={() => onAddQuiz(moduleId, item)}
              className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
              title="Thêm quiz"
            >
              <FaClipboardList />
            </button>
          )}
          <button
            onClick={() => onEdit(moduleId, item)}
            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Chỉnh sửa"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => onDelete(moduleId, item.id)}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Xóa"
          >
            <FaTrash />
          </button>
        </div>
      </div>
    </div>
  );
};

interface LessonListProps {
  items: CourseContentItem[];
  moduleId: string;
  onDragEnd: (event: DragEndEvent) => void;
  onEdit: (moduleId: string, item: CourseContentItem) => void;
  onDelete: (moduleId: string, itemId: string) => void;
  onAddQuiz: (moduleId: string, item: CourseContentItem) => void;
}

export const LessonList: FC<LessonListProps> = ({
  items,
  moduleId,
  onDragEnd,
  onEdit,
  onDelete,
  onAddQuiz,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (items.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-md">
        <p className="text-gray-500 dark:text-gray-400">
          Chưa có nội dung nào. Bấm &quot;Thêm nội dung&quot; để bắt đầu.
        </p>
      </div>
    );
  }

  const sortedItems = [...items].sort((a, b) => a.order - b.order);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={sortedItems.map(i => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {sortedItems.map((item) => (
            <SortableContentItem
              key={item.id}
              item={item}
              moduleId={moduleId}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddQuiz={onAddQuiz}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default LessonList;
