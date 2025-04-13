import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';

import { ApiKeysClient } from '@google-cloud/apikeys';
import mongoose from 'mongoose';
import { GoogleAuth } from 'google-auth-library';

// Routes
import authRoutes from './routes/auth';
import subscriptionRoutes from './routes/subscription';
import adminRoutes from './routes/admin';
import generateKeysRoutes from './routes/genarate-key';

// Load environment variables


// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI as string)
  .then(() => {
    console.log('Connected to MongoDB');
    import('./models/User').then(module => {
      module.default.createAdminUser().catch((err: unknown) => 
        console.error('Admin user creation error:', err instanceof Error ? err.message : err)
      );
    });
  })
  .catch((error: unknown) => console.error('MongoDB connection error:', error instanceof Error ? error.message : error));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/generate-key', generateKeysRoutes);

async function createApiKey() {
  const auth = new GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS as string,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  try {
    const apiKeysClient = new ApiKeysClient({
  credentials: await auth.getCredentials(),
  projectId: process.env.GCP_PROJECT_ID
});
    const parent = `projects/${process.env.GCP_PROJECT_ID as string}/locations/global`;

    const [operation] = await apiKeysClient.createKey({
      parent,
      key: {
        displayName: 'VertexAI-Frontend-Key',
        restrictions: {
          apiTargets: [{ service: 'aiplatform.googleapis.com' }],
        },
      },
    });

    const [keyData] = await operation.promise();

    return keyData.keyString;
  } catch (err: unknown) {
    const error = err as Error & { code?: string, response?: { data?: unknown } };
    console.error('Authentication failed:', {
      message: error.message,
      code: error.code,
      details: error.response?.data,
    });
    throw error;
  }
}

app.get('/generate-key', async (req, res) => {
  try {
    const apiKey = await createApiKey();
    res.json({ apiKey });
  } catch (err: unknown) {
    const error = err as Error & { code?: string, response?: { data?: unknown } };
    console.error('Error generating API key:', {
      message: error.message,
      code: error.code,
      response: error.response?.data
    });
    res.status(500).send('Failed to generate API key');
  }
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});