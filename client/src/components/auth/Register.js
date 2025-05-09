import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    password: '',
    userType: 'patient',
    doctorId: '',
    aadharNumber: '',
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('\n=== Submitting Registration Form ===');
      console.log('Form data:', {
        ...formData,
        password: '***'
      });

      // Validate required fields
      if (!formData.username || !formData.password || !formData.name) {
        console.error('Missing required fields');
        alert('Please fill in all required fields');
        return;
      }

      // Validate username format
      if (formData.username.length < 3) {
        console.error('Username too short');
        alert('Username must be at least 3 characters long');
        return;
      }

      // Validate password format
      if (formData.password.length < 6) {
        console.error('Password too short');
        alert('Password must be at least 6 characters long');
        return;
      }

      // Validate based on user type
      if (formData.userType === 'doctor') {
        if (!formData.doctorId) {
          console.error('Doctor ID missing');
          alert('Doctor ID is required for doctors');
          return;
        }
        if (formData.doctorId.length < 3) {
          console.error('Doctor ID too short');
          alert('Doctor ID must be at least 3 characters long');
          return;
        }
        if (formData.aadharNumber) {
          console.error('Aadhar number should not be set for doctors');
          alert('Aadhar number should not be set for doctors');
          return;
        }
      } else if (formData.userType === 'patient') {
        if (!formData.aadharNumber) {
          console.error('Aadhar number missing');
          alert('Aadhar number is required for patients');
          return;
        }
        if (formData.aadharNumber.length !== 12) {
          console.error('Invalid Aadhar number length');
          alert('Aadhar number must be 12 digits');
          return;
        }
        if (!/^\d+$/.test(formData.aadharNumber)) {
          console.error('Invalid Aadhar number format');
          alert('Aadhar number must contain only digits');
          return;
        }
        if (formData.doctorId) {
          console.error('Doctor ID should not be set for patients');
          alert('Doctor ID should not be set for patients');
          return;
        }
      }

      // Prepare the data to send
      const dataToSend = {
        username: formData.username,
        password: formData.password,
        name: formData.name,
        userType: formData.userType,
        doctorId: formData.userType === 'doctor' ? formData.doctorId : null,
        aadharNumber: formData.userType === 'patient' ? formData.aadharNumber : null
      };

      console.log('Making registration request with data:', {
        ...dataToSend,
        password: '***'
      });

      const response = await axios.post('http://localhost:5000/api/auth/register', dataToSend, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Registration response:', {
        ...response.data,
        token: '***'
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userType', formData.userType);
        console.log('Stored in localStorage:', {
          token: '***',
          userType: formData.userType
        });
        navigate(`/${formData.userType}/dashboard`);
      } else {
        throw new Error('No token received from server');
      }
    } catch (error) {
      console.error('\n=== Registration Error ===');
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = 'Registration failed. Please try again.';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message === 'Network Error') {
        errorMessage = 'Cannot connect to server. Please make sure the server is running.';
      }
      
      alert(errorMessage);
    }
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
            Create Account
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
              label="Name"
              name="name"
              value={formData.name}
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
            <FormControl fullWidth margin="normal" sx={{ mb: 2 }}>
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
            {formData.userType === 'doctor' ? (
              <TextField
                fullWidth
                label="Doctor ID"
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                margin="normal"
                required
                sx={{ mb: 2 }}
              />
            ) : (
              <TextField
                fullWidth
                label="Aadhar Number"
                name="aadharNumber"
                value={formData.aadharNumber}
                onChange={handleChange}
                margin="normal"
                required
                sx={{ mb: 2 }}
              />
            )}
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
              Register
            </Button>
            <Divider sx={{ my: 2 }}>OR</Divider>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Already have an account?
              </Typography>
              <Link
                component="button"
                variant="body1"
                onClick={() => navigate('/login')}
                sx={{
                  color: '#1976d2',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Login here
              </Link>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register; 