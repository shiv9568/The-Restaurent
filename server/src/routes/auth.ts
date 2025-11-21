import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { findUserByEmail, createUser, comparePassword, findUserByClerkId, updateUser } from '../db/users.js';
import { verifyToken as verifyClerkToken } from '@clerk/clerk-sdk-node';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Check if user exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user
    const user = await createUser({ name, email, password, phone, role: role || 'user' });

    // Generate token
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await comparePassword(user, password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Login (requires admin role)
router.post('/admin-login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Allow configured admin credentials (dev-friendly), and ensure/admin role in DB when possible
    const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@gmail.com').toLowerCase();
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
    const reqEmail = String(email).toLowerCase().trim();

    if (reqEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      try {
        let adminUser: any = await findUserByEmail(ADMIN_EMAIL);
        if (!adminUser) {
          // Create admin user with hashed password via createUser
          adminUser = await createUser({ name: 'Admin User', email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: 'admin' } as any);
        } else if (adminUser.role !== 'admin' && adminUser.role !== 'super-admin') {
          // Promote existing user to admin
          const updated = await updateUser(adminUser.id, { role: 'admin' } as any);
          adminUser = { ...adminUser, role: updated?.role || 'admin' };
        }
        const token = jwt.sign(
          { userId: adminUser.id, email: adminUser.email, role: 'admin' },
          JWT_SECRET,
          { expiresIn: '7d' }
        );
        return res.json({ token, user: { id: adminUser.id, name: adminUser.name, email: adminUser.email, role: 'admin' } });
      } catch (e) {
        // Fallback token even if DB is unavailable
        const token = jwt.sign(
          { userId: 'admin-bypass', email: ADMIN_EMAIL, role: 'admin' },
          JWT_SECRET,
          { expiresIn: '7d' }
        );
        return res.json({ token, user: { id: 'admin-bypass', name: 'Admin User', email: ADMIN_EMAIL, role: 'admin' } });
      }
    }

    // Default flow: validate against stored user with admin role
    // Find user
    const user = await findUserByEmail(reqEmail);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is admin
    if (user.role !== 'admin' && user.role !== 'super-admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    // Check password
    if (!user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isMatch = await comparePassword(user, password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate admin token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      }, 
      JWT_SECRET, 
      {
        expiresIn: '7d', // Admin sessions last 7 days
      }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error: any) {
    console.error('[Admin login error]', error);
    res.status(500).json({ error: error.message || 'Login failed' });
  }
});

// --- OTP AUTH START ---
const otpStore: Record<string, { otp: string; expires: number }> = {};
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

// Request OTP
router.post('/otp/request', async (req: Request, res: Response) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number is required' });
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[phone] = { otp, expires: Date.now() + OTP_EXPIRY_MS };
  // In production, send SMS here. For demo, return OTP in response.
  res.status(200).json({ message: 'OTP sent', phone, otp });
});

// Verify OTP and login/signup
router.post('/otp/verify', async (req: Request, res: Response) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ error: 'Phone and OTP required' });
  const record = otpStore[phone];
  if (!record || record.expires < Date.now()) return res.status(400).json({ error: 'OTP expired or invalid' });
  if (record.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });
  // OTP verified, find or create user
  let user = await findUserByEmail(`u${phone}@example.com`);
  if (!user) {
    const created = await createUser({ name: 'New User', email: `u${phone}@example.com`, password: phone, phone });
    user = { id: created.id, name: created.name, email: created.email, role: created.role, phone } as any;
  }
  // Issue JWT
  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  // Clean OTP
  delete otpStore[phone];
  res.status(200).json({
    token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, addresses: [] },
  });
});
// --- OTP AUTH END ---

// POST /api/auth/clerk-verify
router.post('/clerk-verify', async (req: Request, res: Response) => {
  const { token } = req.body;
  try {
    // 1. Verify Clerk JWT from frontend (or bypass in non-production for simplicity)
    let payload: any = null;
    try {
      payload = await verifyClerkToken(token);
    } catch (e) {
      const allowBypass = (process.env.ALLOW_AUTH_BYPASS ?? (process.env.NODE_ENV !== 'production' ? 'true' : 'false')) as string;
      if (allowBypass.toLowerCase() === 'true') {
        // Minimal payload fallback for dev
        payload = {
          sub: 'dev-clerk-id',
          first_name: 'Dev',
          last_name: 'User',
          email_address: 'dev@example.com',
          email_addresses: [{ email_address: 'dev@example.com' }],
        };
      } else {
        throw e;
      }
    }
    // 2. Find or create local user by Clerk ID
    let user = await findUserByClerkId(payload.sub);
    if (!user) {
      user = await createUser({
        clerkId: payload.sub,
        name: ((payload.first_name || '') + (payload.last_name ? ` ${payload.last_name}` : '')).trim() || 'User',
        email: Array.isArray(payload.email_addresses)
          ? (payload.email_addresses[0]?.email_address || '')
          : payload.email_address || '',
      } as any);
    }
    // Promote to admin based on env-configured emails or dev flag
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
    const allowAllAdminDev = ((process.env.ALLOW_ALL_AS_ADMIN_IN_DEV ?? (process.env.NODE_ENV !== 'production' ? 'true' : 'false')) as string).toLowerCase() === 'true';
    if ((adminEmails.includes((user.email || '').toLowerCase()) || allowAllAdminDev) && user.role !== 'admin' && user.role !== 'super-admin') {
      const updated = await updateUser(user.id, { role: 'admin' } as any);
      user = { ...user, role: updated.role } as any;
    }
    // 3. Issue backend JWT
    const yourJwt = jwt.sign(
      { userId: user.id, email: user.email, clerkId: user.clerkId, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    res.json({ token: yourJwt, user });
  } catch (err) {
    console.error('[Clerk verify error]', err);
    res.status(401).json({ error: 'Invalid Clerk JWT' });
  }
});

export default router;

