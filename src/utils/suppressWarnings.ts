'use client';

// Globally suppress specific console warnings
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  const originalError = console.error;

  console.warn = (...args: any[]) => {
    const message = args.join(' ');
    
    // Skip Ant Design compatibility warnings
    if (
      message.includes('Warning: [@ant-design/icons]') ||
      message.includes('Warning: [antd]') ||
      message.includes('Tabs.TabPane is deprecated') ||
      message.includes('Timeline.Item is deprecated') ||
      message.includes('destroyOnClose') ||
      message.includes('React 19') ||
      message.includes('@ant-design/v5-patch-for-react-19') ||
      message.includes('deprecated') ||
      message.includes('antd') ||
      message.includes('Ant Design')
    ) {
      return;
    }
    
    originalWarn(...args);
  };

  console.error = (...args: any[]) => {
    const message = args.join(' ');
    
    // Skip Ant Design compatibility errors
    if (
      message.includes('Warning: [@ant-design/icons]') ||
      message.includes('Warning: [antd]') ||
      message.includes('Tabs.TabPane is deprecated') ||
      message.includes('Timeline.Item is deprecated') ||
      message.includes('destroyOnClose') ||
      message.includes('React 19') ||
      message.includes('@ant-design/v5-patch-for-react-19')
    ) {
      return;
    }
    
    originalError(...args);
  };
}

export {};