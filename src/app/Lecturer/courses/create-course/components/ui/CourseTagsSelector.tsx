'use client';
/* eslint-disable */
import { FC, useState } from 'react';
import { Select, Tag, Typography } from 'antd';
import { FaInfoCircle } from 'react-icons/fa';
import { useCreateCourseStore } from 'EduSmart/stores/CreateCourse/CreateCourseStore';
import type { CourseTag } from 'EduSmart/stores/CreateCourse/CreateCourseStore';
import { PREDEFINED_COURSE_TAGS, getTagIdByName } from 'EduSmart/constants/courseTags';
import { useEffect, useMemo } from 'react';

const { Text } = Typography;

interface CourseTagsSelectorProps {
  placeholder?: string;
  maxTags?: number;
  suggestions?: string[];
}

const CourseTagsSelector: FC<CourseTagsSelectorProps> = ({
  placeholder = "Nhập và chọn tags...",
  maxTags = 10,
  suggestions = []
}) => {
  const { courseTags, addTag, updateTags } = useCreateCourseStore();
  const [inputValue, setInputValue] = useState('');
  const [isClient, setIsClient] = useState(false);

  // Fix hydration mismatch by ensuring client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Use predefined course tags from constants
  const predefinedTags = useMemo(() => PREDEFINED_COURSE_TAGS, []);

  // Additional suggestions for free-form tags
  const additionalSuggestions = useMemo(() => [
    'JavaScript', 'TypeScript', 'Node.js', 'Python', 'C#',
    'HTML', 'CSS', 'Bootstrap', 'Tailwind CSS', 'Vue.js', 'Angular',
    'Express.js', 'Spring Boot', 'Django', 'Flask', 'MongoDB', 'MySQL',
    'PostgreSQL', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'Azure',
    'Git', 'GitHub', 'API', 'REST', 'GraphQL', 'Microservices',
    'Mobile Development', 'React Native', 'Flutter',
    'Web Development', 'Frontend', 'Backend', 'Full Stack',
    'Testing', 'Unit Testing', 'Integration Testing',
    'Agile', 'Scrum', 'Project Management', 'Software Architecture'
  ], []);

  // Combine predefined tag names with additional suggestions
  const defaultSuggestions = useMemo(() => [
    ...predefinedTags.map(tag => tag.tagName),
    ...additionalSuggestions
  ], [predefinedTags, additionalSuggestions]);

  const ___unused = [...new Set([...suggestions, ...defaultSuggestions])];

  // Convert CourseTag[] to string[] for the Select component
  const tagNames = useMemo(() => 
    courseTags.map(tag => tag.tagName || `Tag ${tag.tagId}`),
    [courseTags]
  );

  // Get tagId for a tag name (use predefined ID if available, otherwise generate)
  const getTagId = (tagName: string): number => {
    // Check if this is a predefined tag
    const predefinedId = getTagIdByName(tagName);
    if (predefinedId !== null) {
      return predefinedId;
    }
    
    // Generate ID for custom tags (starting from 1000 to avoid conflicts)
    let hash = 0;
    for (let i = 0; i < tagName.length; i++) {
      const char = tagName.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) + 1000; // Add 1000 to avoid conflicts with predefined IDs
  };

  const handleChange = (newTagNames: string[]) => {
    if (newTagNames.length <= maxTags) {
      // Convert string[] back to CourseTag[]
      const newTags: CourseTag[] = newTagNames.map(tagName => {
        // Check if tag already exists
        const existingTag = courseTags.find(tag => tag.tagName === tagName);
        if (existingTag) {
          return existingTag;
        }
        
        // Create new tag
        return {
          tagId: getTagId(tagName),
          tagName: tagName
        };
      });
      
      updateTags(newTags);
    }
  };

  const handleSearch = (searchValue: string) => {
    setInputValue(searchValue);
  };

  // Filter and prioritize predefined tags
  const filteredOptions = useMemo(() => {
    const predefinedMatches = predefinedTags
      .filter(tag => 
        !tagNames.includes(tag.tagName) && 
        tag.tagName.toLowerCase().includes(inputValue.toLowerCase())
      )
      .map(tag => tag.tagName);
    
    const additionalMatches = additionalSuggestions
      .filter(tag => 
        !tagNames.includes(tag) && 
        tag.toLowerCase().includes(inputValue.toLowerCase())
      );
    
    return [...predefinedMatches, ...additionalMatches].slice(0, 20);
  }, [predefinedTags, tagNames, inputValue, additionalSuggestions]);

  const handleSuggestionClick = (tagName: string) => {
    if (courseTags.length < maxTags) {
      const newTag: CourseTag = {
        tagId: getTagId(tagName),
        tagName: tagName
      };
      addTag(newTag);
    }
  };

  // Prevent hydration mismatch
  if (!isClient) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Tags khóa học
            <span className="text-red-500 ml-1">*</span>
          </label>
        </div>
        <div className="w-full h-10 bg-gray-100 dark:bg-gray-800 animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Tags khóa học
          <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="group relative">
          <FaInfoCircle className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help" />
          <div className="absolute left-6 top-0 w-80 p-3 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none">
            Thêm các từ khóa liên quan đến khóa học để học viên dễ tìm thấy. Tối đa {maxTags} tags.
          </div>
        </div>
      </div>

      <Select
        mode="tags"
        value={tagNames}
        onChange={handleChange}
        onSearch={handleSearch}
        placeholder={placeholder}
        size="large"
        className="w-full"
        maxTagCount="responsive"
        tokenSeparators={[',', ' ']}
        options={filteredOptions.map(tag => ({ label: tag, value: tag }))}
        filterOption={false}
        notFoundContent={
          inputValue ? (
            <div className="p-2 text-center text-gray-500">
              Nhấn Enter để thêm &quot;{inputValue}&quot; như tag mới
            </div>
          ) : (
            <div className="p-2 text-center text-gray-500">
              Nhập để tìm kiếm hoặc thêm tag mới
            </div>
          )
        }
        tagRender={(props) => {
          const { label, closable, onClose } = props;
          return (
            <Tag
              color="blue"
              closable={closable}
              onClose={onClose}
              className="m-1 px-2 py-1 text-sm"
            >
              {label}
            </Tag>
          );
        }}
      />

      {/* Selected tags count */}
      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
        <span>Đã chọn: {courseTags.length}/{maxTags} tags</span>
        {courseTags.length >= maxTags && (
          <span className="text-orange-500">Đã đạt giới hạn tối đa</span>
        )}
      </div>

      {/* Popular tags suggestion */}
      {courseTags.length === 0 && (
        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <Text className="text-sm text-blue-700 dark:text-blue-300 font-medium">
            💡 Danh mục khóa học phổ biến:
          </Text>
          <div className="mt-2 flex flex-wrap gap-1">
            {predefinedTags.map(tag => (
              <Tag
                key={tag.tagId}
                className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                onClick={() => handleSuggestionClick(tag.tagName)}
              >
                {tag.tagName}
              </Tag>
            ))}
          </div>
          
          {additionalSuggestions.length > 0 && (
            <>
              <Text className="text-sm text-blue-700 dark:text-blue-300 font-medium mt-3 block">
                🏷️ Tags bổ sung:
              </Text>
              <div className="mt-2 flex flex-wrap gap-1">
                {additionalSuggestions.slice(0, 8).map(tag => (
                  <Tag
                    key={tag}
                    className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                    onClick={() => handleSuggestionClick(tag)}
                  >
                    {tag}
                  </Tag>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseTagsSelector;