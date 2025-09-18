'use client';
import { FC, useState } from 'react';
import { Select, Tag, Typography } from 'antd';
import { FaInfoCircle } from 'react-icons/fa';

const { Text } = Typography;

interface TagsSelectorProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  suggestions?: string[];
}

const TagsSelector: FC<TagsSelectorProps> = ({
  value = [],
  onChange,
  placeholder = "Nhập và chọn tags...",
  maxTags = 10,
  suggestions = []
}) => {
  const [inputValue, setInputValue] = useState('');

  // Default suggestions for course tags
  const defaultSuggestions = [
    'ReactJS', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 'Java', 'C#',
    'HTML', 'CSS', 'Bootstrap', 'Tailwind CSS', 'Vue.js', 'Angular',
    'Express.js', 'Spring Boot', 'Django', 'Flask', 'MongoDB', 'MySQL',
    'PostgreSQL', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'Azure',
    'Git', 'GitHub', 'API', 'REST', 'GraphQL', 'Microservices',
    'Machine Learning', 'Data Science', 'AI', 'Deep Learning',
    'Mobile Development', 'React Native', 'Flutter', 'iOS', 'Android',
    'Web Development', 'Frontend', 'Backend', 'Full Stack',
    'DevOps', 'Testing', 'Unit Testing', 'Integration Testing',
    'Agile', 'Scrum', 'Project Management', 'Software Architecture'
  ];

  const allSuggestions = [...new Set([...suggestions, ...defaultSuggestions])];

  const handleChange = (newValue: string[]) => {
    if (newValue.length <= maxTags) {
      onChange?.(newValue);
    }
  };

  const handleSearch = (searchValue: string) => {
    setInputValue(searchValue);
  };

  const filteredOptions = allSuggestions
    .filter(tag => 
      !value.includes(tag) && 
      tag.toLowerCase().includes(inputValue.toLowerCase())
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
        value={value}
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
        <span>Đã chọn: {value.length}/{maxTags} tags</span>
        {value.length >= maxTags && (
          <span className="text-orange-500">Đã đạt giới hạn tối đa</span>
        )}
      </div>

      {/* Popular tags suggestion */}
      {value.length === 0 && (
        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <Text className="text-sm text-blue-700 dark:text-blue-300 font-medium">
            💡 Tags phổ biến:
          </Text>
          <div className="mt-2 flex flex-wrap gap-1">
            {defaultSuggestions.slice(0, 12).map(tag => (
              <Tag
                key={tag}
                className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                onClick={() => {
                  if (value.length < maxTags) {
                    handleChange([...value, tag]);
                  }
                }}
              >
                {tag}
              </Tag>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TagsSelector;
