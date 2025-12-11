/**
 * Practice Test Types
 * Types for coding practice problems with test cases, templates, and examples
 */

// Programming Language Enum - Using actual API languageId values
export enum ProgrammingLanguage {
  CPP = 76,      // C++ (GCC 14.1.0)
  JAVA = 91,     // Java (JDK 17.0.6)
  PYTHON = 92,   // Python (3.12.4)
  JAVASCRIPT = 102, // JavaScript (Node.js 20.17.0)
  TYPESCRIPT = 103, // TypeScript (5.6.2)
  CSHARP = 51,   // C# (Mono 6.12.0.200)
  GO = 95,       // Go (1.22.5)
  RUST = 93,     // Rust (1.79.0)
  RUBY = 80,     // Ruby (3.3.4)
  PHP = 98,      // PHP (8.3.9)
  SWIFT = 83,    // Swift (5.10)
  KOTLIN = 78,   // Kotlin (2.0.0)
}

export const LANGUAGE_NAMES: Record<ProgrammingLanguage, string> = {
  [ProgrammingLanguage.CPP]: 'C++',
  [ProgrammingLanguage.JAVA]: 'Java',
  [ProgrammingLanguage.PYTHON]: 'Python',
  [ProgrammingLanguage.JAVASCRIPT]: 'JavaScript',
  [ProgrammingLanguage.TYPESCRIPT]: 'TypeScript',
  [ProgrammingLanguage.CSHARP]: 'C#',
  [ProgrammingLanguage.GO]: 'Go',
  [ProgrammingLanguage.RUST]: 'Rust',
  [ProgrammingLanguage.RUBY]: 'Ruby',
  [ProgrammingLanguage.PHP]: 'PHP',
  [ProgrammingLanguage.SWIFT]: 'Swift',
  [ProgrammingLanguage.KOTLIN]: 'Kotlin',
};

export const LANGUAGE_ICONS: Record<ProgrammingLanguage, string> = {
  [ProgrammingLanguage.CPP]: '',
  [ProgrammingLanguage.JAVA]: '',
  [ProgrammingLanguage.PYTHON]: '',
  [ProgrammingLanguage.JAVASCRIPT]: '',
  [ProgrammingLanguage.TYPESCRIPT]: '',
  [ProgrammingLanguage.CSHARP]: '',
  [ProgrammingLanguage.GO]: '',
  [ProgrammingLanguage.RUST]: '',
  [ProgrammingLanguage.RUBY]: '',
  [ProgrammingLanguage.PHP]: '',
  [ProgrammingLanguage.SWIFT]: '',
  [ProgrammingLanguage.KOTLIN]: '',
};


// Difficulty Levels (API uses string values)
export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  'Easy': 'Dễ',
  'Medium': 'Trung bình',
  'Hard': 'Khó',
};

export const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  'Easy': 'green',
  'Medium': 'orange',
  'Hard': 'red',
};


// Legacy enum for backward compatibility
export enum Difficulty {
  EASY = 1,
  MEDIUM = 2,
  HARD = 3,
}

// Core Types
export interface PracticeProblem {
  title: string;
  description: string;
  difficulty: number; // API expects 1, 2, 3 for Easy, Medium, Hard
}

export interface TestCase {
  inputData: string;
  expectedOutput: string;
}

export interface TestCases {
  publicTestcases: TestCase[];
  privateTestcases: TestCase[];
}

export interface CodeTemplate {
  languageId: ProgrammingLanguage;
  userTemplatePrefix: string;
  userTemplateSuffix: string;
  userStubCode: string;
}

// API Response Template (uses different property names)
export interface ApiCodeTemplate {
  templateId?: string;
  languageId: number;
  languageName?: string;
  templatePrefix: string; // API uses templatePrefix
  templateSuffix: string; // API uses templateSuffix
  userStubCode: string;
}

export interface PracticeExample {
  exampleOrder: number;
  inputData: string;
  outputData: string;
  explanation: string;
}

// Solution for practice test
export interface PracticeSolution {
  languageId: number;
  solutionCode: string;
}

