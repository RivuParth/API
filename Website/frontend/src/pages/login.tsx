import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Link
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        // sx={{
        //   marginTop: 8,
        //   display: 'flex',
        //   flexDirection: 'column',
        //   alignItems: 'center',
        //   background: 'linear-gradient(135deg,rgb(0, 0, 0) 0%, #1a1a2e 100%)',
        //   minHeight: '100vh',
        //   padding: '20px 0'
        // }}
      >
        <Card sx={{ 
          width: '100%', 
          mt: 3,
          backgroundColor: 'rgb(0, 0, 0)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 0, 0, 0.2)',
          boxShadow: '0 8px 32px 0 rgba(225, 224, 224, 0.37)'
        }}>
          <CardContent>
            <Typography component="h1" variant="h5" align="center" gutterBottom sx={{ color: 'white', mb: 3 }}>
              Welcome Back!
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ 
                  mt: 3, 
                  mb: 2,
                  backgroundColor: '#4e54c8',
                  '&:hover': {
                    backgroundColor: '#434190'
                  },
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Login'}
              </Button>
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Link href="/signup" variant="body2">
                  Sign Up
                </Link>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Login;