import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  courseServiceAPI, 
  CreateCourseDto, 
  UpdateCourseDto,
} from 'EduSmart/api/api-course-service';

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
}

export interface Discussion {
    id?: string; // for updates
    title: string;
    description?: string;
    discussionQuestion?: string;
    isActive: boolean;
}

export interface Material {
    id?: string; // for updates
    title: string;
    description?: string;
    fileUrl?: string;
    isActive: boolean;
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
    let teacherId = '';
    
    try {
        const { getUserIdFromTokenAction } = await import('EduSmart/app/(auth)/action');
        const userInfo = await getUserIdFromTokenAction();
        
        if (userInfo.ok && userInfo.userId) {
            teacherId = userInfo.userId;
        } else {
            console.error('[CreateCourse] Failed to get lecturer ID from JWT:', userInfo);
            throw new Error('Unable to get lecturer ID from logged-in account');
        }
    } catch (error) {
        console.error('[CreateCourse] Error extracting lecturer ID:', error);
        throw new Error('Failed to get lecturer ID: ' + (error instanceof Error ? error.message : 'Unknown error'));
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
    let teacherId = '';
    
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
    
    return {
        teacherId: teacherId,
        subjectId: state.courseInformation.subjectId,
        title: state.courseInformation.title,
        shortDescription: state.courseInformation.shortDescription,
        description: state.courseInformation.description,
        courseImageUrl: state.courseInformation.courseImageUrl,
        courseIntroVideoUrl: state.courseInformation.courseIntroVideoUrl, // Video giới thiệu khóa học
        durationMinutes: state.courseInformation.durationMinutes,
        level: state.courseInformation.level,
        price: state.courseInformation.price,
        dealPrice: state.courseInformation.dealPrice,
        isActive: state.courseInformation.isActive,
        objectives: state.objectives.map((obj, idx) => ({
            // Only include objectiveId if it exists (for existing objectives)
            ...(obj.id && { objectiveId: obj.id }),
            content: obj.content,
            positionIndex: obj.positionIndex ?? idx,
            isActive: obj.isActive,
        })),
        requirements: state.requirements.map((req, idx) => ({
            // Only include requirementId if it exists (for existing requirements)  
            ...(req.id && { requirementId: req.id }),
            content: req.content,
            positionIndex: req.positionIndex ?? idx,
            isActive: req.isActive,
        })),
        audiences: state.targetAudience.length > 0 ? state.targetAudience.map(aud => ({
            // Use audienceId instead of targetAudienceId to match API
            ...(aud.id && { audienceId: aud.id }),
            content: aud.content,
            positionIndex: aud.positionIndex,
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
                    if (data.courseImageUrl !== undefined) cleanData.courseImageUrl = data.courseImageUrl;
                    if (data.durationMinutes !== undefined) cleanData.durationMinutes = data.durationMinutes;
                    if (data.price !== undefined && data.price !== null) cleanData.price = Number(data.price) || 0;
                    if (data.dealPrice !== undefined) cleanData.dealPrice = data.dealPrice;
                    if (data.isActive !== undefined) cleanData.isActive = data.isActive;
                    
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
                    
                    // Subject mapping: form now provides subjectId directly
                    if (data.subjectId !== undefined && data.subjectId !== null && data.subjectId !== '') {
                        cleanData.subjectId = String(data.subjectId);
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

                    // Map cover image uploader → courseImageUrl (first item)
                    if (Array.isArray(data.coverImage) && data.coverImage.length > 0) {
                        const first = data.coverImage[0];
                        const url = (first?.baseUrl || first?.url || '').toString();
                        if (url) {
                            cleanData.courseImageUrl = url;
                        }
                    }

                    // Map learning objectives (array of strings) → objectives DTO in store
                    // PRESERVE EXISTING IDs to prevent creating duplicates
                    let mappedObjectives = state.objectives;
                    if (Array.isArray(data.learningObjectives)) {
                        const filteredObjectives = data.learningObjectives
                            .filter((s: unknown) => typeof s === 'string' && s.trim().length > 0);
                        
                        mappedObjectives = filteredObjectives.map((content: string, index: number) => {
                            // Try to preserve existing ID if content matches
                            const existingObjective = state.objectives.find(obj => obj.content === content);
                            return {
                                id: existingObjective?.id, // Preserve existing ID if found
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
                        const filteredRequirements = data.requirements
                            .filter((s: unknown) => typeof s === 'string' && s.trim().length > 0);
                            
                        mappedRequirements = filteredRequirements.map((content: string, index: number) => {
                            // Try to preserve existing ID if content matches
                            const existingRequirement = state.requirements.find(req => req.content === content);
                            return {
                                id: existingRequirement?.id, // Preserve existing ID if found
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
                        const filteredTargetAudience = data.targetAudience
                            .filter((s: unknown) => typeof s === 'string' && s.trim().length > 0);
                            
                        mappedTargetAudience = filteredTargetAudience.map((content: string, index: number) => {
                            // Try to preserve existing ID if content matches
                            const existingTargetAudience = state.targetAudience.find(aud => aud.content === content);
                            return {
                                id: existingTargetAudience?.id, // Preserve existing ID if found
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
                                } else {
                                    console.warn('⚠️ [CreateCourse] Course created but verification failed:', fetchResponse);
                                }
                            } catch (fetchError) {
                                console.error('❌ [CreateCourse] Error during course verification:', fetchError);
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
                    const courseData = await convertToUpdateCourseDto(state);
                    
                    // Validation: Since modules are not part of basic course update,
                    // we skip module validation for now
                    // Modules would be updated via a separate API endpoint if needed
                    
                    const response = await courseServiceAPI.updateCourse(state.courseId, courseData);
                    
                    if (response.success) {
                        set({ isSaving: false });
                        return true;
                    } else {
                        set({ 
                            error: response.message || 'Failed to update course',
                            isSaving: false 
                        });
                        return false;
                    }
                } catch (error) {
                    set({ 
                        error: 'Network error occurred while updating course',
                        isSaving: false 
                    });
                    return false;
                }
            },
            
            loadCourseData: async (courseId: string) => {
                set({ isLoading: true, error: null });
                
                try {
                    const response = await courseServiceAPI.getCourseById(courseId);
                    
                    if (response.success && response.response) {
                        const course = response.response;
                        
                        set({
                            courseId,
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
                                // Initialize courseIntroVideoUrl as empty since API doesn't return it
                                courseIntroVideoUrl: '', // Video giới thiệu khóa học - will be empty for editing
                                durationMinutes: course.durationMinutes,
                                level: course.level,
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
                            courseTags: course.courseTags?.map(tag => ({
                                tagId: tag.tagId,
                                tagName: tag.tagName || '',
                            })) || [],
                            // Initialize empty targetAudience array since API doesn't return this field
                            targetAudience: [],
                            modules: course.modules?.map(module => ({
                                id: module.moduleId,
                                moduleName: module.moduleName || '',
                                description: module.description,
                                positionIndex: module.positionIndex,
                                isActive: module.isActive,
                                isCore: module.isCore,
                                durationMinutes: module.durationMinutes,
                                level: module.level,
                                objectives: module.objectives?.map(obj => ({
                                    id: obj.objectiveId,
                                    content: obj.content || '',
                                    positionIndex: obj.positionIndex,
                                    isActive: obj.isActive,
                                })) || [],
                                lessons: module.guestLessons?.map(lesson => ({
                                    id: lesson.lessonId,
                                    title: lesson.title || '',
                                    videoUrl: '', // API doesn't provide videoUrl, will be empty for editing
                                    videoDurationSec: 0, // API doesn't provide duration, will be 0 for editing  
                                    positionIndex: lesson.positionIndex,
                                    isActive: lesson.isActive,
                                    // Initialize empty lesson quiz since API doesn't provide quiz details
                                    lessonQuiz: undefined,
                                })) || [],
                                // Initialize empty arrays for discussions and materials since API doesn't return them
                                // These will be available for editing but start empty
                                discussions: [],
                                materials: [],
                                isExpanded: false,
                            })) || [],
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
                    console.error('Load course data error:', error);
                    set({ 
                        error: 'Network error occurred while loading course data',
                        isLoading: false 
                    });
                    return false;
                }
            },
            
            // Form management
            resetForm: () => set(initialState),
            setCourseId: (id) => set({ courseId: id }),
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
                        } catch (error) {
                            console.warn('[CreateCourseStore] Failed to get item from localStorage:', error);
                            return null;
                        }
                    },
                    setItem: (name: string, value: string) => {
                        try {
                            // Validate JSON before storing
                            JSON.parse(value);
                            localStorage.setItem(name, value);
                        } catch (error) {
                            console.warn('[CreateCourseStore] Failed to set item in localStorage:', error);
                        }
                    },
                    removeItem: (name: string) => {
                        try {
                            localStorage.removeItem(name);
                        } catch (error) {
                            console.warn('[CreateCourseStore] Failed to remove item from localStorage:', error);
                        }
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
                        console.error('[CreateCourseStore] Rehydration error:', error);
                    } else {
                    }
                };
            },
        }
    )
);

