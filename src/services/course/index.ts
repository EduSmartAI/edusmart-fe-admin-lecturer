/**
 * Course Service Exports
 */

export * from './courseService';
export * from './courseTransformers';

// Legacy support (deprecated)
export { CourseUpdateService } from './legacyCourseUpdateService';
export type {
    BasicUpdateCourseDto,
    CompleteUpdateCourseDto,
    CourseUpdateResponse
} from './legacyCourseUpdateService';

