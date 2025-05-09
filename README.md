# Health Records Management System

A web application for managing health records with separate portals for doctors and patients.

## Features

- Separate login for doctors and patients
- Doctor registration with Doctor ID
- Patient registration with Aadhar Number
- Health record management
- Appointment booking system
- Secure authentication using JWT

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a PostgreSQL database named 'health_records'

4. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the database credentials and JWT secret in `.env`

5. Start the server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user (doctor/patient)
- POST `/api/auth/login` - Login user

### Health Records
- POST `/api/health-records` - Add new health record (doctor only)
- GET `/api/health-records/my-records` - Get patient's health records
- GET `/api/health-records/doctor-records` - Get doctor's patients' records

### Appointments
- POST `/api/appointments/book` - Book an appointment (patient only)
- GET `/api/appointments/my-appointments` - Get patient's appointments
- GET `/api/appointments/doctor-appointments` - Get doctor's appointments
- PATCH `/api/appointments/:id/status` - Update appointment status (doctor only)

## Security

- Passwords are hashed using bcrypt
- JWT-based authentication
- Role-based access control
- Input validation and sanitization

## Frontend

The frontend is built with React and will be available in a separate repository. 