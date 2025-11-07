import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
    courseServiceAPI, 
    CreateCourseDto, 
    UpdateCourseDto,
} from 'EduSmart/api/api-course-service';
import { updateCourseQuizzes } from 'EduSmart/services/course/courseService';

// Course basic information aligned with API schema
export interface CourseInformation {
    teacherId: string;
    subjectId: string;
    subjectCode: string;
    title: string;
    shortDescription: string;
    description: string;
    courseImageUrl?: string;
    courseIntroVideoUrl?: string; // Video giới thiệu khóa học
    durationMinutes?: number;
    level?: number; // 1, 2, 3 for beginner, intermediate, advanced
    price: number;
    dealPrice?: number;
    isActive: boolean;
}

// Course objectives aligned with API
export interface CourseObjective {
    id?: string; // for updates
    content: string;
    positionIndex: number;
    isActive: boolean;
}

// Course requirements aligned with API
export interface CourseRequirement {
    id?: string; // for updates
    content: string;
    positionIndex: number;
    isActive: boolean;
}

// Course target audience aligned with API (similar structure to requirements)
export interface CourseTargetAudience {
    id?: string; // for updates
    content: string;
    positionIndex: number;
    isActive: boolean;
}

// Course tags aligned with API
export interface CourseTag {
    tagId: number;
    tagName?: string;
}

// Module objectives aligned with API
export interface ModuleObjective {
    id?: string; // for updates
    content: string;
    positionIndex: number;
    isActive: boolean;
}

// Lesson structure aligned with API
export interface Lesson {
    id?: string; // for updates
    title: string;
    videoUrl?: string;
    videoDurationSec?: number;
    positionIndex: number;
    isActive: boolean;
    lessonQuiz?: LessonQuiz;
    type?: string; // Optional: to mark special lesson types like 'quiz' for module quizzes
}

// Quiz-related interfaces
export interface LessonQuiz {
    id?: string;
    quizSettings?: QuizSettings;
    questions?: Question[];
    lastModified?: number; // Timestamp to track when quiz was last edited
}

export interface QuizSettings {
    id?: string;
    durationMinutes?: number;
    passingScorePercentage?: number;
    shuffleQuestions?: boolean;
    showResultsImmediately?: boolean;
    allowRetake?: boolean;
}

export interface Question {
    id?: string;
    questionType: number; // 1 = MultipleChoice, 2 = TrueFalse, 3 = SingleChoice
    questionText?: string;
    options?: QuestionOption[];
    explanation?: string;
}

export interface QuestionOption {
    id?: string;
    text?: string;
    isCorrect: boolean;
}

export interface ModuleQuiz {
    id?: string;
    quizSettings?: QuizSettings;
    questions?: Question[];
    lastModified?: number; // Timestamp to track when quiz was last edited
}

export interface Discussion {
    id?: string; // for updates
    title: string;
    description?: string;
    discussionQuestion?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
    metadata?: Record<string, unknown>;
}

export interface Material {
    id?: string; // for updates
    title: string;
    description?: string;
    fileUrl?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
    metadata?: Record<string, unknown>;
}

// Module structure aligned with API
export interface CourseModule {
    id?: string; // for updates
    moduleName: string;
    description?: string;
    positionIndex: number;
    isActive: boolean;
    isCore: boolean;
    durationMinutes?: number;
    level?: number;
    objectives: ModuleObjective[];
    lessons: Lesson[];
    discussions?: Discussion[]; // Optional: thảo luận
    materials?: Material[]; // Optional: tài liệu 
    moduleQuiz?: ModuleQuiz; // Optional: module quiz
    isExpanded?: boolean; // UI state only
}

export interface CreateCourseState {
    currentStep: number;
    courseInformation: CourseInformation;
    objectives: CourseObjective[];
    requirements: CourseRequirement[];
    targetAudience: CourseTargetAudience[];
    courseTags: CourseTag[];
    modules: CourseModule[];
    isLoading: boolean;
    isSaving: boolean;
    error: string | null;
    courseId?: string; // Set when editing existing course
    isCreateMode: boolean; // Flag to indicate if we're in create mode
    editedQuizIds: Set<string>; // Track which quizzes were edited in current session
    
    // Step management
    setCurrentStep: (step: number) => void;
    
    // Course information
    updateCourseInformation: (data: any) => void;
    
    // Objectives management
    addObjective: (objective: Omit<CourseObjective, 'positionIndex'>) => void;
    updateObjective: (index: number, data: Partial<CourseObjective>) => void;
    removeObjective: (index: number) => void;
    reorderObjectives: (startIndex: number, endIndex: number) => void;
    
    // Requirements management
    addRequirement: (requirement: Omit<CourseRequirement, 'positionIndex'>) => void;
    updateRequirement: (index: number, data: Partial<CourseRequirement>) => void;
    removeRequirement: (index: number) => void;
    reorderRequirements: (startIndex: number, endIndex: number) => void;
    
    // Target Audience management
    addTargetAudience: (targetAudience: Omit<CourseTargetAudience, 'positionIndex'>) => void;
    updateTargetAudience: (index: number, data: Partial<CourseTargetAudience>) => void;
    removeTargetAudience: (index: number) => void;
    reorderTargetAudience: (startIndex: number, endIndex: number) => void;
    
    // Tags management
    addTag: (tag: CourseTag) => void;
    removeTag: (tagId: number) => void;
    updateTags: (tags: CourseTag[]) => void;
    
    // Module management
    addModule: (module: Omit<CourseModule, 'id' | 'positionIndex'>) => void;
    updateModule: (index: number, data: Partial<CourseModule>) => void;
    removeModule: (index: number) => void;
    reorderModules: (startIndex: number, endIndex: number) => void;
    toggleModuleExpansion: (index: number) => void;
    
    // Module objectives management
    addModuleObjective: (moduleIndex: number, objective: Omit<ModuleObjective, 'positionIndex'>) => void;
    updateModuleObjective: (moduleIndex: number, objectiveIndex: number, data: Partial<ModuleObjective>) => void;
    removeModuleObjective: (moduleIndex: number, objectiveIndex: number) => void;
    
    // Lesson management
    addLesson: (moduleIndex: number, lesson: Omit<Lesson, 'positionIndex'>) => void;
    updateLesson: (moduleIndex: number, lessonIndex: number, data: Partial<Lesson>) => void;
    removeLesson: (moduleIndex: number, lessonIndex: number) => void;
    reorderLessons: (moduleIndex: number, startIndex: number, endIndex: number) => void;
    
    // API actions
    createCourse: () => Promise<boolean>; // Returns true if successful
    updateCourse: () => Promise<boolean>;
    loadCourseData: (courseId: string) => Promise<boolean>;
    
