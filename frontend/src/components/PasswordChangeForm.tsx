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
import { useUsers } from '../contexts/UserContext';
import { PasswordChange } from '../types/User';
import { validatePassword, PasswordError } from '../utils/passwordUtils';
import AuthService from '../services/AuthService';

const PasswordChangeForm: React.FC = () => {
  const { currentUser, error } = useUsers();
  const [formData, setFormData] = useState<PasswordChange>({
    current_password: '',
    new_password: '',
  });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user types
    if (formError) setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);
    setSuccess(false);

    try {
      // Validate new password
      validatePassword(formData.new_password);

      // Check if new password is different from current
      if (formData.current_password === formData.new_password) {
        throw new PasswordError('New password must be different from current password');
      }

      // Call AuthService to change password
      await AuthService.changePassword(formData);

      setSuccess(true);
      setFormData({
        current_password: '',
        new_password: '',
      });
    } catch (error) {
      if (error instanceof PasswordError) {
        setFormError(error.message);
      } else {
        setFormError('Failed to change password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <Alert severity="warning">
        You must be logged in to change your password.
      </Alert>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 400, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Change Password
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {formError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {formError}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Password changed successfully!
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          margin="normal"
          required
          fullWidth
          name="current_password"
          label="Current Password"
          type="password"
          value={formData.current_password}
          onChange={handleChange}
          disabled={loading}
        />

        <TextField
          margin="normal"
          required
          fullWidth
          name="new_password"
          label="New Password"
          type="password"
          value={formData.new_password}
          onChange={handleChange}
          disabled={loading}
          helperText="Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters"
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Change Password'}
        </Button>
      </Box>
    </Paper>
  );
};

export default PasswordChangeForm;