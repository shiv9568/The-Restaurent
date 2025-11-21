import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SignIn, SignUp, useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

async function exchangeClerkForBackendJWT(getToken: () => Promise<string | null>) {
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const clerkToken = await getToken();
  const body = JSON.stringify({ token: clerkToken || '' });
  const headers = { 'Content-Type': 'application/json' } as const;
  let res = await fetch(`${API_BASE}/auth/clerk-verify`, { method: 'POST', headers, body });
  if (!res.ok) return null;
  const data = await res.json();
  return data;
}

const Auth = () => {
  const { isSignedIn, getToken } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    async function doExchange() {
      if (isSignedIn) {
        const backendToken = window.localStorage.getItem('token');
        if (!backendToken) {
          const data = await exchangeClerkForBackendJWT(getToken);
          if (data?.token) {
            window.localStorage.setItem('token', data.token);
            if (data.user) window.localStorage.setItem('user', JSON.stringify(data.user));
          } else {
            window.localStorage.removeItem('token');
          }
        }
        // After exchange, if user has no phone, redirect to complete-profile
        try {
          const raw = window.localStorage.getItem('user');
          const parsed = raw ? JSON.parse(raw) : null;
          if (!parsed?.phone) {
            navigate('/complete-profile');
            return;
          }
        } catch {}
        navigate('/');
      }
    }
    doExchange();
  }, [isSignedIn, getToken, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to FoodieDash</CardTitle>
          <p className="text-muted-foreground">Login or sign up to order deliciousness</p>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={v => setTab(v as 'login' | 'signup')} className="font-medium">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <SignIn redirectUrl="/" signUpUrl="/auth?tab=signup" />
            </TabsContent>
            <TabsContent value="signup">
              <SignUp redirectUrl="/" signInUrl="/auth?tab=login" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
