import React from 'react';
import { SignUp } from '@clerk/clerk-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminSignUp() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Restaurant Admin
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create your admin account
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Admin Registration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <SignUp 
                appearance={{
                  elements: {
                    formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-sm normal-case',
                    card: 'shadow-none',
                    headerTitle: 'hidden',
                    headerSubtitle: 'hidden',
                    socialButtonsBlockButton: 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700 text-sm normal-case',
                    formFieldInput: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
                    footerActionLink: 'text-blue-600 hover:text-blue-700',
                  }
                }}
                redirectUrl="/admin/dashboard"
                signInUrl="/admin/login"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
