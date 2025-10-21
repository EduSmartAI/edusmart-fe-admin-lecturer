/**
 * Module Accordion Component
 * 
 * Displays a module container with header, content count, and action buttons
 * Contains the lesson list and handles content addition
 */

import React, { FC } from 'react';
import { FaPlus, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { Button } from 'antd';
import { CourseModule, CourseContentItem } from 'EduSmart/stores/CreateCourse/CreateCourseStore';
import { LessonList } from './LessonList';
import { DragEndEvent } from '@dnd-kit/core';

interface ModuleAccordionProps {
  module: CourseModule;
  moduleIndex: number;
  items: CourseContentItem[];
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onAddContent: (moduleId: string) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onEditItem: (moduleId: string, item: CourseContentItem) => void;
  onDeleteItem: (moduleId: string, itemId: string) => void;
  onAddQuiz: (moduleId: string, item: CourseContentItem) => void;
}

export const ModuleAccordion: FC<ModuleAccordionProps> = ({
  module,
  moduleIndex,
  items,
  isExpanded = true,
  onToggleExpand,
  onAddContent,
  onDragEnd,
  onEditItem,
  onDeleteItem,
  onAddQuiz,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 mb-4 overflow-hidden transition-all duration-300">
      {/* Module Header */}
      <div className="p-4 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-gray-200 dark:border-gray-700">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-semibold text-sm">
              {moduleIndex + 1}
            </span>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                {module.moduleName}
              </h3>
              {module.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  {module.description}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {items.length} nội dung
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="primary"
            icon={<FaPlus />}
            onClick={() => onAddContent(module.id || '')}
            className="bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700"
          >
            Thêm nội dung
          </Button>
          
          {onToggleExpand && (
            <Button
              type="text"
              icon={isExpanded ? <FaChevronUp /> : <FaChevronDown />}
              onClick={onToggleExpand}
              className="text-gray-600 dark:text-gray-400"
            />
          )}
        </div>
      </div>

      {/* Module Content */}
      {isExpanded && (
        <div className="p-4">
          <LessonList
            items={items}
            moduleId={module.id || ''}
            onDragEnd={onDragEnd}
            onEdit={onEditItem}
            onDelete={onDeleteItem}
            onAddQuiz={onAddQuiz}
          />
        </div>
      )}
    </div>
  );
};

export default ModuleAccordion;
