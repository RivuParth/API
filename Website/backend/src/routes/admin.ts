import express from 'express';
import { Request, Response } from 'express';
import User from '../models/User';
import { authenticateToken, isAdmin } from '../middleware/auth';
import bcrypt from 'bcryptjs';

const router = express.Router();
router.use(authenticateToken, isAdmin);

// Create new API user
router.post('/users', async (req: Request, res: Response) => {
  try {
    const { username, email, password, isAdmin } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user - password will be hashed by User model's pre-save hook
    const newUser = new User({
      username,
      email,
      password,
      isAdmin: isAdmin || false
    });

    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

// Get all users
router.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving users' });
  }
});

// Get user statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    // TODO: Implement get statistics logic
    res.status(200).json({ message: 'Statistics retrieved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving statistics' });
  }
});

// Update user status
router.put('/users/:userId/status', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { isSubscribed: status },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user status' });
  }
});

// Get system logs
router.get('/logs', async (req: Request, res: Response) => {
  try {
    // TODO: Implement get system logs logic
    res.status(200).json({ message: 'System logs retrieved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving system logs' });
  }
});



export default router;