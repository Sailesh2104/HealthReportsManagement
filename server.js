const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const authRoutes = require('./routes/auth');
const healthRecordRoutes = require('./routes/healthRecords');
const appointmentRoutes = require('./routes/appointments');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    optionsSuccessStatus: 200
};

// Debug middleware
app.use((req, res, next) => {
    console.log('\n=== Incoming Request ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Path:', req.path);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('=====================\n');
    next();
});

// Apply CORS
app.use(cors(corsOptions));

// Parse JSON bodies
app.use(express.json());

// Test route
app.get('/test', (req, res) => {
    res.json({ message: 'Server is running', port: PORT });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/health-records', healthRecordRoutes);
app.use('/api/appointments', appointmentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('\n=== Server Error ===');
    console.error('Error:', err);
    console.error('Stack:', err.stack);
    console.error('=====================\n');
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    console.log('\n=== 404 Not Found ===');
    console.log('Requested URL:', req.url);
    console.log('=====================\n');
    res.status(404).json({ error: 'Not Found', path: req.path });
});

// Sync database and start server
const startServer = async () => {
    try {
        await sequelize.sync();
        console.log('Database connection established successfully.');

        const server = app.listen(PORT, () => {
            console.log('\n=== Server Started ===');
            console.log(`Server is running on http://localhost:${PORT}`);
            console.log('Available routes:');
            console.log(`- GET http://localhost:${PORT}/test`);
            console.log(`- GET http://localhost:${PORT}/api/users/doctors`);
            console.log(`- GET http://localhost:${PORT}/api/appointments/my-appointments`);
            console.log(`- GET http://localhost:${PORT}/api/health-records/my-records`);
            console.log('=====================\n');
        });

        server.on('error', (error) => {
            console.error('\n=== Server Error ===');
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            console.error('=====================\n');

            if (error.code === 'EADDRINUSE') {
                console.error(`Port ${PORT} is already in use. Trying to find available port...`);
                // Try to find an available port
                const findAvailablePort = async (startPort) => {
                    const net = require('net');
                    return new Promise((resolve, reject) => {
                        const server = net.createServer();
                        server.listen(startPort, () => {
                            const { port } = server.address();
                            server.close(() => resolve(port));
                        });
                        server.on('error', (err) => {
                            if (err.code === 'EADDRINUSE') {
                                resolve(findAvailablePort(startPort + 1));
                            } else {
                                reject(err);
                            }
                        });
                    });
                };

                findAvailablePort(PORT + 1)
                    .then(availablePort => {
                        console.log(`Found available port: ${availablePort}`);
                        server.listen(availablePort);
                    })
                    .catch(err => {
                        console.error('Could not find available port:', err);
                        process.exit(1);
                    });
            } else {
                console.error('Server error:', error);
                process.exit(1);
            }
        });
    } catch (err) {
        console.error('Unable to connect to the database:', err);
        process.exit(1);
    }
};

startServer(); 