    // Form management
    clearError: () => void;
    resetForm: () => void;
    setCourseId: (id: string) => void;
    forceResetForCreateMode: () => void;
    setCreateMode: (isCreateMode: boolean) => void;
    
    // Quiz editing tracking
    markQuizAsEdited: (quizId: string) => void;
    clearEditedQuizIds: () => void;
}

// Legacy interface for backward compatibility
export interface CourseContentItem {
    id: string;
    type: string;
    title: string;
    description?: string;
    duration?: number;
    file?: File;
    url?: string;
    quiz?: unknown;
    metadata?: Record<string, unknown>;
    order: number;
}

// No hardcoded teacher ID - always extract from logged-in account

const initialState = {
    currentStep: 0,
    courseInformation: {
        teacherId: '', // Will be set dynamically from JWT token
        subjectId: '',
        subjectCode: '',
        title: '',
        shortDescription: '',
        description: '',
        courseImageUrl: '',
        courseIntroVideoUrl: '', // Video giới thiệu khóa học
        durationMinutes: 0,
        level: 1, // 1 = Beginner
        price: 0,
        dealPrice: undefined,
        isActive: true,
    },
    objectives: [],
    requirements: [],
    targetAudience: [],
    courseTags: [],
    modules: [],
    isLoading: false,
    isSaving: false,
    error: null,
    courseId: undefined,
    isCreateMode: true, // Default to create mode
    editedQuizIds: new Set<string>(), // Empty set initially
};

// Helper functions
const reorderArray = <T>(array: T[], startIndex: number, endIndex: number): T[] => {
    const result = [...array];
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
};

const updatePositionIndexes = <T extends { positionIndex: number }>(array: T[]): T[] => {
    return array.map((item, index) => ({ ...item, positionIndex: index }));
};

// Convert store data to API format
const convertToCreateCourseDto = async (state: CreateCourseState): Promise<CreateCourseDto> => {
    // Debug: Log the current state modules before conversion
    state.modules.forEach((module, idx) => {
        if (module.moduleQuiz) {
        }
        module.lessons.forEach((lesson, lessonIdx) => {
            if (lesson.lessonQuiz) {
            }
        });
    });
    state.modules.forEach((module, idx) => {
        module.objectives.forEach((obj, objIdx) => {
        });
    });
    
    // Get lecturer ID from JWT token (don't hardcode teacher_id) 
    let teacherId = state.courseInformation.teacherId?.trim() || '';

    if (!teacherId) {
        try {
            const { getUserIdFromTokenAction } = await import('EduSmart/app/(auth)/action');
            const userInfo = await getUserIdFromTokenAction();
            
            if (userInfo.ok && userInfo.userId) {
                teacherId = userInfo.userId;
            } else {
                throw new Error('Unable to get lecturer ID from logged-in account');
            }
        } catch (error) {
            throw new Error('Failed to get lecturer ID: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    }
    
    // Derive total course duration from modules/lessons if not explicitly set
    const totalMinutesFromState = (state.modules || []).reduce((sum, mod) => {
        const moduleMinutes = (mod.durationMinutes && mod.durationMinutes > 0)
            ? mod.durationMinutes
            : Math.round(((mod.lessons || []).reduce((s, l) => s + (l.videoDurationSec || 0), 0)) / 60);
        return sum + (moduleMinutes || 0);
    }, 0);

    const dto: CreateCourseDto = {
        teacherId: teacherId, // Use dynamically extracted lecturer ID
        subjectId: state.courseInformation.subjectId,
        title: state.courseInformation.title,
        shortDescription: state.courseInformation.shortDescription,
        description: state.courseInformation.description,
        // Let backend generate slug to avoid uniqueness conflicts
        // slug: state.courseInformation.slug,
        courseImageUrl: state.courseInformation.courseImageUrl,
        courseIntroVideoUrl: state.courseInformation.courseIntroVideoUrl, // Video giới thiệu khóa học
        durationMinutes: (state.courseInformation.durationMinutes && state.courseInformation.durationMinutes > 0)
            ? state.courseInformation.durationMinutes
            : (totalMinutesFromState > 0 ? totalMinutesFromState : undefined),
        level: typeof state.courseInformation.level === 'string'
            ? parseInt(state.courseInformation.level as unknown as string)
            : state.courseInformation.level,
        price: state.courseInformation.price,
        dealPrice: state.courseInformation.dealPrice,
        isActive: state.courseInformation.isActive,
        objectives: state.objectives.map((obj, idx) => ({
            content: obj.content,
            positionIndex: (obj.positionIndex ?? idx) + 1,
            isActive: obj.isActive,
        })),
        requirements: state.requirements.map((req, idx) => ({
            content: req.content,
            positionIndex: (req.positionIndex ?? idx) + 1,
            isActive: req.isActive,
        })),
        courseTags: state.courseTags.map((tag) => ({
            tagId: tag.tagId,
        })),
        audiences: state.targetAudience.map((aud, idx) => ({
            content: aud.content,
            positionIndex: (aud.positionIndex ?? idx) + 1,
            isActive: aud.isActive,
        })),
        modules: state.modules.map((module, mIdx) => ({
            moduleName: module.moduleName,
            description: module.description,
            positionIndex: (module.positionIndex ?? mIdx) + 1,
            isActive: module.isActive,
            isCore: module.isCore,
            durationMinutes: (() => {
                if (module.durationMinutes && module.durationMinutes > 0) return module.durationMinutes;
                const minutesFromLessons = Math.round(((module.lessons || []).reduce((s, l) => s + (l.videoDurationSec || 0), 0)) / 60);
                return minutesFromLessons > 0 ? minutesFromLessons : undefined;
            })(),
            level: typeof module.level === 'string' ? parseInt(module.level as unknown as string) : module.level,
            objectives: module.objectives.map((obj, oIdx) => ({
                content: obj.content,
                positionIndex: (obj.positionIndex ?? oIdx) + 1,
                isActive: obj.isActive,
            })),
            // Optional: lessons (bài học - videos) - only include if user added them
            // Exclude quiz display lessons (type: 'quiz') as they are for UI only
            ...((() => {
                const validLessons = module.lessons
                    ?.filter((lesson: Lesson) => {
                        const isValid = lesson.title && 
                            lesson.title.trim().length > 0 && 
                            lesson.type !== 'quiz'; // Exclude quiz display lessons
                        return isValid;
                    }) || [];
                
                
                return validLessons.length > 0 ? {
                    lessons: validLessons.map((lesson: Lesson, lIdx: number) => ({
                        title: lesson.title,
                        videoUrl: lesson.videoUrl && lesson.videoUrl.trim().length > 0 
                            ? lesson.videoUrl 
                            : '', // Leave empty if no video uploaded
                        videoDurationSec: lesson.videoDurationSec || 0,
                        positionIndex: (lesson.positionIndex ?? lIdx) + 1,
                        isActive: lesson.isActive ?? true,
                        // Optional: lesson quiz
                        ...(lesson.lessonQuiz && {
                            lessonQuiz: {
                                quizSettings: lesson.lessonQuiz.quizSettings ? {
                                    durationMinutes: lesson.lessonQuiz.quizSettings.durationMinutes,
                                    passingScorePercentage: lesson.lessonQuiz.quizSettings.passingScorePercentage,
                                    shuffleQuestions: lesson.lessonQuiz.quizSettings.shuffleQuestions,
                                    showResultsImmediately: lesson.lessonQuiz.quizSettings.showResultsImmediately,
                                    allowRetake: lesson.lessonQuiz.quizSettings.allowRetake,
                                } : undefined,
                                questions: lesson.lessonQuiz.questions?.map(question => ({
                                    questionType: question.questionType,
                                    questionText: question.questionText,
                                    explanation: question.explanation,
                                    options: question.options?.map(option => ({
                                        text: option.text,
                                        isCorrect: option.isCorrect,
                                    })),
                                })),
                            }
                        }),
                    }))
                } : {};
            })()), 
            
            // Optional: discussions (thảo luận) - only include if user added them  
            ...(module.discussions && module.discussions.length > 0 && {
                discussions: module.discussions
                    .filter((discussion: Discussion) => discussion.title && discussion.title.trim().length > 0)
                    .map((discussion: Discussion, dIdx: number) => ({
                        title: discussion.title,
                        description: discussion.description || '',
                        discussionQuestion: discussion.discussionQuestion || '',
                        isActive: discussion.isActive ?? true,
                    }))
            }),
            
            // Optional: materials (tài liệu) - only include if user added them
            ...(module.materials && module.materials.length > 0 && {
                materials: module.materials
                    .filter((material: Material) => material.title && material.title.trim().length > 0)
                    .map((material: Material, mIdx: number) => ({
                        title: material.title,
                        description: material.description || '',
                        fileUrl: material.fileUrl || '',
                        isActive: material.isActive ?? true,
                    }))
            }),
            
            // Optional: module quiz
            ...(module.moduleQuiz && {
                moduleQuiz: {
                    quizSettings: module.moduleQuiz.quizSettings ? {
                        durationMinutes: module.moduleQuiz.quizSettings.durationMinutes,
                        passingScorePercentage: module.moduleQuiz.quizSettings.passingScorePercentage,
                        shuffleQuestions: module.moduleQuiz.quizSettings.shuffleQuestions,
                        showResultsImmediately: module.moduleQuiz.quizSettings.showResultsImmediately,
                        allowRetake: module.moduleQuiz.quizSettings.allowRetake,
                    } : undefined,
                    questions: module.moduleQuiz.questions?.map(question => ({
                        questionType: question.questionType,
                        questionText: question.questionText,
                        explanation: question.explanation,
                        options: question.options?.map(option => ({
                            text: option.text,
                            isCorrect: option.isCorrect,
                        })),
                    })),
                }
            }),
        })),
    };

    // Sanitize: remove empty strings and nulls for optional fields the API might reject
    if (!dto.courseImageUrl || dto.courseImageUrl.trim() === '') {
        delete (dto as any).courseImageUrl;
    }
    // Normalize possible markdown-style image link: [url](url)
    if (dto.courseImageUrl && /\[[^\]]+\]\([^\)]+\)/.test(dto.courseImageUrl)) {
        const match = dto.courseImageUrl.match(/\(([^\)]+)\)/);
        if (match?.[1]) {
            (dto as any).courseImageUrl = match[1];
        } else {
            delete (dto as any).courseImageUrl;
        }
    }
    // Always omit slug; backend will generate from title
    delete (dto as any).slug;
    
    // Helper function to check if HTML content is empty
    const isHtmlContentEmpty = (html: string): boolean => {
        if (!html || html.trim() === '') return true;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const textContent = tempDiv.textContent || tempDiv.innerText || '';
        return textContent.trim() === '';
    };
    
    if (!dto.shortDescription || isHtmlContentEmpty(dto.shortDescription)) {
        delete (dto as any).shortDescription;
    }
    if (!dto.description || isHtmlContentEmpty(dto.description)) {
        delete (dto as any).description;
    }

    dto.modules = dto.modules?.map(m => {
        const mm: any = { ...m };
        if (!mm.description || mm.description.trim() === '') delete mm.description;
        if (Array.isArray(mm.lessons)) {
            mm.lessons = mm.lessons.map((l: any) => {
                const ll: any = { ...l };
                if (!ll.videoUrl || String(ll.videoUrl).trim() === '') delete ll.videoUrl;
                if (!ll.title || String(ll.title).trim() === '') delete ll.title;
                return ll;
            });
        }
        return mm;
    });

    return dto;
};

