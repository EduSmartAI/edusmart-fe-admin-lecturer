"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  Button,
  Form,
  Input,
  Select,
  Space,
  Modal,
  Divider,
  Empty,
  message,
  Card,
  Tooltip,
  InputNumber,
  Checkbox,
  Radio,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  DragOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import type { SurveyQuestion, SurveyAnswer } from "EduSmart/stores/Admin";
import { DndContext, closestCenter, DragOverlay, type DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type QuestionType = "SHORT_TEXT" | "MULTIPLE_CHOICE" | "CHECKBOX" | "NUMERIC";

interface InlineQuestionEditorProps {
  questions: SurveyQuestion[];
  onQuestionsChange: (questions: SurveyQuestion[]) => void;
  isEditable?: boolean;
  isLoading?: boolean;
}

interface QuestionFormValues {
  questionText: string;
  questionType: QuestionType;
  numericMin?: number;
  numericMax?: number;
  answers?: SurveyAnswer[];
}

// Sortable Question Item Component
const SortableQuestionItem: React.FC<{
  question: SurveyQuestion;
  index: number;
  onEdit: (question: SurveyQuestion) => void;
  onDelete: (questionId: string) => void;
  isEditable: boolean;
}> = ({ question, index, onEdit, onDelete, isEditable }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`mb-3 p-4 border rounded-lg bg-white dark:bg-gray-800 ${
        isDragging ? "shadow-lg" : "shadow-sm"
      }`}
    >
      <div className="flex items-start gap-3">
        {isEditable && (
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing pt-1 text-gray-400"
          >
            <DragOutlined className="text-lg" />
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Q{index + 1}. {question.questionText}
            </h4>
            <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
              {question.questionType}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Order: {question.order}
          </p>

          {/* Question Type Specific Display */}
          {question.questionType === "MULTIPLE_CHOICE" ||
          question.questionType === "CHECKBOX" ? (
            <div className="mt-2 ml-2">
              {question.answers?.map((ans, idx) => (
                <div key={ans.id} className="text-sm text-gray-700 dark:text-gray-300 py-1">
                  {question.questionType === "MULTIPLE_CHOICE" ? (
                    <>
                      <Radio disabled checked={idx === 0} />
                      {ans.answerText}
                    </>
                  ) : (
                    <>
                      <Checkbox disabled checked={false} />
                      {ans.answerText}
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : question.questionType === "NUMERIC" ? (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Range: {question.answers?.[0]?.answerText || "Not specified"}
            </div>
          ) : null}
        </div>

        {isEditable && (
          <Space size="small">
            <Tooltip title="Edit">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => onEdit(question)}
                className="text-blue-600 hover:text-blue-700"
              />
            </Tooltip>
            <Tooltip title="Delete">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                danger
                onClick={() => onDelete(question.id)}
                className="text-red-600 hover:text-red-700"
              />
            </Tooltip>
          </Space>
        )}
      </div>
    </div>
  );
};

// Main Editor Component
export const InlineQuestionEditor: React.FC<InlineQuestionEditorProps> = ({
  questions,
  onQuestionsChange,
  isEditable = true,
  isLoading = false,
}) => {
  const [form] = Form.useForm<QuestionFormValues>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<SurveyQuestion | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle drag end
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    const oldIndex = questions.findIndex((q) => q.id === active.id);
    const newIndex = questions.findIndex((q) => q.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newQuestions = arrayMove(questions, oldIndex, newIndex).map(
        (q, idx) => ({
          ...q,
          order: idx + 1,
        })
      );
      onQuestionsChange(newQuestions);
      message.success("Question reordered successfully");
    }
    setActiveId(null);
  }, [questions, onQuestionsChange]);

  // Handle add question
  const handleAddQuestion = () => {
    form.resetFields();
    setEditingQuestion(null);
    setIsModalOpen(true);
  };

  // Handle edit question
  const handleEditQuestion = (question: SurveyQuestion) => {
    setEditingQuestion(question);
    form.setFieldsValue({
      questionText: question.questionText,
      questionType: question.questionType as QuestionType,
      numericMin: 0,
      numericMax: 100,
    });
    setIsModalOpen(true);
  };

  // Handle delete question
  const handleDeleteQuestion = (questionId: string) => {
    Modal.confirm({
      title: "Delete Question?",
      content: "This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      onOk() {
        const updatedQuestions = questions
          .filter((q) => q.id !== questionId)
          .map((q, idx) => ({
            ...q,
            order: idx + 1,
          }));
        onQuestionsChange(updatedQuestions);
        message.success("Question deleted successfully");
      },
    });
  };

  // Handle form submit
  const handleFormSubmit = async (values: QuestionFormValues) => {
    try {
      if (editingQuestion) {
        // Update existing question
        const updatedQuestions = questions.map((q) =>
          q.id === editingQuestion.id
            ? {
                ...q,
                questionText: values.questionText,
                questionType: values.questionType,
                answers: values.answers || q.answers,
              }
            : q
        );
        onQuestionsChange(updatedQuestions);
        message.success("Question updated successfully");
      } else {
        // Add new question
        const newQuestion: SurveyQuestion = {
          id: `Q${Date.now()}`,
          questionId: `Q${Date.now()}`,
          questionText: values.questionText,
          questionType: values.questionType,
          order: questions.length + 1,
          answers: (values.answers || []).map((a) => ({
            id: a.id,
            answerText: a.answerText,
            isCorrect: a.isCorrect ?? false,
          })),
        };
        onQuestionsChange([...questions, newQuestion]);
        message.success("Question added successfully");
      }

      form.resetFields();
      setIsModalOpen(false);
      setEditingQuestion(null);
    } catch {
      message.error("Failed to save question");
    }
  };

  if (!isEditable && questions.length === 0) {
    return <Empty description="No questions added" />;
  }

  return (
    <div ref={containerRef} className="space-y-4">
      {/* Questions List */}
      {questions.length > 0 ? (
        <Card
          className="shadow-sm"
          title={
            <div className="flex items-center justify-between">
              <span>{questions.length} Question(s)</span>
              {isEditable && (
                <span className="text-xs font-normal text-gray-500">
                  Drag to reorder
                </span>
              )}
            </div>
          }
        >
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            onDragStart={(event) => setActiveId(event.active.id as string)}
          >
            <SortableContext
              items={questions.map((q) => q.id)}
              strategy={verticalListSortingStrategy}
              disabled={!isEditable}
            >
              {questions.map((question, index) => (
                <SortableQuestionItem
                  key={question.id}
                  question={question}
                  index={index}
                  onEdit={handleEditQuestion}
                  onDelete={handleDeleteQuestion}
                  isEditable={isEditable}
                />
              ))}
            </SortableContext>
            <DragOverlay>
              {activeId ? (
                <Card className="opacity-75 shadow-lg">
                  {questions.find((q) => q.id === activeId)?.questionText}
                </Card>
              ) : null}
            </DragOverlay>
          </DndContext>
        </Card>
      ) : (
        <Empty description="No questions added yet" />
      )}

      {/* Add Question Button */}
      {isEditable && (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          block
          size="large"
          onClick={handleAddQuestion}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Add Question
        </Button>
      )}

      {/* Question Modal */}
      <Modal
        title={editingQuestion ? "Edit Question" : "Add Question"}
        open={isModalOpen}
        width={700}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingQuestion(null);
          form.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Divider />
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          autoComplete="off"
          className="mt-6"
        >
          <Form.Item
            label="Question Text"
            name="questionText"
            rules={[
              { required: true, message: "Please enter question text" },
              { min: 5, message: "Question must be at least 5 characters" },
            ]}
          >
            <Input.TextArea
              placeholder="Enter the question..."
              rows={3}
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            label="Question Type"
            name="questionType"
            rules={[{ required: true, message: "Please select question type" }]}
            initialValue="SHORT_TEXT"
          >
            <Select
              placeholder="Select question type"
              options={[
                { label: "Short Text", value: "SHORT_TEXT" },
                { label: "Multiple Choice", value: "MULTIPLE_CHOICE" },
                { label: "Checkbox", value: "CHECKBOX" },
                { label: "Numeric", value: "NUMERIC" },
              ]}
            />
          </Form.Item>

          {/* Type-specific fields */}
          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.questionType !== currentValues.questionType}>
            {({ getFieldValue }) => {
              const questionType = getFieldValue("questionType");

              if (questionType === "NUMERIC") {
                return (
                  <>
                    <Form.Item
                      label="Minimum Value"
                      name="numericMin"
                      initialValue={0}
                    >
                      <InputNumber className="w-full" />
                    </Form.Item>
                    <Form.Item
                      label="Maximum Value"
                      name="numericMax"
                      initialValue={100}
                    >
                      <InputNumber className="w-full" />
                    </Form.Item>
                  </>
                );
              }

              if (
                questionType === "MULTIPLE_CHOICE" ||
                questionType === "CHECKBOX"
              ) {
                return (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 text-sm text-gray-700 dark:text-gray-300">
                    <p className="font-semibold mb-2">Answers Configuration</p>
                    <p>
                      You can add answer options after creating the question. Click &quot;Edit&quot; to
                      modify answers.
                    </p>
                  </div>
                );
              }

              return null;
            }}
          </Form.Item>

          <Divider />

          <Form.Item className="mb-0">
            <Space className="w-full justify-end gap-2">
              <Button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingQuestion(null);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                icon={<SaveOutlined />}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {editingQuestion ? "Update" : "Add"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InlineQuestionEditor;
