"use client";

import { useState } from "react";
import { Steps, Card, App } from "antd";
import { useRouter } from "next/navigation";
import { CodeOutlined } from "@ant-design/icons";
import { usePracticeTestStore } from "EduSmart/stores/Admin";
import type { CreatePracticeTestDto } from "EduSmart/types/practice-test";
import ProblemInfoStep from "EduSmart/components/Admin/PracticeTest/ProblemInfoStep";
import ExamplesStep from "EduSmart/components/Admin/PracticeTest/ExamplesStep";
import TestCasesStep from "EduSmart/components/Admin/PracticeTest/TestCasesStep";
import TemplatesStep from "EduSmart/components/Admin/PracticeTest/TemplatesStepNew";
import ReviewStep from "EduSmart/components/Admin/PracticeTest/ReviewStep";

export default function CreatePracticeTestClient() {
  const { message } = App.useApp();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<CreatePracticeTestDto>>({
    problem: {
      title: '',
      description: '',
      difficulty: 1, // 1 = Easy, 2 = Medium, 3 = Hard
    },
    examples: [],
    testcases: [],
    templates: [],
  });
  const { createPracticeTest } = usePracticeTestStore();

  const steps = [
    {
      title: "Thông tin",
      description: "Tiêu đề & Độ khó",
      icon: <CodeOutlined />,
    },
    {
      title: "Ví dụ",
      description: "Input/Output",
    },
    {
      title: "Test Cases",
      description: "Public & Private",
    },
    {
      title: "Templates",
      description: "Code mẫu",
    },
    {
      title: "Xác nhận",
      description: "Kiểm tra lại",
    },
  ];

  const handleProblemInfoComplete = (data: CreatePracticeTestDto['problem']) => {
    setFormData((prev) => ({ ...prev, problem: data }));
    setCurrentStep(1);
  };

  const handleExamplesComplete = (examples: CreatePracticeTestDto['examples']) => {
    setFormData((prev) => ({ ...prev, examples }));
    setCurrentStep(2);
  };

  const handleTestCasesComplete = (testcases: CreatePracticeTestDto['testcases']) => {
    setFormData((prev) => ({ ...prev, testcases }));
    setCurrentStep(3);
  };

  const handleTemplatesComplete = (templates: CreatePracticeTestDto['templates']) => {
    setFormData((prev) => ({ ...prev, templates }));
    setCurrentStep(4);
  };

  const handleSubmit = async () => {
    // Validate that all required data is present
    if (!formData.problem || !formData.examples || !formData.testcases || !formData.templates) {
      message.error("Vui lòng hoàn thành tất cả các bước");
      return;
    }

    console.log('🟢 [Client] Starting practice test submission...');
    console.log('🟢 [Client] Form data:', JSON.stringify(formData, null, 2));
    
    // Detailed payload validation
    const payloadValidation = {
      problem: {
        title: formData.problem.title,
        description: formData.problem.description,
        difficulty: formData.problem.difficulty,
        difficultyType: typeof formData.problem.difficulty,
        isValid: typeof formData.problem.difficulty === 'number' && [1, 2, 3].includes(formData.problem.difficulty),
      },
      examples: {
        count: formData.examples.length,
        structure: formData.examples.map((ex, i) => ({
          index: i,
          exampleOrder: ex.exampleOrder,
          hasInput: !!ex.inputData,
          hasOutput: !!ex.outputData,
          hasExplanation: !!ex.explanation,
        })),
      },
      testcases: {
        count: formData.testcases.length,
        isArray: Array.isArray(formData.testcases),
        structure: formData.testcases[0] ? {
          hasPublicTestcases: !!formData.testcases[0].publicTestcases,
          publicCount: formData.testcases[0].publicTestcases?.length || 0,
          hasPrivateTestcases: !!formData.testcases[0].privateTestcases,
          privateCount: formData.testcases[0].privateTestcases?.length || 0,
          publicSample: formData.testcases[0].publicTestcases?.[0],
          privateSample: formData.testcases[0].privateTestcases?.[0],
        } : 'EMPTY - This is the problem!',
      },
      templates: {
        count: formData.templates.length,
        structure: formData.templates.map((t, i) => ({
          index: i,
          languageId: t.languageId,
          languageIdType: typeof t.languageId,
          hasPrefix: !!t.userTemplatePrefix,
          hasSuffix: !!t.userTemplateSuffix,
          hasStubCode: !!t.userStubCode,
        })),
      },
    };
    
    console.log('🔍 [Client] Payload Validation:', JSON.stringify(payloadValidation, null, 2));
    
    // Check for common issues
    if (formData.testcases.length === 0) {
      console.error('❌ [Client] ERROR: testcases array is EMPTY!');
      message.error('Testcases không được để trống. Vui lòng thêm test cases.');
      return;
    }
    
    if (!formData.testcases[0]?.publicTestcases || formData.testcases[0].publicTestcases.length === 0) {
      console.error('❌ [Client] ERROR: No public testcases found!');
      message.error('Vui lòng thêm ít nhất 1 public test case.');
      return;
    }
    
    if (formData.templates.length === 0) {
      console.error('❌ [Client] ERROR: No templates found!');
      message.error('Vui lòng thêm ít nhất 1 code template.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createPracticeTest(formData as CreatePracticeTestDto);
      
      console.log('✅ [Client] createPracticeTest completed, result:', result);
      
      // Success even if result is null (API might not return data)
      message.success("Tạo Practice Test thành công!");
      router.push("/Admin/content-management/practice-tests");
    } catch (error: unknown) {
      console.error('❌ [Client] Error during submission:', error);
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi tạo Practice Test";
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <CodeOutlined className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Tạo Bài Thực Hành Mới
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Tạo bài tập lập trình với test cases và code templates
              </p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <Card className="mb-6 shadow-sm border-0">
          <Steps
            current={currentStep}
            items={steps}
            responsive
            className="mb-6"
          />
        </Card>

        {/* Step Content */}
        <div className="mb-6">
          {currentStep === 0 && (
            <ProblemInfoStep
              initialData={formData.problem}
              onNext={handleProblemInfoComplete}
              onCancel={() => router.push("/Admin/content-management/practice-tests")}
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
              initialData={formData.testcases || []}
              onNext={handleTestCasesComplete}
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
    </div>
  );
}
