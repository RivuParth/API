import express from 'express';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Register new user
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({ username, email, password });
    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id, username: user.username, isAdmin: user.isAdmin, isSubscribed: user.isSubscribed },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        isAdmin: user.isAdmin,
        isSubscribed: user.isSubscribed
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error registering user' });
  }
});

// Login user
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Allow admin to login through admin portal
    if (username === 'admin' && req.path !== '/admin/login') {
      return res.status(403).json({ message: 'Admin must login through admin portal' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, username: user.username, isAdmin: user.isAdmin, isSubscribed: user.isSubscribed },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        isAdmin: user.isAdmin,
        isSubscribed: user.isSubscribed
      }
    });
  } catch (error: any) {
    res.status(401).json({ message: error.message || 'Invalid credentials' });
  }
});

// Admin login
router.post('/admin/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Allow admin to login through admin portal
    if (username === 'admin' && req.path !== '/admin/login') {
      return res.status(403).json({ message: 'Admin must login through admin portal' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check admin status
    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Access denied - admin privileges required' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, username: user.username, isAdmin: user.isAdmin, isSubscribed: user.isSubscribed },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        isAdmin: user.isAdmin,
        isSubscribed: user.isSubscribed
      }
    });
  } catch (error: any) {
    res.status(401).json({ message: error.message || 'Invalid admin credentials' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      id: user._id,
      username: user.username,
      isAdmin: user.isAdmin,
      isSubscribed: user.isSubscribed
    });
  } catch (error: any) {
    res.status(401).json({ message: error.message || 'Not authenticated' });
  }
});

export default router;