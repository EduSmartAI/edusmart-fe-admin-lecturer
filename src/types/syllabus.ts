/**
 * Syllabus Management Types
 * Types for managing academic syllabuses, majors, semesters, and subjects
 */

// ========== Semester Types ==========
export interface Semester {
  semesterId: string;
  semesterCode: string;
  semesterName: string;
  semesterNumber: number;
}

// ========== Subject in Syllabus ==========
export interface SyllabusSubject {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  credit: number | null;
  isMandatory: boolean;
  positionIndex: number;
}

// ========== Semester in Syllabus ==========
export interface SyllabusSemester {
  semesterId: string;
  semesterName: string;
  positionIndex: number;
  subjects: SyllabusSubject[];
}

// ========== Full Syllabus ==========
export interface Syllabus {
  syllabusId: string;
  majorId: string;
  versionLabel: string;
  effectiveFrom: string;
  effectiveTo: string;
  semesters: SyllabusSemester[];
}

// ========== Syllabus List Item (for listing) ==========
export interface SyllabusListItem {
  syllabusId: string;
  majorId: string;
  majorCode?: string;
  majorName?: string;
  versionLabel: string;
  effectiveFrom: string;
  effectiveTo: string;
  semesterCount?: number;
  subjectCount?: number;
}

// ========== Create Syllabus DTOs ==========
export interface CreateSyllabusSubjectDto {
  subjectId: string;
  credit: number;
  isMandatory: boolean;
  positionIndex: number;
}

export interface CreateSyllabusSemesterDto {
  semesterId: string;
  positionIndex: number;
  subjects: CreateSyllabusSubjectDto[];
}

export interface CreateFullSyllabusDto {
  majorId: string;
  versionLabel: string;
  effectiveFrom: string;
  effectiveTo: string;
  semesters: CreateSyllabusSemesterDto[];
}

export interface CreateFullSyllabusPayload {
  createFullSyllabusDto: CreateFullSyllabusDto;
}

// ========== Clone Syllabus DTOs ==========
export interface CloneCascadeSyllabusDto {
  baseVersion: string;
  newVersion: string;
  majorCode: string;
  effectiveFrom: string;
  effectiveTo: string;
}

export interface CloneCascadeSyllabusPayload {
  cloneCascadeSyllabusDto: CloneCascadeSyllabusDto;
}

export interface CloneFoundationSyllabusDto {
  baseVersion: string;
  newVersion: string;
  effectiveFrom: string;
  effectiveTo: string;
}

export interface CloneFoundationSyllabusPayload {
  cloneFoundationSyllabusDto: CloneFoundationSyllabusDto;
}

// ========== Wizard State ==========
export interface SyllabusWizardStep1 {
  majorId: string;
  versionLabel: string;
  effectiveFrom: string;
  effectiveTo: string;
}

export interface SyllabusWizardStep2 {
  selectedSemesterIds: string[];
}

export interface SyllabusWizardStep3 {
  semesterSubjects: Record<string, CreateSyllabusSubjectDto[]>;
}

export interface SyllabusWizardState {
  currentStep: number;
  step1Data: SyllabusWizardStep1 | null;
  step2Data: SyllabusWizardStep2 | null;
  step3Data: SyllabusWizardStep3 | null;
}

// ========== Clone Modal State ==========
export type CloneType = 'cascade' | 'foundation';

export interface CloneModalState {
  isOpen: boolean;
  cloneType: CloneType | null;
  sourceSyllabus: Syllabus | null;
}

// ========== API Response Types ==========
export interface SyllabusApiResponse<T> {
  response: T;
  success: boolean;
  messageId: string | null;
  message: string | null;
  detailErrors: unknown | null;
}

export interface SyllabusPaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
