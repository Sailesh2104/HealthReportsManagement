import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Link,
  Divider,
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    userType: 'patient',
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userType', formData.userType);
      navigate(`/${formData.userType}/dashboard`);
    } catch (error) {
      console.error('Login error:', error);
      alert(error.response?.data?.error || 'Login failed. Please check your credentials.');
    }
  };

  const handleRegisterClick = (e) => {
    e.preventDefault();
    navigate('/register');
  };

  return (
    <Container maxWidth="sm">
      <Box 
        sx={{ 
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4,
            width: '100%',
            maxWidth: 400,
            borderRadius: 2,
            background: 'linear-gradient(to bottom right, #ffffff, #f5f5f5)',
          }}
        >
          <Typography 
            variant="h4" 
            align="center" 
            gutterBottom
            sx={{ 
              color: '#1976d2',
              fontWeight: 'bold',
              mb: 3,
            }}
          >
            Welcome Back
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              margin="normal"
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth margin="normal" sx={{ mb: 3 }}>
              <InputLabel>User Type</InputLabel>
              <Select
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                label="User Type"
              >
                <MenuItem value="patient">Patient</MenuItem>
                <MenuItem value="doctor">Doctor</MenuItem>
              </Select>
            </FormControl>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ 
                mt: 2,
                mb: 2,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1565C0 30%, #1CB5E0 90%)',
                },
              }}
            >
              Login
            </Button>
            <Divider sx={{ my: 2 }}>OR</Divider>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Don't have an account?
              </Typography>
              <Button
                onClick={handleRegisterClick}
                sx={{
                  color: '#1976d2',
                  textTransform: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Register here
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 