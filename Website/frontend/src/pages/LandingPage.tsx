import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Person as PersonIcon,
  Key as KeyIcon,
  Code as CodeIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import "@lottiefiles/lottie-player";

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const lottieRef = useRef(null);

  const handleGetStarted = () => {
    navigate('/signup');
  };

  const handleLearnMore = () => {
    navigate('/login');
  };

  return (
    <Box sx={{ bgcolor: '#ffffff', minHeight: '100vh' }}>
      {/* Navigation */}
      <Box sx={{
        bgcolor: '#FFFFFF',
        backdropFilter: 'blur(10px)',
        position: 'fixed',
        width: '100%',
        zIndex: 10,
        boxShadow: 10,
        py: 2
      }}>
        <Container maxWidth="lg">
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* <IconButton color="primary" onClick={() => theme.palette.mode === 'dark' ? theme.palette.mode = 'light' : theme.palette.mode = 'dark'}>
                {theme.palette.mode === 'dark' ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 00.393 15 7.5 7.5 0 007.5-7.5c0-.132 0-.263 0-.393A7.5 7.5 0 0012 3z"/>
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 18a6 6 0 110-12 6 6 0 010 12zm0-2a4 4 0 100-8 4 4 0 000 8zM11 1h2v3h-2V1zm0 19h2v3h-2v-3zM3.515 4.929l1.414-1.414L7.05 5.636 5.636 7.05 3.515 4.93zM16.95 18.364l1.414-1.414 2.121 2.121-1.414 1.414-2.121-2.121zm2.121-14.85l1.414 1.415-2.121 2.121-1.414-1.414 2.121-2.121zM5.636 16.95l1.414 1.414-2.121 2.121-1.414-1.414 2.121-2.121zM1 11h3v2H1v-2zm19 0h3v2h-3v-2z"/>
                  </svg>
                )}
              </IconButton> */}
              <KeyIcon sx={{ fontSize: 32, color: '#000000' }} />
              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', ml: 1, color: '#000000' }}>
                My API
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {!user ? (
                <>
                  <Button
                    variant="text"
                    onClick={() => navigate('/login')}
                    sx={{ color: '#000000' }}
                  >
                    Login
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/signup')}
                  >
                    Sign Up
                  </Button>
                </>
              ) : (
                <IconButton onClick={logout} color="inherit">
                  <LogoutIcon />
                </IconButton>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box sx={{ pt: '100px', pb: 8 }}>

        <Container maxWidth="lg">
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { md: '1fr 1fr' },
            gap: 4,
            alignItems: 'center'
          }}>
            <Box>
              <Typography
                variant={isMobile ? 'h4' : 'h3'}
                sx={{
                  fontWeight: 'bold',
                  mb: 3,
                  fontSize: '2rem',
                  lineHeight: 1.2,
                  color: '#1a237e'
                }}
              >
                Power Your Projects with Instant API Access
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: '#455a64',
                  mb: 4,
                  fontSize: { xs: '1rem', md: '1.2rem' }
                }}
              >
                Generate secure, unique API keys in one click. Built for developers. Trusted by teams.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleGetStarted}
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleLearnMore}
                  sx={{
                    color: '#1a237e',
                    borderColor: '#1a237e',
                    '&:hover': {
                      borderColor: '#1a237e',
                      backgroundColor: 'rgba(26, 35, 126, 0.04)'
                    }
                  }}
                >
                  Learn More
                </Button>
              </Box>
            </Box>
            {!isMobile && (
              <Box sx={{
                width: '100%',
                height: '400px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                overflow: 'visible',
                borderRadius: 2,
                bgcolor: 'transparent'
              }}>
                <Box
                  sx={{ width: '100%', height: '400px' }}
                  dangerouslySetInnerHTML={{
                    __html: `
      <lottie-player 
        src="https://assets8.lottiefiles.com/packages/lf20_qp1q7mct.json"
        background="transparent" 
        speed="1" 
        style="width: 100%; height: 400px;"
        loop 
        autoplay>
      </lottie-player>
    `
                  }}
                />

              </Box>
            )}
          </Box>
        </Container>
      </Box>

      {/* How it Works */}
      <Box sx={{ bgcolor: '#000000', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              textAlign: 'center',
              mb: 6
            }}
          >
            How It Works
          </Typography>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { md: 'repeat(3, 1fr)' },
            gap: 4
          }}>
            {[
              {
                icon: <PersonIcon fontSize="large" sx={{ color: 'black' }} />,
                title: '1. Create Account',
                description: 'Quick and secure signup process'
              },
              {
                icon: <KeyIcon fontSize="large" sx={{ color: 'black' }} />,
                title: '2. Login',
                description: 'Access your secure dashboard'
              },
              {
                icon: <CodeIcon fontSize="large" sx={{ color: 'black' }} />,
                title: '3. Generate API Key',
                description: 'Get your unique API key instantly'
              }
            ].map((item, index) => (
              <Box
                key={index}
                sx={{
                  textAlign: 'center',
                  p: 3,
                  borderRadius: 2,
                  bgcolor: 'action.hover'
                }}
              >
                <Box sx={{
                  bgcolor: 'primary.light',
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2
                }}>
                  {item.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 1 }}>
                  {item.title}
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  {item.description}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: '#000000', mt: 8, py: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
            © 2024 API Generator. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}