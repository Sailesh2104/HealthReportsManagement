const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
    try {
        console.log('\n=== Registration Process Started ===');
        console.log('Registration request received:', req.body);
        const { username, password, userType, name, doctorId, aadharNumber } = req.body;

        // Log all received fields
        console.log('Received fields:', {
            username,
            userType,
            name,
            doctorId,
            aadharNumber,
            password: password ? '***' : undefined
        });

        // Validate required fields based on user type
        if (userType === 'doctor' && !doctorId) {
            console.log('Doctor ID missing');
            return res.status(400).json({ error: 'Doctor ID is required for doctors.' });
        }
        if (userType === 'patient' && !aadharNumber) {
            console.log('Aadhar number missing');
            return res.status(400).json({ error: 'Aadhar number is required for patients.' });
        }

        // Check if username exists for the same user type
        console.log('Checking if username exists for user type:', userType);
        const existingUser = await User.findOne({ 
            where: { 
                username,
                userType // Only check username uniqueness within the same user type
            } 
        });
        if (existingUser) {
            console.log('Username already exists for user type:', userType);
            return res.status(400).json({ error: `Username already exists for ${userType}s.` });
        }

        // Check if doctorId already exists for doctors
        if (userType === 'doctor') {
            console.log('Checking if doctorId exists:', doctorId);
            const existingDoctor = await User.findOne({ where: { doctorId } });
            if (existingDoctor) {
                console.log('Doctor ID already exists:', doctorId);
                return res.status(400).json({ error: 'Doctor ID already exists.' });
            }
        }

        // Check if aadharNumber already exists for patients
        if (userType === 'patient') {
            console.log('Checking if aadharNumber exists:', aadharNumber);
            const existingPatient = await User.findOne({ where: { aadharNumber } });
            if (existingPatient) {
                console.log('Aadhar number already exists:', aadharNumber);
                return res.status(400).json({ error: 'Aadhar number already exists.' });
            }
        }

        console.log('Creating new user...');
        // Create user
        const user = await User.create({
            username,
            password,
            userType,
            name,
            doctorId: userType === 'doctor' ? doctorId : null,
            aadharNumber: userType === 'patient' ? aadharNumber : null
        });

        console.log('User created successfully:', {
            id: user.id,
            username: user.username,
            userType: user.userType,
            name: user.name,
            doctorId: user.doctorId,
            aadharNumber: user.aadharNumber
        });

        // Generate token
        console.log('Generating JWT token...');
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        const response = {
            user: {
                id: user.id,
                username: user.username,
                userType: user.userType,
                name: user.name
            },
            token
        };

        console.log('Sending response:', {
            ...response,
            token: '***'
        });
        console.log('=== Registration Process Completed ===');

        res.status(201).json(response);
    } catch (error) {
        console.error('\n=== Registration Error ===');
        console.error('Error details:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('=====================\n');
        res.status(400).json({ error: error.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { username, password, userType } = req.body;

        // Find user
        const user = await User.findOne({ where: { username, userType } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            user: {
                id: user.id,
                username: user.username,
                userType: user.userType,
                name: user.name
            },
            token
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router; 