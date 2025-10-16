/**
 * Domain Models for Course
 * Pure data structures representing course entities
 */

// ============================================
// Core Course Models
// ============================================

export interface CourseInformation {
  teacherId: string;
  subjectId: string;
  subjectCode: string;
  title: string;
  shortDescription: string;
  description: string;
  courseImageUrl?: string;
  courseIntroVideoUrl?: string;
  durationMinutes?: number;
  level?: number;
  price: number;
  dealPrice?: number;
  isActive: boolean;
}

export interface CourseObjective {
  id?: string;
  content: string;
  positionIndex: number;
  isActive: boolean;
}

export interface CourseRequirement {
  id?: string;
  content: string;
  positionIndex: number;
  isActive: boolean;
}

export interface CourseAudience {
  id?: string;
  content: string;
  positionIndex: number;
  isActive: boolean;
}

export interface CourseTag {
  tagId: number;
  tagName?: string;
}

// ============================================
// Module & Lesson Models
// ============================================

export interface CourseModule {
  id?: string;
  moduleName: string;
  description?: string;
  positionIndex: number;
  isActive: boolean;
  isCore: boolean;
  durationMinutes?: number;
  level?: number;
  objectives: ModuleObjective[];
  lessons: Lesson[];
  discussions?: Discussion[];
  materials?: Material[];
  moduleQuiz?: ModuleQuiz;
}

export interface ModuleObjective {
  id?: string;
  content: string;
  positionIndex: number;
  isActive: boolean;
}

export interface Lesson {
  id?: string;
  title: string;
  videoUrl?: string;
  videoDurationSec?: number;
  positionIndex: number;
  isActive: boolean;
  lessonQuiz?: LessonQuiz;
}

export interface Discussion {
  id?: string;
  title: string;
  description?: string;
  discussionQuestion?: string;
  isActive: boolean;
}

export interface Material {
  id?: string;
  title: string;
  description?: string;
  fileUrl?: string;
  isActive: boolean;
}

// ============================================
// Quiz Models
// ============================================

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

export interface LessonQuiz {
  id?: string;
  quizSettings?: QuizSettings;
  questions?: Question[];
}

// ============================================
// Aggregate Course Model
// ============================================

export interface Course {
  courseId?: string;
  courseInformation: CourseInformation;
  objectives: CourseObjective[];
  requirements: CourseRequirement[];
  targetAudience: CourseAudience[];
  courseTags: CourseTag[];
  modules: CourseModule[];
}

// ============================================
// Query & Filter Models
// ============================================

export interface CoursePagination {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CourseFilters {
  search?: string;
  subjectCode?: string;
  isActive?: boolean;
  sortBy?: CourseSortBy;
}

export enum CourseSortBy {
  CreatedAt = 1,
  UpdatedAt = 2,
  Title = 3,
  Price = 4
}

// ============================================
// Operation Result Models
// ============================================

export interface OperationResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}




