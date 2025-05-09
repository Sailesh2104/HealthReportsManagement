const express = require('express');
const { auth, checkUserType } = require('../middleware/auth');
const HealthRecord = require('../models/HealthRecord');
const User = require('../models/User');

const router = express.Router();

// Add health record (doctor only)
router.post('/', auth, checkUserType('doctor'), async (req, res) => {
    try {
        console.log('\n=== Adding Health Record ===');
        console.log('Request body:', req.body);
        console.log('Current user (doctor):', {
            id: req.user.id,
            username: req.user.username,
            userType: req.user.userType
        });

        const { patientId, diagnosis, prescription } = req.body;

        // Verify patient exists
        console.log('Looking for patient with ID:', patientId);
        const patient = await User.findByPk(patientId);
        console.log('Found patient:', patient ? {
            id: patient.id,
            username: patient.username,
            userType: patient.userType,
            name: patient.name
        } : 'Not found');

        if (!patient || patient.userType !== 'patient') {
            console.log('Patient not found or not a patient');
            return res.status(404).json({ error: 'Patient not found.' });
        }

        console.log('Creating health record...');
        const record = await HealthRecord.create({
            patientId,
            doctorId: req.user.id,
            diagnosis,
            prescription
        });

        console.log('Health record created successfully:', {
            id: record.id,
            patientId: record.patientId,
            doctorId: record.doctorId
        });

        res.status(201).json(record);
    } catch (error) {
        console.error('\n=== Error Adding Health Record ===');
        console.error('Error details:', error);
        console.error('Error stack:', error.stack);
        console.error('=====================\n');
        res.status(400).json({ error: error.message });
    }
});

// Get patient's health records (patient only)
router.get('/my-records', auth, checkUserType('patient'), async (req, res) => {
    try {
        const records = await HealthRecord.findAll({
            where: { patientId: req.user.id },
            include: [
                { model: User, as: 'doctor', attributes: ['name', 'doctorId'] }
            ],
            order: [['date', 'DESC']]
        });

        res.json(records);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get doctor's patients' records (doctor only)
router.get('/doctor-records', auth, checkUserType('doctor'), async (req, res) => {
    try {
        const records = await HealthRecord.findAll({
            where: { doctorId: req.user.id },
            include: [
                { model: User, as: 'patient', attributes: ['name', 'aadharNumber'] }
            ],
            order: [['date', 'DESC']]
        });

        res.json(records);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router; 