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
  type LearningGoalTypeValue,
} from "./LearningGoalStore";

export {
  useTechnologyStore,
  type Technology,
  type TechnologyCreatePayload,
  type TechnologyUpdatePayload,
  type TechnologyState,
  type TechnologyTypeValue,
} from "./TechnologyStore";

export {
  useSurveyStore,
  type Survey,
  type SurveyCreatePayload,
  type SurveyUpdatePayload,
  type SurveyQuestion,
  type SurveyQuestionPayload,
  type SurveyAnswer,
  type SurveyState,
  type SurveyStatus,
} from "./SurveyStore";

export {
  useStudentSurveyStore,
  type StudentSurveyState,
} from "./StudentSurveyStore";

export {
  useStudentTestStore,
  type StudentTestState,
} from "./StudentTestStore";

export {
  usePracticeTestStore,
  type PracticeTestState,
} from "./PracticeTestStore";

export {
  useInitialTestStore,
  type InitialTestState,
} from "./InitialTestStore";

export {
  useSyllabusStore,
  type Major,
  type MajorCreatePayload,
  type MajorUpdatePayload,
  type Subject,
  type SubjectCreatePayload,
  type SubjectUpdatePayload,
  type SyllabusState,
} from "./SyllabusStore";
