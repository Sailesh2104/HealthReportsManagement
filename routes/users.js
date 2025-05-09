const express = require('express');
const { auth, checkUserType } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Get all doctors (for patients to book appointments)
router.get('/doctors', auth, async (req, res) => {
    try {
        console.log('=== Fetching Doctors List ===');
        console.log('Request headers:', req.headers);
        console.log('Authorization header:', req.headers.authorization);
        console.log('Current user:', {
            id: req.user.id,
            username: req.user.username,
            userType: req.user.userType
        });

        // First, let's check all users in the database
        const allUsers = await User.findAll({
            attributes: ['id', 'username', 'userType', 'name', 'doctorId']
        });
        console.log('All users in database:', allUsers);

        // Now get only doctors
        const doctors = await User.findAll({
            where: { userType: 'doctor' },
            attributes: ['id', 'name', 'doctorId']
        });
        console.log('Found doctors:', doctors);

        if (doctors.length === 0) {
            console.log('No doctors found in the database');
        } else {
            console.log(`Found ${doctors.length} doctors`);
        }

        res.json(doctors);
    } catch (error) {
        console.error('=== Error in /doctors endpoint ===');
        console.error('Error details:', error);
        console.error('Error stack:', error.stack);
        res.status(400).json({ error: error.message });
    }
});

module.exports = router; 