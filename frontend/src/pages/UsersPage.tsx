import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SecurityIcon from '@mui/icons-material/Security';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '../contexts/UserContext';
import { User, UserInput, UserRole } from '../types/User';
import { convertToUserManagerFormat } from '../utils/userUtils';

const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const { users, addUser, updateUser, deleteUser } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserInput>({
    email: '',
    full_name: '',
    role: 'collector',
    is_active: true
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab =
      activeTab === 0 || // All users
      (activeTab === 1 && user.is_active) || // Active users
      (activeTab === 2 && !user.is_active); // Inactive users

    return matchesSearch && matchesTab;
  });

  const handleAddUser = async () => {
    try {
      await addUser(formData);
      setOpenAddDialog(false);
      setFormData({
        email: '',
        full_name: '',
        role: 'collector',
        is_active: true
      });
    } catch (error) {
      console.error('Failed to add user:', error);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;
    try {
      await updateUser(selectedUser.id, formData);
      setOpenEditDialog(false);
      setSelectedUser(null);
      setFormData({
        email: '',
        full_name: '',
        role: 'collector',
        is_active: true
      });
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleDeleteUser = async (user: User) => {
    try {
      await deleteUser(user.id);
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle role selection
  const handleRoleChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setFormData(prev => ({
      ...prev,
      role: e.target.value as UserRole
    }));
  };

  // Open edit dialog
  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      is_active: user.is_active,
      password: ''
    });
    setOpenEditDialog(true);
  };

  // Open delete dialog
  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };

  // Get role color
  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'error';
      case 'supervisor': return 'warning';
      case 'collector': return 'info';
      case 'seller': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Users</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenAddDialog(true)}
        >
          Add User
        </Button>
      </Box>

      <Paper sx={{ mb: 2 }}>
        <Box p={2}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="All Users" />
          <Tab label="Active" />
          <Tab label="Inactive" />
        </Tabs>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.full_name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={user.role}
                    color={getRoleColor(user.role)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.is_active ? 'Active' : 'Inactive'}
                    color={user.is_active ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEditClick(user)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteClick(user)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add User Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            value={formData.email}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="full_name"
            label="Full Name"
            fullWidth
            value={formData.full_name}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="password"
            label="Password"
            type="password"
            fullWidth
            value={formData.password}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="role"
            label="Role"
            select
            fullWidth
            value={formData.role}
            onChange={handleRoleChange}
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="supervisor">Supervisor</MenuItem>
            <MenuItem value="collector">Collector</MenuItem>
            <MenuItem value="seller">Seller</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button onClick={handleAddUser} color="primary">Add</Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            value={formData.email}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="full_name"
            label="Full Name"
            fullWidth
            value={formData.full_name}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="password"
            label="New Password (leave blank to keep current)"
            type="password"
            fullWidth
            value={formData.password}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="role"
            label="Role"
            select
            fullWidth
            value={formData.role}
            onChange={handleRoleChange}
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="supervisor">Supervisor</MenuItem>
            <MenuItem value="collector">Collector</MenuItem>
            <MenuItem value="seller">Seller</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleEditUser} color="primary">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedUser?.full_name}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={() => handleDeleteUser(selectedUser!)} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersPage;
