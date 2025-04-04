import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  Divider,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Edit as EditIcon,
  Description as DescriptionIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import useAuth from '../../hooks/useAuth';
import { formatDate } from '../../utils/formatters';
import { getInitials, stringToColor } from '../../utils/helpers';
import useDocuments from '../../hooks/useDocuments';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user } = useAuth();
  const { documents, getDocuments } = useDocuments();
  const navigate = useNavigate();
  const [recentDocuments, setRecentDocuments] = useState([]);
  
  useEffect(() => {
    getDocuments();
  }, [getDocuments]);
  
  useEffect(() => {
    if (documents) {
      setRecentDocuments(documents.slice(0, 5));
    }
  }, [documents]);
  
  const handleEditProfile = () => {
    navigate('/settings');
  };
  
  const handleViewAllDocuments = () => {
    navigate('/ca/documents');
  };
  
  // Mock user data for demonstration
  const userProfile = {
    ...user,
    firstName: 'John',
    lastName: 'Doe',
    phone: '+91 9876543210',
    company: 'ABC Accounting Services',
    joinDate: '2022-01-15',
    role: 'CA',
    documentsProcessed: 156,
    clientsManaged: 24,
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  mb: 2,
                  bgcolor: stringToColor(userProfile.username),
                  fontSize: '2rem',
                }}
              >
                {getInitials(`${userProfile.firstName} ${userProfile.lastName}`)}
              </Avatar>
              <Typography variant="h5">
                {userProfile.firstName} {userProfile.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {userProfile.role}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                sx={{ mt: 2 }}
                onClick={handleEditProfile}
              >
                Edit Profile
              </Button>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <EmailIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Email"
                  secondary={userProfile.email}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PhoneIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Phone"
                  secondary={userProfile.phone}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <BusinessIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Company"
                  secondary={userProfile.company}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CalendarIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Joined"
                  secondary={formatDate(userProfile.joinDate)}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Documents Processed
                  </Typography>
                  <Typography variant="h3" color="primary">
                    {userProfile.documentsProcessed}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Clients Managed
                  </Typography>
                  <Typography variant="h3" color="secondary">
                    {userProfile.clientsManaged}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Recent Documents
                  </Typography>
                  <Button
                    variant="text"
                    onClick={handleViewAllDocuments}
                  >
                    View All
                  </Button>
                </Box>
                
                <List>
                  {recentDocuments.length > 0 ? (
                    recentDocuments.map((doc) => (
                      <ListItem
                        key={doc.id}
                        button
                        onClick={() => navigate(`/workspace/quick-analysis?documentId=${doc.id}`)}
                        divider
                      >
                        <ListItemIcon>
                          <DescriptionIcon color={doc.status === 'completed' ? 'success' : 'action'} />
                        </ListItemIcon>
                        <ListItemText
                          primary={doc.title}
                          secondary={`Status: ${doc.status} | Uploaded: ${formatDate(doc.createdAt)}`}
                        />
                      </ListItem>
                    ))
                  ) : (
                    <ListItem>
                      <ListItemText
                        primary="No recent documents"
                        secondary="Upload and process documents to see them here"
                      />
                    </ListItem>
                  )}
                </List>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Account Activity
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Last Login"
                      secondary={formatDate(new Date(), 'MMM DD, YYYY HH:mm')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <DescriptionIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Last Document Processed"
                      secondary="Financial Statement - ABC Corp (2 days ago)"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Last Client Added"
                      secondary="XYZ Industries (1 week ago)"
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;