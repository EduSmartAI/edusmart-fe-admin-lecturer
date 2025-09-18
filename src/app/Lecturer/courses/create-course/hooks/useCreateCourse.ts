import { useState, useCallback, useEffect } from 'react';
import { useCreateCourseStore } from 'EduSmart/stores/CreateCourse/CreateCourseStore';
import { useAuthStore } from 'EduSmart/stores/Auth/AuthStore';
import { CourseFormData } from '../types';
import { isStepValid } from '../utils/validation';
import { saveToLocalStorage, loadFromLocalStorage, clearLocalStorage, initializeAutoSave, checkAndClearExpiredData } from '../utils/autoSave';
import { validateCourseCreationAuth, debugAuthState, getOrRefreshToken } from '../utils/authHelper';

export const useCreateCourse = () => {
    const { 
        currentStep, 
        setCurrentStep, 
        courseInformation, 
        updateCourseInformation,
        createCourse,
        error,
        clearError,
        isSaving,
        resetForm
    } = useCreateCourseStore();
    const { token, isAuthen, refreshToken, getAuthen } = useAuthStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const [authError, setAuthError] = useState<string | null>(null);

    // Authentication validation functions
    const validateAuthToken = useCallback(async (): Promise<boolean> => {
        try {
            setAuthError(null);
            
            // Use the enhanced auth validation helper
            const authResult = await validateCourseCreationAuth();
            
            if (authResult.success) {
                console.log('[CreateCourse] Authentication validated successfully');
                debugAuthState(); // Debug logging
                return true;
            } else {
                console.log('[CreateCourse] Authentication validation failed:', authResult.error);
                setAuthError(authResult.error || 'Authentication failed');
                return false;
            }
        } catch (error) {
            console.error('[CreateCourse] Auth validation error:', error);
            setAuthError('Authentication error. Please try logging in again.');
            return false;
        }
    }, []);

    // Enhanced course creation with auth validation
    const createCourseWithAuth = useCallback(async (): Promise<boolean> => {
        try {
            setIsSubmitting(true);
            setAuthError(null);

            // First validate authentication
            const isAuthValid = await validateAuthToken();
            if (!isAuthValid) {
                setIsSubmitting(false);
                return false;
            }

            // Log final auth status before creating course
            console.log('[CreateCourse] Creating course with auth token present');
            
            // Proceed with course creation
            const success = await createCourse();
            
            if (success) {
                console.log('[CreateCourse] Course created successfully');
                // Clear auto-save data on successful creation
                clearLocalStorage();
            } else {
                console.log('[CreateCourse] Course creation failed');
            }
            
            return success;
        } catch (error) {
            console.error('[CreateCourse] Course creation error:', error);
            setAuthError('Failed to create course. Please try again.');
            return false;
        } finally {
            setIsSubmitting(false);
        }
    }, [validateAuthToken, createCourse]);

    // Load saved data on mount and initialize auto-save system
    useEffect(() => {
        // Initialize auto-save system (checks for expired data and schedules clearing)
        initializeAutoSave();
        
        // Load any valid saved data
        const savedData = loadFromLocalStorage();
        if (savedData) {
            updateCourseInformation(savedData);
        }
        
        // Set up periodic check for expired data every minute
        const intervalId = setInterval(() => {
            const wasExpired = checkAndClearExpiredData();
            if (wasExpired) {
                // Clear the store data when auto-save data expires
                resetForm();
                console.log('Store data cleared due to auto-save expiry');
            }
        }, 60000); // Check every minute
        
        // Cleanup interval on unmount
        return () => clearInterval(intervalId);
    }, [updateCourseInformation, resetForm]);

    // Initialize authentication on mount
    useEffect(() => {
        const initAuth = async () => {
            console.log('[CreateCourse] Initializing authentication...');
            debugAuthState();
            
            // Validate authentication status
            const authResult = await validateCourseCreationAuth();
            if (!authResult.success) {
                console.log('[CreateCourse] Initial auth validation failed:', authResult.error);
                setAuthError(authResult.error || 'Authentication required');
            } else {
                console.log('[CreateCourse] Authentication ready for course creation');
            }
        };

        initAuth();
    }, []); // Run once on mount

    // Auto-save when data changes (for all steps 1, 2, 3, 4)
    const handleDataChange = useCallback((data: Partial<CourseFormData>) => {
        // Convert CourseFormData to CourseInformation format
        const convertedData = {
            ...data,
            level: data.level ? (typeof data.level === 'string' ? parseInt(data.level) : data.level) : undefined,
        };
        updateCourseInformation(convertedData);
        
        // Auto-save for all steps (currentStep + 1 because step counting starts from 0)
        const stepNumber = (currentStep + 1).toString();
        saveToLocalStorage(data, stepNumber);
    }, [updateCourseInformation, currentStep]);

    // Navigate to next step
    const goToNextStep = useCallback(() => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    }, [currentStep, setCurrentStep]);

    // Navigate to previous step
    const goToPreviousStep = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    }, [currentStep, setCurrentStep]);

    // Go to specific step
    const goToStep = useCallback((step: number) => {
        if (step >= 0 && step <= 4) {
            setCurrentStep(step);
        }
    }, [setCurrentStep]);

    // Reset form
    const resetFormAndStorage = useCallback(() => {
        resetForm();
        clearLocalStorage();
        setCurrentStep(0);
        setErrors([]);
    }, [resetForm, setCurrentStep]);

    return {
        currentStep,
        courseInformation,
        isSubmitting: isSubmitting || isSaving,
        errors,
        storeError: error,
        authError,
        clearStoreError: clearError,
        clearAuthError: () => setAuthError(null),
        handleDataChange,
        goToNextStep,
        goToPreviousStep,
        goToStep,
        resetForm: resetFormAndStorage,
        createCourseWithAuth,
        validateAuthToken,
        // Auth status for UI
        isAuthenticated: isAuthen,
        hasToken: !!token,
    };
};