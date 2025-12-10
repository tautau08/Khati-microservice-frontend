"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';

export default function APITestPage() {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  const addResult = (test: string, success: boolean, data: any) => {
    setResults(prev => [...prev, { test, success, data, timestamp: new Date().toISOString() }]);
  };

  const testConnection = async () => {
    setIsLoading(true);
    setResults([]);

    // Test 1: Check if API URL is configured
    addResult('Environment Variable', true, { API_URL: API_BASE_URL });

    // Test 2: Try to connect to backend
    try {
      const response = await axios.get(`${API_BASE_URL}/actuator/health`, { timeout: 5000 });
      addResult('Backend Health Check', true, response.data);
    } catch (error: any) {
      addResult('Backend Health Check', false, { 
        error: error.message,
        code: error.code,
        details: 'Backend might not be running on port 8080'
      });
    }

    // Test 3: Try to get products (public endpoint)
    try {
      const response = await axios.get(`${API_BASE_URL}/api/inventory/products`, { timeout: 5000 });
      addResult('Get Products (Public)', true, { 
        count: response.data.length,
        products: response.data.slice(0, 3)
      });
    } catch (error: any) {
      addResult('Get Products (Public)', false, { 
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
    }

    // Test 4: Try to get categories (public endpoint)
    try {
      const response = await axios.get(`${API_BASE_URL}/api/inventory/categories`, { timeout: 5000 });
      addResult('Get Categories (Public)', true, { 
        count: response.data.length,
        categories: response.data
      });
    } catch (error: any) {
      addResult('Get Categories (Public)', false, { 
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
    }

    // Test 5: Test registration endpoint
    try {
      const testData = {
        username: 'test_' + Date.now(),
        email: `test_${Date.now()}@example.com`,
        password: 'Test@123'
      };
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, testData, { timeout: 5000 });
      addResult('Register Endpoint', true, { 
        message: 'Registration endpoint is working',
        response: response.data
      });
    } catch (error: any) {
      addResult('Register Endpoint', false, { 
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
        note: 'This might fail if user already exists, which is OK'
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">API Connection Test</CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Test your backend connection and API endpoints
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button 
              onClick={testConnection}
              disabled={isLoading}
              className="bg-farm-green-700 hover:bg-farm-green-800"
            >
              {isLoading ? 'Testing...' : 'Run All Tests'}
            </Button>
            <Button 
              onClick={() => setResults([])}
              variant="outline"
              disabled={isLoading || results.length === 0}
            >
              Clear Results
            </Button>
          </div>

          <div className="space-y-4 mt-6">
            {results.map((result, index) => (
              <Card key={index} className={result.success ? 'border-green-500' : 'border-red-500'}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{result.test}</CardTitle>
                    <Badge variant={result.success ? 'default' : 'destructive'}>
                      {result.success ? 'PASS' : 'FAIL'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {results.length === 0 && !isLoading && (
            <div className="text-center py-12 text-gray-500">
              Click "Run All Tests" to check your API connection
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Debug Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Debug Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="font-medium">API Base URL:</span>
            <span className="text-farm-green-700">{API_BASE_URL}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Environment:</span>
            <span>{process.env.NODE_ENV}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Browser:</span>
            <span>{typeof window !== 'undefined' ? 'Client Side' : 'Server Side'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="mt-6 border-blue-500">
        <CardHeader>
          <CardTitle className="text-lg">Troubleshooting Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-medium text-gray-900">If all tests fail:</p>
            <ul className="list-disc list-inside text-gray-600 ml-4 mt-1">
              <li>Backend is not running - Start your Spring Boot API Gateway on port 8080</li>
              <li>Check if <code className="bg-gray-100 px-1 rounded">http://localhost:8080</code> is accessible</li>
            </ul>
          </div>
          
          <div>
            <p className="font-medium text-gray-900">If only auth tests fail:</p>
            <ul className="list-disc list-inside text-gray-600 ml-4 mt-1">
              <li>Auth service might not be running</li>
              <li>Check auth service on port 8081</li>
              <li>Verify API Gateway routes to auth service</li>
            </ul>
          </div>

          <div>
            <p className="font-medium text-gray-900">CORS Error:</p>
            <ul className="list-disc list-inside text-gray-600 ml-4 mt-1">
              <li>Add CORS configuration in your API Gateway</li>
              <li>Allow origin: <code className="bg-gray-100 px-1 rounded">http://localhost:3000</code></li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
