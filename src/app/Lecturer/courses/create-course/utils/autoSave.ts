const AUTO_SAVE_KEY = 'course_creation_draft';
const AUTO_SAVE_DELAY = 2000; // 2 seconds
const AUTO_CLEAR_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds
const ALLOWED_SAVE_STEPS = ['1', '2', '3', '4']; // Save for all steps 1, 2, 3, 4

export interface AutoSaveData {
    timestamp: string;
    version: string;
    formStep: string;
    [key: string]: unknown;
}

export const saveToLocalStorage = (formData: Record<string, unknown>, step: string): void => {
    try {
        if (!ALLOWED_SAVE_STEPS.includes(step)) {
            return;
        }

        const filteredData = Object.entries(formData).reduce((acc, [key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                acc[key] = value;
            }
            return acc;
        }, {} as Record<string, unknown>);

        const dataToSave: AutoSaveData = {
            ...filteredData,
            timestamp: new Date().toISOString(),
            version: '1.0',
            formStep: step,
        };

        localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(dataToSave));
        
        // Set up auto-clear after 10 minutes
        scheduleAutoClear();
    } catch (error) {
        console.error('Failed to save to localStorage:', error);
    }
};

export const loadFromLocalStorage = (): Record<string, unknown> | null => {
    try {
        const savedData = localStorage.getItem(AUTO_SAVE_KEY);
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            
            // Always check if data has expired (older than 10 minutes)
            const timestamp = new Date(parsedData.timestamp);
            const now = new Date();
            const timeDifference = now.getTime() - timestamp.getTime();
            
            if (timeDifference > AUTO_CLEAR_TIMEOUT) {
                // Data has expired, clear it
                clearLocalStorage();
                console.log('Auto-saved course data expired and cleared (loaded after 10 minutes)');
                return null;
            }
            
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { timestamp: ts, version, formStep, ...formData } = parsedData;
            return formData;
        }
    } catch (error) {
        console.error('Failed to load from localStorage:', error);
    }
    return null;
};

export const clearLocalStorage = (): void => {
    try {
        localStorage.removeItem(AUTO_SAVE_KEY);
        // Cancel any scheduled auto-clear since data is already cleared
        cancelAutoClear();
    } catch (error) {
        console.error('Failed to clear localStorage:', error);
    }
};

export const getLastSavedTime = (): Date | null => {
    try {
        const savedData = localStorage.getItem(AUTO_SAVE_KEY);
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            return new Date(parsedData.timestamp);
        }
    } catch (error) {
        console.error('Failed to get last saved time:', error);
    }
    return null;
};

export const getTimeUntilExpiry = (): number => {
    try {
        const savedData = localStorage.getItem(AUTO_SAVE_KEY);
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            const timestamp = new Date(parsedData.timestamp);
            const expiryTime = timestamp.getTime() + AUTO_CLEAR_TIMEOUT;
            const now = new Date().getTime();
            return Math.max(0, expiryTime - now);
        }
    } catch (error) {
        console.error('Failed to calculate time until expiry:', error);
    }
    return 0;
};

export const getSavedStep = (): string | null => {
    try {
        const savedData = localStorage.getItem(AUTO_SAVE_KEY);
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            return parsedData.formStep;
        }
    } catch (error) {
        console.error('Failed to get saved step:', error);
    }
    return null;
};

// Store timeout IDs globally to prevent multiple timeouts
let autoClearTimeoutId: NodeJS.Timeout | null = null;
let periodicCheckIntervalId: NodeJS.Timeout | null = null;

export const scheduleAutoClear = (): void => {
    // Clear any existing timeout
    if (autoClearTimeoutId) {
        clearTimeout(autoClearTimeoutId);
    }
    
    // Clear any existing periodic check
    if (periodicCheckIntervalId) {
        clearInterval(periodicCheckIntervalId);
    }
    
    // Calculate remaining time until expiry
    const timeUntilExpiry = getTimeUntilExpiry();
    
    if (timeUntilExpiry <= 0) {
        // Data has already expired, clear it immediately
        clearLocalStorage();
        console.log('Auto-saved course data cleared (already expired)');
        return;
    }
    
    // Schedule auto-clear for the remaining time
    autoClearTimeoutId = setTimeout(() => {
        clearLocalStorage();
        console.log('Auto-saved course data cleared after 10 minutes');
    }, timeUntilExpiry);
    
    // Also set up a periodic check every minute to catch edge cases
    periodicCheckIntervalId = setInterval(() => {
        const wasExpired = checkAndClearExpiredData();
        if (wasExpired) {
            console.log('Auto-saved course data cleared by periodic check');
            // Clear the interval since data is gone
            if (periodicCheckIntervalId) {
                clearInterval(periodicCheckIntervalId);
                periodicCheckIntervalId = null;
            }
            // Clear the timeout since data is already cleared
            if (autoClearTimeoutId) {
                clearTimeout(autoClearTimeoutId);
                autoClearTimeoutId = null;
            }
        }
    }, 60000); // Check every minute
};

export const cancelAutoClear = (): void => {
    if (autoClearTimeoutId) {
        clearTimeout(autoClearTimeoutId);
        autoClearTimeoutId = null;
    }
    if (periodicCheckIntervalId) {
        clearInterval(periodicCheckIntervalId);
        periodicCheckIntervalId = null;
    }
};

export const checkAndClearExpiredData = (): boolean => {
    try {
        const savedData = localStorage.getItem(AUTO_SAVE_KEY);
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            const timestamp = new Date(parsedData.timestamp);
            const now = new Date();
            const timeDifference = now.getTime() - timestamp.getTime();
            
            if (timeDifference > AUTO_CLEAR_TIMEOUT) {
                clearLocalStorage();
                return true; // Data was expired and cleared
            }
        }
        return false; // Data is still valid or doesn't exist
    } catch (error) {
        console.error('Failed to check expired data:', error);
        return false;
    }
};

export const initializeAutoSave = (): void => {
    // Check and clear expired data on initialization
    const wasExpired = checkAndClearExpiredData();
    
    if (!wasExpired) {
        // If data exists and is not expired, schedule auto-clear
        const savedData = localStorage.getItem(AUTO_SAVE_KEY);
        if (savedData) {
            scheduleAutoClear();
        }
    }
};

export const createDebouncedSave = (callback: (data: Record<string, unknown>, step: string) => void) => {
    let timeoutId: NodeJS.Timeout | null = null;

    return (formData: Record<string, unknown>, step: string) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
            callback(formData, step);
        }, AUTO_SAVE_DELAY);
    };
};
