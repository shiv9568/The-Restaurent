import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ClerkProvider } from '@clerk/clerk-react'

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_placeholder_key_for_development'

// For development/testing, we'll use a placeholder key if none is provided
if (!PUBLISHABLE_KEY || PUBLISHABLE_KEY === 'placeholder') {
  console.warn('⚠️ Using placeholder Clerk key for development. Set VITE_CLERK_PUBLISHABLE_KEY in .env for production.')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <App />
    </ClerkProvider>
  </StrictMode>,
)
