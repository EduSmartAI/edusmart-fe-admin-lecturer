'use client';
import { FC, useState, useCallback, useEffect } from 'react';
import { Input, Button, Select, Radio, Space, Card, InputNumber, Switch } from 'antd';
import { FaPlus, FaTrash, FaClock, FaCheck, FaQuestion } from 'react-icons/fa';

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
  points?: number;
}

interface QuizBuilderProps {
  initialQuestions?: QuizQuestion[];
  initialSettings?: Partial<QuizSettings>;
  onSave?: (questions: QuizQuestion[], settings: QuizSettings) => void;
  onCancel?: () => void;
}

interface QuizSettings {
  timeLimit?: number;
  passingScore?: number;
  shuffleQuestions?: boolean;
  showResults?: boolean;
  allowRetake?: boolean;
}

const QuizBuilder: FC<QuizBuilderProps> = ({
  initialQuestions = [],
  initialSettings = {},
  onSave,
  onCancel
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>(initialQuestions);
  const [settings, setSettings] = useState<QuizSettings>({
    timeLimit: 30,
    passingScore: 70,
    shuffleQuestions: false,
    showResults: true,
    allowRetake: true,
    ...initialSettings // Override with initial settings
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Update state when props change
  useEffect(() => {
    setQuestions(initialQuestions);
  }, [initialQuestions]);

  useEffect(() => {
    setSettings({
      timeLimit: 30,
      passingScore: 70,
      shuffleQuestions: false,
      showResults: true,
      allowRetake: true,
      ...initialSettings
    });
  }, [initialSettings]);

  // Add new question
  const addQuestion = useCallback(() => {
    const newQuestion: QuizQuestion = {
      id: Date.now().toString(),
      question: '',
      type: 'multiple-choice',
      options: ['', '', '', ''],
      correctAnswer: 0,
      points: 1
    };
    
    setQuestions(prev => [...prev, newQuestion]);
    setEditingIndex(questions.length);
  }, [questions.length]);

  // Remove question
  const removeQuestion = useCallback((index: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  }, [editingIndex]);

  // Update question
  const updateQuestion = useCallback((index: number, updatedQuestion: Partial<QuizQuestion>) => {    setQuestions(prev => prev.map((q, i) => 
      i === index ? { ...q, ...updatedQuestion } : q
    ));
  }, []);

  // Add option to multiple choice question
  const addOption = useCallback((questionIndex: number) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i === questionIndex && q.options) {
        const newOptions = [...q.options, ''];
        
        // Also add to optionsMetadata if it exists
        const newMetadata = q.optionsMetadata ? [
          ...q.optionsMetadata,
          { id: `option-${q.id}-${q.options.length}`, text: '', isCorrect: false }
        ] : undefined;
        
        return { ...q, options: newOptions, optionsMetadata: newMetadata };
      }
      return q;
    }));
  }, []);

  // Remove option from multiple choice question
  const removeOption = useCallback((questionIndex: number, optionIndex: number) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i === questionIndex && q.options && q.options.length > 2) {
        const newOptions = q.options.filter((_, oi) => oi !== optionIndex);
        
        // Also remove from optionsMetadata if it exists
        const newMetadata = q.optionsMetadata ? 
          q.optionsMetadata.filter((_, oi) => oi !== optionIndex) : 
          undefined;
        
        return { 
          ...q, 
          options: newOptions,
          optionsMetadata: newMetadata,
          correctAnswer: q.correctAnswer as number > optionIndex 
            ? (q.correctAnswer as number) - 1 
            : q.correctAnswer
        };
      }
      return q;
    }));
  }, []);

  // Update option text
  const updateOption = useCallback((questionIndex: number, optionIndex: number, text: string) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i === questionIndex && q.options) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = text;
        
        // Also update optionsMetadata if it exists to keep it in sync
        const newMetadata = q.optionsMetadata ? [...q.optionsMetadata] : undefined;
        if (newMetadata && newMetadata[optionIndex]) {
          newMetadata[optionIndex] = {
            ...newMetadata[optionIndex],
            text: text
          };
        }
        
        return { ...q, options: newOptions, optionsMetadata: newMetadata };
      }
      return q;
    }));
  }, []);

  // Render question editor
  const renderQuestionEditor = (question: QuizQuestion, index: number) => (
    <Card
      key={question.id}
      className="mb-4 shadow-sm hover:shadow-md transition-shadow duration-200"
      title={
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
              {index + 1}
            </div>
            <span>Câu hỏi {index + 1}</span>
          </span>
          <div className="flex items-center gap-2">
            <Select
              value={question.type}
              onChange={(value) => updateQuestion(index, { 
                type: value,
                options: value === 'multiple-choice' ? ['', ''] : undefined,
                optionsMetadata: undefined, // Clear metadata when changing type
                correctAnswer: value === 'true-false' ? 'true' : (value === 'multiple-choice' ? 0 : '')
              })}
              size="small"
              style={{ width: 150 }}
            >
              <Select.Option value="multiple-choice">Trắc nghiệm</Select.Option>
              <Select.Option value="true-false">Đúng/Sai</Select.Option>
              <Select.Option value="short-answer">Tự luận ngắn</Select.Option>
            </Select>
            <Button
              type="text"
              danger
              size="small"
              icon={<FaTrash />}
              onClick={() => removeQuestion(index)}
            />
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Question text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nội dung câu hỏi
          </label>
          <Input.TextArea
            value={question.question}
            onChange={(e) => updateQuestion(index, { question: e.target.value })}
            placeholder="Nhập câu hỏi..."
            rows={3}
            className="w-full"
          />
        </div>

        {/* Question type specific fields */}
        {question.type === 'multiple-choice' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Các lựa chọn
            </label>
            <Radio.Group
              value={question.correctAnswer}
              onChange={(e) => updateQuestion(index, { correctAnswer: e.target.value })}
              className="w-full"
            >
              <Space direction="vertical" className="w-full">
                {question.options?.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center gap-2 w-full">
                    <Radio value={optionIndex} />
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                      placeholder={`Lựa chọn ${optionIndex + 1}`}
                      className="flex-1"
                    />
                    {question.options && question.options.length > 2 && (
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<FaTrash />}
                        onClick={() => removeOption(index, optionIndex)}
                      />
                    )}
                  </div>
                ))}
              </Space>
            </Radio.Group>
            <Button
              type="dashed"
              onClick={() => addOption(index)}
              className="w-full mt-2"
              icon={<FaPlus />}
            >
              Thêm lựa chọn
            </Button>
          </div>
        )}

        {question.type === 'true-false' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Đáp án đúng
            </label>
            <Radio.Group
              value={question.correctAnswer}
              onChange={(e) => updateQuestion(index, { correctAnswer: e.target.value })}
            >
              <Radio value="true">Đúng</Radio>
              <Radio value="false">Sai</Radio>
            </Radio.Group>
          </div>
        )}

        {question.type === 'short-answer' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Đáp án mẫu (tùy chọn)
            </label>
            <Input.TextArea
              value={question.correctAnswer as string}
              onChange={(e) => updateQuestion(index, { correctAnswer: e.target.value })}
              placeholder="Đáp án mẫu hoặc từ khóa cần có..."
              rows={2}
            />
          </div>
        )}

        {/* Explanation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Giải thích (tùy chọn)
          </label>
          <Input.TextArea
            value={question.explanation || ''}
            onChange={(e) => updateQuestion(index, { explanation: e.target.value })}
            placeholder="Giải thích đáp án..."
            rows={2}
          />
        </div>

        {/* Points */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Điểm số:
          </label>
          <InputNumber
            value={question.points || 1}
            onChange={(value) => updateQuestion(index, { points: value || 1 })}
            min={1}
            max={10}
            size="small"
          />
        </div>
      </div>
    </Card>
  );

  // Render quiz settings
  const renderQuizSettings = () => (
    <Card title="Cài đặt Quiz" className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Thời gian làm bài (phút)
          </label>
          <InputNumber
            value={settings.timeLimit}
            onChange={(value) => setSettings(prev => ({ ...prev, timeLimit: value || undefined }))}
            min={1}
            max={180}
            placeholder="Không giới hạn"
            className="w-full"
            addonBefore={<FaClock />}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Điểm tối thiểu để qua bài (%)
          </label>
          <InputNumber
            value={settings.passingScore}
            onChange={(value) => setSettings(prev => ({ ...prev, passingScore: value || 0 }))}
            min={0}
            max={100}
            className="w-full"
            addonAfter="%"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Xáo trộn câu hỏi
          </span>
          <Switch
            checked={settings.shuffleQuestions}
            onChange={(checked) => setSettings(prev => ({ ...prev, shuffleQuestions: checked }))}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Hiển thị kết quả ngay
          </span>
          <Switch
            checked={settings.showResults}
            onChange={(checked) => setSettings(prev => ({ ...prev, showResults: checked }))}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Cho phép làm lại
          </span>
          <Switch
            checked={settings.allowRetake}
            onChange={(checked) => setSettings(prev => ({ ...prev, allowRetake: checked }))}
          />
        </div>
      </div>
    </Card>
  );

  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Tạo Quiz
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {questions.length} câu hỏi • {totalPoints} điểm
          </p>
        </div>
        <Button
          type="primary"
          icon={<FaPlus />}
          onClick={addQuestion}
          className="bg-blue-500 border-blue-500"
        >
          Thêm câu hỏi
        </Button>
      </div>

      {/* Quiz Settings */}
      {renderQuizSettings()}

      {/* Questions */}
      <div>
        {questions.length === 0 ? (
          <Card className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaQuestion className="text-2xl text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
              Chưa có câu hỏi nào
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Hãy bắt đầu bằng cách thêm câu hỏi đầu tiên
            </p>
            <Button
              type="primary"
              icon={<FaPlus />}
              onClick={addQuestion}
              className="bg-blue-500 border-blue-500"
            >
              Thêm câu hỏi đầu tiên
            </Button>
          </Card>
        ) : (
          questions.map((question, index) => renderQuestionEditor(question, index))
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button onClick={onCancel}>
          Hủy
        </Button>
        <Button
          type="primary"
          onClick={() => onSave?.(questions, settings)}
          disabled={questions.length === 0 || questions.some(q => !q.question.trim())}
          className="bg-green-500 border-green-500"
        >
          <FaCheck className="mr-2" />
          Lưu Quiz
        </Button>
      </div>
    </div>
  );
};

export default QuizBuilder;
