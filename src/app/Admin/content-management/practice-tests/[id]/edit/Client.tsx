"use client";

import { useState, useEffect } from "react";
import { Steps, App, Spin, Alert, Button, Progress } from "antd";
import { useRouter } from "next/navigation";
import {
  CodeOutlined,
  ArrowLeftOutlined,
  CloseOutlined,
  FileTextOutlined,
  BulbOutlined,
  ExperimentOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { usePracticeTestStore } from "EduSmart/stores/Admin";
import type { UpdatePracticeTestDto, UpdatePracticeProblem, UpdateTestCase, UpdateCodeTemplate, UpdatePracticeExample, UpdatePracticeSolution } from "EduSmart/types/practice-test";
import ProblemInfoStep from "EduSmart/components/Admin/PracticeTest/ProblemInfoStep";
import ExamplesStep from "EduSmart/components/Admin/PracticeTest/ExamplesStep";
import TestCasesStep from "EduSmart/components/Admin/PracticeTest/TestCasesStep";
import TemplatesStepNew from "EduSmart/components/Admin/PracticeTest/TemplatesStepNew";
import SolutionsStep from "EduSmart/components/Admin/PracticeTest/SolutionsStep";
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
  const { isLoading, error, getPracticeTestDetail, updatePracticeTest } = usePracticeTestStore();
  
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
    solutions: [],
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
         * - solutionId for solutions
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
          // Load existing solutions if available
          solutions: (test.solutions || []).map(s => ({
            solutionId: s.solutionId, // Include ID to update existing solution
            languageId: s.languageId,
            solutionCode: s.solutionCode,
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
      icon: <FileTextOutlined />,
    },
    {
      title: "Ví dụ",
      description: "Input/Output",
      icon: <BulbOutlined />,
    },
    {
      title: "Test Cases",
      description: "Public & Private",
      icon: <ExperimentOutlined />,
    },
    {
      title: "Templates",
      description: "Code mẫu",
      icon: <CodeOutlined />,
    },
    {
      title: "Solutions",
      description: "Lời giải mẫu",
      icon: <TrophyOutlined />,
    },
    {
      title: "Xác nhận",
      description: "Kiểm tra lại",
      icon: <CheckCircleOutlined />,
    },
  ];

  // Calculate progress percentage
  const calculateProgress = () => {
    let progress = 0;
    if (formData.problem?.title) progress += 16.67;
    if (formData.examples && formData.examples.length > 0) progress += 16.67;
    if (formData.testcases && formData.testcases.length > 0) progress += 16.67;
    if (formData.templates && formData.templates.length > 0) progress += 16.67;
    if (formData.solutions && formData.solutions.length > 0) progress += 16.67;
    if (currentStep === 5) progress += 16.67;
    return Math.round(progress);
  };

  // Get step status for Steps component
  const getStepStatus = (stepIndex: number): "wait" | "process" | "finish" | "error" => {
    if (stepIndex < currentStep) return "finish";
    if (stepIndex === currentStep) return "process";
    return "wait";
  };

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

  const handleSolutionsComplete = (solutions: UpdatePracticeSolution[]) => {
    setFormData((prev) => ({ ...prev, solutions }));
    setCurrentStep(5);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" tip="Đang tải dữ liệu...">
          <div className="p-12" />
        </Spin>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          action={
            <Button onClick={() => router.back()}>Quay lại</Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push(`/Admin/content-management/practice-tests/${problemId}`)}
              className="text-gray-600 hover:text-gray-900"
            >
              Chi tiết
            </Button>
            <div className="h-6 w-px bg-gray-200" />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <CodeOutlined className="text-white" />
              </div>
              <span className="text-gray-900 font-semibold">Chỉnh Sửa Practice Test</span>
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
              onClick={() => router.push(`/Admin/content-management/practice-tests/${problemId}`)}
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
        <div className="bg-gradient-to-r from-indigo-50 to-white rounded-xl border border-indigo-200 p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
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
              initialData={formData.problem as unknown as Parameters<typeof ProblemInfoStep>[0]['initialData']}
              onNext={handleProblemInfoComplete as unknown as Parameters<typeof ProblemInfoStep>[0]['onNext']}
              onCancel={() => router.push(`/Admin/content-management/practice-tests/${problemId}`)}
            />
          )}

          {currentStep === 1 && (
            <ExamplesStep
              initialData={formData.examples as unknown as Parameters<typeof ExamplesStep>[0]['initialData'] || []}
              onNext={handleExamplesComplete as unknown as Parameters<typeof ExamplesStep>[0]['onNext']}
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
            <TemplatesStepNew
              initialData={formData.templates as unknown as Parameters<typeof TemplatesStepNew>[0]['initialData'] || []}
              onNext={handleTemplatesComplete as unknown as Parameters<typeof TemplatesStepNew>[0]['onNext']}
              onBack={handleBack}
            />
          )}

          {currentStep === 4 && (
            <SolutionsStep
              initialData={(formData.solutions || []).map(s => ({
                languageId: s.languageId,
                solutionCode: s.solutionCode,
              }))}
              onNext={(solutions) => handleSolutionsComplete(solutions.map(s => ({
                languageId: s.languageId,
                solutionCode: s.solutionCode,
              })))}
              onBack={handleBack}
            />
          )}

          {currentStep === 5 && (
            <ReviewStep
              formData={{
                problem: {
                  title: formData.problem?.title || '',
                  description: formData.problem?.description || '',
                  difficulty: formData.problem?.difficulty === 'Easy' ? 1 : formData.problem?.difficulty === 'Medium' ? 2 : 3,
                },
                examples: formData.examples || [],
                testcases: {
                  publicTestcases: formData.testcases?.filter(tc => tc.isPublic).map(tc => ({
                    inputData: tc.inputData,
                    expectedOutput: tc.expectedOutput,
                  })) || [],
                  privateTestcases: formData.testcases?.filter(tc => !tc.isPublic).map(tc => ({
                    inputData: tc.inputData,
                    expectedOutput: tc.expectedOutput,
                  })) || [],
                },
                templates: formData.templates || [],
                solutions: formData.solutions || [],
              }}
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