const convertToUpdateCourseDto = async (state: CreateCourseState): Promise<UpdateCourseDto> => {
    // Get lecturer ID from JWT token (same logic as create)
    let teacherId = state.courseInformation.teacherId?.trim() || '';

    if (!teacherId) {
        try {
            const { getUserIdFromTokenAction } = await import('EduSmart/app/(auth)/action');
            const userInfo = await getUserIdFromTokenAction();
            
            if (userInfo.ok && userInfo.userId) {
                teacherId = userInfo.userId;
            } else {
                throw new Error('Unable to get lecturer ID from logged-in account');
            }
        } catch (error) {
            throw new Error('Failed to get lecturer ID: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    }

    if (!teacherId) {
        throw new Error('Failed to determine lecturer ID for course update');
    }
    
    return {
        teacherId: teacherId,
        subjectId: state.courseInformation.subjectId,
        title: state.courseInformation.title,
        shortDescription: state.courseInformation.shortDescription,
        description: state.courseInformation.description,
        courseImageUrl: state.courseInformation.courseImageUrl,
        // DO NOT send courseIntroVideoUrl in update - it's managed separately
        // courseIntroVideoUrl: state.courseInformation.courseIntroVideoUrl,
        durationMinutes: state.courseInformation.durationMinutes,
        level: state.courseInformation.level,
        price: state.courseInformation.price,
        dealPrice: state.courseInformation.dealPrice,
        isActive: state.courseInformation.isActive,
        objectives: state.objectives.map((obj, idx) => ({
            // Only include objectiveId if it exists (for existing objectives)
            ...(obj.id && { objectiveId: obj.id }),
            content: obj.content,
            // Always ensure 1-based indexing for API (idx + 1)
            positionIndex: idx + 1,
            isActive: obj.isActive,
        })),
        requirements: state.requirements.map((req, idx) => ({
            // Only include requirementId if it exists (for existing requirements)  
            ...(req.id && { requirementId: req.id }),
            content: req.content,
            // Always ensure 1-based indexing for API (idx + 1)
            positionIndex: idx + 1,
            isActive: req.isActive,
        })),
        audiences: state.targetAudience.length > 0 ? state.targetAudience.map((aud, idx) => ({
            // Use audienceId instead of targetAudienceId to match API
            ...(aud.id && { audienceId: aud.id }),
            content: aud.content,
            // Always ensure 1-based indexing for API (idx + 1)
            positionIndex: idx + 1,
            isActive: aud.isActive,
        })) : [], // Include empty array explicitly - API might expect this
        // Add courseTags in the format API expects
        courseTags: state.courseTags.map(tag => ({
            tagId: tag.tagId,
        })),
        // Note: Modules are updated separately via a different API endpoint
        // The basic course update only handles course information, objectives, requirements, and audiences
    };
};

export const useCreateCourseStore = create<CreateCourseState>()(
    persist(
        (set, get) => ({
            ...initialState,
            
            // Step management
            setCurrentStep: (step) => set({ currentStep: step }),
            
            // Course information
            updateCourseInformation: (data: any) =>
                set((state) => {
                    const cleanData: Partial<CourseInformation> = {};
                    
                    // Copy basic fields - only update if value is provided and meaningful
                    if (data.title !== undefined && data.title !== null) cleanData.title = String(data.title).trim();
                    if (data.description !== undefined && data.description !== null) cleanData.description = String(data.description);
                    if (data.durationMinutes !== undefined) cleanData.durationMinutes = data.durationMinutes;
                    if (data.price !== undefined && data.price !== null) cleanData.price = Number(data.price) || 0;
                    if (data.dealPrice !== undefined) cleanData.dealPrice = data.dealPrice;
                    if (data.isActive !== undefined) cleanData.isActive = data.isActive;
                    
                    // Handle courseImageUrl - CloudinaryImageUpload returns string when maxCount=1
                    if (data.courseImageUrl !== undefined) {
                        if (typeof data.courseImageUrl === 'string') {
                            cleanData.courseImageUrl = data.courseImageUrl;
                        } else if (Array.isArray(data.courseImageUrl) && data.courseImageUrl.length > 0) {
                            // Handle array format (fallback)
                            const first = data.courseImageUrl[0];
                            const url = (first?.baseUrl || first?.url || '').toString();
                            if (url) {
                                cleanData.courseImageUrl = url;
                            }
                        }
                    }
                    
                    // Map promoVideo → courseIntroVideoUrl
                    if (data.promoVideo !== undefined) {
                        // Handle array format from file uploader
                        if (Array.isArray(data.promoVideo) && data.promoVideo.length > 0) {
                            const firstVideo = data.promoVideo[0];
                            const videoUrl = (firstVideo?.baseUrl || firstVideo?.url || '').toString();
                            if (videoUrl) {
                                cleanData.courseIntroVideoUrl = videoUrl;
                            }
                        } else if (typeof data.promoVideo === 'string' && data.promoVideo.trim()) {
                            cleanData.courseIntroVideoUrl = data.promoVideo.trim();
                        }
                    }
                    
                    // Subject mapping: handle both subjectId and derive subjectCode
                    if (data.subjectId !== undefined && data.subjectId !== null && data.subjectId !== '') {
                        cleanData.subjectId = String(data.subjectId);
                        
                        // Map subjectId to subjectCode using the predefined mapping
                        const subjectCodeMap: Record<string, string> = {
                            'a4917fc0-bbcc-46b1-a7c8-f32e1d2aa298': 'PRF192',
                            'a83eabde-fb96-4732-88f3-3e7a846796bc': 'MAE101',
                            '432cabc2-79bd-42ac-a67b-fc233dd3a6bc': 'CEA201',
                            '3ed33ae3-da55-49f7-b563-41ca0503fab5': 'SSL101C',
                            '63368d18-6112-413d-9815-4e31597b6e4c': 'CSI104',
                            '5e8967c9-2971-4250-a7fc-a8a26ca7f106': 'NWC203C',
                            '0611fe1b-416d-49eb-b0bd-b0ff73cc00c9': 'SSG104',
                            'e70ee6db-2fc9-4176-adae-904973bcc475': 'PRO192',
                            'ec341342-0993-42b2-a4df-ff0433381605': 'MAD101',
                            'b47af2e8-ac4c-4328-b61a-7ba0446556a7': 'OSG202',
                            'ed305e62-8cdc-49af-b7d0-290c54a6dbfb': 'CSD201',
                            '16299387-cb9f-476c-aff1-a93fcd3d9266': 'DBI202',
                            '75ef24fc-2915-4a76-9c26-b4ff1af07f2e': 'LAB211',
                            '8d6297cd-98df-4ed0-9c52-cce0be2642da': 'JPD113',
                            'c1604ae9-5ee3-457d-b7d0-186546f490ba': 'WED201C',
                            'c61bfce2-fc50-478f-a33d-cd2031211125': 'SWE201C',
                            '006449aa-5a7e-4d91-990a-5ffefaa6d220': 'JPD123',
                            'bc1cedaa-4279-4bca-b5d2-60cd4705b4dc': 'IOT102',
                            '4bbc5bf7-bfe9-4762-90cd-7825ca9bffde': 'PRJ301',
                            'a7a8d965-8564-4ad9-ac34-2c8c76f7103b': 'MAS291',
                            '7d6c6094-fcd2-4521-b568-09c5fb796c75': 'SWR302',
                            'de4982a0-82aa-48b0-b824-8267edb15a55': 'SWT301',
                            'a4b86226-5d71-4e97-a822-284ab4bca343': 'SWP391',
                            '898e94b7-cbab-4b6d-857b-3a3a09dfbe0e': 'ITE302C',
                            '2a56f88e-29c4-4482-92c3-23ae0de88d72': 'OJT202',
                            '810cc767-1a1f-42ab-8510-d670aa11a69b': 'ENW492C',
                            '9b9b36a8-5dbf-4ba3-8caf-3645716918c2': 'EXE101',
                            '3ccd8b12-32a5-451d-9cc7-e034c3c544f0': 'PRU212',
                            '7b8bbd5b-abdf-4203-800c-1890144a6159': 'PMG201C',
                            'fa1f6445-3fc7-4284-b8ac-0338148cd10a': 'SWD392',
                            'd3d0a48d-ba44-4c8a-b9b3-d6cf9e6e2166': 'MLN122',
                            'a9030ae8-8799-4548-82ab-6df7e5fd0fef': 'MLN111',
                            '0773bda7-4280-4dbe-aed2-40bbc6ecf324': 'EXE201',
                            '6c8111e7-0bb2-45a4-b0c3-13ebc34bb621': 'WDU203C',
                            '9119e3a2-1471-4521-99bc-d28e981c2bfd': 'PRM392',
                            'df536a34-ad72-423d-b398-bf8727287d12': 'MLN131',
                            '5e0350ac-c664-4818-93f0-8b3b1eb244df': 'VNR202',
                            '15f5dda4-68b9-4b97-81d5-800a250e0a4e': 'HCM202',
                            '7f0174b9-2a64-480e-9be5-df87092c9f70': 'SEP490',
                            '888a4c89-ea86-4653-aea7-9c8d87139928': 'PRN212',
                            '2857f69c-c1c7-4d87-a365-79a59af754fb': 'PRN222',
                            'b48cb061-4bc6-4eb7-a5b7-856e01d9c283': 'PRN232',
                        };
                        
                        cleanData.subjectCode = subjectCodeMap[cleanData.subjectId] || 'PRF192';
                    }
                    
                    // Convert level from string to number if provided
                    if (data.level !== undefined && data.level !== null && data.level !== '') {
                        const levelMap: Record<string, number> = {
                            'Beginner': 1,
                            'Intermediate': 2,
                            'Advanced': 3
                        };
                        cleanData.level = levelMap[String(data.level)] || 1;
                    }
                    
                    // Map subtitle → shortDescription (preserve existing value if subtitle is empty)
                    if (data.subtitle !== undefined && data.subtitle !== null) {
                        cleanData.shortDescription = String(data.subtitle).trim();
                    }

                    // Map learning objectives (array of strings) → objectives DTO in store
                    // PRESERVE EXISTING IDs to prevent creating duplicates
                    let mappedObjectives = state.objectives;
                    if (Array.isArray(data.learningObjectives)) {
                        // Don't filter out empty strings to allow users to add items and fill them later
                        const objectives = data.learningObjectives
                            .filter((s: unknown) => typeof s === 'string' || s === undefined || s === null)
                            .map((s: unknown) => typeof s === 'string' ? s : '');
                        
                        mappedObjectives = objectives.map((content: string, index: number) => {
                            // Preserve existing ID by index position (not by content match to handle duplicate content)
                            const existingObjective = state.objectives[index];
                            return {
                                id: existingObjective?.id, // Preserve existing ID if found at same index
                                content,
                                positionIndex: index,
                                isActive: true,
                            };
                        });
                    }

                    // Map requirements (array of strings)
                    // PRESERVE EXISTING IDs to prevent creating duplicates  
                    let mappedRequirements = state.requirements;
                    if (Array.isArray(data.requirements)) {
                        // Don't filter out empty strings to allow users to add items and fill them later
                        const requirements = data.requirements
                            .filter((s: unknown) => typeof s === 'string' || s === undefined || s === null)
                            .map((s: unknown) => typeof s === 'string' ? s : '');
                            
                        mappedRequirements = requirements.map((content: string, index: number) => {
                            // Preserve existing ID by index position (not by content match to handle duplicate content)
                            const existingRequirement = state.requirements[index];
                            return {
                                id: existingRequirement?.id, // Preserve existing ID if found at same index
                                content,
                                positionIndex: index,
                                isActive: true,
                            };
                        });
                    }

                    // Map target audience (array of strings)
                    // PRESERVE EXISTING IDs to prevent creating duplicates
                    let mappedTargetAudience = state.targetAudience;
                    if (Array.isArray(data.targetAudience)) {
                        // Don't filter out empty strings to allow users to add items and fill them later
                        const targetAudience = data.targetAudience
                            .filter((s: unknown) => typeof s === 'string' || s === undefined || s === null)
                            .map((s: unknown) => typeof s === 'string' ? s : '');
                            
                        mappedTargetAudience = targetAudience.map((content: string, index: number) => {
                            // Preserve existing ID by index position (not by content match to handle duplicate content)
                            const existingTargetAudience = state.targetAudience[index];
                            return {
                                id: existingTargetAudience?.id, // Preserve existing ID if found at same index
                                content,
                                positionIndex: index,
                                isActive: true,
                            };
                        });
                    }

                    // Map course tags
                    let mappedCourseTags = state.courseTags;
                    if (Array.isArray(data.courseTags)) {
                        mappedCourseTags = data.courseTags
                            .filter((tag: any) => tag && typeof tag.tagId === 'number')
                            .map((tag: any) => ({
                                tagId: tag.tagId,
                                tagName: tag.tagName || tag.name || '',
                            }));
                    } else if (Array.isArray(data.tags)) {
                        // Support both 'courseTags' and 'tags' for flexibility
                        mappedCourseTags = data.tags
                            .filter((tag: any) => tag && typeof tag.tagId === 'number')
                            .map((tag: any) => ({
                                tagId: tag.tagId,
                                tagName: tag.tagName || tag.name || '',
                            }));
                    }

                    const updatedState = {
                        courseInformation: { ...state.courseInformation, ...cleanData },
                        objectives: mappedObjectives,
                        requirements: mappedRequirements,
                        targetAudience: mappedTargetAudience,
                        courseTags: mappedCourseTags,
                    };
                    
                    return updatedState;
                }),
            
            // Objectives management
            addObjective: (objective) =>
                set((state) => ({
                    objectives: [
                        ...state.objectives,
                        { ...objective, positionIndex: state.objectives.length }
                    ]
                })),
            
            updateObjective: (index, data) =>
                set((state) => ({
                    objectives: state.objectives.map((obj, i) =>
                        i === index ? { ...obj, ...data } : obj
                    )
                })),
            
            removeObjective: (index) =>
                set((state) => ({
                    objectives: updatePositionIndexes(
                        state.objectives.filter((_, i) => i !== index)
                    )
                })),
            
            reorderObjectives: (startIndex, endIndex) =>
                set((state) => ({
                    objectives: updatePositionIndexes(
                        reorderArray(state.objectives, startIndex, endIndex)
                    )
                })),
            
            // Requirements management
            addRequirement: (requirement) =>
                set((state) => ({
                    requirements: [
                        ...state.requirements,
                        { ...requirement, positionIndex: state.requirements.length }
                    ]
                })),
            
            updateRequirement: (index, data) =>
                set((state) => ({
                    requirements: state.requirements.map((req, i) =>
                        i === index ? { ...req, ...data } : req
                    )
                })),
            
            removeRequirement: (index) =>
                set((state) => ({
                    requirements: updatePositionIndexes(
                        state.requirements.filter((_, i) => i !== index)
                    )
                })),
            
            reorderRequirements: (startIndex, endIndex) =>
                set((state) => ({
                    requirements: updatePositionIndexes(
                        reorderArray(state.requirements, startIndex, endIndex)
                    )
                })),
            
            // Target Audience management
            addTargetAudience: (targetAudience) =>
                set((state) => ({
                    targetAudience: [
                        ...state.targetAudience,
                        { ...targetAudience, positionIndex: state.targetAudience.length }
                    ]
                })),
            
            updateTargetAudience: (index, data) =>
                set((state) => ({
                    targetAudience: state.targetAudience.map((aud, i) =>
                        i === index ? { ...aud, ...data } : aud
                    )
                })),
            
            removeTargetAudience: (index) =>
                set((state) => ({
                    targetAudience: updatePositionIndexes(
                        state.targetAudience.filter((_, i) => i !== index)
                    )
                })),
            
            reorderTargetAudience: (startIndex, endIndex) =>
                set((state) => ({
                    targetAudience: updatePositionIndexes(
                        reorderArray(state.targetAudience, startIndex, endIndex)
                    )
                })),
            
            // Tags management
            addTag: (tag) =>
                set((state) => ({
                    courseTags: [...state.courseTags, tag]
                })),
            
            removeTag: (tagId) =>
                set((state) => ({
                    courseTags: state.courseTags.filter(tag => tag.tagId !== tagId)
                })),
            
            updateTags: (tags) =>
                set({ courseTags: tags }),
            
            // Module management
            addModule: (module) =>
                set((state) => ({
                    modules: [
                        ...state.modules,
                        {
                            ...module,
                            positionIndex: state.modules.length,
                            isExpanded: false
                        }
                    ]
                })),
            
            updateModule: (index, data) =>
                set((state) => ({
                    modules: state.modules.map((module, i) =>
                        i === index ? { ...module, ...data } : module
                    )
                })),
            
            removeModule: (index) =>
                set((state) => ({
                    modules: updatePositionIndexes(
                        state.modules.filter((_, i) => i !== index)
                    )
                })),
            
            reorderModules: (startIndex, endIndex) =>
                set((state) => ({
                    modules: updatePositionIndexes(
                        reorderArray(state.modules, startIndex, endIndex)
                    )
                })),
            
            toggleModuleExpansion: (index) =>
                set((state) => ({
                    modules: state.modules.map((module, i) =>
                        i === index ? { ...module, isExpanded: !module.isExpanded } : module
                    )
                })),
            
            // Module objectives management
            addModuleObjective: (moduleIndex, objective) =>
                set((state) => ({
                    modules: state.modules.map((module, i) =>
                        i === moduleIndex ? {
                            ...module,
                            objectives: [
                                ...module.objectives,
                                { ...objective, positionIndex: module.objectives.length }
                            ]
                        } : module
                    )
                })),
            
            updateModuleObjective: (moduleIndex, objectiveIndex, data) =>
                set((state) => ({
                    modules: state.modules.map((module, i) =>
                        i === moduleIndex ? {
                            ...module,
                            objectives: module.objectives.map((obj, j) =>
                                j === objectiveIndex ? { ...obj, ...data } : obj
                            )
                        } : module
                    )
                })),
            
            removeModuleObjective: (moduleIndex, objectiveIndex) =>
                set((state) => ({
                    modules: state.modules.map((module, i) =>
                        i === moduleIndex ? {
                            ...module,
                            objectives: updatePositionIndexes(
                                module.objectives.filter((_, j) => j !== objectiveIndex)
                            )
                        } : module
                    )
                })),
            
            // Lesson management
            addLesson: (moduleIndex, lesson) =>
                set((state) => ({
                    modules: state.modules.map((module, i) =>
                        i === moduleIndex ? {
                            ...module,
                            lessons: [
                                ...module.lessons,
                                { ...lesson, positionIndex: module.lessons.length }
                            ]
                        } : module
                    )
                })),
            
            updateLesson: (moduleIndex, lessonIndex, data) =>
                set((state) => ({
                    modules: state.modules.map((module, i) =>
                        i === moduleIndex ? {
                            ...module,
                            lessons: module.lessons.map((lesson, j) =>
                                j === lessonIndex ? { ...lesson, ...data } : lesson
                            )
                        } : module
                    )
                })),
            
            removeLesson: (moduleIndex, lessonIndex) =>
                set((state) => ({
                    modules: state.modules.map((module, i) =>
                        i === moduleIndex ? {
                            ...module,
                            lessons: updatePositionIndexes(
                                module.lessons.filter((_, j) => j !== lessonIndex)
                            )
                        } : module
                    )
                })),
            
            reorderLessons: (moduleIndex, startIndex, endIndex) =>
                set((state) => ({
                    modules: state.modules.map((module, i) =>
                        i === moduleIndex ? {
                            ...module,
                            lessons: updatePositionIndexes(
                                reorderArray(module.lessons, startIndex, endIndex)
                            )
                        } : module
                    )
                })),
            
            // Error management
            clearError: () => set({ error: null }),
            
            // Quiz editing tracking
            markQuizAsEdited: (quizId) => 
                set((state) => ({
                    editedQuizIds: new Set(state.editedQuizIds).add(quizId)
                })),
            
            clearEditedQuizIds: () => set({ editedQuizIds: new Set<string>() }),
            
            // API actions
            createCourse: async () => {
                const state = get();
                set({ isSaving: true, error: null });
                
                // Validate required fields (teacherId will be extracted from JWT)
                if (!state.courseInformation.subjectId) {
                    set({ 
                        error: 'Subject ID is required. Please select a category.',
                        isSaving: false 
                    });
                    return false;
                }
                
                if (!state.courseInformation.title) {
                    set({ 
                        error: 'Course title is required',
                        isSaving: false 
                    });
                    return false;
                }
                
                try {
                    const courseData = await convertToCreateCourseDto(state);
                    
                    // Debug: Log the payload being sent to API                    
                    const response = await courseServiceAPI.createCourse(courseData);

                    if (response.success && response.response) {
                        const createdCourseId = response.response;
                        
                        // Try to immediately fetch the created course to verify it exists
                        setTimeout(async () => {
                            try {
                                const { courseServiceAPI } = await import('EduSmart/api/api-course-service');
                                const fetchResponse = await courseServiceAPI.getCourseById(createdCourseId);
                                
                                if (fetchResponse.success && fetchResponse.response) {
                                    // Course created and verified successfully
                                } else {                                }
                            } catch (fetchError) {
                                // Error fetching created course - but creation was still successful
                            }
                        }, 1000); // Wait 1 second for potential DB commit delay
                        
                        set({ 
                            courseId: createdCourseId,
                            isSaving: false 
                        });
                        return true;
                    } else {
                        if (response.detailErrors && response.detailErrors.length > 0) {
                            // Validation errors found
                        }
                        set({ 
                            error: response.message || 'Failed to create course',
                            isSaving: false 
                        });
                        return false;
                    }
                } catch (error: any) {
                    const status = error?.response?.status;
                    const data = error?.response?.data;
                    let message = 'Network error occurred while creating course';
                    if (status) {
                        message = `Create failed (HTTP ${status})`;
                    }
                    if (data?.message) {
                        message = `${message}: ${data.message}`;
                    }
                    
                    set({ 
                        error: message,
                        isSaving: false 
                    });
                    return false;
                }
            },
            
            updateCourse: async () => {
                const state = get();
                if (!state.courseId) {
                    set({ error: 'No course ID available for update' });
                    return false;
                }
                
                set({ isSaving: true, error: null });
                
                try {
                    // Step 1: Update basic course information
                    const courseData = await convertToUpdateCourseDto(state);
                    const response = await courseServiceAPI.updateCourse(state.courseId, courseData);
                    
                    if (!response || response.success !== true) {
                        const errorMsg = response?.message || 'Failed to update course information';
                        set({ 
                            error: errorMsg,
                            isSaving: false 
                        });
                        return false;
                    }
                    
                    // Step 2: Update modules (if there are any modules)
                    if (state.modules && state.modules.length > 0) {
                        const { transformModulesForUpdate } = await import('EduSmart/services/course/courseTransformers');
                        const modulesDto = transformModulesForUpdate(state.modules);
                        
                        const modulesResponse = await courseServiceAPI.updateCourseModules(
                            state.courseId, 
                            modulesDto,
                            state.courseId
                        );
                        
                        if (!modulesResponse || modulesResponse.success !== true) {
                            const errorMsg = modulesResponse?.message || 'Failed to update modules';
                            set({ 
                                error: errorMsg,
                                isSaving: false 
                            });
                            return false;
                        }
                    }
                    
                    // Step 3: Update quizzes (if there are any edited quizzes)
                    if (state.editedQuizIds && state.editedQuizIds.size > 0) {
                        const quizResult = await updateCourseQuizzes(state.courseId, state.modules, state.editedQuizIds);
                        
                        if (!quizResult.success) {
                            set({
                                error: quizResult.error || quizResult.message || 'Failed to update quizzes',
                                isSaving: false,
                            });
                            return false;
                        }
                        
                        // Clear the edited quiz IDs to mark them as synced
                        set({ editedQuizIds: new Set<string>() });
                    }
                    
                    // All updates successful
                    set({ isSaving: false, error: null });
                    return true;
                    
                } catch (error) {
                    console.error('Update course error:', error);
                    const errorMsg = error instanceof Error ? error.message : 'Network error occurred while updating course';
                    set({ 
                        error: errorMsg,
                        isSaving: false 
                    });
                    return false;
                }
            },
            
            loadCourseData: async (courseId: string) => {
                set({ isLoading: true, error: null });
                
                // Clear localStorage to prevent interference with fresh data
                try {
                    localStorage.removeItem('create-course-storage');
                } catch (e) {                }
                
                try {
                    const response = await courseServiceAPI.getCourseById(courseId);
                    
                    if (response.success && response.response) {
                        const course = response.response;
                        
                        set({
                            courseId,
                            currentStep: 0, // Reset to step 1 when entering edit mode
                            isCreateMode: false, // Set edit mode
                            courseInformation: {
                                teacherId: course.teacherId,
                                subjectId: course.subjectId,
                                subjectCode: course.subjectCode || '',
                                title: course.title || '',
                                shortDescription: course.shortDescription || '',
                                description: course.description || '',
                                courseImageUrl: course.courseImageUrl && !course.courseImageUrl.includes('example.com') 
                                    ? course.courseImageUrl 
                                    : undefined, // Remove example URLs
                                // Load courseIntroVideoUrl from API - try both 'videoUrl' and 'courseIntroVideoUrl'
                                courseIntroVideoUrl: (course as any).videoUrl || course.courseIntroVideoUrl || '', // Always provide empty string if undefined
                                durationMinutes: course.durationMinutes,
                                level: typeof course.level === 'string' ? parseInt(course.level, 10) : (course.level || 1), // Ensure level is a number
                                price: course.price,
                                dealPrice: course.dealPrice,
                                isActive: course.isActive,
                            },
                            objectives: course.objectives?.map(obj => ({
                                id: obj.objectiveId,
                                content: obj.content || '',
                                positionIndex: obj.positionIndex,
                                isActive: obj.isActive,
                            })) || [],
                            requirements: course.requirements?.map(req => ({
                                id: req.requirementId,
                                content: req.content || '',
                                positionIndex: req.positionIndex,
                                isActive: req.isActive,
                            })) || [],
                            courseTags: ((course as any).tags || course.courseTags)?.map((tag: any) => ({
                                tagId: tag.tagId || tag.id || tag.tagID,
                                tagName: tag.tagName || tag.name || tag.tag_name || '',
                            })) || [], // Always provide empty array if undefined
                            // Load targetAudience from API - use correct field 'audiences'
                            targetAudience: course.audiences?.map((aud: any) => ({
                                id: aud.audienceId || aud.id,
                                content: aud.content || '',
                                positionIndex: aud.positionIndex || 0,
                                isActive: aud.isActive !== false,
                            })) || [], // Always provide empty array if undefined
                            modules: course.modules?.map(module => {
                                // Cast module to any to access fields not in TypeScript interface but present in API
                                const moduleData = module as any;
                                
                                return {
                                    id: moduleData.moduleId,
                                    moduleName: moduleData.moduleName || '',
                                    description: moduleData.description,
                                    positionIndex: moduleData.positionIndex,
                                    isActive: moduleData.isActive,
                                    isCore: moduleData.isCore,
                                    durationMinutes: moduleData.durationMinutes,
                                    level: moduleData.level,
                                    objectives: moduleData.objectives?.map((obj: any) => ({
                                        id: obj.objectiveId,
                                        content: obj.content || '',
                                        positionIndex: obj.positionIndex,
                                        isActive: obj.isActive,
                                    })) || [],
                                    lessons: (moduleData.lessons || moduleData.guestLessons)?.map((lesson: any) => ({
                                        id: lesson.lessonId,
                                        title: lesson.title || '',
                                        // Use the correct field 'videoUrl' from API response
                                        videoUrl: lesson.videoUrl || 
                                                 lesson.lessonVideoUrl || 
                                                 lesson.contentUrl || '', 
                                        // Use the correct field 'videoDurationSec' from API response
                                        videoDurationSec: lesson.videoDurationSec || 
                                                         lesson.durationSeconds || 
                                                         lesson.duration || 0,
                                        positionIndex: lesson.positionIndex,
                                        isActive: lesson.isActive,
                                        // Load lesson quiz from API response if it exists
                                        lessonQuiz: lesson.lessonQuiz ? {
                                            id: lesson.lessonQuiz.quizId || lesson.lessonQuiz.id || `lesson-quiz-${lesson.lessonId}`,
                                            quizId: lesson.lessonQuiz.quizId || lesson.lessonQuiz.id,
                                            lessonQuizId: lesson.lessonQuiz.lessonQuizId || lesson.lessonQuiz.id,
                                            quizSettings: lesson.lessonQuiz.quizSettings ? {
                                                durationMinutes: lesson.lessonQuiz.quizSettings.durationMinutes,
                                                passingScorePercentage: lesson.lessonQuiz.quizSettings.passingScorePercentage,
                                                shuffleQuestions: lesson.lessonQuiz.quizSettings.shuffleQuestions,
                                                showResultsImmediately: lesson.lessonQuiz.quizSettings.showResultsImmediately,
                                                allowRetake: lesson.lessonQuiz.quizSettings.allowRetake,
                                            } : undefined,
                                            questions: lesson.lessonQuiz.questions?.map((q: any) => ({
                                                id: q.questionId || `question-${Math.random()}`,
                                                questionType: q.questionType,
                                                questionText: q.questionText,
                                                explanation: q.explanation,
                                                options: q.answers?.map((ans: any) => ({
                                                    id: ans.answerId || `answer-${Math.random()}`,
                                                    text: ans.answerText,
                                                    isCorrect: ans.isCorrect || false,
                                                })) || [],
                                            })) || [],
                                        } : undefined,
                                    })) || [],
                                    // Load discussions from moduleDiscussionDetails
                                    discussions: moduleData.moduleDiscussionDetails?.map((discussion: any) => ({
                                        id: discussion.discussionId,
                                        title: discussion.title || '',
                                        description: discussion.description || '',
                                        discussionQuestion: discussion.discussionQuestion || '',
                                        isActive: discussion.isActive ?? true,
                                        createdAt: discussion.createdAt,
                                        updatedAt: discussion.updatedAt,
                                    })) || [],
                                    // Load materials from moduleMaterialDetails
                                    materials: moduleData.moduleMaterialDetails?.map((material: any) => ({
                                        id: material.materialId,
                                        title: material.title || '',
                                        description: material.description || '',
                                        fileUrl: material.fileUrl || '',
                                        isActive: material.isActive ?? true,
                                        createdAt: material.createdAt,
                                        updatedAt: material.updatedAt,
                                    })) || [],
                                    // Load module quiz from moduleQuiz
                                    moduleQuiz: moduleData.moduleQuiz ? {
                                        id: moduleData.moduleQuiz.quizId || moduleData.moduleQuiz.id || `module-quiz-${moduleData.moduleId}`,
                                        quizId: moduleData.moduleQuiz.quizId || moduleData.moduleQuiz.id,
                                        moduleQuizId: moduleData.moduleQuiz.moduleQuizId || moduleData.moduleQuiz.id,
                                        quizSettings: moduleData.moduleQuiz.quizSettings ? {
                                            durationMinutes: moduleData.moduleQuiz.quizSettings.durationMinutes,
                                            passingScorePercentage: moduleData.moduleQuiz.quizSettings.passingScorePercentage,
                                            shuffleQuestions: moduleData.moduleQuiz.quizSettings.shuffleQuestions,
                                            showResultsImmediately: moduleData.moduleQuiz.quizSettings.showResultsImmediately,
                                            allowRetake: moduleData.moduleQuiz.quizSettings.allowRetake,
                                        } : undefined,
                                        questions: moduleData.moduleQuiz.questions?.map((q: any) => ({
                                            id: q.questionId || `question-${Math.random()}`,
                                            questionType: q.questionType,
                                            questionText: q.questionText,
                                            explanation: q.explanation,
                                            options: q.answers?.map((ans: any) => ({
                                                id: ans.answerId || `answer-${Math.random()}`,
                                                text: ans.answerText,
                                                isCorrect: ans.isCorrect || false,
                                            })) || [],
                                        })) || [],
                                    } : undefined,
                                    isExpanded: false,
                                };
                            }) || [],
                            isLoading: false,
                            isSaving: false,
                            error: null,
                        });
                        
                        return true;
                    } else {
                        set({ 
                            error: response.message || 'Failed to load course data',
                            isLoading: false 
                        });
                        return false;
                    }
                } catch (error) {
                    set({ 
                        error: 'Network error occurred while loading course data',
                        isLoading: false 
                    });
                    return false;
                }
            },
            
            // Form management
            resetForm: () => {
                // Reset state to initial
                set(initialState);
                
                // Also clear localStorage to prevent restoration
                try {
                    if (typeof window !== 'undefined' && window.localStorage) {
                        localStorage.removeItem('create-course-storage');                    }
                } catch (error) {                }
            },
            setCourseId: (id) => set({ courseId: id }),
            forceResetForCreateMode: () => {
                // Force reset for create mode - clear everything including localStorage
                try {
                    if (typeof window !== 'undefined' && window.localStorage) {
                        localStorage.removeItem('create-course-storage');
                    }
                } catch (error) {                }
                
                // Reset state completely
                set({ ...initialState, isCreateMode: true });            },
            setCreateMode: (isCreateMode) => set({ isCreateMode }),
        }),
        {
            name: 'create-course-storage',
            storage: createJSONStorage(() => {
                // Enhanced SSR check - return proper no-op storage for server-side rendering
                if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
                    return {
                        getItem: () => null,
                        setItem: () => {},
                        removeItem: () => {},
                    };
                }
                
                // Add extra safety checks for localStorage
                return {
                    getItem: (name: string) => {
                        try {
                            const item = localStorage.getItem(name);
                            if (item) {
                                // Validate the JSON before returning
                                JSON.parse(item);
                                return item;
                            }
                            return null;
                        } catch (error) {                            return null;
                        }
                    },
                    setItem: (name: string, value: string) => {
                        try {
                            // Validate JSON before storing
                            JSON.parse(value);
                            localStorage.setItem(name, value);
                        } catch (error) {                        }
                    },
                    removeItem: (name: string) => {
                        try {
                            localStorage.removeItem(name);
                        } catch (error) {                        }
                    },
                };
            }),
            partialize: (state) => ({
                currentStep: state.currentStep,
                courseInformation: state.courseInformation,
                objectives: state.objectives,
                requirements: state.requirements,
                targetAudience: state.targetAudience,
                courseTags: state.courseTags,
                modules: state.modules,
                courseId: state.courseId,
                isCreateMode: state.isCreateMode,
            }),
            // Add version and migration support
            version: 1,
            migrate: (persistedState: any, version: number) => {
                return persistedState;
            },
            // Skip hydration errors and continue - prevent SSR issues
            skipHydration: true,
            onRehydrateStorage: () => {
                return (state, error) => {
                    if (error) {
                    } else {
                    }
                };
            },
        }
    )
);

