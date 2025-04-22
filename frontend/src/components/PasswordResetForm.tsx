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
import { PasswordResetConfirm } from '../types/User';
import { useParams } from 'react-router-dom';

const PasswordResetForm: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      if (!token) {
        throw new Error('Invalid reset token');
      }

      await AuthService.resetPassword({
        token,
        new_password: password
      });
      setSuccess(true);
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Alert severity="error">
        Invalid password reset link. Please request a new password reset.
      </Alert>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 400, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Set New Password
      </Typography>

      <Typography variant="body1" color="text.secondary" paragraph>
        Please enter your new password below.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Your password has been reset successfully. You can now log in with your new password.
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="New Password"
          type="password"
          id="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />

        <TextField
          margin="normal"
          required
          fullWidth
          name="confirmPassword"
          label="Confirm New Password"
          type="password"
          id="confirmPassword"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Reset Password'}
        </Button>
      </Box>
    </Paper>
  );
};

export default PasswordResetForm;