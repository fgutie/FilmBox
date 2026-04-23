// Importa Express para crear las rutas
const express = require('express');

// Importa las funciones del controlador de reviews y perfil
const {
  createOrUpdateReview,
  getUserReviews,
  getMovieReview,
  deleteReview,
  updateProfile,
  getUserProfile,
} = require('../controllers/reviewController');

// Crea un router de Express
const router = express.Router();

// Ruta para crear o actualizar una review
router.post('/', createOrUpdateReview);

// Ruta para obtener todas las reviews de un usuario
router.get('/user/:userId', getUserReviews);

// Ruta para obtener la review de un usuario para una película concreta
router.get('/movie/:userId/:movieId', getMovieReview);

// Ruta para eliminar una review
router.delete('/', deleteReview);

// Ruta para actualizar el perfil de usuario
router.put('/profile', updateProfile);

// Ruta para obtener el perfil completo de un usuario
router.get('/profile/:userId', getUserProfile);

// Exporta el router para usarlo en server.js
module.exports = router;