/**
 * Utility to suppress specific Ant Design warnings that are safe to ignore
 * This addresses compatibility warnings between React 19 and Ant Design v5
 */

// Store original console.warn
const originalConsoleWarn = console.warn;

// List of warning messages to suppress
const SUPPRESSED_WARNINGS = [
  'antd v5 support React is 16 ~ 18',
  'destroyOnClose` is deprecated. Please use `destroyOnHidden` instead',
  'Timeline.Item` is deprecated. Please use `items` instead',  
  'Tabs.TabPane` is deprecated. Please use `items` instead',
  '[antd: compatible]',
  '[antd: Modal]',
  '[antd: Timeline]', 
  '[antd: Tabs]',
  'see https://u.ant.design/v5-for-19',
];

// Override console.warn to filter out specific Ant Design warnings
console.warn = (...args: any[]) => {
  const message = args.join(' ');
  
  // Check if this warning should be suppressed
  const shouldSuppress = SUPPRESSED_WARNINGS.some(warning => 
    message.includes(warning)
  );
  
  if (!shouldSuppress) {
    // Call original console.warn for warnings we want to keep
    originalConsoleWarn.apply(console, args);
  }
};

export default {};