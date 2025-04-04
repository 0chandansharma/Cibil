import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Paper,
  Chip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../../components/common/Table/DataTable';
import SearchInput from '../../../components/common/Input/SearchInput';
import ConfirmDialog from '../../../components/common/Modal/ConfirmDialog';
import useDocuments from '../../../hooks/useDocuments';
import { formatDate } from '../../../utils/formatters';

const Documents = () => {
  const navigate = useNavigate();
  const {
    documents,
    getDocuments,
    deleteDocument,
    processDocument,
    error,
  } = useDocuments();
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  
  useEffect(() => {
    getDocuments();
  }, [getDocuments]);
  
  useEffect(() => {
    if (documents) {
      const filtered = documents.filter((document) =>
        document.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (document.clientName && document.clientName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredDocuments(filtered);
    }
  }, [documents, searchQuery]);
  
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
  
  const handleOpenDeleteDialog = (document) => {
    setSelectedDocument(document);
    setOpenDeleteDialog(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedDocument(null);
  };
  
  const handleDeleteDocument = async () => {
    await deleteDocument(selectedDocument.id);
    handleCloseDeleteDialog();
  };
  
  const handleProcessDocument = async (documentId) => {
    await processDocument(documentId);
  };
  
  const handleViewDocument = (documentId) => {
    navigate(`/workspace/quick-analysis?documentId=${documentId}`);
  };
  
  const columns = [
    { id: 'title', label: 'Title', minWidth: 180 },
    {
      id: 'clientName',
      label: 'Client',
      minWidth: 150,
      format: (value) => value || 'N/A',
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      format: (value) => (
        <Chip
          label={value}
          color={
            value === 'completed'
              ? 'success'
              : value === 'processing'
              ? 'info'
              : value === 'failed'
              ? 'error'
              : 'default'
          }
          size="small"
          sx={{ textTransform: 'capitalize' }}
        />
      ),
    },
    {
      id: 'createdAt',
      label: 'Uploaded',
      minWidth: 120,
      format: (value) => formatDate(value),
    },
    {
      id: 'processedAt',
      label: 'Processed',
      minWidth: 120,
      format: (value) => (value ? formatDate(value) : 'Not processed'),
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 150,
      align: 'center',
      format: (_, row) => (
        <Box>
          <Tooltip title="View">
            <IconButton size="small" onClick={() => handleViewDocument(row.id)}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {row.status !== 'completed' && row.status !== 'processing' && (
            <Tooltip title="Process">
              <IconButton size="small" color="primary" onClick={() => handleProcessDocument(row.id)}>
                <PlayArrowIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Delete">
            <IconButton size="small" onClick={() => handleOpenDeleteDialog(row)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];
  
  const paginatedDocuments = filteredDocuments.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Documents</Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/workspace/quick-analysis')}
        >
          Upload New Document
        </Button>
      </Box>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <SearchInput
          value={searchQuery}
          onChange={handleSearchChange}
          onClear={handleClearSearch}
          placeholder="Search documents..."
          fullWidth
        />
      </Paper>
      
      <DataTable
        columns={columns}
        data={paginatedDocuments}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        totalCount={filteredDocuments.length}
        emptyMessage="No documents found"
      />
      
      <ConfirmDialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteDocument}
        title="Delete Document"
        content={`Are you sure you want to delete the document "${selectedDocument?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="error"
      />
    </Box>
  );
};

export default Documents;