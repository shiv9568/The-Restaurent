# MongoDB Atlas Cloud Database Setup Guide

This guide will help you migrate from local MongoDB to MongoDB Atlas cloud database for global, long-term use.

## Benefits of MongoDB Atlas

- ✅ **Free Forever**: 512MB storage, shared RAM (M0 cluster)
- ✅ **Global Access**: Access from anywhere, no local installation needed
- ✅ **99.95% Uptime**: Reliable cloud infrastructure
- ✅ **Automatic Backups**: Built-in backup and recovery
- ✅ **No Code Changes**: Works with your existing Mongoose setup
- ✅ **Easy Scaling**: Upgrade anytime when needed
- ✅ **Security**: Built-in authentication and network security

## Step 1: Create MongoDB Atlas Account

1. Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Sign up with your email (or use Google/GitHub)
3. Verify your email address

## Step 2: Create Free Cluster

1. After login, click **"Build a Database"** or **"Create"** button
2. Select **"M0 Free"** tier (Free Shared Cluster)
3. Choose **Cloud Provider**: 
   - AWS (recommended)
   - Google Cloud
   - Azure
4. Select **Region**: 
   - Choose closest to you (e.g., `us-east-1` for US, `ap-south-1` for India)
   - For global access, choose a central region
5. **Cluster Name**: `foodie-dash-cluster` (or any name you like)
6. Click **"Create"**

⏳ Wait 3-5 minutes for cluster to be created

## Step 3: Create Database User

1. In the **"Security"** section, click **"Database Access"**
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Set username: `foodie-dash-admin` (or your choice)
5. Set password: Generate a strong password (save it securely!)
   - Click **"Autogenerate Secure Password"** 
   - **COPY AND SAVE** the password - you won't see it again!
6. **Database User Privileges**: Select **"Read and write to any database"**
7. Click **"Add User"**

## Step 4: Configure Network Access

1. In **"Security"** section, click **"Network Access"**
2. Click **"Add IP Address"**
3. For development, you have two options:

   **Option A: Allow All IPs (Easy for testing)**
   - Click **"Allow Access from Anywhere"**
   - Enter: `0.0.0.0/0`
   - Click **"Confirm"**
   - ⚠️ **Note**: This is less secure but good for development/testing

   **Option B: Allow Specific IPs (More Secure)**
   - Click **"Add Current IP Address"** (adds your current IP)
   - Add your server's IP if deploying
   - Click **"Confirm"**

## Step 5: Get Connection String

1. Click **"Database"** in the left sidebar
2. Click **"Connect"** on your cluster
3. Select **"Connect your application"**
4. Choose **Driver**: `Node.js` and **Version**: `5.5 or later`
5. Copy the connection string (looks like this):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 6: Update Your Environment Variables

