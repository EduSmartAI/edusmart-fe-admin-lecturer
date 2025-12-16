'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export type CodeEditorTheme = 'vs' | 'vs-dark';

export interface CodeEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  language?: string;
  height?: number | string;
  readOnly?: boolean;
  className?: string;
  theme?: CodeEditorTheme;
}

export default function CodeEditor({
  value,
  onChange,
  language,
  height = 320,
  readOnly = false,
  className = '',
  theme,
}: CodeEditorProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const computeIsDark = () => {
      try {
        return document.documentElement.classList.contains('dark');
      } catch {
        return false;
      }
    };

    setIsDark(computeIsDark());

    const observer = new MutationObserver(() => {
      setIsDark(computeIsDark());
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const resolvedTheme: CodeEditorTheme = useMemo(() => {
    if (theme) return theme;
    return isDark ? 'vs-dark' : 'vs';
  }, [isDark, theme]);

  return (
    <div className={`rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 ${className}`.trim()}>
      <MonacoEditor
        value={value ?? ''}
        onChange={(v) => onChange?.(v ?? '')}
        language={language}
        theme={resolvedTheme}
        height={height}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          automaticLayout: true,
          renderLineHighlight: 'all',
          contextmenu: true,
        }}
      />
    </div>
  );
}
