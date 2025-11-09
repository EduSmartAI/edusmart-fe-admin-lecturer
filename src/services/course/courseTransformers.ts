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
import type {
  UpdateCourseQuizPayload,
  QuizPayload,
  QuizQuestionPayload,
  QuizAnswerPayload,
} from 'EduSmart/api/api-quiz-service';

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
  
  // Note: quizSettingsId should NOT be included inside quizSettings object
  // It's only needed at the quiz level (lessonQuizId/moduleQuizId)
  return {
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
      answers: question.options?.map(opt => ({
        answerId: opt.id,
        answerText: opt.text,
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

export const transformModulesForUpdate = (modules: CourseModule[]): UpdateModuleDto[] => {
  return modules.map((module, index) => {
    const currentTime = new Date().toISOString();

    const discussions = module.discussions?.map((disc) => {
      const storedCreatedAt = disc.createdAt;
      const createdAt = storedCreatedAt || currentTime;

      return {
        discussionId: disc.id,
        title: disc.title,
        description: disc.description,
        discussionQuestion: disc.discussionQuestion,
        isActive: disc.isActive !== undefined ? disc.isActive : true,
        createdAt,
        updatedAt: currentTime,
      };
    });

    const materials = module.materials?.map((mat) => {
      const storedCreatedAt = mat.createdAt;
      const createdAt = storedCreatedAt || currentTime;

      return {
        materialId: mat.id,
        title: mat.title,
        description: mat.description,
        fileUrl: mat.fileUrl,
        isActive: mat.isActive !== undefined ? mat.isActive : true,
        createdAt,
        updatedAt: currentTime,
      };
    });

    return {
      moduleId: module.id,
      moduleName: module.moduleName,
      description: module.description,
      positionIndex: index + 1, // API uses 1-based index
      isActive: module.isActive,
      isCore: module.isCore,
      durationMinutes: module.durationMinutes,
      durationHours: module.durationMinutes ? module.durationMinutes / 60 : undefined,
      level: index + 1, // Level is typically same as position
      objectives: module.objectives.map((obj, objIdx) => ({
        objectiveId: obj.id,
        content: obj.content,
        positionIndex: objIdx + 1, // API uses 1-based index
        isActive: obj.isActive,
      })),
      lessons: module.lessons.map((lesson, idx) => transformLessonForUpdate(lesson, idx)),
      moduleDiscussionDetails: discussions,
      discussions,
      moduleMaterialDetails: materials,
      materials,
      // ❌ DON'T include moduleQuiz here - it's handled separately by updateCourseQuizzes()
      // This prevents conflicts and "Lỗi hệ thống" errors from the backend
      // ...(module.moduleQuiz
      //   ? {
      //       moduleQuiz: {
      //         moduleQuizId: module.moduleQuiz.id,
      //         quizSettings: transformQuizSettings(module.moduleQuiz.quizSettings),
      //         questions: transformQuestions(module.moduleQuiz.questions) ?? [],
      //       },
      //     }
      //   : {}),
    };
  });
};

const transformLessonForUpdate = (lesson: Lesson, index: number) => ({
  lessonId: lesson.id,
  title: lesson.title,
  videoUrl: lesson.videoUrl,
  videoDurationSec: lesson.videoDurationSec,
  positionIndex: index + 1, // API uses 1-based index
  isActive: lesson.isActive,
  // ❌ DON'T include lessonQuiz here - it's handled separately by updateCourseQuizzes()
  // This prevents conflicts and "Lỗi hệ thống" errors from the backend
  // ...(lesson.lessonQuiz
  //   ? {
  //       lessonQuiz: {
  //         lessonQuizId: lesson.lessonQuiz.id,
  //         quizSettings: transformQuizSettings(lesson.lessonQuiz.quizSettings),
  //         questions: transformQuestions(lesson.lessonQuiz.questions) ?? [],
  //       },
  //     }
  //   : {}),
});

const mapAnswersForQuiz = (options?: Array<{ id?: string; text?: string; isCorrect?: boolean }>): QuizAnswerPayload[] => {
  if (!options) return [];

  return options.map((opt) => ({
    // Only include answerId if it's a real UUID (not temporary like "answer-0.123")
    ...(isRealQuizId(opt.id) ? { answerId: opt.id } : {}),
    answerText: opt.text,
    isCorrect: opt.isCorrect ?? false,
  }));
};

const mapQuestionsForQuiz = (questions?: unknown[]): QuizQuestionPayload[] => {
  if (!questions || !Array.isArray(questions)) return [];

  return questions.map((q) => {
    const question = q as {
      id?: string;
      questionType: number;
      questionText?: string;
      explanation?: string;
      options?: Array<{ id?: string; text?: string; isCorrect?: boolean }>;
    };

    return {
      // Only include questionId if it's a real UUID (not temporary like "question-0.123")
      ...(isRealQuizId(question.id) ? { questionId: question.id } : {}),
      questionText: question.questionText,
      questionType: question.questionType,
      explanation: question.explanation,
      answers: mapAnswersForQuiz(question.options),
    } satisfies QuizQuestionPayload;
  });
};

// Helper to check if ID is a real database ID (UUID format) vs temporary client ID
const isRealQuizId = (id?: string): boolean => {
  if (!id) return false;
  // Check if it's a UUID format (real database ID) vs temporary ID like "lesson-quiz-1234"
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

const mapQuizForPayload = (quiz?: ModuleQuiz | Lesson['lessonQuiz']): QuizPayload | null => {
  if (!quiz) {
    console.log('⚠️ [mapQuizForPayload] Quiz is null or undefined');
    return null;
  }

  const extendedQuiz = quiz as (ModuleQuiz & {
    quizId?: string;
    moduleQuizId?: string;
    lessonQuizId?: string;
  }) | (Lesson['lessonQuiz'] & {
    quizId?: string;
    lessonQuizId?: string;
    moduleQuizId?: string;
  });

  const candidateQuizId = typeof extendedQuiz.quizId === 'string' ? extendedQuiz.quizId : quiz.id;

  console.log('🔍 [mapQuizForPayload] Candidate quiz ID:', candidateQuizId);
  console.log('🔍 [mapQuizForPayload] Is real UUID:', isRealQuizId(candidateQuizId));

  // Skip temporary IDs - these quizzes don't exist in the database yet
  if (!isRealQuizId(candidateQuizId)) {
    console.log(`⚠️ [mapQuizForPayload] Skipping quiz with temporary ID: ${candidateQuizId}`);
    return null;
  }

  const settings = quiz.quizSettings ?? {};
  const questions = mapQuestionsForQuiz(quiz.questions);

  console.log('🔍 [mapQuizForPayload] Quiz settings:', settings);
  console.log('🔍 [mapQuizForPayload] Questions count:', questions.length);

  return {
    quizId: candidateQuizId,
    durationMinutes: settings.durationMinutes,
    passingScorePercentage: settings.passingScorePercentage,
    shuffleQuestions: settings.shuffleQuestions,
    showResultsImmediately: settings.showResultsImmediately,
    allowRetake: settings.allowRetake,
    questions,
  } satisfies QuizPayload;
};

export const buildCourseQuizUpdatePayload = (
  modules: CourseModule[],
  editedQuizIds?: Set<string>
): UpdateCourseQuizPayload => {
  const quizzes: QuizPayload[] = [];

  console.log('🔧 [buildCourseQuizUpdatePayload] Edited quiz IDs:', Array.from(editedQuizIds || []));

  modules.forEach((module, moduleIndex) => {
    const moduleQuiz = module.moduleQuiz as (ModuleQuiz & { lastModified?: number; quizId?: string }) | undefined;
    
    // Only include module quiz if it was EXPLICITLY edited in this session
    if (moduleQuiz) {
      const quizId = moduleQuiz.quizId || moduleQuiz.id;
      console.log(`🔧 [Module ${moduleIndex}] Module quiz found. ID: ${quizId}, Is edited: ${editedQuizIds?.has(quizId || '')}`);
      
      if (editedQuizIds && quizId && editedQuizIds.has(quizId)) {
        console.log(`📝 [Module ${moduleIndex}] Processing module quiz ${quizId}...`);
        const mapped = mapQuizForPayload(moduleQuiz);
        if (mapped) {
          console.log(`✅ [Module ${moduleIndex}] Module quiz mapped successfully:`, JSON.stringify(mapped, null, 2));
          quizzes.push(mapped);
        } else {
          console.warn(`⚠️ [Module ${moduleIndex}] Module quiz ${quizId} mapping returned null`);
        }
      } else if (editedQuizIds) {
        console.log(`⏭️ [Module ${moduleIndex}] Skipping module quiz ${quizId} (not in edited set)`);
      } else {
        // Fallback: if no editedQuizIds provided, use old time-based logic
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
        if (!moduleQuiz.lastModified || moduleQuiz.lastModified >= fiveMinutesAgo) {
          const mapped = mapQuizForPayload(moduleQuiz);
          if (mapped) {
            quizzes.push(mapped);
          }
        }
      }
    }

    module.lessons.forEach((lesson, lessonIndex) => {
      const lessonQuiz = lesson.lessonQuiz as (Lesson['lessonQuiz'] & { lastModified?: number; quizId?: string }) | undefined;
      
      // Only include lesson quiz if it was EXPLICITLY edited in this session
      if (lessonQuiz) {
        const quizId = lessonQuiz.quizId || lessonQuiz.id;
        console.log(`🔧 [Module ${moduleIndex}, Lesson ${lessonIndex}] Lesson quiz found. ID: ${quizId}, Is edited: ${editedQuizIds?.has(quizId || '')}`);
        
        if (editedQuizIds && quizId && editedQuizIds.has(quizId)) {
          console.log(`📝 [Module ${moduleIndex}, Lesson ${lessonIndex}] Processing lesson quiz ${quizId}...`);
          const mapped = mapQuizForPayload(lessonQuiz);
          if (mapped) {
            console.log(`✅ [Module ${moduleIndex}, Lesson ${lessonIndex}] Lesson quiz mapped successfully:`, JSON.stringify(mapped, null, 2));
            quizzes.push(mapped);
          } else {
            console.warn(`⚠️ [Module ${moduleIndex}, Lesson ${lessonIndex}] Lesson quiz ${quizId} mapping returned null`);
          }
        } else if (editedQuizIds) {
          console.log(`⏭️ [Module ${moduleIndex}, Lesson ${lessonIndex}] Skipping lesson quiz ${quizId} (not in edited set)`);
        } else {
          // Fallback: if no editedQuizIds provided, use old time-based logic
          const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
          if (!lessonQuiz.lastModified || lessonQuiz.lastModified >= fiveMinutesAgo) {
            const mapped = mapQuizForPayload(lessonQuiz);
            if (mapped) {
              quizzes.push(mapped);
            }
          }
        }
      }
    });
  });

  console.log(`🔧 [buildCourseQuizUpdatePayload] Total quizzes to update: ${quizzes.length}`);
  console.log('🔧 [buildCourseQuizUpdatePayload] Final payload:', JSON.stringify({ quizzes }, null, 2));

  return {
    quizzes,
  };
};

