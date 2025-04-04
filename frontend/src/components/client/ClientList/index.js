import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Paper,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Description as DocumentIcon,
} from '@mui/icons-material';
import PropTypes from 'prop-types';

const ClientList = ({ clients, onView, onEdit, onDelete, onAnalyze }) => {
  if (!clients || clients.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No clients found.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper>
      <List>
        {clients.map((client, index) => (
          <React.Fragment key={client.id}>
            <ListItem alignItems="flex-start">
              <ListItemText
                primary={client.name}
                secondary={
                  <Box>
                    <Typography component="span" variant="body2" color="text.primary">
                      {client.email}
                    </Typography>
                    <br />
                    <Typography component="span" variant="body2" color="text.secondary">
                      {client.phone}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        size="small"
                        icon={<DocumentIcon fontSize="small" />}
                        label={`${client.documentsCount || 0} Documents`}
                      />
                    </Box>
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" aria-label="view" onClick={() => onView(client)} size="small" sx={{ mr: 1 }}>
                  <VisibilityIcon fontSize="small" />
                </IconButton>
                <IconButton edge="end" aria-label="edit" onClick={() => onEdit(client)} size="small" sx={{ mr: 1 }}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton edge="end" aria-label="analyze" onClick={() => onAnalyze(client)} size="small" sx={{ mr: 1 }} color="primary">
                  <DocumentIcon fontSize="small" />
                </IconButton>
                <IconButton edge="end" aria-label="delete" onClick={() => onDelete(client)} size="small" color="error">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
            {index < clients.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

ClientList.propTypes = {
  clients: PropTypes.array.isRequired,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onAnalyze: PropTypes.func.isRequired,
};

export default ClientList;