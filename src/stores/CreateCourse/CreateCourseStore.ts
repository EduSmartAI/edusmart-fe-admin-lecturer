import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  courseServiceAPI, 
  CreateCourseDto, 
  UpdateCourseDto,
} from 'EduSmart/api/api-course-service';
import { useSessionAuthStore } from 'EduSmart/stores/Auth/SessionAuthStore';

// Course basic information aligned with API schema
export interface CourseInformation {
    teacherId: string;
    subjectId: string;
    subjectCode: string;
    title: string;
    shortDescription: string;
    description: string;
    courseImageUrl?: string;
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
    isExpanded?: boolean; // UI state only
}

export interface CreateCourseState {
    currentStep: number;
    courseInformation: CourseInformation;
    objectives: CourseObjective[];
    requirements: CourseRequirement[];
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

// Temporary teacher ID - TODO: Get from user session/authentication
const DEFAULT_TEACHER_ID = 'd9824682-b5ba-4cd2-8015-5a808e899e4e';

const initialState = {
    currentStep: 0,
    courseInformation: {
        teacherId: DEFAULT_TEACHER_ID,
        subjectId: '',
        subjectCode: '',
        title: '',
        shortDescription: '',
        description: '',
        courseImageUrl: '',
        durationMinutes: 0,
        level: 1, // 1 = Beginner
        price: 0,
        dealPrice: undefined,
        isActive: true,
    },
    objectives: [],
    requirements: [],
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
const convertToCreateCourseDto = (state: CreateCourseState): CreateCourseDto => {
    // Build raw dto first
    const sessionUserId = useSessionAuthStore.getState().session?.userId;
    // Derive total course duration from modules/lessons if not explicitly set
    const totalMinutesFromState = (state.modules || []).reduce((sum, mod) => {
        const moduleMinutes = (mod.durationMinutes && mod.durationMinutes > 0)
            ? mod.durationMinutes
            : Math.round(((mod.lessons || []).reduce((s, l) => s + (l.videoDurationSec || 0), 0)) / 60);
        return sum + (moduleMinutes || 0);
    }, 0);

    const dto: CreateCourseDto = {
        teacherId: sessionUserId || state.courseInformation.teacherId,
        subjectId: state.courseInformation.subjectId,
        title: state.courseInformation.title,
        shortDescription: state.courseInformation.shortDescription,
        description: state.courseInformation.description,
        // Let backend generate slug to avoid uniqueness conflicts
        // slug: state.courseInformation.slug,
        courseImageUrl: state.courseInformation.courseImageUrl,
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
            lessons: module.lessons
                .filter(lesson => typeof lesson.videoUrl === 'string' && lesson.videoUrl.trim().length > 0)
                .map((lesson, lIdx) => ({
                title: lesson.title,
                videoUrl: lesson.videoUrl,
                videoDurationSec: lesson.videoDurationSec,
                positionIndex: (lesson.positionIndex ?? lIdx) + 1,
                isActive: lesson.isActive,
            })),
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
    if (!dto.shortDescription || dto.shortDescription.trim() === '') {
        delete (dto as any).shortDescription;
    }
    if (!dto.description || dto.description.trim() === '') {
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

const convertToUpdateCourseDto = (state: CreateCourseState): UpdateCourseDto => {
    return {
        teacherId: state.courseInformation.teacherId,
        subjectId: state.courseInformation.subjectId,
        title: state.courseInformation.title,
        shortDescription: state.courseInformation.shortDescription,
        description: state.courseInformation.description,
        courseImageUrl: state.courseInformation.courseImageUrl,
        durationMinutes: state.courseInformation.durationMinutes,
        level: state.courseInformation.level,
        price: state.courseInformation.price,
        dealPrice: state.courseInformation.dealPrice,
        isActive: state.courseInformation.isActive,
        objectives: state.objectives.map(obj => ({
            objectiveId: obj.id,
            content: obj.content,
            positionIndex: obj.positionIndex,
            isActive: obj.isActive,
        })),
        requirements: state.requirements.map(req => ({
            requirementId: req.id,
            content: req.content,
            positionIndex: req.positionIndex,
            isActive: req.isActive,
        })),
        modules: state.modules.map(module => ({
            moduleId: module.id,
            moduleName: module.moduleName,
            description: module.description,
            positionIndex: module.positionIndex,
            isActive: module.isActive,
            isCore: module.isCore,
            durationMinutes: module.durationMinutes,
            level: module.level,
            objectives: module.objectives.map(obj => ({
                objectiveId: obj.id,
                content: obj.content,
                positionIndex: obj.positionIndex,
                isActive: obj.isActive,
            })),
            lessons: module.lessons.map(lesson => ({
                lessonId: lesson.id,
                title: lesson.title,
                videoUrl: lesson.videoUrl,
                videoDurationSec: lesson.videoDurationSec,
                positionIndex: lesson.positionIndex,
                isActive: lesson.isActive,
            })),
        })),
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
                    // Create a clean copy of only the fields we need to avoid circular references
                    const cleanData: Partial<CourseInformation> = {};
                    
                    // Copy basic fields
                    if (data.title !== undefined) cleanData.title = data.title;
                    if (data.description !== undefined) cleanData.description = data.description;
                    if (data.courseImageUrl !== undefined) cleanData.courseImageUrl = data.courseImageUrl;
                    if (data.durationMinutes !== undefined) cleanData.durationMinutes = data.durationMinutes;
                    if (data.price !== undefined) cleanData.price = data.price;
                    if (data.dealPrice !== undefined) cleanData.dealPrice = data.dealPrice;
                    if (data.isActive !== undefined) cleanData.isActive = data.isActive;
                    
                    // Subject mapping: form now provides subjectId directly
                    if (data.subjectId) {
                        cleanData.subjectId = data.subjectId as unknown as string;
                    }
                    
                    // Convert level from string to number if provided
                    if (data.level) {
                        const levelMap: Record<string, number> = {
                            'Beginner': 1,
                            'Intermediate': 2,
                            'Advanced': 3
                        };
                        cleanData.level = levelMap[data.level] || 1;
                    }
                    
                    // Map subtitle → shortDescription
                    if (data.subtitle) {
                        cleanData.shortDescription = data.subtitle;
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
                    let mappedObjectives = state.objectives;
                    if (Array.isArray(data.learningObjectives)) {
                        mappedObjectives = data.learningObjectives
                            .filter((s: unknown) => typeof s === 'string' && s.trim().length > 0)
                            .map((content: string, index: number) => ({
                                content,
                                positionIndex: index,
                                isActive: true,
                            }));
                    }

                    // Map requirements (array of strings)
                    let mappedRequirements = state.requirements;
                    if (Array.isArray(data.requirements)) {
                        mappedRequirements = data.requirements
                            .filter((s: unknown) => typeof s === 'string' && s.trim().length > 0)
                            .map((content: string, index: number) => ({
                                content,
                                positionIndex: index,
                                isActive: true,
                            }));
                    }

                    return {
                        courseInformation: { ...state.courseInformation, ...cleanData },
                        objectives: mappedObjectives,
                        requirements: mappedRequirements,
                    };
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
                
                // Validate required fields
                if (!state.courseInformation.teacherId) {
                    set({ 
                        error: 'Teacher ID is required',
                        isSaving: false 
                    });
                    return false;
                }
                
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
                    const courseData = convertToCreateCourseDto(state);
                    console.log('Sending course data:', courseData); // Debug log
                    const response = await courseServiceAPI.createCourse(courseData);
                    // Debug logs for server response
                    console.log('[CreateCourse] Server response:', response);

                    if (response.success && response.response) {
                        set({ 
                            courseId: response.response,
                            isSaving: false 
                        });
                        return true;
                    } else {
                        if (response.detailErrors && response.detailErrors.length > 0) {
                            console.warn('[CreateCourse] Validation errors:', response.detailErrors);
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
                    console.error('Create course error:', { status, data, raw: error });
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
                    const courseData = convertToUpdateCourseDto(state);
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
                    console.error('Update course error:', error);
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
                                courseImageUrl: course.courseImageUrl,
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
                                    videoUrl: '',
                                    videoDurationSec: 0,
                                    positionIndex: lesson.positionIndex,
                                    isActive: lesson.isActive,
                                })) || [],
                                isExpanded: false,
                            })) || [],
                            isLoading: false,
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
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                currentStep: state.currentStep,
                courseInformation: state.courseInformation,
                objectives: state.objectives,
                requirements: state.requirements,
                modules: state.modules,
                courseId: state.courseId,
            }),
        }
    )
);

