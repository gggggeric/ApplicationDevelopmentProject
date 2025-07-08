import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../utils/toast';
import axios from 'axios';
import { 
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  styled,
  keyframes,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ArrowForward as ArrowForwardIcon,
  DirectionsCar as CarIcon,
  Security as ShieldIcon
} from '@mui/icons-material';

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const AdminLogin = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const navigate = useNavigate();

  // Responsive sizing
  const getResponsiveValue = (mobile, tablet, desktop) => {
    if (isMobile) return mobile;
    if (isTablet) return tablet;
    return desktop;
  };

  const validateForm = () => {
    if (!email.trim()) {
      showToast('error', 'Email Required', 'Please enter your email address');
      return false;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      showToast('error', 'Invalid Email', 'Please enter a valid email address');
      return false;
    }

    if (!password.trim()) {
      showToast('error', 'Password Required', 'Please enter your password');
      return false;
    }

    if (password.length < 6) {
      showToast('error', 'Password Too Short', 'Password must be at least 6 characters');
      return false;
    }

    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: email.trim().toLowerCase(),
        password: password.trim()
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Login failed');
      }

      // Store token and user data (adjust based on your API response)
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data.user));

      showToast('success', 'Login Successful', `Welcome back, ${response.data.user.name || 'Admin'}!`);
      
      // Redirect to dashboard
      navigate('/dashboard');
      
    } catch (error) {
      let errorMessage = 'An error occurred during login';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        errorMessage = error.response.data.message || error.response.statusText;
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server';
      } else {
        // Something happened in setting up the request
        errorMessage = error.message;
      }
      
      showToast('error', 'Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin(e);
    }
  };

  // Styled components with responsive values
  const AdminLoginContainer = styled(Box)({
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  });

  const GradientBackground = styled(Box)({
    background: 'linear-gradient(to bottom, #F8F3D9, #EBE5C2)',
    position: 'relative',
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: getResponsiveValue('1rem', '1.5rem', '2rem'),
  });

  // ... (keep all your existing styled components)

  return (
    <AdminLoginContainer>
      <GradientBackground>
        {/* Decorative Background Elements */}
        <Box sx={{
          position: 'absolute',
          borderRadius: '50%',
          backgroundColor: 'rgba(185, 178, 138, 0.1)',
          width: getResponsiveValue('120px', '140px', '150px'),
          height: getResponsiveValue('120px', '140px', '150px'),
          top: getResponsiveValue('-40px', '-45px', '-50px'),
          right: getResponsiveValue('-40px', '-45px', '-50px'),
        }} />
        
        {/* ... (other decorative circles) */}

        <Box sx={{
          width: '100%',
          maxWidth: getResponsiveValue('90%', '400px', '500px'),
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          {/* Header Section */}
          <Box sx={{ textAlign: 'center', marginBottom: getResponsiveValue('1.5rem', '1.75rem', '2rem'), width: '100%' }}>
            {/* Logo and title */}
          </Box>
          
          {/* Form Card */}
          <Box sx={{
            backgroundColor: '#FFFFFF',
            borderTopLeftRadius: getResponsiveValue('25px', '30px', '35px'),
            borderTopRightRadius: getResponsiveValue('25px', '30px', '35px'),
            padding: getResponsiveValue('1.5rem', '1.75rem', '2rem'),
            width: '100%',
            boxShadow: '0 -5px 15px rgba(80, 75, 56, 0.1)',
          }} component="form" onSubmit={handleLogin}>
            
            {/* Form inputs */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: focusedInput === 'email' ? '#FFFFFF' : '#F8F3D9',
              borderRadius: '18px',
              marginBottom: '1rem',
              padding: '4px',
              border: `2px solid ${focusedInput === 'email' ? '#B9B28A' : 'transparent'}`,
              boxShadow: focusedInput === 'email' ? '0 3px 8px rgba(80, 75, 56, 0.15)' : '0 3px 8px rgba(80, 75, 56, 0.08)',
              transition: 'all 0.3s ease',
            }}>
              <Box sx={{
                width: getResponsiveValue('40px', '42px', '45px'),
                height: getResponsiveValue('40px', '42px', '45px'),
                borderRadius: '14px',
                backgroundColor: '#EBE5C2',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: getResponsiveValue('10px', '12px', '15px'),
              }}>
                <EmailIcon sx={{ 
                  color: '#504B38',
                  fontSize: getResponsiveValue('18px', '20px', '20px')
                }} />
              </Box>
              <TextField
                fullWidth
                type="email"
                placeholder="Enter admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                onKeyPress={handleKeyPress}
                required
                variant="standard"
                InputProps={{
                  disableUnderline: true,
                  style: {
                    color: '#504B38',
                    fontWeight: 400,
                    fontSize: getResponsiveValue('0.9375rem', '1rem', '1rem'),
                  },
                }}
                sx={{
                  '& .MuiInputBase-input': {
                    height: getResponsiveValue('40px', '42px', '45px'),
                    padding: 0,
                  },
                }}
              />
            </Box>

            {/* Password input */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: focusedInput === 'password' ? '#FFFFFF' : '#F8F3D9',
              borderRadius: '18px',
              marginBottom: '1rem',
              padding: '4px',
              border: `2px solid ${focusedInput === 'password' ? '#B9B28A' : 'transparent'}`,
              boxShadow: focusedInput === 'password' ? '0 3px 8px rgba(80, 75, 56, 0.15)' : '0 3px 8px rgba(80, 75, 56, 0.08)',
              transition: 'all 0.3s ease',
            }}>
              <Box sx={{
                width: getResponsiveValue('40px', '42px', '45px'),
                height: getResponsiveValue('40px', '42px', '45px'),
                borderRadius: '14px',
                backgroundColor: '#EBE5C2',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: getResponsiveValue('10px', '12px', '15px'),
              }}>
                <LockIcon sx={{ 
                  color: '#504B38',
                  fontSize: getResponsiveValue('18px', '20px', '20px')
                }} />
              </Box>
              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                onKeyPress={handleKeyPress}
                required
                variant="standard"
                InputProps={{
                  disableUnderline: true,
                  style: {
                    color: '#504B38',
                    fontWeight: 400,
                    fontSize: getResponsiveValue('0.9375rem', '1rem', '1rem'),
                  },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: '#504B38' }}
                      >
                        {showPassword ? 
                          <VisibilityOffIcon fontSize={getResponsiveValue('small', 'small', 'medium')} /> : 
                          <VisibilityIcon fontSize={getResponsiveValue('small', 'small', 'medium')} />
                        }
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiInputBase-input': {
                    height: getResponsiveValue('40px', '42px', '45px'),
                    padding: 0,
                  },
                }}
              />
            </Box>

            {/* Login button */}
            <Button
              type="submit"
              disabled={loading}
              sx={{
                borderRadius: '18px',
                overflow: 'hidden',
                marginBottom: '1.5rem',
                width: '100%',
                boxShadow: '0 8px 12px rgba(80, 75, 56, 0.25)',
                background: 'linear-gradient(to right, #504B38, #B9B28A)',
                color: '#F8F3D9',
                fontSize: getResponsiveValue('1rem', '1.0625rem', '1.125rem'),
                fontWeight: 600,
                height: getResponsiveValue('50px', '54px', '58px'),
                '&:hover': {
                  opacity: 0.9,
                  background: 'linear-gradient(to right, #504B38, #B9B28A)',
                },
                '&:disabled': {
                  opacity: 0.7,
                },
              }}
            >
              {loading ? (
                <Box sx={{
                  border: '2px solid rgba(248, 243, 217, 0.3)',
                  borderTop: '2px solid #F8F3D9',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  animation: `${spin} 1s linear infinite`,
                }} />
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <span>Access Dashboard</span>
                  <Box sx={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(248, 243, 217, 0.2)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginLeft: '10px',
                  }}>
                    <ArrowForwardIcon sx={{ 
                      fontSize: getResponsiveValue('18px', '20px', '20px'),
                      color: '#F8F3D9'
                    }} />
                  </Box>
                </Box>
              )}
            </Button>

            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#B9B28A',
              fontSize: getResponsiveValue('0.75rem', '0.8125rem', '0.875rem'),
              marginTop: '1rem',
            }}>
              <ShieldIcon sx={{ 
                fontSize: getResponsiveValue('0.875rem', '0.9375rem', '1rem'),
                marginRight: '8px'
              }} />
              <span>This portal is for authorized personnel only</span>
            </Box>
          </Box>
        </Box>
      </GradientBackground>
    </AdminLoginContainer>
  );
};

export default AdminLogin;