1. Open `server/.env` file (create if it doesn't exist)

2. Replace the connection string with your Atlas connection string:

   ```env
   # MongoDB Atlas Connection (replace with your actual connection string)
   MONGODB_URI=mongodb+srv://foodie-dash-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/foodie-dash?retryWrites=true&w=majority

   # Server Configuration
   PORT=5000
   NODE_ENV=production

   # JWT Secret (use a strong random string in production!)
   JWT_SECRET=your-very-strong-secret-key-change-this
   JWT_EXPIRES_IN=7d

   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:5173,https://yourdomain.com
   ```

3. **Important**: Replace these values:
   - `foodie-dash-admin` → Your database username
   - `YOUR_PASSWORD` → Your database password (URL encode special characters)
   - `cluster0.xxxxx.mongodb.net` → Your actual cluster URL
   - `foodie-dash` → Your database name (can be any name)

## Step 7: URL Encoding Your Password

If your password contains special characters (like `@`, `#`, `%`, etc.), you need to URL encode them:

- `@` becomes `%40`
- `#` becomes `%23`
- `%` becomes `%25`
- `&` becomes `%26`
- `/` becomes `%2F`

**Example:**
```
Password: MyP@ss#123
Encoded: MyP%40ss%23123
```

Or use an online URL encoder: [https://www.urlencoder.org/](https://www.urlencoder.org/)

## Step 8: Test the Connection

1. Save your `.env` file
2. Make sure your server is stopped
3. Navigate to server directory:
   ```bash
   cd server
   ```
4. Start the server:
   ```bash
   npm run dev
   ```
5. Look for this message:
   ```
   ✅ Connected to MongoDB
   ✅ Default admin user created
   🚀 Server running on port 5000
   ```

If you see connection errors, check:
- Password is correct (and URL encoded if needed)
- IP address is whitelisted in Network Access
- Connection string is complete
- Internet connection is active

## Step 9: Verify Data Migration (Optional)

If you have existing local data:

1. Export from local MongoDB:
   ```bash
   mongodump --uri="mongodb://localhost:27017/foodie-dash" --out=./backup
   ```

2. Import to Atlas:
   ```bash
   mongorestore --uri="mongodb+srv://username:password@cluster.mongodb.net/foodie-dash" ./backup/foodie-dash
   ```

Or use MongoDB Compass to manually export/import collections.

## Production Deployment

When deploying to production (Vercel, Railway, Heroku, etc.):

1. Add your Atlas connection string as an environment variable
2. Ensure your hosting provider's IP is whitelisted (or use `0.0.0.0/0` with strong password)
3. Never commit `.env` file to Git
4. Use environment variables in your hosting platform

### Example: Vercel Deployment
```bash
# In Vercel Dashboard → Settings → Environment Variables
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/foodie-dash
JWT_SECRET=your-production-secret
NODE_ENV=production
```

## Security Best Practices

1. ✅ Use strong passwords (12+ characters, mixed case, numbers, symbols)
2. ✅ Don't commit `.env` files to Git (add to `.gitignore`)
3. ✅ Restrict IP access to known IPs in production
4. ✅ Regularly rotate passwords
5. ✅ Enable MongoDB Atlas alerts for suspicious activity
6. ✅ Use separate database users for different applications

## Monitoring and Alerts

MongoDB Atlas provides free monitoring:

1. Go to **"Metrics"** tab in Atlas dashboard
2. Monitor:
   - Connection count
   - Storage usage
   - CPU/RAM usage
3. Set up alerts (Settings → Alerts) for:
   - High connection count
   - Storage approaching limit
   - Failed authentication attempts

## Free Tier Limits

**M0 Free Tier Includes:**
- 512MB storage
- Shared RAM (512MB)
- No time limit (free forever)
- Automatic backups (7-day retention)
- No credit card required

**When to Upgrade:**
- Storage exceeds 512MB
- Need more performance
- Need dedicated resources
- Need longer backup retention

## Troubleshooting

### Connection Timeout
- Check network access IP whitelist
- Verify firewall settings
- Check internet connection

### Authentication Failed
- Verify username and password
- URL encode special characters in password
- Check user has correct privileges

### Slow Queries
- Add indexes to frequently queried fields
- Review slow query logs in Atlas
- Consider upgrading cluster tier

### Out of Storage
- Delete unused data
- Archive old orders
- Upgrade to paid tier

## Alternative Free Options

If MongoDB Atlas doesn't work for you:

1. **Railway.app**: Free tier with MongoDB ($5 monthly credits)
2. **MongoDB on Railway**: Pre-configured MongoDB instance
3. **Supabase**: PostgreSQL (would require code changes)
4. **PlanetScale**: MySQL (would require code changes)

## Support

- MongoDB Atlas Documentation: [https://docs.atlas.mongodb.com/](https://docs.atlas.mongodb.com/)
- MongoDB Community Forum: [https://developer.mongodb.com/community/forums/](https://developer.mongodb.com/community/forums/)
- Atlas Support: Available in dashboard

---

**Ready to go!** Your database is now in the cloud and accessible globally. 🚀

