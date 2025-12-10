"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Sprout } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authAPI.login(formData);
      
      const { token } = response.data;

      if (!token) {
        throw new Error('No token received from server');
      }

      // Decode JWT to get user info
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const payload = JSON.parse(jsonPayload);
      
      const username = payload.sub || formData.username;
      const roles = payload.roles || [];

      // Store auth data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ 
        userId: username, // Using username as userId since backend doesn't return userId
        username, 
        roles 
      }));

      toast({
        title: 'Welcome back!',
        description: `Logged in successfully as ${username}`,
      });

      // Redirect based on role
      if (roles.includes('ROLE_ADMIN')) {
        router.push('/admin');
      } else if (roles.includes('ROLE_MANAGER')) {
        router.push('/manager');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      let errorMessage = 'An unexpected error occurred';
      
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Cannot connect to server. Please check if the backend is running.';
      } else if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        // Handle HTTP status codes
        if (status === 401) {
          errorMessage = 'Invalid username or password';
        } else if (status === 403) {
          errorMessage = 'Access denied';
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (data?.message) {
          errorMessage = data.message;
        }
      }
      
      toast({
        title: 'Login Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-farm-green-50 to-farm-cream-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-farm-green-700 rounded-full">
              <Sprout className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-farm-green-800">
            Welcome to Khati
          </CardTitle>
          <CardDescription>Farm Fresh E-commerce Platform</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-farm-green-700 hover:bg-farm-green-800"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/register" className="text-farm-green-700 hover:underline font-medium">
                Sign up
              </Link>
            </p>
            <Link href="/products" className="text-sm text-center text-farm-green-700 hover:underline">
              Continue as guest
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
