const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userType: {
        type: DataTypes.ENUM('doctor', 'patient'),
        allowNull: false
    },
    doctorId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true,
        validate: {
            isDoctorIdValid(value) {
                if (this.userType === 'doctor' && !value) {
                    throw new Error('Doctor ID is required for doctors');
                }
                if (this.userType === 'patient' && value) {
                    throw new Error('Doctor ID should not be set for patients');
                }
            }
        }
    },
    aadharNumber: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true,
        validate: {
            isAadharValid(value) {
                if (this.userType === 'patient' && !value) {
                    throw new Error('Aadhar number is required for patients');
                }
                if (this.userType === 'doctor' && value) {
                    throw new Error('Aadhar number should not be set for doctors');
                }
            }
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    hooks: {
        beforeSave: async (user) => {
            if (user.changed('password')) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        }
    }
});

User.prototype.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = User; 