// API Response Example (includes exampleId)
export interface ApiPracticeExample {
  exampleId?: string;
  exampleOrder: number;
  inputData: string;
  outputData: string;
  explanation: string;
}

// API Response TestCase (flat structure with isPublic flag)
export interface ApiTestCase {
  testcaseId?: string;
  inputData: string;
  expectedOutput: string;
  isPublic: boolean;
}

// Update API types - these include IDs for existing items
export interface UpdateTestCase {
  testcaseId?: string; // Optional: only for existing test cases
  inputData: string;
  expectedOutput: string;
  isPublic: boolean;
}

export interface UpdateCodeTemplate {
  templateId?: string; // Optional: only for existing templates
  languageId: ProgrammingLanguage;
  userTemplatePrefix: string;
  userTemplateSuffix: string;
  userStubCode: string;
}

export interface UpdatePracticeExample {
  exampleId?: string; // Optional: only for existing examples
  exampleOrder: number;
  inputData: string;
  outputData: string;
  explanation: string;
}

export interface UpdatePracticeProblem {
  title: string;
  description: string;
  difficulty: string; // Update API uses string: "Easy", "Medium", "Hard"
}

// API Payloads
export interface CreatePracticeTestDto {
  problem: PracticeProblem;
  testcases: TestCases; // API expects single TestCases object, not array
  templates: CodeTemplate[];
  examples: PracticeExample[];
  solutions: PracticeSolution[];
}

// Update Solution type with optional solutionId
export interface UpdatePracticeSolution {
  solutionId?: string; // Optional: only for existing solutions
  languageId: number;
  solutionCode: string;
}

export interface UpdatePracticeTestDto {
  problemId: string;
  problem: UpdatePracticeProblem;
  testcases: UpdateTestCase[]; // Flat array, not nested
  templates: UpdateCodeTemplate[];
  examples: UpdatePracticeExample[];
  solutions?: UpdatePracticeSolution[]; // Optional for backward compatibility
}

export interface AddExamplesDto {
  problemId: string;
  examples: PracticeExample[];
}

export interface AddTemplatesDto {
  problemId: string;
  templates: CodeTemplate[];
}

export interface AddTestCasesDto {
  problemId: string;
  publicTestcases: TestCase[];
  privateTestcases: TestCase[];
}

// Response Types (API structure)
export interface ApiPracticeSolution {
  solutionId?: string;
  language: {
    languageId: number;
    languageName: string;
  };
  solutionCode: string;
}

export interface PracticeTest {
  problemId: string; // API uses problemId, not id
  title: string;
  description: string;
  difficulty: DifficultyLevel; // API uses string: "Easy", "Medium", "Hard"
  createdAt: string;
  updatedAt?: string;
  totalTestCases?: number;
  totalExamples?: number;
  totalTemplates?: number;
  totalSubmissions?: number;
  examples?: ApiPracticeExample[]; // API response includes exampleId
  testCases?: ApiTestCase[]; // API uses testCases (capital C) as flat array with isPublic
  templates?: ApiCodeTemplate[]; // API response uses templatePrefix/templateSuffix
  solutions?: ApiPracticeSolution[]; // API response includes solutions
  // Legacy support for nested testcases structure
  testcases?: TestCases;
}

export interface PracticeTestListItem {
  problemId: string; // API uses problemId, not id
  title: string;
  difficulty: DifficultyLevel; // API uses string: "Easy", "Medium", "Hard"
  totalTestCases: number;
  totalExamples: number;
  totalTemplates: number;
  totalSubmissions: number;
  createdAt: string;
}

// Pagination
export interface PaginationParams {
  pageNumber: number;
  pageSize: number;
  search?: string;
  difficulty?: DifficultyLevel;
}

// API returns practiceTests array directly in response, not nested in items
export interface PaginatedPracticeTestResponse {
  practiceTests: PracticeTestListItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ApiResponse<T> {
  response: T;
  success: boolean;
  messageId: string;
  message: string;
  detailErrors: string[] | null;
}
