import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import AuthService from '../services/AuthService';
import { PasswordResetRequest } from '../types/User';

const PasswordResetRequestForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await AuthService.requestPasswordReset({ email });
      setSuccess(true);
      setEmail('');
    } catch (error) {
      setError('Failed to send password reset request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 400, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Reset Password
      </Typography>

      <Typography variant="body1" color="text.secondary" paragraph>
        Enter your email address and we'll send you a link to reset your password.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Password reset instructions have been sent to your email.
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Send Reset Link'}
        </Button>
      </Box>
    </Paper>
  );
};

export default PasswordResetRequestForm;