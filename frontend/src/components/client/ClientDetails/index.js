import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Button,
  Chip,
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import PropTypes from 'prop-types';

const ClientDetails = ({ client, onEdit, onDelete }) => {
  if (!client) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No client selected.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Typography variant="h5" component="h2">
          {client.name}
        </Typography>
        <Box>
          <Button
            startIcon={<EditIcon />}
            onClick={() => onEdit(client)}
            sx={{ mr: 1 }}
            size="small"
          >
            Edit
          </Button>
          <Button
            startIcon={<DeleteIcon />}
            onClick={() => onDelete(client)}
            color="error"
            size="small"
          >
            Delete
          </Button>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <EmailIcon color="action" sx={{ mr: 1 }} />
            <Typography variant="body1">{client.email}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PhoneIcon color="action" sx={{ mr: 1 }} />
            <Typography variant="body1">{client.phone}</Typography>
          </Box>
          {client.address && (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <LocationIcon color="action" sx={{ mr: 1, mt: 0.3 }} />
              <Typography variant="body1">{client.address}</Typography>
            </Box>
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>
            Statistics
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip label={`${client.documentsCount || 0} Documents`} />
            <Chip label={`${client.processedDocuments || 0} Processed`} color="primary" />
            <Chip label={`Last Activity: ${client.lastActivity || 'Never'}`} variant="outlined" />
          </Box>
        </Grid>
      </Grid>

      {client.notes && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>
            Notes
          </Typography>
          <Typography variant="body2">{client.notes}</Typography>
        </>
      )}
    </Paper>
  );
};

ClientDetails.propTypes = {
  client: PropTypes.object,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default ClientDetails;