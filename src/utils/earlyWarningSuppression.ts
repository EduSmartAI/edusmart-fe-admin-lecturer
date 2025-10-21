/**
 * Early warning suppression for Ant Design compatibility issues
 * This script runs immediately when imported to suppress console warnings
 */

// Only run on client side
if (typeof window !== 'undefined') {
  // Store original console methods
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
    'warningOnce',
    '_warning'
  ];

  const shouldSuppress = (message: string) => {
    return suppressedPatterns.some(pattern => message.includes(pattern));
  };

  // Override console methods
  console.warn = (...args: unknown[]) => {
    const message = args.join(' ');
    if (!shouldSuppress(message)) {
      originalWarn.apply(console, args);
    }
  };

  console.error = (...args: unknown[]) => {
    const message = args.join(' ');
    if (!shouldSuppress(message)) {
      originalError.apply(console, args);
    }
  };

  // Also suppress via process.env if available
  if (typeof process !== 'undefined') {
    process.env.SUPPRESS_ANTD_WARNINGS = 'true';
  }
}

export {};