'use client';
import { FC, useState } from 'react';
import { Select, Tag, Typography } from 'antd';
import { FaInfoCircle } from 'react-icons/fa';

const { Text } = Typography;

// Define tag structure with ID and name
interface CourseTag {
  tagId: number;
  tagName: string;
}

interface TagsSelectorProps {
  value?: CourseTag[];
  onChange?: (value: CourseTag[]) => void;
  placeholder?: string;
  maxTags?: number;
}

const TagsSelector: FC<TagsSelectorProps> = ({
  value = [],
  onChange,
  placeholder = "Nhập và chọn tags...",
  maxTags = 10
}) => {
  const [inputValue, setInputValue] = useState('');

  // Hardcoded course tags based on system requirements with IDs
  const availableTags: CourseTag[] = [
    { tagId: 1, tagName: 'Software Engineering' },
    { tagId: 2, tagName: '.NET' },
    { tagId: 3, tagName: 'Java' },
    { tagId: 4, tagName: 'ReactJS' },
    { tagId: 5, tagName: 'Android (Kotlin)' },
    { tagId: 6, tagName: 'iOS (Swift)' },
    { tagId: 7, tagName: 'DevOps' },
    { tagId: 8, tagName: 'Data Engineering' },
    { tagId: 9, tagName: 'Artificial Intelligence' },
    { tagId: 10, tagName: 'Cyber Security' },
    { tagId: 11, tagName: 'AI & Machine Learning' }
  ];

  const handleChange = (selectedTagNames: string[]) => {
    if (selectedTagNames.length <= maxTags) {
      // Convert tag names back to CourseTag objects with IDs
      const selectedTags = selectedTagNames.map(tagName => {
        const foundTag = availableTags.find(t => t.tagName === tagName);
        return foundTag || { tagId: 0, tagName }; // Fallback for custom tags
      });
      onChange?.(selectedTags);
    }
  };

  const handleSearch = (searchValue: string) => {
    setInputValue(searchValue);
  };

  // Get currently selected tag names for comparison
  const selectedTagNames = value.map(tag => tag.tagName);

  const filteredOptions = availableTags
    .filter((tag: CourseTag) => 
      !selectedTagNames.includes(tag.tagName) && 
      tag.tagName.toLowerCase().includes(inputValue.toLowerCase())
    )
    .slice(0, 20); // Limit to 20 suggestions

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
        value={selectedTagNames}
        onChange={handleChange}
        onSearch={handleSearch}
        placeholder={placeholder}
        size="large"
        className="w-full"
        maxTagCount="responsive"
        tokenSeparators={[',', ' ']}
        options={filteredOptions.map((tag: CourseTag) => ({ 
          label: tag.tagName, 
          value: tag.tagName,
          key: tag.tagId 
        }))}
        filterOption={false}
        notFoundContent={
          inputValue ? (
            <div className="p-2 text-center text-gray-500">
              Nhấn Enter để thêm &quot;{inputValue}&quot; như tag mới
            </div>
          ) : (
            <div className="p-2 text-center text-gray-500">
              Nhập để tìm kiếm hoặc chọn tag
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
        <span>Đã chọn: {value.length}/{maxTags} tags</span>
        {value.length >= maxTags && (
          <span className="text-orange-500">Đã đạt giới hạn tối đa</span>
        )}
      </div>

      {/* Popular tags suggestion */}
      {value.length === 0 && (
        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <Text className="text-sm text-blue-700 dark:text-blue-300 font-medium">
            💡 Tags khóa học có sẵn:
          </Text>
          <div className="mt-2 flex flex-wrap gap-1">
            {availableTags.map((tag: CourseTag) => (
              <Tag
                key={tag.tagId}
                className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                onClick={() => {
                  if (value.length < maxTags) {
                    handleChange([...selectedTagNames, tag.tagName]);
                  }
                }}
              >
                {tag.tagName}
              </Tag>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TagsSelector;
