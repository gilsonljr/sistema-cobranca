import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Link,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user types
    if (error) setError('');
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await AuthService.login({
        email: formData.email,
        password: formData.password
      });

      setSuccessMessage('Login successful! Redirecting...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      // In a real app, this would send a password reset email
      setSuccessMessage('If the email exists, you will receive instructions to reset your password.');
      setShowForgotPassword(false);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError('Error processing request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    setFormData({
      email: 'admin@admin.com',
      password: 'admin123'
    });
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: '12px' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Billing System
          </Typography>

          {!showForgotPassword ? (
            <>
              <Alert severity="info" sx={{ mb: 3 }}>
                Use admin credentials:
                <Box sx={{ mt: 1 }}>
                  <strong>Email:</strong> admin@admin.com
                  <br />
                  <strong>Password:</strong> admin123
                  <br />
                  <Link
                    component="button"
                    variant="body2"
                    onClick={fillAdminCredentials}
                    sx={{ mt: 1 }}
                  >
                    Fill automatically
                  </Link>
                </Box>
              </Alert>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {successMessage && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {successMessage}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={formData.email}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Login'}
                </Button>

                <Box sx={{ textAlign: 'center' }}>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Forgot your password?
                  </Link>
                </Box>
              </Box>
            </>
          ) : (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Reset Password
              </Typography>
              <TextField
                margin="normal"
                required
                fullWidth
                id="reset-email"
                label="Email"
                name="reset-email"
                autoComplete="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setShowForgotPassword(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleForgotPassword}
                  disabled={loading || !resetEmail}
                >
                  {loading ? <CircularProgress size={24} /> : 'Send'}
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;