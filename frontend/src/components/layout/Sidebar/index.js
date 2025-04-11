import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Box,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Description as DocumentIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  AccountBalance as AccountBalanceIcon,
  BarChart as StatsIcon,
  Search as SearchIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { hasRole } from '../../../utils/helpers';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarOpen } = useSelector((state) => state.ui);
  const { user } = useSelector((state) => state.auth);
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  const adminMenuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/admin',
      show: hasRole(user, 'admin'),
    },
    {
      text: 'Users',
      icon: <PeopleIcon />,
      path: '/admin/users',
      show: hasRole(user, 'admin'),
    },
    {
        text: 'Statistics',
        icon: <StatsIcon />,
        path: '/admin/stats',
        show: hasRole(user, 'admin'),
      },
    ];
    
    const caMenuItems = [
      {
        text: 'Dashboard',
        icon: <DashboardIcon />,
        path: '/ca',
        show: hasRole(user, 'ca'),
      },
      {
        text: 'Clients',
        icon: <PersonIcon />,
        path: '/ca/clients',
        show: hasRole(user, 'ca'),
      },
      {
        text: 'Bank Statement',
        icon: <AccountBalanceIcon />,
        path: '/workspace/bank-statement',
        show: true,
      },
      {
        text: 'Documents',
        icon: <DocumentIcon />,
        path: '/ca/documents',
        show: hasRole(user, 'ca'),
      },
    ];
    
    const commonMenuItems = [
      {
        text: 'Quick Analysis',
        icon: <SearchIcon />,
        path: '/workspace/quick-analysis',
        show: true,
      },
      {
        text: 'Settings',
        icon: <SettingsIcon />,
        path: '/settings',
        show: true,
      },
    ];
    
    const renderMenuItems = (items) => {
      return items
        .filter((item) => item.show)
        .map((item) => (
          <ListItem key={item.text} disablePadding>
            <Tooltip title={!sidebarOpen ? item.text : ''} placement="right">
              <ListItemButton
                selected={isActive(item.path)}
                onClick={() => navigate(item.path)}
                sx={{
                  minHeight: 48,
                  justifyContent: sidebarOpen ? 'initial' : 'center',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: sidebarOpen ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {sidebarOpen && <ListItemText primary={item.text} />}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ));
    };
    
    return (
      <Drawer
        variant="permanent"
        sx={{
          width: sidebarOpen ? 240 : 72,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: sidebarOpen ? 240 : 72,
            boxSizing: 'border-box',
            transition: (theme) =>
              theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            overflowX: 'hidden',
            mt: '64px',
          },
        }}
      >
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {hasRole(user, 'admin') && renderMenuItems(adminMenuItems)}
            {hasRole(user, 'ca') && renderMenuItems(caMenuItems)}
          </List>
          <Divider />
          <List>{renderMenuItems(commonMenuItems)}</List>
        </Box>
      </Drawer>
    );
  };
  
  export default Sidebar;