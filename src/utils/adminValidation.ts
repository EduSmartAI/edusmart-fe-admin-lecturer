/**
 * Admin Content Management - Validation Utilities
 * Provides form validation rules and helpers
 */

/**
 * Validate learning goal name
 */
export const validateGoalName = (name: string): string | undefined => {
  if (!name || name.trim().length === 0) {
    return "Learning goal name is required";
  }
  if (name.length < 3) {
    return "Name must be at least 3 characters";
  }
  if (name.length > 255) {
    return "Name must not exceed 255 characters";
  }
  return undefined;
};

/**
 * Validate technology name
 */
export const validateTechName = (name: string): string | undefined => {
  if (!name || name.trim().length === 0) {
    return "Technology name is required";
  }
  if (name.length < 2) {
    return "Name must be at least 2 characters";
  }
  if (name.length > 255) {
    return "Name must not exceed 255 characters";
  }
  return undefined;
};

/**
 * Validate survey code
 */
export const validateSurveyCode = (code: string): string | undefined => {
  if (!code || code.trim().length === 0) {
    return "Survey code is required";
  }
  if (code.length < 3) {
    return "Code must be at least 3 characters";
  }
  if (code.length > 50) {
    return "Code must not exceed 50 characters";
  }
  // Only alphanumeric and underscore
  if (!/^[A-Za-z0-9_]+$/.test(code)) {
    return "Code can only contain letters, numbers, and underscores";
  }
  return undefined;
};

/**
 * Validate survey title
 */
export const validateSurveyTitle = (title: string): string | undefined => {
  if (!title || title.trim().length === 0) {
    return "Survey title is required";
  }
  if (title.length < 3) {
    return "Title must be at least 3 characters";
  }
  if (title.length > 255) {
    return "Title must not exceed 255 characters";
  }
  return undefined;
};

/**
 * Validate question text
 */
export const validateQuestionText = (text: string): string | undefined => {
  if (!text || text.trim().length === 0) {
    return "Question text is required";
  }
  if (text.length < 5) {
    return "Question must be at least 5 characters";
  }
  if (text.length > 1000) {
    return "Question must not exceed 1000 characters";
  }
  return undefined;
};

/**
 * Validate multiple choice answers
 */
export const validateMultipleChoiceAnswers = (answers: { answerText: string; isCorrect: boolean }[]): string | undefined => {
  if (!answers || answers.length < 2) {
    return "At least 2 answers are required";
  }
  if (answers.length > 10) {
    return "Maximum 10 answers allowed";
  }

  // Check all answers have text
  if (answers.some((a) => !a.answerText || a.answerText.trim().length === 0)) {
    return "All answers must have text";
  }

  // Check for duplicates
  const texts = answers.map((a) => a.answerText.toLowerCase());
  if (new Set(texts).size !== texts.length) {
    return "Answer texts must be unique";
  }

  // Check exactly one correct
  const correctCount = answers.filter((a) => a.isCorrect).length;
  if (correctCount !== 1) {
    return "Exactly one answer must be marked as correct";
  }

  return undefined;
};

/**
 * Validate checkbox answers
 */
export const validateCheckboxAnswers = (answers: { answerText: string; isCorrect: boolean }[]): string | undefined => {
  if (!answers || answers.length < 2) {
    return "At least 2 answers are required";
  }
  if (answers.length > 10) {
    return "Maximum 10 answers allowed";
  }

  // Check all answers have text
  if (answers.some((a) => !a.answerText || a.answerText.trim().length === 0)) {
    return "All answers must have text";
  }

  // Check for duplicates
  const texts = answers.map((a) => a.answerText.toLowerCase());
  if (new Set(texts).size !== texts.length) {
    return "Answer texts must be unique";
  }

  // Check at least one correct
  const correctCount = answers.filter((a) => a.isCorrect).length;
  if (correctCount === 0) {
    return "At least one answer must be marked as correct";
  }

  return undefined;
};

/**
 * Validate numeric rules
 */
export const validateNumericRules = (rules: {
  minValue: number;
  maxValue: number;
}): string | undefined => {
  if (typeof rules.minValue !== "number" || typeof rules.maxValue !== "number") {
    return "Min and Max values are required";
  }

  if (rules.minValue >= rules.maxValue) {
    return "Min value must be less than Max value";
  }

  if (!Number.isFinite(rules.minValue) || !Number.isFinite(rules.maxValue)) {
    return "Values must be valid numbers";
  }

  return undefined;
};

/**
 * Validate form field
 */
export const validateField = (
  fieldName: string,
  value: unknown,
  rules?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: unknown) => string | undefined;
  }
): string | undefined => {
  if (rules?.required && (!value || (typeof value === "string" && value.trim().length === 0))) {
    return `${fieldName} is required`;
  }

  if (typeof value === "string") {
    if (rules?.minLength && value.length < rules.minLength) {
      return `${fieldName} must be at least ${rules.minLength} characters`;
    }

    if (rules?.maxLength && value.length > rules.maxLength) {
      return `${fieldName} must not exceed ${rules.maxLength} characters`;
    }

    if (rules?.pattern && !rules.pattern.test(value)) {
      return `${fieldName} format is invalid`;
    }
  }

  if (rules?.custom) {
    return rules.custom(value);
  }

  return undefined;
};
