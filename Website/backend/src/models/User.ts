import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

interface IUser extends mongoose.Document {
  username: string;
  email: string;
  password: string;
  isAdmin: boolean;
  isSubscribed: boolean;
  subscriptionId?: string;
  stripeCustomerId?: string;
  apiKey?: string;
  apiKeys: {
    key: string;
    createdAt: Date;
    isActive: boolean;
    serviceAccountEmail: string;
    projectId: string;
    service: string;
  }[];
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: (props: { value: string }) => `${props.value} is not a valid email address!`
    }
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isSubscribed: {
    type: Boolean,
    default: false,
  },
  subscriptionId: {
    type: String,
  },
  apiKey: {
    type: String,
  },
  apiKeys: [{
    key: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    },
    serviceAccountEmail: {
      type: String,
      required: true
    },
    projectId: {
      type: String,
      required: true
    },
    service: {
      type: String,
      required: true
    }
  }],
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Create admin user if not exists
interface IUserModel extends mongoose.Model<IUser> {
  createAdminUser(): Promise<void>;
}

const User = mongoose.model<IUser, IUserModel>('User', userSchema);

User.createAdminUser = async () => {
  try {
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const adminUser = new User({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin',
        isAdmin: true
      });
      await adminUser.save();
      console.log('Admin user created successfully');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

// Default admin credentials will be created during server startup in index.ts

export default User;