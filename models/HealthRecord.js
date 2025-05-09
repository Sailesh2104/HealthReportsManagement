const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const HealthRecord = sequelize.define('HealthRecord', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    patientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    doctorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    diagnosis: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    prescription: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

// Define associations
HealthRecord.belongsTo(User, { as: 'patient', foreignKey: 'patientId' });
HealthRecord.belongsTo(User, { as: 'doctor', foreignKey: 'doctorId' });

module.exports = HealthRecord; 