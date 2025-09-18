import React, { useState } from 'react';
import { Button, Card, Typography, Space, Alert, Divider } from 'antd';
import { useAuthStore } from 'EduSmart/stores/Auth/AuthStore';
import { 
  validateCourseCreationAuth, 
  debugAuthState, 
  loginForCourseCreation, 
  getOrRefreshToken,
  DEFAULT_CREDENTIALS 
} from '../utils/authHelper';

const { Title, Text, Paragraph } = Typography;

interface AuthTestResult {
  success: boolean;
  message: string;
  details?: any;
}

/**
 * Debug component to test authentication for course creation
 * This helps verify that the auth token works properly
 */
export const AuthTestPanel: React.FC = () => {
  const { token, isAuthen } = useAuthStore();
  const [testResults, setTestResults] = useState<AuthTestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (result: AuthTestResult) => {
    setTestResults(prev => [...prev, { ...result, timestamp: new Date().toISOString() }]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testCurrentAuth = async () => {
    setIsLoading(true);
    try {
      debugAuthState();
      const result = await validateCourseCreationAuth();
      
      addResult({
        success: result.success,
        message: result.success ? 'Authentication valid' : `Auth failed: ${result.error}`,
        details: result.details
      });
    } catch (error) {
      addResult({
        success: false,
        message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testLogin = async () => {
    setIsLoading(true);
    try {
      const result = await loginForCourseCreation();
      
      addResult({
        success: result.success,
        message: result.success ? 'Login successful' : `Login failed: ${result.error}`,
        details: { 
          tokenObtained: !!result.token,
          credentials: DEFAULT_CREDENTIALS.username
        }
      });
    } catch (error) {
      addResult({
        success: false,
        message: `Login test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testTokenRefresh = async () => {
    setIsLoading(true);
    try {
      const result = await getOrRefreshToken();
      
      addResult({
        success: result.success,
        message: result.success ? 'Token refresh/retrieval successful' : `Token operation failed: ${result.error}`,
        details: { tokenObtained: !!result.token }
      });
    } catch (error) {
      addResult({
        success: false,
        message: `Token test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const currentAuthStatus = {
    hasToken: !!token,
    isAuthenticated: isAuthen,
    tokenPreview: token ? `${token.slice(0, 8)}...${token.slice(-4)}` : 'None'
  };

  return (
    <Card title="Course Creation Auth Test Panel" style={{ margin: '20px 0' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Title level={4}>Current Authentication Status</Title>
        <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '6px' }}>
          <Text strong>Has Token: </Text>
          <Text type={currentAuthStatus.hasToken ? 'success' : 'danger'}>
            {currentAuthStatus.hasToken ? 'Yes' : 'No'}
          </Text>
          <br />
          <Text strong>Is Authenticated: </Text>
          <Text type={currentAuthStatus.isAuthenticated ? 'success' : 'danger'}>
            {currentAuthStatus.isAuthenticated ? 'Yes' : 'No'}
          </Text>
          <br />
          <Text strong>Token Preview: </Text>
          <Text code>{currentAuthStatus.tokenPreview}</Text>
        </div>

        <Divider />

        <Title level={4}>Test Functions</Title>
        <Space wrap>
          <Button 
            type="primary" 
            onClick={testCurrentAuth} 
            loading={isLoading}
          >
            Test Current Auth
          </Button>
          <Button 
            onClick={testLogin} 
            loading={isLoading}
          >
            Test Login with Credentials
          </Button>
          <Button 
            onClick={testTokenRefresh} 
            loading={isLoading}
          >
            Test Token Refresh
          </Button>
          <Button 
            onClick={clearResults}
            type="text"
          >
            Clear Results
          </Button>
        </Space>

        <Divider />

        <Title level={4}>Test Results</Title>
        {testResults.length === 0 ? (
          <Text type="secondary">No test results yet. Run a test above.</Text>
        ) : (
          <Space direction="vertical" style={{ width: '100%' }}>
            {testResults.map((result, index) => (
              <Alert
                key={index}
                message={result.message}
                type={result.success ? 'success' : 'error'}
                showIcon
                description={
                  result.details && (
                    <pre style={{ fontSize: '12px', marginTop: '8px' }}>
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  )
                }
              />
            ))}
          </Space>
        )}

        <Divider />

        <div style={{ background: '#f0f0f0', padding: '12px', borderRadius: '6px' }}>
          <Title level={5}>Default Credentials Used:</Title>
          <Paragraph>
            <Text strong>Username:</Text> {DEFAULT_CREDENTIALS.username}<br />
            <Text strong>Password:</Text> {DEFAULT_CREDENTIALS.password}<br />
            <Text strong>Client ID:</Text> {DEFAULT_CREDENTIALS.client_id}<br />
            <Text strong>Client Secret:</Text> {DEFAULT_CREDENTIALS.client_secret}
          </Paragraph>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            These credentials are automatically used when logging in for course creation.
          </Text>
        </div>
      </Space>
    </Card>
  );
};