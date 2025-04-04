import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import DataTable from '../../../components/common/Table/DataTable';
import SearchInput from '../../../components/common/Input/SearchInput';
import FormDialog from '../../../components/common/Modal/FormDialog';
import ConfirmDialog from '../../../components/common/Modal/ConfirmDialog';
import TextField from '../../../components/common/Input/TextField';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../../../services/api';
import { formatDate } from '../../../utils/formatters';

const userSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  role: Yup.string().required('Role is required'),
  password: Yup.string().when('isEditing', {
    is: false,
    then: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .required('Password is required'),
    otherwise: Yup.string(),
  }),
});

const Users = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search: searchQuery,
        },
      });
      setUsers(response.data.users);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };
  
  useEffect(() => {
    fetchUsers();
    
    // For demo purposes, set some sample data
    setUsers([
      { id: 1, username: 'admin', email: 'admin@example.com', role: 'admin', createdAt: '2023-01-15T10:30:00Z', lastLogin: '2023-05-15T08:45:00Z' },
      { id: 2, username: 'john.doe', email: 'john@example.com', role: 'ca', createdAt: '2023-02-20T14:20:00Z', lastLogin: '2023-05-14T16:30:00Z' },
      { id: 3, username: 'jane.smith', email: 'jane@example.com', role: 'ca', createdAt: '2023-03-10T09:15:00Z', lastLogin: '2023-05-15T11:10:00Z' },
    ]);
    setTotalCount(3);
  }, [page, rowsPerPage, searchQuery]);
  
  const handleChangePage = (newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(0);
  };
  
  const handleClearSearch = () => {
    setSearchQuery('');
    setPage(0);
  };
  
  const handleOpenDialog = (user = null) => {
    setSelectedUser(user);
    setOpenDialog(true);
    if (user) {
      formik.setValues({
        username: user.username,
        email: user.email,
        role: user.role,
        password: '',
        isEditing: true,
      });
    } else {
      formik.resetForm();
      formik.setFieldValue('isEditing', false);
    }
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    formik.resetForm();
  };
  
  const handleOpenDeleteDialog = (user) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedUser(null);
  };
  
  const handleDeleteUser = async () => {
    try {
      await api.delete(`/admin/users/${selectedUser.id}`);
      fetchUsers();
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };
  
  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      role: 'ca',
      password: '',
      isEditing: false,
    },
    validationSchema: userSchema,
    onSubmit: async (values) => {
      try {
        if (selectedUser) {
          await api.put(`/admin/users/${selectedUser.id}`, {
            username: values.username,
            email: values.email,
            role: values.role,
            password: values.password || undefined,
          });
        } else {
          await api.post('/admin/users', {
            username: values.username,
            email: values.email,
            role: values.role,
            password: values.password,
          });
        }
        fetchUsers();
        handleCloseDialog();
      } catch (error) {
        console.error('Error saving user:', error);
      }
    },
  });
  
  const columns = [
    { id: 'username', label: 'Username', minWidth: 120 },
    { id: 'email', label: 'Email', minWidth: 180 },
    {
      id: 'role',
      label: 'Role',
      minWidth: 100,
      format: (value) => (
        <Chip
          label={value.toUpperCase()}
          color={value === 'admin' ? 'primary' : 'secondary'}
          size="small"
        />
      ),
    },
    {
      id: 'createdAt',
      label: 'Created At',
      minWidth: 120,
      format: (value) => formatDate(value),
    },
    {
      id: 'lastLogin',
      label: 'Last Login',
      minWidth: 120,
      format: (value) => formatDate(value),
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 100,
      align: 'center',
      format: (_, row) => (
        <Box>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => handleOpenDialog(row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={() => handleOpenDeleteDialog(row)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Users</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add User
        </Button>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <SearchInput
          value={searchQuery}
          onChange={handleSearchChange}
          onClear={handleClearSearch}
          placeholder="Search users..."
          fullWidth
        />
      </Box>
      
      <DataTable
        columns={columns}
        data={users}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        totalCount={totalCount}
        emptyMessage="No users found"
      />
      
      <FormDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onSubmit={formik.handleSubmit}
        title={selectedUser ? 'Edit User' : 'Add User'}
        submitText={selectedUser ? 'Update' : 'Add'}
      >
        <TextField
          name="username"
          label="Username"
          value={formik.values.username}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.username && formik.errors.username}
          fullWidth
          margin="normal"
        />
        <TextField
          name="email"
          label="Email"
          type="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email && formik.errors.email}
          fullWidth
          margin="normal"
        />
        <TextField
          name="role"
          label="Role"
          select
          SelectProps={{ native: true }}
          value={formik.values.role}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.role && formik.errors.role}
          fullWidth
          margin="normal"
        >
          <option value="admin">Admin</option>
          <option value="ca">CA</option>
        </TextField>
        <TextField
          name="password"
          label={selectedUser ? 'Password (leave blank to keep unchanged)' : 'Password'}
          type="password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.password && formik.errors.password}
          fullWidth
          margin="normal"
          required={!selectedUser}
        />
      </FormDialog>
      
      <ConfirmDialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteUser}
        title="Delete User"
        content={`Are you sure you want to delete the user "${selectedUser?.username}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="error"
      />
    </Box>
  );
};

export default Users;