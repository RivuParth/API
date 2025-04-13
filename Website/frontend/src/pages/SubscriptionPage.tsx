import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { Check as CheckIcon } from '@mui/icons-material';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const features = [
    'Access to API Key Generation',
    'Unlimited API Calls',
    'Priority Support',
    'Advanced Analytics',
  ];

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      window.location.href = 'https://buy.stripe.com/test_6oE8zd4cH3Mi7IY9AC';
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast.error(error?.message || 'Failed to initiate subscription process');
    } finally {
      setLoading(false);
    }
  };

  if (user?.isSubscribed) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            You're Already Subscribed!
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/dashboard')}
            sx={{ mt: 3 }}
          >
            Return to Dashboard
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Subscribe to My API
        </Typography>
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h5" align="center" gutterBottom>
              Premium Plan
            </Typography>
            <Typography variant="h4" align="center" color="primary" gutterBottom>
              US$100.00/month
            </Typography>
            <List>
              {features.map((feature, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={feature} />
                </ListItem>
              ))}
            </List>
          </CardContent>
          <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleSubscribe}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Subscribe Now'}
            </Button>
          </CardActions>
        </Card>
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="text"
            onClick={() => navigate('/dashboard')}
          >
            Return to Dashboard
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default SubscriptionPage;