const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const List = sequelize.define('List', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  movies: {
    type: DataTypes.JSON, // Array de objetos de películas
    defaultValue: [],
  },
}, {
  timestamps: true,
});

// Relación con User
List.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(List, { foreignKey: 'userId' });

module.exports = List;