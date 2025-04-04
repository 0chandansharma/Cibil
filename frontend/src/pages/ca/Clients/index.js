import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Description as DocumentIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../../components/common/Table/DataTable';
import SearchInput from '../../../components/common/Input/SearchInput';
import FormDialog from '../../../components/common/Modal/FormDialog';
import ConfirmDialog from '../../../components/common/Modal/ConfirmDialog';
import TextField from '../../../components/common/Input/TextField';
import { useFormik } from 'formik';
import useClients from '../../../hooks/useClients';
import { clientSchema } from '../../../utils/validators';

const Clients = () => {
  const navigate = useNavigate();
  const {
    clients,
    getClients,
    createClient,
    updateClient,
    deleteClient,
    error,
  } = useClients();
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [filteredClients, setFilteredClients] = useState([]);
  
  useEffect(() => {
    getClients();
  }, [getClients]);
  
  useEffect(() => {
    if (clients) {
      const filtered = clients.filter((client) =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredClients(filtered);
    }
  }, [clients, searchQuery]);
  
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
  
  const handleOpenDialog = (client = null) => {
    setSelectedClient(client);
    setOpenDialog(true);
    if (client) {
      formik.setValues({
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address || '',
      });
    } else {
      formik.resetForm();
    }
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedClient(null);
    formik.resetForm();
  };
  
  const handleOpenDeleteDialog = (client) => {
    setSelectedClient(client);
    setOpenDeleteDialog(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedClient(null);
  };
  
  const handleDeleteClient = async () => {
    await deleteClient(selectedClient.id);
    handleCloseDeleteDialog();
  };
  
  const handleClientAnalysis = (clientId) => {
    navigate(`/workspace/client-analysis/${clientId}`);
  };
  
  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
    },
    validationSchema: clientSchema,
    onSubmit: async (values) => {
      try {
        if (selectedClient) {
          await updateClient(selectedClient.id, values);
        } else {
          await createClient(values);
        }
        handleCloseDialog();
      } catch (error) {
        console.error('Error saving client:', error);
      }
    },
  });
  
  const columns = [
    { id: 'name', label: 'Name', minWidth: 180 },
    { id: 'email', label: 'Email', minWidth: 180 },
    { id: 'phone', label: 'Phone', minWidth: 120 },
    { id: 'documentsCount', label: 'Documents', minWidth: 100 },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 180,
      align: 'center',
      format: (_, row) => (
        <Box>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => handleOpenDialog(row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="View Documents">
            <IconButton size="small" onClick={() => navigate(`/ca/clients/${row.id}/documents`)}>
              <DocumentIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Analyze">
            <IconButton size="small" color="primary" onClick={() => handleClientAnalysis(row.id)}>
              <DocumentIcon fontSize="small" />
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
  
  const paginatedClients = filteredClients.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Clients</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Client
        </Button>
      </Box>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <SearchInput
          value={searchQuery}
          onChange={handleSearchChange}
          onClear={handleClearSearch}
          placeholder="Search clients..."
          fullWidth
        />
      </Paper>
      
      <DataTable
        columns={columns}
        data={paginatedClients}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        totalCount={filteredClients.length}
        emptyMessage="No clients found"
      />
      
      <FormDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onSubmit={formik.handleSubmit}
        title={selectedClient ? 'Edit Client' : 'Add Client'}
        submitText={selectedClient ? 'Update' : 'Add'}
      >
        <TextField
          name="name"
          label="Client Name"
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.name && formik.errors.name}
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
          name="phone"
          label="Phone"
          value={formik.values.phone}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.phone && formik.errors.phone}
          fullWidth
          margin="normal"
        />
        <TextField
          name="address"
          label="Address"
          multiline
          rows={3}
          value={formik.values.address}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.address && formik.errors.address}
          fullWidth
          margin="normal"
        />
      </FormDialog>
      
      <ConfirmDialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteClient}
        title="Delete Client"
        content={`Are you sure you want to delete the client "${selectedClient?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="error"
      />
    </Box>
  );
};

export default Clients;