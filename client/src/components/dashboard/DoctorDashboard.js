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
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [newRecord, setNewRecord] = useState({
    patientId: '',
    diagnosis: '',
    prescription: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('\n=== Fetching Doctor Dashboard Data ===');
      
      const [appointmentsRes, recordsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/appointments/doctor-appointments', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('http://localhost:5000/api/health-records/doctor-records', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      console.log('Appointments data:', appointmentsRes.data.map(a => ({
        id: a.id,
        patientId: a.patientId,
        patient: a.patient ? {
          id: a.patient.id,
          name: a.patient.name,
          userType: a.patient.userType
        } : null,
        status: a.status
      })));

      setAppointments(appointmentsRes.data);
      setRecords(recordsRes.data);
    } catch (error) {
      console.error('Error fetching data:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    }
  };

  const handleUpdateStatus = async (appointmentId, status) => {
    try {
      console.log('Updating appointment status:', { appointmentId, status });
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        alert('Please log in again');
        navigate('/login');
        return;
      }

      const response = await axios.patch(
        `http://localhost:5000/api/appointments/${appointmentId}/status`,
        { status },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Update response:', response.data);
      
      if (response.status === 200) {
        alert(`Appointment ${status} successfully`);
        fetchData(); // Refresh the appointments list
      }
    } catch (error) {
      console.error('Error updating appointment status:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      alert(error.response?.data?.error || 'Error updating appointment status. Please try again.');
    }
  };

  const handleAddRecord = async () => {
    try {
      console.log('\n=== Adding Health Record ===');
      console.log('Selected appointment:', selectedAppointment);
      console.log('New record data:', {
        patientId: newRecord.patientId,
        diagnosis: newRecord.diagnosis,
        prescription: newRecord.prescription
      });

      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        alert('Please log in again');
        navigate('/login');
        return;
      }

      if (!newRecord.diagnosis || !newRecord.prescription) {
        alert('Please fill in both diagnosis and prescription');
        return;
      }

      if (!newRecord.patientId) {
        console.error('No patient ID found');
        alert('Error: Patient ID is missing');
        return;
      }

      console.log('Making request to add health record...');
      const response = await axios.post(
        'http://localhost:5000/api/health-records',
        {
          patientId: newRecord.patientId,
          diagnosis: newRecord.diagnosis,
          prescription: newRecord.prescription
        },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Health record added successfully:', response.data);
      
      if (response.status === 201) {
        alert('Health record added successfully');
        setOpenDialog(false);
        setNewRecord({ patientId: '', diagnosis: '', prescription: '' });
        fetchData(); // Refresh the records list
      }
    } catch (error) {
      console.error('\n=== Error Adding Health Record ===');
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      alert(error.response?.data?.error || 'Error adding health record. Please try again.');
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
            Doctor Dashboard
          </Typography>
          <IconButton color="inherit" onClick={handleSignOut}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Doctor Dashboard
        </Typography>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Appointments
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Patient Name</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>{appointment.patient.name}</TableCell>
                    <TableCell>
                      {new Date(appointment.date).toLocaleString()}
                    </TableCell>
                    <TableCell>{appointment.status}</TableCell>
                    <TableCell>
                      {appointment.status === 'pending' && (
                        <>
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => handleUpdateStatus(appointment.id, 'approved')}
                            sx={{ mr: 1 }}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => handleUpdateStatus(appointment.id, 'rejected')}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {appointment.status === 'approved' && (
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => {
                            console.log('\n=== Opening Add Record Dialog ===');
                            console.log('Selected appointment:', {
                              id: appointment.id,
                              patientId: appointment.patientId,
                              patient: appointment.patient ? {
                                id: appointment.patient.id,
                                name: appointment.patient.name,
                                userType: appointment.patient.userType
                              } : null
                            });
                            
                            if (!appointment.patientId) {
                              console.error('Patient ID is missing from appointment');
                              alert('Error: Patient ID is missing. Please try refreshing the page.');
                              return;
                            }

                            setSelectedAppointment(appointment);
                            setNewRecord({
                              patientId: appointment.patientId,
                              diagnosis: '',
                              prescription: ''
                            });
                            setOpenDialog(true);
                            console.log('Dialog opened with patient ID:', appointment.patientId);
                          }}
                        >
                          Add Record
                        </Button>
                      )}
                    </TableCell>
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
                  <TableCell>Patient Name</TableCell>
                  <TableCell>Diagnosis</TableCell>
                  <TableCell>Prescription</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.patient.name}</TableCell>
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
          <DialogTitle>Add Health Record</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Diagnosis"
              fullWidth
              value={newRecord.diagnosis}
              onChange={(e) =>
                setNewRecord({ ...newRecord, diagnosis: e.target.value })
              }
            />
            <TextField
              margin="dense"
              label="Prescription"
              fullWidth
              multiline
              rows={4}
              value={newRecord.prescription}
              onChange={(e) =>
                setNewRecord({ ...newRecord, prescription: e.target.value })
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleAddRecord} variant="contained">
              Add Record
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default DoctorDashboard; 