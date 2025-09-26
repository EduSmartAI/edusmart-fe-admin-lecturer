import { useCallback, useRef, useState, useEffect } from 'react';
import { saveToLocalStorage, loadFromLocalStorage, scheduleAutoClear, cancelAutoClear } from '../utils/autoSave';
import { App } from 'antd';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface UseAutoSaveOptions {
    step: string;
    delay?: number;
    onLoad?: (data: Record<string, unknown>) => void;
    onSave?: (data: Record<string, unknown>) => void;
    onError?: (error: Error) => void;
}

export const useAutoSave = (options: UseAutoSaveOptions) => {
    const { step, delay = 2000, onLoad, onSave, onError } = options;
    const { message } = App.useApp();
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [isClient, setIsClient] = useState(false);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isInitialLoadRef = useRef(true);

    // Check if we're on the client side
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Auto-save function
    const saveData = useCallback((formData: Record<string, unknown>) => {
        if (!isClient) return;
        
        try {
            saveToLocalStorage(formData, step);
            setSaveStatus('saved');
            setLastSaved(new Date());
            onSaveRef.current?.(formData);

            // Reset status after 3 seconds
            setTimeout(() => {
                setSaveStatus('idle');
            }, 3000);

            if (isClient) {
                message.success('Đã lưu tự động', 1);
            }
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
            setSaveStatus('error');
            onErrorRef.current?.(error as Error);

            // Reset error status after 5 seconds
            setTimeout(() => {
                setSaveStatus('idle');
            }, 5000);

            if (isClient) {
                message.error('Không thể lưu dữ liệu tự động');
            }
        }
    }, [step, isClient]); // Only stable dependencies

    // Debounced save function
    const debouncedSave = useCallback((formData: Record<string, unknown>) => {
        // Clear existing timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Don't save during initial load
        if (isInitialLoadRef.current) {
            return;
        }

        setSaveStatus('saving');

        // Set new timeout
        saveTimeoutRef.current = setTimeout(() => {
            saveData(formData);
        }, delay);
    }, [saveData, delay]);

    // Use refs to avoid dependency issues
    const onLoadRef = useRef(onLoad);
    const onSaveRef = useRef(onSave);
    const onErrorRef = useRef(onError);
    
    // Update refs when callbacks change
    useEffect(() => {
        onLoadRef.current = onLoad;
        onSaveRef.current = onSave;
        onErrorRef.current = onError;
    }, [onLoad, onSave, onError]);

    // Load saved data on mount
    const loadSavedData = useCallback(() => {
        if (!isClient) return;
        
        try {
            const savedData = loadFromLocalStorage();
            if (savedData && onLoadRef.current) {
                onLoadRef.current(savedData);
                setLastSaved(new Date());
                if (isClient) {
                    message.info('Đã khôi phục dữ liệu đã lưu', 2);
                }
            }
        } catch (error) {
            console.error('Failed to load saved data:', error);
            onErrorRef.current?.(error as Error);
        } finally {
            // Mark initial load as complete
            isInitialLoadRef.current = false;
        }
    }, [isClient]); // Only depend on isClient

    // Initialize auto-save on mount - only run when client is ready
    useEffect(() => {
        if (isClient) {
            loadSavedData();
        }
        
        // Cleanup timeout on unmount
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
            cancelAutoClear();
        };
    }, [isClient, loadSavedData]);

    // Mark initial load as complete after first render
    useEffect(() => {
        const timer = setTimeout(() => {
            isInitialLoadRef.current = false;
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    return {
        saveStatus,
        lastSaved,
        debouncedSave,
        saveData,
        loadSavedData,
    };
};