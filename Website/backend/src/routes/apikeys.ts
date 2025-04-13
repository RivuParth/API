import express from 'express';
import { Request, Response } from 'express';
import User from '../models/User';
import crypto from 'crypto';

const router = express.Router();



// Generate new API key
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.isSubscribed) {
      return res.status(403).json({ 
        message: 'Subscription required to generate API keys',
        upgradeUrl: '/subscribe'
      });
    }
    
    // Import required Google Cloud libraries
    const {google} = require('googleapis');
    const serviceUsage = google.serviceusage('v1');
    const apiKeys = google.apikeys('v2');
    
    // Authenticate with service account
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: 'service_account',
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL
      },
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
    
    const authClient = await auth.getClient();
    
    // Enable Vertex AI API if not already enabled
    try {
      await serviceUsage.services.enable({
        name: `projects/${process.env.GOOGLE_PROJECT_ID}/services/aiplatform.googleapis.com`,
        auth: authClient
      });
    } catch (error) {
      if ((error as any).code !== 409) { // 409 means API is already enabled
        throw error;
      }
    }
    
    // Create API key restricted to Vertex AI
    const apiKeyResponse = await apiKeys.projects.locations.keys.create({
      parent: `projects/${process.env.GOOGLE_PROJECT_ID}/locations/global`,
      keyId: `vertex-ai-key-${Date.now()}`,
      requestBody: {
        displayName: 'Vertex AI Access Key',
        restrictions: {
          apiTargets: [
            {
              service: 'aiplatform.googleapis.com'
            }
          ]
        }
      },
      auth: authClient
    });
    
    if (!apiKeyResponse.data || !apiKeyResponse.data.keyString) {
      throw new Error('Failed to generate API key: Invalid response from Google API Keys API');
    }
    
    const apiKey = apiKeyResponse.data.keyString;
    
    // Save key to user
    user.apiKeys.push({
      key: apiKey,
      createdAt: new Date(),
      isActive: true,
      serviceAccountEmail: process.env.GOOGLE_CLIENT_EMAIL || '',
      projectId: process.env.GOOGLE_PROJECT_ID || '',
      service: 'aiplatform.googleapis.com'
    });
    
    await user.save();
    
    res.status(201).json({ 
      apiKey,
      message: 'Vertex AI API key generated successfully'
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    res.status(500).json({ 
      message: 'Error generating API key',
      error: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// List user's API keys
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const user = await User.findById(userId).select('apiKeys');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user.apiKeys);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    res.status(500).json({ 
      message: 'Error retrieving API keys',
      error: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Get user's API key
router.get('/api/api-keys', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const user = await User.findById(userId).select('apiKeys');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.apiKeys.length === 0) {
      return res.status(404).json({ message: 'No API keys found' });
    }
    
    res.status(200).json([user.apiKeys[0].key]);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    res.status(500).json({ 
      message: 'Error retrieving API key',
      error: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Revoke API key
router.delete('/:keyId', async (req: Request, res: Response) => {
  try {
    const { keyId } = req.params;
    // TODO: Implement revoke API key logic
    res.status(200).json({ message: 'API key revoked successfully' });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    res.status(500).json({ 
      message: 'Error revoking API key',
      error: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

export default router;