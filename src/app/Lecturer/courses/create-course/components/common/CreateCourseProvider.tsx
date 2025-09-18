'use client';

import { FC, ReactNode } from 'react';

// The useCreateCourseStore is a hook that can be used directly in components.
// This provider component is included for structural consistency and to encapsulate
// any future context-related logic that might be needed.

interface CreateCourseProviderProps {
    children: ReactNode;
}

const CreateCourseProvider: FC<CreateCourseProviderProps> = ({ children }) => {
    return <>{children}</>;
};

export default CreateCourseProvider;

