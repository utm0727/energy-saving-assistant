import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
  Tooltip,
} from '@mui/material';
import { CloudUpload as UploadIcon, DateRange, Speed, Notifications as NotificationsIcon } from '@mui/icons-material';
import api from '../services/api';

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a file first.' });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.uploadDataset(formData);
      setMessage({ type: 'success', text: 'File uploaded successfully!' });
      setFile(null);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to upload file.' });
    }
  };

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 4, 
        borderRadius: 2,
        bgcolor: 'white',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
      }}
    >
      <Typography 
        variant="h5" 
        gutterBottom
        sx={{ 
          color: '#1976d2',
          fontWeight: 600,
          mb: 3
        }}
      >
        Upload Electricity Usage Data
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 3,
        p: 2,
        bgcolor: 'rgba(25, 118, 210, 0.04)',
        borderRadius: 2,
      }}>
        <NotificationsIcon sx={{ color: '#1976d2', mr: 2 }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ color: '#1976d2', fontWeight: 500, mb: 0.5 }}>
            Electricity Tariff Notifications
          </Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>
            Get notified when your usage approaches the next tariff tier:
          </Typography>
          <List dense sx={{ mt: 1, pl: 2 }}>
            <ListItem sx={{ py: 0 }}>
              <Typography variant="body2" sx={{ color: '#666' }}>
                • 1-200 kWh: 21.80 sen/kWh
              </Typography>
            </ListItem>
            <ListItem sx={{ py: 0 }}>
              <Typography variant="body2" sx={{ color: '#666' }}>
                • 201-300 kWh: 33.40 sen/kWh
              </Typography>
            </ListItem>
            <ListItem sx={{ py: 0 }}>
              <Typography variant="body2" sx={{ color: '#666' }}>
                • 301-600 kWh: 51.60 sen/kWh
              </Typography>
            </ListItem>
            <ListItem sx={{ py: 0 }}>
              <Typography variant="body2" sx={{ color: '#666' }}>
                • 601-900 kWh: 54.60 sen/kWh
              </Typography>
            </ListItem>
            <ListItem sx={{ py: 0 }}>
              <Typography variant="body2" sx={{ color: '#666' }}>
                • 901+ kWh: 57.10 sen/kWh
              </Typography>
            </ListItem>
          </List>
        </Box>
        <Tooltip title="Enable notifications when approaching next tariff tier">
          <FormControlLabel
            control={
              <Switch
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                color="primary"
              />
            }
            label=""
          />
        </Tooltip>
      </Box>

      <Typography 
        variant="body1" 
        sx={{ 
          color: '#666',
          mb: 2 
        }}
      >
        Please upload a CSV file containing electricity usage data.
      </Typography>

      <Typography 
        variant="subtitle1" 
        sx={{ 
          color: '#333',
          fontWeight: 500,
          mb: 2
        }}
      >
        Required columns:
      </Typography>

      <List sx={{ mb: 3 }}>
        <ListItem sx={{ pl: 0 }}>
          <ListItemIcon sx={{ minWidth: 36 }}>
            <DateRange sx={{ color: '#1976d2' }} />
          </ListItemIcon>
          <ListItemText 
            primary="Date (date column)"
            sx={{ '& .MuiTypography-root': { color: '#555' } }}
          />
        </ListItem>
        <ListItem sx={{ pl: 0 }}>
          <ListItemIcon sx={{ minWidth: 36 }}>
            <Speed sx={{ color: '#1976d2' }} />
          </ListItemIcon>
          <ListItemText 
            primary="Usage (consumption value)"
            sx={{ '& .MuiTypography-root': { color: '#555' } }}
          />
        </ListItem>
      </List>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          component="label"
          variant="outlined"
          startIcon={<UploadIcon />}
          sx={{
            borderColor: '#1976d2',
            color: '#1976d2',
            '&:hover': {
              borderColor: '#1565c0',
              bgcolor: 'rgba(25, 118, 210, 0.04)',
            },
          }}
        >
          CHOOSE FILE
          <input
            type="file"
            hidden
            accept=".csv"
            onChange={handleFileChange}
          />
        </Button>

        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!file}
          sx={{
            bgcolor: '#1976d2',
            '&:hover': {
              bgcolor: '#1565c0',
            },
            '&.Mui-disabled': {
              bgcolor: 'rgba(25, 118, 210, 0.12)',
              color: 'rgba(0, 0, 0, 0.26)',
            },
          }}
        >
          UPLOAD
        </Button>
      </Box>

      {file && (
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#666',
            mb: 2
          }}
        >
          Selected file: {file.name}
        </Typography>
      )}

      {message && (
        <Alert 
          severity={message.type}
          sx={{ 
            mt: 2,
            '&.MuiAlert-standardSuccess': {
              bgcolor: 'rgba(46, 125, 50, 0.08)',
            },
            '&.MuiAlert-standardError': {
              bgcolor: 'rgba(211, 47, 47, 0.08)',
            },
          }}
        >
          {message.text}
        </Alert>
      )}
    </Paper>
  );
} 