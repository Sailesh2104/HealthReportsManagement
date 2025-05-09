import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import DoctorDashboard from './components/dashboard/DoctorDashboard';
import PatientDashboard from './components/dashboard/PatientDashboard';

const PrivateRoute = ({ children, allowedUserType }) => {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (allowedUserType && userType !== allowedUserType) {
    return <Navigate to={`/${userType}/dashboard`} />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/doctor/dashboard"
          element={
            <PrivateRoute allowedUserType="doctor">
              <DoctorDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/patient/dashboard"
          element={
            <PrivateRoute allowedUserType="patient">
              <PatientDashboard />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
