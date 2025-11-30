"use client";

import { useState } from "react";
import { Steps, App, Button, Progress } from "antd";
import { useRouter } from "next/navigation";
import {
  CodeOutlined,
  FileTextOutlined,
  BulbOutlined,
  ExperimentOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  CloseOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { usePracticeTestStore } from "EduSmart/stores/Admin";
import type { CreatePracticeTestDto, PracticeSolution } from "EduSmart/types/practice-test";
import ProblemInfoStep from "EduSmart/components/Admin/PracticeTest/ProblemInfoStep";
import ExamplesStep from "EduSmart/components/Admin/PracticeTest/ExamplesStep";
import TestCasesStep from "EduSmart/components/Admin/PracticeTest/TestCasesStep";
import TemplatesStep from "EduSmart/components/Admin/PracticeTest/TemplatesStepNew";
import SolutionsStep from "EduSmart/components/Admin/PracticeTest/SolutionsStep";
import ReviewStep from "EduSmart/components/Admin/PracticeTest/ReviewStep";

export default function CreatePracticeTestClient() {
  const { message } = App.useApp();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<CreatePracticeTestDto>>({
    problem: {
      title: "",
      description: "",
      difficulty: 1, // 1 = Easy, 2 = Medium, 3 = Hard
    },
    examples: [],
    testcases: {
      publicTestcases: [],
      privateTestcases: [],
    },
    templates: [],
    solutions: [],
  });
  const { createPracticeTest } = usePracticeTestStore();

  const steps = [
    {
      key: "info",
      title: "Thông tin",
      shortTitle: "Info",
      icon: <FileTextOutlined />,
      description: "Tiêu đề, mô tả, độ khó",
    },
    {
      key: "examples",
      title: "Ví dụ",
      shortTitle: "Examples",
      icon: <BulbOutlined />,
      description: "Input/Output mẫu",
    },
    {
      key: "testcases",
      title: "Test Cases",
      shortTitle: "Tests",
      icon: <ExperimentOutlined />,
      description: "Public & Private",
    },
    {
      key: "templates",
      title: "Templates",
      shortTitle: "Code",
      icon: <CodeOutlined />,
      description: "Code mẫu cho mỗi ngôn ngữ",
    },
    {
      key: "solutions",
      title: "Solutions",
      shortTitle: "Solutions",
      icon: <TrophyOutlined />,
      description: "Lời giải mẫu",
    },
    {
      key: "review",
      title: "Review",
      shortTitle: "Review",
      icon: <CheckCircleOutlined />,
      description: "Kiểm tra và tạo",
    },
  ];

  // Calculate completion status for each step
  const getStepStatus = (stepIndex: number): "wait" | "process" | "finish" | "error" => {
    if (stepIndex < currentStep) return "finish";
    if (stepIndex === currentStep) return "process";
    return "wait";
  };

  // Calculate overall progress
  const calculateProgress = () => {
    let completed = 0;
    if (formData.problem?.title && formData.problem?.description) completed++;
    if (formData.examples && formData.examples.length > 0) completed++;
    if (formData.testcases && (formData.testcases.publicTestcases?.length > 0 || formData.testcases.privateTestcases?.length > 0)) completed++;
    if (formData.templates && formData.templates.length > 0) completed++;
    if (formData.solutions && formData.solutions.length > 0) completed++;
    return Math.round((completed / 5) * 100);
  };

  const handleProblemInfoComplete = (data: CreatePracticeTestDto["problem"]) => {
    setFormData((prev) => ({ ...prev, problem: data }));
    setCurrentStep(1);
  };

  const handleExamplesComplete = (examples: CreatePracticeTestDto["examples"]) => {
    setFormData((prev) => ({ ...prev, examples }));
    setCurrentStep(2);
  };

  const handleTestCasesComplete = (testcases: CreatePracticeTestDto["testcases"]) => {
    setFormData((prev) => ({ ...prev, testcases }));
    setCurrentStep(3);
  };

  const handleTemplatesComplete = (templates: CreatePracticeTestDto["templates"]) => {
    setFormData((prev) => ({ ...prev, templates }));
    setCurrentStep(4);
  };

  const handleSolutionsComplete = (solutions: PracticeSolution[]) => {
    setFormData((prev) => ({ ...prev, solutions }));
    setCurrentStep(5);
  };

  const handleSubmit = async () => {
    // Validate that all required data is present
    if (!formData.problem || !formData.examples || !formData.testcases || !formData.templates) {
      message.error("Vui lòng hoàn thành tất cả các bước");
      return;
    }

    // Check for common issues
    if (!formData.testcases.publicTestcases || formData.testcases.publicTestcases.length === 0) {
      message.error("Vui lòng thêm ít nhất 1 public test case.");
      return;
    }

    if (formData.templates.length === 0) {
      message.error("Vui lòng thêm ít nhất 1 code template.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createPracticeTest(formData as CreatePracticeTestDto);
      message.success("Tạo Practice Test thành công!");
      router.push("/Admin/content-management/practice-tests");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Có lỗi xảy ra khi tạo Practice Test";
      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (step: number) => {
    setCurrentStep(step);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCancel = () => {
    router.push("/Admin/content-management/practice-tests");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={handleCancel}
              className="text-gray-600 hover:text-gray-900"
            >
              Danh sách
            </Button>
            <div className="h-6 w-px bg-gray-200" />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <CodeOutlined className="text-white" />
              </div>
              <span className="text-gray-900 font-semibold">Tạo Practice Test Mới</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <span>Hoàn thành:</span>
              <Progress
                percent={calculateProgress()}
                size="small"
                strokeColor="#10b981"
                trailColor="#e5e7eb"
                style={{ width: 100 }}
                showInfo={false}
              />
              <span className="text-emerald-600 font-medium">{calculateProgress()}%</span>
            </div>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={handleCancel}
              className="text-gray-400 hover:text-red-500"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Progress Steps */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
          <Steps
            current={currentStep}
            size="small"
            className="admin-steps"
            items={steps.map((step, index) => ({
              title: (
                <span className={`${index <= currentStep ? "text-gray-900" : "text-gray-400"}`}>
                  {step.title}
                </span>
              ),
              description: (
                <span className={`text-xs ${index <= currentStep ? "text-gray-600" : "text-gray-400"}`}>
                  {step.description}
                </span>
              ),
              icon: (
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    index < currentStep
                      ? "bg-emerald-500 text-white"
                      : index === currentStep
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-500"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {index < currentStep ? <CheckCircleOutlined /> : step.icon}
                </div>
              ),
              status: getStepStatus(index),
            }))}
          />
        </div>

        {/* Current Step Info Card */}
        <div className="bg-gradient-to-r from-emerald-50 to-white rounded-xl border border-emerald-200 p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
              {steps[currentStep].icon}
            </div>
            <div>
              <div className="text-gray-900 font-semibold">
                Bước {currentStep + 1}: {steps[currentStep].title}
              </div>
              <div className="text-gray-500 text-sm">{steps[currentStep].description}</div>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {currentStep === 0 && (
            <ProblemInfoStep
              initialData={formData.problem}
              onNext={handleProblemInfoComplete}
              onCancel={handleCancel}
            />
          )}

          {currentStep === 1 && (
            <ExamplesStep
              initialData={formData.examples || []}
              onNext={handleExamplesComplete}
              onBack={handleBack}
            />
          )}

          {currentStep === 2 && (
            <TestCasesStep
              initialData={formData.testcases ? [formData.testcases] : []}
              onNext={(testcases) => handleTestCasesComplete(testcases[0])}
              onBack={handleBack}
            />
          )}

          {currentStep === 3 && (
            <TemplatesStep
              initialData={formData.templates || []}
              onNext={handleTemplatesComplete}
              onBack={handleBack}
            />
          )}

          {currentStep === 4 && (
            <SolutionsStep
              initialData={formData.solutions || []}
              onNext={handleSolutionsComplete}
              onBack={handleBack}
            />
          )}

          {currentStep === 5 && (
            <ReviewStep
              formData={formData as CreatePracticeTestDto}
              onBack={handleBack}
              onEdit={handleEdit}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>

      {/* Custom styles for admin theme steps */}
      <style jsx global>{`
        .admin-steps .ant-steps-item-tail::after {
          background-color: #e5e7eb !important;
        }
        .admin-steps .ant-steps-item-finish .ant-steps-item-tail::after {
          background-color: #10b981 !important;
        }
        .admin-steps .ant-steps-item-title {
          font-weight: 500 !important;
        }
        .admin-steps .ant-steps-item-description {
          font-size: 12px !important;
        }
      `}</style>
    </div>
  );
}
