import express from 'express';
import { google } from 'googleapis';

const router = express.Router();

const projectId = process.env.GCP_PROJECT_ID;

async function createApiKey() {
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
  
    try {
      const authClient = await auth.getClient();
      console.log('Authentication client created successfully');
  
      // @ts-ignore
      const apiKeysClient = google.apikeys({ version: 'v2', auth: authClient });
      console.log('API Keys client initialized');
  
      const parent = `projects/${projectId}/locations/global`;
  
      const operation = await apiKeysClient.projects.locations.keys.create({
        parent,
        requestBody: {
          displayName: 'VertexAI-Frontend-Key',
          restrictions: {
            apiTargets: [
              {
                service: 'aiplatform.googleapis.com',
              },
            ],
          },
        },
      });
  
      // Wait for long-running operation to complete
      // @ts-ignore
      const { data: keyData } = await google.apikeys('v2').operations.get({
        // @ts-ignore
        name: operation.data.name,
        auth: authClient
      });
  
      console.log('API key created successfully');
      console.log('Operation details:', JSON.stringify(keyData, null, 2));
  
      return keyData.response.keyString;
    } catch (err: any) {
      console.error('Authentication failed:', {
        message: err.message,
        code: err.code,
        details: err.response?.data,
        stack: err.stack
      });
      process.exit(1);
    }
  }
  

// Generate api key
router.get('/', async (req, res) => {
    try {
      const apiKey = await createApiKey();
      res.json({ 
        apiKey,
        status: 'success',
        message: 'API key generated successfully'
      });
    } catch (err : any) {
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        response: err.response?.data
      });
      console.error('Error generating API key:', err);
      res.status(500).json({
        status: 'error',
        message: 'Failed to generate API key',
        error: err.message
      });
    }
  });

export default router;