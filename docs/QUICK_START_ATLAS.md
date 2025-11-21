# Quick Start: MongoDB Atlas Setup

## 🚀 5-Minute Setup

1. **Create Account**: [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)

2. **Create Cluster**: 
   - Click "Build a Database"
   - Choose **M0 Free** tier
   - Select region (closest to you)
   - Click "Create"

3. **Create Database User**:
   - Go to "Database Access" → "Add New Database User"
   - Username: `foodie-admin`
   - Password: Generate secure password (SAVE IT!)
   - Privileges: "Read and write to any database"

4. **Configure Network**:
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (or add your IP)
   - Enter: `0.0.0.0/0` → "Confirm"

5. **Get Connection String**:
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password (URL encode special chars)

6. **Update `.env` file**:
   ```env
   MONGODB_URI=mongodb+srv://foodie-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/foodie-dash?retryWrites=true&w=majority
   ```

7. **Start Server**:
   ```bash
   cd server
   npm run dev
   ```

✅ Done! Your database is now in the cloud.

## 📝 Password URL Encoding

If password has special characters:
- `@` → `%40`
- `#` → `%23`
- `%` → `%25`
- `/` → `%2F`

**Example**: `MyP@ss#123` → `MyP%40ss%23123`

## 🔗 Full Guide

For detailed instructions, see [MONGODB_ATLAS_SETUP.md](./MONGODB_ATLAS_SETUP.md)

