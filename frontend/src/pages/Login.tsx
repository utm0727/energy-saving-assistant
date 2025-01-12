import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box,
  Tab,
  Tabs,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const [tab, setTab] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: ''
  });
  const [tnbData, setTnbData] = useState({
    accountNumber: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      if (tab === 0) { // Regular login
        const response = await api.login(formData.username, formData.password);
        console.log('Login response:', response);
        const token = response.data.access_token;
        console.log('Received token:', token);
        localStorage.setItem('token', token);
        navigate('/');
      } else if (tab === 1) { // TNB login
        setError('TNB登录功能暂未开放。请使用普通账号登录。');
      } else { // Register
        await api.register(formData);
        setSuccess('注册成功！请使用新账号登录。');
        setTab(0);
        setFormData({
          email: '',
          username: '',
          password: ''
        });
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      setError(error.response?.data?.detail || '操作失败，请重试');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Energy Saving Assistant
          </Typography>
          <Tabs value={tab} onChange={(e, v) => setTab(v)} centered>
            <Tab label="Login" />
            <Tab label="TNB Account" />
            <Tab label="Register" />
          </Tabs>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {success}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            {tab === 0 && (
              <>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Username"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </>
            )}
            {tab === 1 && (
              <>
                <TextField
                  fullWidth
                  margin="normal"
                  label="TNB Account Number"
                  value={tnbData.accountNumber}
                  onChange={(e) => setTnbData({...tnbData, accountNumber: e.target.value})}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="TNB Password"
                  type="password"
                  value={tnbData.password}
                  onChange={(e) => setTnbData({...tnbData, password: e.target.value})}
                />
              </>
            )}
            {tab === 2 && (
              <>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Username"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </>
            )}
            <Button
              fullWidth
              variant="contained"
              type="submit"
              sx={{ mt: 3 }}
            >
              {tab === 0 ? 'Login' : tab === 1 ? 'Login with TNB' : 'Register'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
} 