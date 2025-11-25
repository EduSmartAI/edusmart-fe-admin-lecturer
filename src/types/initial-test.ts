/**
 * Initial Test Types
 * Types for initial assessment tests (entry-level tests for students)
 * Based on API: POST /quiz/api/v1/Admin/InsertTest
 */

// Difficulty Levels (0-based from API)
export enum DifficultyLevel {
  EASY = 0,
  MEDIUM = 1,
  HARD = 2,
}

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  [DifficultyLevel.EASY]: 'Dễ',
  [DifficultyLevel.MEDIUM]: 'Trung bình',
  [DifficultyLevel.HARD]: 'Khó',
};

export const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  [DifficultyLevel.EASY]: 'green',
  [DifficultyLevel.MEDIUM]: 'orange',
  [DifficultyLevel.HARD]: 'red',
};

// Question Types (0-based from API)
export enum QuestionType {
  MULTIPLE_CHOICE = 0,
  TRUE_FALSE = 1,
  SHORT_ANSWER = 2,
}

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  [QuestionType.MULTIPLE_CHOICE]: 'Trắc nghiệm',
  [QuestionType.TRUE_FALSE]: 'Đúng/Sai',
  [QuestionType.SHORT_ANSWER]: 'Tự luận ngắn',
};

// Answer Interface
export interface QuestionAnswer {
  answerText: string;
  isCorrect: boolean;
}

// Question Interface
export interface Question {
  questionText: string;
  difficultyLevel: DifficultyLevel;
  questionType: QuestionType;
  explanation: string;
  answers: QuestionAnswer[];
}

// Quiz Interface
export interface Quiz {
  title: string;
  description: string;
  subjectCode: string; // UUID
  questions: Question[];
}

// Initial Test Create Payload
export interface CreateInitialTestDto {
  testName: string;
  description: string;
  quizzes: Quiz[];
}

// Initial Test Response (List Item)
export interface InitialTestListItem {
  testId: string;
  testName: string;
  description: string;
  totalQuizzes: number;
  totalQuestions: number;
  createdAt: string;
  updatedAt: string;
}

// Initial Test Detail
export interface InitialTest extends InitialTestListItem {
  quizzes: Quiz[];
}

// Pagination
export interface PaginationParams {
  pageNumber: number;
  pageSize: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

// API Response Wrapper
export interface ApiResponse<T> {
  response: T;
  success: boolean;
  messageId: string;
  message: string;
  detailErrors: string[] | null;
}
