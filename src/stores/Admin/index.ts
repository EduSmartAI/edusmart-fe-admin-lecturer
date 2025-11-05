/**
 * Admin Stores Index
 * Central export point for all admin-related Zustand stores
 */

export {
  useLearningGoalStore,
  type LearningGoal,
  type LearningGoalCreatePayload,
  type LearningGoalUpdatePayload,
  type LearningGoalState,
  type LearningGoalType,
} from "./LearningGoalStore";

export {
  useTechnologyStore,
  type Technology,
  type TechnologyCreatePayload,
  type TechnologyUpdatePayload,
  type TechnologyState,
  type TechnologyType,
  type TechnologyCategory,
} from "./TechnologyStore";

export {
  useSurveyStore,
  type Survey,
  type SurveyCreatePayload,
  type SurveyUpdatePayload,
  type SurveyQuestion,
  type SurveyAnswer,
  type SurveyState,
  type SurveyStatus,
} from "./SurveyStore";

export {
  useQuestionStore,
  type Question,
  type QuestionCreatePayload,
  type QuestionUpdatePayload,
  type QuestionAnswer,
  type QuestionState,
  type QuestionType,
  type NumericRules,
} from "./QuestionStore";
