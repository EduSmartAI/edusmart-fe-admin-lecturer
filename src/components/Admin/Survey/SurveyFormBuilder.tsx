"use client";

import React, { useState } from "react";
import {
  Button,
  Input,
  Switch,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  CopyOutlined,
  CheckSquareOutlined,
  DownOutlined,
  UpOutlined,
} from "@ant-design/icons";

export interface SurveyOption {
  id: string;
  text: string;
}

export interface SurveyQuestion {
  id: string;
  questionText: string;
  required: boolean;
  options: SurveyOption[];
}

interface SurveyFormBuilderProps {
  questions: SurveyQuestion[];
  onChange: (questions: SurveyQuestion[]) => void;
  surveyTitle: string;
  onTitleChange: (title: string) => void;
  surveyDescription: string;
  onDescriptionChange: (description: string) => void;
}

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 11);

// Create default question - only Multiple Choice
const createDefaultQuestion = (): SurveyQuestion => ({
  id: generateId(),
  questionText: "",
  required: false,
  options: [
    { id: generateId(), text: "Lựa chọn 1" },
    { id: generateId(), text: "Lựa chọn 2" },
  ],
});

export default function SurveyFormBuilder({
  questions,
  onChange,
  surveyTitle,
  onTitleChange,
  surveyDescription,
  onDescriptionChange,
}: SurveyFormBuilderProps) {
  const [focusedQuestionId, setFocusedQuestionId] = useState<string | null>(null);

  // Add new question
  const addQuestion = () => {
    const newQuestion = createDefaultQuestion();
    onChange([...questions, newQuestion]);
    setFocusedQuestionId(newQuestion.id);
  };

  // Update question
  const updateQuestion = (id: string, updates: Partial<SurveyQuestion>) => {
    onChange(
      questions.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  // Delete question
  const deleteQuestion = (id: string) => {
    onChange(questions.filter((q) => q.id !== id));
  };

  // Duplicate question
  const duplicateQuestion = (question: SurveyQuestion) => {
    const newQuestion: SurveyQuestion = {
      ...question,
      id: generateId(),
      options: question.options.map((opt) => ({ ...opt, id: generateId() })),
    };
    const index = questions.findIndex((q) => q.id === question.id);
    const newQuestions = [...questions];
    newQuestions.splice(index + 1, 0, newQuestion);
    onChange(newQuestions);
  };

  // Move question up/down
  const moveQuestion = (id: string, direction: "up" | "down") => {
    const index = questions.findIndex((q) => q.id === id);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === questions.length - 1)
    ) {
      return;
    }
    const newQuestions = [...questions];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [newQuestions[index], newQuestions[newIndex]] = [
      newQuestions[newIndex],
      newQuestions[index],
    ];
    onChange(newQuestions);
  };

  // Add option to question
  const addOption = (questionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;
    
    const newOption: SurveyOption = {
      id: generateId(),
      text: `Lựa chọn ${question.options.length + 1}`,
    };
    updateQuestion(questionId, {
      options: [...question.options, newOption],
    });
  };

  // Update option
  const updateOption = (questionId: string, optionId: string, text: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;
    
    updateQuestion(questionId, {
      options: question.options.map((opt) =>
        opt.id === optionId ? { ...opt, text } : opt
      ),
    });
  };

  // Delete option
  const deleteOption = (questionId: string, optionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question || question.options.length <= 2) return; // At least 2 options required
    
    updateQuestion(questionId, {
      options: question.options.filter((opt) => opt.id !== optionId),
    });
  };

  // Render options for multiple choice questions
  const renderOptions = (question: SurveyQuestion) => {
    return (
      <div className="space-y-4 mt-6">
        {question.options.map((option, index) => (
          <div key={option.id} className="flex items-center gap-4 group">
            {/* Radio indicator */}
            <div className="w-6 h-6 rounded-full border-2 border-gray-400 flex-shrink-0 transition-colors group-hover:border-purple-400" />

            {/* Option input */}
            <Input
              value={option.text}
              onChange={(e) => updateOption(question.id, option.id, e.target.value)}
              placeholder={`Lựa chọn ${index + 1}`}
              variant="borderless"
              size="large"
              className="flex-1 border-b-2 border-transparent hover:border-gray-300 focus:border-purple-500 transition-colors px-0 text-base"
              style={{ fontSize: 16 }}
            />

            {/* Delete option button */}
            {question.options.length > 2 && (
              <Button
                type="text"
                icon={<DeleteOutlined style={{ fontSize: 18 }} />}
                onClick={() => deleteOption(question.id, option.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 w-10 h-10"
              />
            )}
          </div>
        ))}

        {/* Add option button */}
        <div className="flex items-center gap-4 mt-4 pt-2">
          <div className="w-6 h-6 rounded-full border-2 border-gray-300 border-dashed flex-shrink-0" />
          <Button
            type="text"
            onClick={() => addOption(question.id)}
            className="text-purple-600 hover:text-purple-700 px-0 text-base font-medium h-10"
            style={{ fontSize: 16 }}
          >
            + Thêm lựa chọn
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Survey Header Card */}
        <div className="bg-white rounded-xl shadow-md border-t-[12px] border-t-purple-600 mb-6 overflow-hidden">
          <div className="p-8">
            <Input
              value={surveyTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Tiêu đề khảo sát"
              variant="borderless"
              className="text-4xl font-medium mb-4 px-0 border-b-2 border-transparent hover:border-gray-300 focus:border-purple-500 transition-colors"
              style={{ fontSize: 32, fontWeight: 500, lineHeight: 1.3 }}
            />
            <Input.TextArea
              value={surveyDescription}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Mô tả về khảo sát này..."
              variant="borderless"
              autoSize={{ minRows: 2, maxRows: 5 }}
              className="text-gray-600 px-0 border-b-2 border-transparent hover:border-gray-300 focus:border-purple-500 transition-colors text-lg"
              style={{ fontSize: 18, lineHeight: 1.6 }}
            />
          </div>
        </div>

        {/* Questions */}
        {questions.map((question, index) => (
          <div
            key={question.id}
            className={`bg-white rounded-xl shadow-md mb-6 transition-all duration-200 overflow-hidden ${
              focusedQuestionId === question.id
                ? "border-l-[6px] border-l-purple-600 ring-1 ring-purple-200"
                : "border-l-[6px] border-l-transparent hover:border-l-gray-300"
            }`}
            onClick={() => setFocusedQuestionId(question.id)}
          >
            <div className="p-8">
              {/* Question header */}
              <div className="flex items-start gap-6 mb-6">
                <div className="flex-1">
                  <Input.TextArea
                    value={question.questionText}
                    onChange={(e) =>
                      updateQuestion(question.id, { questionText: e.target.value })
                    }
                    placeholder="Nhập câu hỏi của bạn"
                    autoSize={{ minRows: 1, maxRows: 4 }}
                    variant="borderless"
                    className="text-xl font-medium px-0 border-b-2 border-transparent hover:border-gray-300 focus:border-purple-500 resize-none transition-colors"
                    style={{ fontSize: 20, fontWeight: 500, lineHeight: 1.5 }}
                  />
                </div>
                
                {/* Question type indicator (fixed as Multiple Choice) */}
                <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-lg text-purple-700">
                  <CheckSquareOutlined style={{ fontSize: 18 }} />
                  <span className="text-base font-medium">Trắc nghiệm</span>
                </div>
              </div>

              {/* Options */}
              {renderOptions(question)}
            </div>

            {/* Question footer */}
            <div className="px-8 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Tooltip title="Di chuyển lên">
                  <Button
                    type="text"
                    icon={<UpOutlined style={{ fontSize: 16 }} />}
                    onClick={() => moveQuestion(question.id, "up")}
                    disabled={index === 0}
                    className="text-gray-500 hover:text-purple-600 w-10 h-10"
                  />
                </Tooltip>
                <Tooltip title="Di chuyển xuống">
                  <Button
                    type="text"
                    icon={<DownOutlined style={{ fontSize: 16 }} />}
                    onClick={() => moveQuestion(question.id, "down")}
                    disabled={index === questions.length - 1}
                    className="text-gray-500 hover:text-purple-600 w-10 h-10"
                  />
                </Tooltip>
              </div>

              <div className="flex items-center gap-2">
                <Tooltip title="Nhân đôi câu hỏi">
                  <Button
                    type="text"
                    icon={<CopyOutlined style={{ fontSize: 18 }} />}
                    onClick={() => duplicateQuestion(question)}
                    className="text-gray-500 hover:text-purple-600 w-10 h-10"
                  />
                </Tooltip>
                <Tooltip title="Xóa câu hỏi">
                  <Button
                    type="text"
                    icon={<DeleteOutlined style={{ fontSize: 18 }} />}
                    onClick={() => deleteQuestion(question.id)}
                    className="text-gray-500 hover:text-red-500 w-10 h-10"
                  />
                </Tooltip>
                <div className="w-px h-8 bg-gray-300 mx-3" />
                <span className="text-base text-gray-600 font-medium mr-3">Bắt buộc</span>
                <Switch
                  checked={question.required}
                  onChange={(checked) =>
                    updateQuestion(question.id, { required: checked })
                  }
                  className={question.required ? "bg-purple-600" : ""}
                />
              </div>
            </div>
          </div>
        ))}

        {/* Add Question Floating Button */}
        <div className="fixed right-10 top-1/2 -translate-y-1/2 flex flex-col gap-3 bg-white rounded-xl shadow-xl p-3 border border-gray-100">
          <Tooltip title="Thêm câu hỏi trắc nghiệm" placement="left">
            <Button
              type="text"
              icon={<PlusOutlined style={{ fontSize: 22 }} />}
              onClick={() => addQuestion()}
              className="w-14 h-14 flex items-center justify-center hover:bg-purple-50 hover:text-purple-600 transition-colors rounded-lg"
            />
          </Tooltip>
        </div>

        {/* Add first question prompt */}
        {questions.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-6">
              <CheckSquareOutlined style={{ fontSize: 32 }} className="text-purple-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">
              Bắt đầu tạo khảo sát
            </h3>
            <p className="text-gray-500 mb-6 text-lg">
              Thêm câu hỏi trắc nghiệm đầu tiên để bắt đầu
            </p>
            <Button 
              type="primary" 
              size="large" 
              onClick={() => addQuestion()}
              className="bg-purple-600 hover:bg-purple-700 h-12 px-8 text-lg font-medium"
            >
              <PlusOutlined /> Thêm câu hỏi trắc nghiệm
            </Button>
          </div>
        )}

        {/* Bottom add question button */}
        {questions.length > 0 && (
          <div className="flex justify-center mt-4">
            <Button
              type="dashed"
              size="large"
              icon={<PlusOutlined style={{ fontSize: 18 }} />}
              onClick={() => addQuestion()}
              className="px-10 h-12 text-base font-medium border-2 hover:border-purple-400 hover:text-purple-600 transition-colors"
            >
              Thêm câu hỏi trắc nghiệm
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
