/**
 * Course Data Transformers
 * Pure functions to convert between domain models and API DTOs
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  Course,
  CourseModule,
  Lesson,
  ModuleQuiz
} from 'EduSmart/domain/course/models';

import type {
  CreateCourseDto,
  UpdateCourseDto,
  CreateModuleDto,
  UpdateModuleDto
} from 'EduSmart/api/api-course-service';

// Type alias for the modules DTO (since it doesn't exist in API)
type UpdateCourseWithModulesDto = UpdateCourseDto & { modules?: any[] };

// ============================================
// Helper Functions
// ============================================

const transformQuizSettings = (settings?: unknown) => {
  if (!settings) return undefined;
  const s = settings as {
    id?: string;
    durationMinutes?: number;
    passingScorePercentage?: number;
    shuffleQuestions?: boolean;
    showResultsImmediately?: boolean;
    allowRetake?: boolean;
  };
  
  return {
    quizSettingsId: s.id,
    durationMinutes: s.durationMinutes,
    passingScorePercentage: s.passingScorePercentage,
    shuffleQuestions: s.shuffleQuestions,
    showResultsImmediately: s.showResultsImmediately,
    allowRetake: s.allowRetake
  };
};

const transformQuestions = (questions?: unknown[]) => {
  if (!questions || !Array.isArray(questions)) return undefined;
  
  return questions.map((q: unknown) => {
    const question = q as {
      id?: string;
      questionType: number;
      questionText?: string;
      options?: Array<{ id?: string; text?: string; isCorrect: boolean }>;
      explanation?: string;
    };
    
    return {
      questionId: question.id,
      questionType: question.questionType,
      questionText: question.questionText,
      explanation: question.explanation,
      options: question.options?.map(opt => ({
        optionId: opt.id,
        text: opt.text,
        isCorrect: opt.isCorrect
      }))
    };
  });
};

// ============================================
// Create DTO Transformers
// ============================================

export const transformToCreateDto = async (course: Course, teacherId: string): Promise<CreateCourseDto> => {
  return {
    teacherId,
    subjectId: course.courseInformation.subjectId,
    title: course.courseInformation.title,
    shortDescription: course.courseInformation.shortDescription,
    description: course.courseInformation.description,
    courseImageUrl: course.courseInformation.courseImageUrl,
    courseIntroVideoUrl: course.courseInformation.courseIntroVideoUrl,
    durationMinutes: course.courseInformation.durationMinutes,
    level: course.courseInformation.level,
    price: course.courseInformation.price,
    dealPrice: course.courseInformation.dealPrice,
    isActive: course.courseInformation.isActive,
    
    objectives: course.objectives.map((obj, index) => ({
      content: obj.content,
      positionIndex: index,
      isActive: obj.isActive
    })),
    
    requirements: course.requirements.map((req, index) => ({
      content: req.content,
      positionIndex: index,
      isActive: req.isActive
    })),
    
    audiences: course.targetAudience.map((aud, index) => ({
      content: aud.content,
      positionIndex: index,
      isActive: aud.isActive
    })),
    
    courseTags: course.courseTags.map(tag => ({
      tagId: tag.tagId
    })),
    
    modules: transformModulesForCreate(course.modules)
  };
};

const transformModulesForCreate = (modules: CourseModule[]): CreateModuleDto[] => {
  return modules.map((module, index) => ({
    moduleName: module.moduleName,
    description: module.description,
    positionIndex: index,
    isActive: module.isActive,
    isCore: module.isCore,
    durationMinutes: module.durationMinutes,
    level: module.level,
    
    objectives: module.objectives.map((obj, objIdx) => ({
      content: obj.content,
      positionIndex: objIdx,
      isActive: obj.isActive
    })),
    
    lessons: module.lessons.map((lesson, idx) => transformLessonForCreate(lesson, idx)),
    
    discussions: module.discussions?.map((disc) => ({
      title: disc.title,
      description: disc.description,
      discussionQuestion: disc.discussionQuestion,
      isActive: disc.isActive
    })),
    
    materials: module.materials?.map((mat) => ({
      title: mat.title,
      description: mat.description,
      fileUrl: mat.fileUrl,
      isActive: mat.isActive
    })),
    
    moduleQuiz: module.moduleQuiz ? transformModuleQuizForCreate(module.moduleQuiz) : undefined
  }));
};

const transformLessonForCreate = (lesson: Lesson, index: number) => ({
  title: lesson.title,
  videoUrl: lesson.videoUrl,
  videoDurationSec: lesson.videoDurationSec,
  positionIndex: index,
  isActive: lesson.isActive,
  lessonQuiz: lesson.lessonQuiz ? {
    quizSettings: transformQuizSettings(lesson.lessonQuiz.quizSettings),
    questions: transformQuestions(lesson.lessonQuiz.questions)
  } : undefined
});

const transformModuleQuizForCreate = (quiz: ModuleQuiz) => ({
  quizSettings: transformQuizSettings(quiz.quizSettings),
  questions: transformQuestions(quiz.questions)
});

// ============================================
// Update DTO Transformers
// ============================================

export const transformToUpdateDto = async (course: Course, teacherId: string): Promise<UpdateCourseDto> => {
  return {
    teacherId,
    subjectId: course.courseInformation.subjectId,
    title: course.courseInformation.title,
    shortDescription: course.courseInformation.shortDescription,
    description: course.courseInformation.description,
    courseImageUrl: course.courseInformation.courseImageUrl,
    courseIntroVideoUrl: course.courseInformation.courseIntroVideoUrl,
    durationMinutes: course.courseInformation.durationMinutes,
    level: course.courseInformation.level,
    price: course.courseInformation.price,
    dealPrice: course.courseInformation.dealPrice,
    isActive: course.courseInformation.isActive,
    
    objectives: course.objectives.map((obj, index) => ({
      objectiveId: obj.id,
      content: obj.content,
      positionIndex: index,
      isActive: obj.isActive
    })),
    
    requirements: course.requirements.map((req, index) => ({
      requirementId: req.id,
      content: req.content,
      positionIndex: index,
      isActive: req.isActive
    })),
    
    audiences: course.targetAudience.map((aud, index) => ({
      audienceId: aud.id,
      content: aud.content,
      positionIndex: index,
      isActive: aud.isActive
    })),
    
    courseTags: course.courseTags.map(tag => ({
      tagId: tag.tagId
    }))
  };
};

export const transformToUpdateWithModulesDto = async (
  course: Course,
  teacherId: string
): Promise<UpdateCourseWithModulesDto> => {
  const basicDto = await transformToUpdateDto(course, teacherId);
  
  return {
    ...basicDto,
    modules: transformModulesForUpdate(course.modules)
  } as UpdateCourseWithModulesDto;
};

const transformModulesForUpdate = (modules: CourseModule[]): UpdateModuleDto[] => {
  return modules.map((module, index) => ({
    moduleId: module.id,
    moduleName: module.moduleName,
    description: module.description,
    positionIndex: index,
    isActive: module.isActive,
    isCore: module.isCore,
    durationMinutes: module.durationMinutes,
    level: module.level,
    
    objectives: module.objectives.map((obj, objIdx) => ({
      objectiveId: obj.id,
      content: obj.content,
      positionIndex: objIdx,
      isActive: obj.isActive
    })),
    
    lessons: module.lessons.map((lesson, idx) => transformLessonForUpdate(lesson, idx)),
    
    moduleDiscussionDetails: module.discussions?.map((disc) => ({
      discussionId: disc.id,
      title: disc.title,
      description: disc.description,
      discussionQuestion: disc.discussionQuestion,
      isActive: disc.isActive
    })),
    
    moduleMaterialDetails: module.materials?.map((mat) => ({
      materialId: mat.id,
      title: mat.title,
      description: mat.description,
      fileUrl: mat.fileUrl,
      isActive: mat.isActive
    })),
    
    moduleQuiz: module.moduleQuiz ? transformModuleQuizForUpdate(module.moduleQuiz) : undefined
  }));
};

const transformLessonForUpdate = (lesson: Lesson, index: number) => ({
  lessonId: lesson.id,
  title: lesson.title,
  videoUrl: lesson.videoUrl,
  videoDurationSec: lesson.videoDurationSec,
  positionIndex: index,
  isActive: lesson.isActive,
  lessonQuiz: lesson.lessonQuiz ? {
    lessonQuizId: lesson.lessonQuiz.id,
    quizSettings: transformQuizSettings(lesson.lessonQuiz.quizSettings),
    questions: transformQuestions(lesson.lessonQuiz.questions)
  } : undefined
});

const transformModuleQuizForUpdate = (quiz: ModuleQuiz) => ({
  moduleQuizId: quiz.id,
  quizSettings: transformQuizSettings(quiz.quizSettings),
  questions: transformQuestions(quiz.questions)
});

