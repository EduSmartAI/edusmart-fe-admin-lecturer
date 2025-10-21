'use client';
import { FC, ReactNode } from 'react';
import { useSuppressAntdWarnings } from 'EduSmart/hooks/useSuppressAntdWarnings';

interface GlobalWarningSuppressionProps {
  children: ReactNode;
}

const GlobalWarningSuppression: FC<GlobalWarningSuppressionProps> = ({ children }) => {
  // Suppress Ant Design compatibility warnings globally
  useSuppressAntdWarnings();
  
  return <>{children}</>;
};

export default GlobalWarningSuppression;