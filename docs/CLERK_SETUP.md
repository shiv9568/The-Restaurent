# Clerk Authentication Setup

This project uses Clerk for authentication in the admin dashboard.

## Setup Instructions

### 1. Create a Clerk Account
1. Go to [https://clerk.com](https://clerk.com)
2. Sign up for a free account
3. Create a new application

### 2. Get Your Publishable Key
1. In your Clerk dashboard, go to "API Keys"
2. Copy your "Publishable key"
3. It should look like: `pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 3. Set Environment Variables
Create a `.env` file in the root directory and add:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

Replace `pk_test_your_publishable_key_here` with your actual publishable key from Clerk.

### 4. Configure Clerk Settings
In your Clerk dashboard:

1. **Authentication Methods**: Enable email/password and any social providers you want
2. **User Management**: Configure user metadata if needed
3. **Appearance**: Customize the sign-in/sign-up forms to match your brand

### 5. Test the Integration
1. Start the development server: `npm run dev`
2. Navigate to `/admin/login`
3. Try signing up with a new account
4. Test the admin dashboard functionality

## Features Implemented

- ✅ ClerkProvider wrapper in main.tsx
- ✅ Protected routes using Clerk authentication
- ✅ Admin login page with Clerk SignIn component
- ✅ Admin sign-up page with Clerk SignUp component
- ✅ User profile display in admin navbar
- ✅ Logout functionality using Clerk
- ✅ Loading states during authentication

## Admin Dashboard Access

- **Login URL**: `/admin/login`
- **Sign-up URL**: `/admin/sign-up`
- **Dashboard URL**: `/admin/dashboard`

## Troubleshooting

### Common Issues

1. **"Missing Publishable Key" Error**
   - Make sure your `.env` file is in the root directory
   - Check that the variable name is exactly `VITE_CLERK_PUBLISHABLE_KEY`
   - Restart your development server after adding the environment variable

2. **Authentication Not Working**
   - Verify your publishable key is correct
   - Check the Clerk dashboard for any configuration issues
   - Make sure your domain is allowed in Clerk settings

3. **Styling Issues**
   - The Clerk components are styled to match the admin theme
   - You can further customize the appearance in the Clerk dashboard

## Security Notes

- Never commit your `.env` file to version control
- Use different keys for development and production
- Regularly rotate your API keys
- Monitor your Clerk dashboard for any suspicious activity

## Next Steps

1. Set up user roles and permissions in Clerk
2. Configure email templates
3. Set up webhooks for user events
4. Add social authentication providers
5. Implement user management features
