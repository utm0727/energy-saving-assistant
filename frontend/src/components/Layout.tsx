import React, { useEffect } from 'react';
import { Outlet, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  CloudUpload as UploadIcon,
  Analytics as AnalyticsIcon,
  WbSunny as WeatherIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';

const drawerWidth = 280;

export default function Layout() {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Layout mounted');
    const token = localStorage.getItem('token');
    console.log('Current token:', token);
  }, []);

  const handleLogout = () => {
    console.log('Logging out...');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Upload Data', icon: <UploadIcon />, path: '/upload' },
    { text: 'Analysis', icon: <AnalyticsIcon />, path: '/analysis' },
    { text: 'Weather', icon: <WeatherIcon />, path: '/weather' },
  ];

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: 'white',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar>
          <Typography 
            variant="h5" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              color: '#1976d2',
              fontWeight: 600,
              letterSpacing: '0.5px'
            }}
          >
            Energy Saving Assistant
          </Typography>
          <IconButton 
            color="primary" 
            onClick={handleLogout}
            sx={{ 
              '&:hover': { 
                bgcolor: 'rgba(25, 118, 210, 0.08)',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.2s'
            }}
          >
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: 'white',
            boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
            border: 'none'
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', p: 2 }}>
          <List>
            {menuItems.map((item, index) => (
              <ListItem 
                key={item.text} 
                component={RouterLink} 
                to={item.path}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  '&:hover': {
                    bgcolor: 'rgba(25, 118, 210, 0.08)',
                    transform: 'translateX(5px)',
                  },
                  '&.active': {
                    bgcolor: 'rgba(25, 118, 210, 0.15)',
                  },
                  transition: 'all 0.2s'
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: '#1976d2',
                    minWidth: 45
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{ 
                    '& .MuiTypography-root': { 
                      fontWeight: 500,
                      color: '#333'
                    }
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 4,
          bgcolor: '#f5f5f5',
          minHeight: '100vh'
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
} 