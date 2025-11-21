# Admin Panel Setup Guide

## Default Admin Credentials

**The default admin user is automatically created when the server starts!**

- **Email:** `admin@gmail.com`
- **Password:** `admin123`

Simply start your server and use these credentials to log in at `/admin/login`.

---

## Creating Additional Admin Users

If you need to create additional admin users, you have two options:

### Option 1: Using the Registration API

Send a POST request to `/api/auth/register` with the following data:

```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "YourSecurePassword123!",
  "role": "admin"
}
```

**Example using curl:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "YourSecurePassword123!",
    "role": "admin"
  }'
```

### Option 2: Update Existing User Role (via MongoDB)

If you have an existing user, you can update their role directly in MongoDB:

```javascript
// In MongoDB shell or MongoDB Compass
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "admin" } }
)
```

## Accessing the Admin Panel

1. Navigate to `/admin/login` in your browser
2. Enter the admin email and password
3. Upon successful login, you'll be redirected to the admin dashboard

## Security Features

- ✅ Custom email/password authentication (no Clerk dependency)
- ✅ Role-based access control (admin/super-admin only)
- ✅ JWT token authentication
- ✅ Protected admin routes
- ✅ Secure token storage
- ✅ Automatic logout on token expiration
- ✅ Session management

## Admin Token Storage

The admin authentication system stores:
- `adminToken`: The admin JWT token
- `adminUser`: The admin user information (including role)
- `token`: Shared token for API calls

## Logging Out

Click the "Logout" button in the admin navbar to securely log out and clear admin session data.

## Notes

- Admin tokens expire after 7 days
- Only users with `role: "admin"` or `role: "super-admin"` can access the admin panel
- All admin API routes require a valid admin token in the Authorization header
- Regular user tokens won't work for admin routes

