import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  AppBar,
  Toolbar,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PatientDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    doctorId: '',
    date: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    console.log('PatientDashboard mounted');
    fetchData();
    fetchDoctors();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching appointments and records with token:', token ? 'Present' : 'Missing');
      const [appointmentsRes, recordsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/appointments/my-appointments', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('http://localhost:5000/api/health-records/my-records', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setAppointments(appointmentsRes.data);
      setRecords(recordsRes.data);
      console.log('Appointments and records fetched successfully');
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error fetching data. Please try again.');
    }
  };

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('\n=== Fetching Doctors List ===');
      console.log('Token from localStorage:', token ? 'Present' : 'Missing');
      
      if (!token) {
        console.error('No token found in localStorage');
        alert('Please log in again');
        navigate('/login');
        return;
      }

      // First, test if the server is running using fetch
      console.log('Testing server connection...');
      try {
        console.log('Making test request to http://localhost:5000/test');
        const testResponse = await fetch('http://localhost:5000/test', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Test response status:', testResponse.status);
        console.log('Test response headers:', Object.fromEntries(testResponse.headers.entries()));
        
        if (!testResponse.ok) {
          throw new Error(`HTTP error! status: ${testResponse.status}`);
        }
        
        const testData = await testResponse.json();
        console.log('Server test response:', testData);
      } catch (testError) {
        console.error('Server test failed:', {
          message: testError.message,
          type: testError.name,
          stack: testError.stack
        });
        
        if (testError.message.includes('Failed to fetch')) {
          console.error('Connection failed - server might be down or CORS issue');
          alert('Cannot connect to server. Please make sure the server is running on port 5000.');
        } else {
          alert('Cannot connect to server. Please try again later.');
        }
        return;
      }

      // Now try to fetch doctors
      console.log('\nMaking request to /api/users/doctors');
      console.log('Request headers:', {
        'Authorization': `Bearer ${token.substring(0, 10)}...`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      });

      const response = await fetch('http://localhost:5000/api/users/doctors', {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response data:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.status === 200) {
        setDoctors(data);
      } else {
        console.error('Error response:', data);
        alert('Error fetching doctors list. Please try again.');
      }
    } catch (error) {
      console.error('\n=== Error Fetching Doctors ===');
      console.error('Error details:', {
        message: error.message,
        type: error.name,
        stack: error.stack
      });
      
      if (error.message.includes('Failed to fetch')) {
        console.error('Connection failed - server might be down or CORS issue');
        alert('Cannot connect to server. Please make sure the server is running on port 5000.');
      } else if (error.message.includes('401')) {
        console.log('Unauthorized - redirecting to login');
        navigate('/login');
      } else {
        alert('Error fetching doctors list. Please try again.');
      }
    }
  };

  const handleBookAppointment = async () => {
    try {
      if (!newAppointment.doctorId || !newAppointment.date) {
        alert('Please select both doctor and date');
        return;
      }

      const token = localStorage.getItem('token');
      console.log('Booking appointment with data:', { ...newAppointment, token: token ? 'Present' : 'Missing' });
      await axios.post(
        'http://localhost:5000/api/appointments/book',
        newAppointment,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOpenDialog(false);
      setNewAppointment({ doctorId: '', date: '' });
      fetchData();
      alert('Appointment booked successfully!');
    } catch (error) {
      console.error('Error booking appointment:', error.response || error);
      alert(error.response?.data?.error || 'Error booking appointment. Please try again.');
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    navigate('/login');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Patient Dashboard
          </Typography>
          <IconButton color="inherit" onClick={handleSignOut}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h5">Appointments</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                console.log('Opening booking dialog');
                setOpenDialog(true);
              }}
            >
              Book Appointment
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Doctor Name</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>{appointment.doctor.name}</TableCell>
                    <TableCell>
                      {new Date(appointment.date).toLocaleString()}
                    </TableCell>
                    <TableCell>{appointment.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Health Records
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Doctor Name</TableCell>
                  <TableCell>Diagnosis</TableCell>
                  <TableCell>Prescription</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.doctor.name}</TableCell>
                    <TableCell>{record.diagnosis}</TableCell>
                    <TableCell>{record.prescription}</TableCell>
                    <TableCell>
                      {new Date(record.date).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Book Appointment</DialogTitle>
          <DialogContent>
            <FormControl fullWidth margin="dense">
              <InputLabel>Select Doctor</InputLabel>
              <Select
                value={newAppointment.doctorId}
                onChange={(e) =>
                  setNewAppointment({ ...newAppointment, doctorId: e.target.value })
                }
                label="Select Doctor"
              >
                {doctors.length === 0 ? (
                  <MenuItem disabled>No doctors available</MenuItem>
                ) : (
                  doctors.map((doctor) => (
                    <MenuItem key={doctor.id} value={doctor.id}>
                      {doctor.name} (ID: {doctor.doctorId})
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              label="Appointment Date"
              type="datetime-local"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              value={newAppointment.date}
              onChange={(e) =>
                setNewAppointment({ ...newAppointment, date: e.target.value })
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleBookAppointment} variant="contained">
              Book Appointment
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default PatientDashboard; 