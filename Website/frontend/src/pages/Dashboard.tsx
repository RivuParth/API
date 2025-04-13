import { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  TextField,
  Tooltip,
} from '@mui/material';
import { ContentCopy as ContentCopyIcon, Logout as LogoutIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';


const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);


  const handleGetApiKey = async () => {
    setLoading(true);
    try {
      const response = await fetch(import.meta.env.VITE_API_URL+'/generate-key/');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.apiKey) {
        throw new Error('API key was not returned from server');
      }
      
      setApiKey(data.apiKey);
      toast.success('Google Cloud API Key generated successfully!');
    } catch (err) {
      toast.error('Failed to generate API key: ' + (err as Error).message);
      console.error('Client error during API call:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    toast.success('API Key copied to clipboard!');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <Tooltip title="Logout">
          <IconButton onClick={handleLogout} color="inherit">
            <LogoutIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Welcome, {user?.username}!
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Subscription Status: {user?.isSubscribed ? 'Active' : 'Inactive'}
          </Typography>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            API Key Management
          </Typography>
          
          {apiKey && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                value={apiKey}
                label="Your API Key"
                variant="outlined"
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <Tooltip title="Copy API Key">
                      <IconButton onClick={handleCopyApiKey} edge="end">
                        <ContentCopyIcon />
                      </IconButton>
                    </Tooltip>
                  ),
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Make sure to copy your API key now as it won't be shown again.
              </Typography>
            </Box>
          )}
            {user?.isSubscribed ? (
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleGetApiKey}
                  disabled={loading}
                  fullWidth
                >
                  Get Your API Key
                </Button>
              </Box>
            ) : (
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => navigate('/subscription')}
                  fullWidth
                >
                  Subscribe to get your API key
                </Button>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                  You need an active subscription to generate an API key
                </Typography>
              </Box>
            )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default Dashboard;