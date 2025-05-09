const express = require('express');
const { auth, checkUserType } = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

const router = express.Router();

// Book appointment (patient only)
router.post('/book', auth, checkUserType('patient'), async (req, res) => {
    try {
        const { doctorId, date } = req.body;

        // Verify doctor exists
        const doctor = await User.findByPk(doctorId);
        if (!doctor || doctor.userType !== 'doctor') {
            return res.status(404).json({ error: 'Doctor not found.' });
        }

        // Check if slot is available
        const existingAppointment = await Appointment.findOne({
            where: {
                doctorId,
                date,
                status: 'approved'
            }
        });

        if (existingAppointment) {
            return res.status(400).json({ error: 'This time slot is already booked.' });
        }

        const appointment = await Appointment.create({
            patientId: req.user.id,
            doctorId,
            date
        });

        res.status(201).json(appointment);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get patient's appointments (patient only)
router.get('/my-appointments', auth, checkUserType('patient'), async (req, res) => {
    try {
        const appointments = await Appointment.findAll({
            where: { patientId: req.user.id },
            include: [
                { model: User, as: 'doctor', attributes: ['name', 'doctorId'] }
            ],
            order: [['date', 'ASC']]
        });

        res.json(appointments);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get doctor's appointments (doctor only)
router.get('/doctor-appointments', auth, checkUserType('doctor'), async (req, res) => {
    try {
        console.log('\n=== Fetching Doctor Appointments ===');
        console.log('Doctor ID:', req.user.id);

        const appointments = await Appointment.findAll({
            where: { doctorId: req.user.id },
            include: [
                { 
                    model: User, 
                    as: 'patient', 
                    attributes: ['id', 'name', 'aadharNumber', 'userType']
                }
            ],
            order: [['date', 'ASC']]
        });

        console.log('Found appointments:', appointments.map(a => ({
            id: a.id,
            patientId: a.patientId,
            patient: a.patient ? {
                id: a.patient.id,
                name: a.patient.name,
                userType: a.patient.userType
            } : null
        })));

        res.json(appointments);
    } catch (error) {
        console.error('Error fetching doctor appointments:', error);
        res.status(400).json({ error: error.message });
    }
});

// Update appointment status (doctor only)
router.patch('/:id/status', auth, checkUserType('doctor'), async (req, res) => {
    try {
        const { status } = req.body;
        const appointment = await Appointment.findByPk(req.params.id);

        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found.' });
        }

        if (appointment.doctorId !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to update this appointment.' });
        }

        appointment.status = status;
        await appointment.save();

        res.json(appointment);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router; 