const sequelize = require('./config/database');

async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('Database connection successful!');
        
        // Test database sync
        await sequelize.sync({ force: false });
        console.log('Database sync successful!');
        
        process.exit(0);
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
}

testConnection(); 