"use client";

import { useState, useEffect } from "react";
import { Steps, Card, App, Spin, Alert } from "antd";
import { useRouter } from "next/navigation";
import { CodeOutlined } from "@ant-design/icons";
import { usePracticeTestStore } from "EduSmart/stores/Admin";
import type { UpdatePracticeTestDto, UpdatePracticeProblem, UpdateTestCase, UpdateCodeTemplate, UpdatePracticeExample } from "EduSmart/types/practice-test";
import ProblemInfoStep from "EduSmart/components/Admin/PracticeTest/ProblemInfoStep";
import ExamplesStep from "EduSmart/components/Admin/PracticeTest/ExamplesStep";
import TestCasesStep from "EduSmart/components/Admin/PracticeTest/TestCasesStep";
import TemplatesStep from "EduSmart/components/Admin/PracticeTest/TemplatesStep";
import ReviewStep from "EduSmart/components/Admin/PracticeTest/ReviewStep";

interface EditPracticeTestClientProps {
  problemId: string;
}

export default function EditPracticeTestClient({ problemId }: EditPracticeTestClientProps) {
  const { message } = App.useApp();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const { selectedTest, isLoading, error, getPracticeTestDetail, updatePracticeTest } = usePracticeTestStore();
  
  const [formData, setFormData] = useState<Partial<UpdatePracticeTestDto>>({
    problemId,
    problem: {
      title: '',
      description: '',
      difficulty: 'Easy',
    },
    examples: [],
    testcases: [],
    templates: [],
  });

  // Load existing practice test data
  useEffect(() => {
    const loadPracticeTest = async () => {
      setIsInitializing(true);
      const test = await getPracticeTestDetail(problemId);
      
      if (test) {
        /**
         * Convert PracticeTest to UpdatePracticeTestDto format
         * 
         * NOTE: API behavior for updates:
         * - Items WITHOUT IDs = Create new items
         * - Items WITH IDs = Update existing items
         * - Items MISSING from request = Delete those items
         * 
         * The API detail response includes IDs for all items:
         * - exampleId for examples
         * - testcaseId for test cases
         * - templateId for templates
         * 
         * By including these IDs, we preserve existing items when updating.
         */
        const updateData: Partial<UpdatePracticeTestDto> = {
          problemId,
          problem: {
            title: test.title,
            description: test.description,
            difficulty: test.difficulty, // Already a string: "Easy", "Medium", "Hard"
          },
          examples: (test.examples || []).map(ex => ({
            exampleId: ex.exampleId, // Include ID to update existing example
            exampleOrder: ex.exampleOrder,
            inputData: ex.inputData,
            outputData: ex.outputData,
            explanation: ex.explanation,
          })),
          // API now returns testCases (capital C) as flat array with isPublic flag
          testcases: (test.testCases || []).map(tc => ({
            testcaseId: tc.testcaseId, // Include ID to update existing test case
            inputData: tc.inputData,
            expectedOutput: tc.expectedOutput,
            isPublic: tc.isPublic,
          })),
          // Transform API template response (templatePrefix/Suffix) to update format (userTemplatePrefix/Suffix)
          templates: (test.templates || []).map(t => ({
            templateId: t.templateId, // Include ID to update existing template
            languageId: t.languageId,
            userTemplatePrefix: t.templatePrefix, // API uses templatePrefix
            userTemplateSuffix: t.templateSuffix, // API uses templateSuffix
            userStubCode: t.userStubCode,
          })),
        };
        
        setFormData(updateData);
      }
      
      setIsInitializing(false);
    };
    
    loadPracticeTest();
  }, [problemId, getPracticeTestDetail]);

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

  const handleProblemInfoComplete = (data: UpdatePracticeProblem) => {
    setFormData((prev) => ({ ...prev, problem: data }));
    setCurrentStep(1);
  };

  const handleExamplesComplete = (examples: UpdatePracticeExample[]) => {
    setFormData((prev) => ({ ...prev, examples }));
    setCurrentStep(2);
  };

  const handleTestCasesComplete = (testcases: UpdateTestCase[]) => {
    setFormData((prev) => ({ ...prev, testcases }));
    setCurrentStep(3);
  };

  const handleTemplatesComplete = (templates: UpdateCodeTemplate[]) => {
    setFormData((prev) => ({ ...prev, templates }));
    setCurrentStep(4);
  };

  const handleSubmit = async () => {
    if (!formData.problem || !formData.examples || !formData.testcases || !formData.templates) {
      message.error("Vui lòng hoàn thành tất cả các bước");
      return;
    }

    console.log('🟢 [Edit] Starting practice test update...');
    console.log('🟢 [Edit] Form data:', JSON.stringify(formData, null, 2));

    setIsSubmitting(true);
    try {
      await updatePracticeTest(formData as UpdatePracticeTestDto);
      
      console.log('✅ [Edit] Practice test updated successfully');
      message.success("Cập nhật Practice Test thành công!");
      router.push("/Admin/content-management/practice-tests");
    } catch (error: unknown) {
      console.error('❌ [Edit] Error during update:', error);
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi cập nhật Practice Test";
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

  if (isInitializing || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Spin size="large" tip="Đang tải dữ liệu...">
          <div className="p-12" />
        </Spin>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          action={
            <button onClick={() => router.back()}>Quay lại</button>
          }
        />
      </div>
    );
  }

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
                Chỉnh Sửa Bài Thực Hành
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Cập nhật thông tin bài tập lập trình
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
              initialData={formData.problem as any}
              onNext={handleProblemInfoComplete as any}
              onCancel={() => router.push(`/Admin/content-management/practice-tests/${problemId}`)}
            />
          )}

          {currentStep === 1 && (
            <ExamplesStep
              initialData={formData.examples as any || []}
              onNext={handleExamplesComplete as any}
              onBack={handleBack}
            />
          )}

          {currentStep === 2 && (
            <TestCasesStep
              initialData={[{
                publicTestcases: formData.testcases?.filter(tc => tc.isPublic).map(tc => ({
                  inputData: tc.inputData,
                  expectedOutput: tc.expectedOutput,
                })) || [],
                privateTestcases: formData.testcases?.filter(tc => !tc.isPublic).map(tc => ({
                  inputData: tc.inputData,
                  expectedOutput: tc.expectedOutput,
                })) || [],
              }]}
              onNext={(testcases) => {
                // Convert back to flat array with isPublic flag
                // Since we don't have IDs, all test cases will be created as new
                const flatTestcases: UpdateTestCase[] = [
                  ...(testcases[0]?.publicTestcases || []).map(tc => ({
                    inputData: tc.inputData,
                    expectedOutput: tc.expectedOutput,
                    isPublic: true,
                  })),
                  ...(testcases[0]?.privateTestcases || []).map(tc => ({
                    inputData: tc.inputData,
                    expectedOutput: tc.expectedOutput,
                    isPublic: false,
                  })),
                ];
                handleTestCasesComplete(flatTestcases);
              }}
              onBack={handleBack}
            />
          )}

          {currentStep === 3 && (
            <TemplatesStep
              initialData={formData.templates as any || []}
              onNext={handleTemplatesComplete as any}
              onBack={handleBack}
            />
          )}

          {currentStep === 4 && (
            <ReviewStep
              formData={{
                problem: {
                  title: formData.problem?.title || '',
                  description: formData.problem?.description || '',
                  difficulty: formData.problem?.difficulty === 'Easy' ? 1 : formData.problem?.difficulty === 'Medium' ? 2 : 3,
                },
                examples: formData.examples || [],
                testcases: [{
                  publicTestcases: formData.testcases?.filter(tc => tc.isPublic).map(tc => ({
                    inputData: tc.inputData,
                    expectedOutput: tc.expectedOutput,
                  })) || [],
                  privateTestcases: formData.testcases?.filter(tc => !tc.isPublic).map(tc => ({
                    inputData: tc.inputData,
                    expectedOutput: tc.expectedOutput,
                  })) || [],
                }],
                templates: formData.templates || [],
              } as any}
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
