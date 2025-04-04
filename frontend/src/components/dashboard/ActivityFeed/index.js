import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Paper,
  Divider,
} from '@mui/material';
import {
  Description as DocumentIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import { formatDate } from '../../../utils/formatters';

const getActivityIcon = (type) => {
  switch (type) {
    case 'document_upload':
      return <UploadIcon />;
    case 'document_process':
      return <CheckCircleIcon />;
    case 'client_add':
      return <PersonIcon />;
    default:
      return <DocumentIcon />;
  }
};

const getActivityColor = (type) => {
  switch (type) {
    case 'document_upload':
      return 'primary';
    case 'document_process':
      return 'success';
    case 'client_add':
      return 'secondary';
    default:
      return 'info';
  }
};

const ActivityFeed = ({ activities, title }) => {
  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        {title || 'Recent Activity'}
      </Typography>
      
      {activities.length > 0 ? (
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {activities.map((activity, index) => (
            <React.Fragment key={activity.id}>
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: `${getActivityColor(activity.type)}.light` }}>
                    {getActivityIcon(activity.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={activity.description}
                  secondary={
                    <Box component="span" sx={{ display: 'block' }}>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        {activity.user}
                      </Typography>
                      {' — '}
                      {formatDate(activity.timestamp, 'MMM DD, YYYY HH:mm')}
                    </Box>
                  }
                />
              </ListItem>
              {index < activities.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No recent activities
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

ActivityFeed.propTypes = {
  activities: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      type: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      user: PropTypes.string.isRequired,
      timestamp: PropTypes.string.isRequired,
    })
  ).isRequired,
  title: PropTypes.string,
};

export default ActivityFeed;