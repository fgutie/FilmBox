const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite', // Archivo de base de datos en el directorio backend
  logging: console.log, // Para ver las consultas en la consola
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('SQLite conectado - FilmBox');
    await sequelize.sync(); // Sincroniza los modelos con la base de datos
  } catch (error) {
    console.error('SQLite Error:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
