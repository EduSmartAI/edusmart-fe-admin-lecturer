import { useEffect } from 'react';

/**
 * Hook to suppress specific Ant Design compatibility warnings
 * Use this hook in components that use deprecated Ant Design APIs
 */
export const useSuppressAntdWarnings = () => {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const originalWarn = console.warn;
    const originalError = console.error;
    
    const suppressedPatterns = [
      'antd v5 support React is 16 ~ 18',
      'TabPane` is deprecated. Please use `items` instead',
      'Timeline.Item` is deprecated. Please use `items` instead',
      'destroyOnClose` is deprecated. Please use `destroyOnHidden` instead',
      '[antd: compatible]',
      '[antd: Modal]',
      '[antd: Timeline]', 
      '[antd: Tabs]',
      'see https://u.ant.design/v5-for-19',
      'defaultReactRender',
      'showWaveEffect',
      'useWave',
      'useLegacyItems',
      'Instance created by `useForm` is not connected to any Form element',
      'Forget to pass `form` prop?',
    ];

    const shouldSuppress = (message: string) => {
      return suppressedPatterns.some(pattern => message.includes(pattern));
    };

    console.warn = (...args) => {
      const message = args.join(' ');
      if (!shouldSuppress(message)) {
        originalWarn.apply(console, args);
      }
    };

    console.error = (...args) => {
      const message = args.join(' ');
      if (!shouldSuppress(message)) {
        originalError.apply(console, args);
      }
    };
    
    // Cleanup function
    return () => {
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);
};