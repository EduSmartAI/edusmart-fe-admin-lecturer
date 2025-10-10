/**
 * Course Operations Hook
 * Handles all course CRUD operations
 * Bridges services and store
 */

import { useCallback } from 'react';
import { useCourseStore } from 'EduSmart/stores/course/courseStore';
import {
  createCourse,
  updateCourseBasicInfo,
  updateCourseComplete,
  fetchAllCourses,
  fetchCoursesByTeacher,
  fetchCourseById,
  uploadCourseImage,
  uploadCourseVideo,
  uploadCourseDocument
} from 'EduSmart/services/course/courseService';
import type { Course } from 'EduSmart/domain/course/models';

export const useCourseOperations = () => {
  const {
    currentCourse,
    setLoading,
    setSaving,
    setError,
    setCourses,
    setSelectedCourseDetails,
    setPagination,
    filters,
    pagination
  } = useCourseStore();

  // ============================================
  // Create Course
  // ============================================
  
  const handleCreateCourse = useCallback(async (course: Course) => {
    setSaving(true);
    setError(null);
    
    try {
      const result = await createCourse(course);
      
      if (result.success) {
        setSaving(false);
        return { success: true, courseId: result.data };
      } else {
        setError(result.error || 'Failed to create course');
        setSaving(false);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      setSaving(false);
      return { success: false, error: errorMessage };
    }
  }, [setSaving, setError]);

  // ============================================
  // Update Course
  // ============================================
  
  const handleUpdateBasicInfo = useCallback(async (courseId: string, course: Course) => {
    setSaving(true);
    setError(null);
    
    try {
      const result = await updateCourseBasicInfo(courseId, course);
      
      if (result.success) {
        setSaving(false);
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Failed to update course');
        setSaving(false);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      setSaving(false);
      return { success: false, error: errorMessage };
    }
  }, [setSaving, setError]);

  const handleUpdateComplete = useCallback(async (courseId: string, course: Course) => {
    setSaving(true);
    setError(null);
    
    try {
      const result = await updateCourseComplete(courseId, course);
      
      if (result.success) {
        setSaving(false);
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Failed to update course');
        setSaving(false);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      setSaving(false);
      return { success: false, error: errorMessage };
    }
  }, [setSaving, setError]);

  // ============================================
  // Fetch Operations
  // ============================================
  
  const handleFetchAllCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchAllCourses(filters, pagination);
      
      if (result.success && result.data) {
        setCourses(result.data.courses);
        setPagination(result.data.pagination);
        setLoading(false);
        return { success: true };
      } else {
        setError(result.error || 'Failed to fetch courses');
        setLoading(false);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  }, [filters, pagination, setLoading, setError, setCourses, setPagination]);

  const handleFetchTeacherCourses = useCallback(async (teacherId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchCoursesByTeacher(teacherId, filters, pagination);
      
      if (result.success && result.data) {
        setCourses(result.data.courses);
        setPagination(result.data.pagination);
        setLoading(false);
        return { success: true };
      } else {
        setError(result.error || 'Failed to fetch teacher courses');
        setLoading(false);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  }, [filters, pagination, setLoading, setError, setCourses, setPagination]);

  const handleFetchCourseDetails = useCallback(async (courseId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchCourseById(courseId);
      
      if (result.success && result.data) {
        setSelectedCourseDetails(result.data);
        setLoading(false);
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Failed to fetch course details');
        setLoading(false);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  }, [setLoading, setError, setSelectedCourseDetails]);

  // ============================================
  // Media Upload Operations
  // ============================================
  
  const handleUploadImage = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await uploadCourseImage(file);
      
      if (result.success && result.data) {
        setLoading(false);
        return { success: true, url: result.data };
      } else {
        setError(result.error || 'Failed to upload image');
        setLoading(false);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  }, [setLoading, setError]);

  const handleUploadVideo = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await uploadCourseVideo(file);
      
      if (result.success && result.data) {
        setLoading(false);
        return { success: true, url: result.data };
      } else {
        setError(result.error || 'Failed to upload video');
        setLoading(false);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  }, [setLoading, setError]);

  const handleUploadDocument = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await uploadCourseDocument(file);
      
      if (result.success && result.data) {
        setLoading(false);
        return { success: true, url: result.data };
      } else {
        setError(result.error || 'Failed to upload document');
        setLoading(false);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  }, [setLoading, setError]);

  return {
    // State
    currentCourse,
    
    // CRUD Operations
    createCourse: handleCreateCourse,
    updateBasicInfo: handleUpdateBasicInfo,
    updateComplete: handleUpdateComplete,
    
    // Fetch Operations
    fetchAllCourses: handleFetchAllCourses,
    fetchTeacherCourses: handleFetchTeacherCourses,
    fetchCourseDetails: handleFetchCourseDetails,
    
    // Media Operations
    uploadImage: handleUploadImage,
    uploadVideo: handleUploadVideo,
    uploadDocument: handleUploadDocument,
  };
};


