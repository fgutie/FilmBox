const express = require('express');
const { createList, getUserLists, getListById, addMovieToList, removeMovieFromList, deleteList } = require('../controllers/listController');
const router = express.Router();

// Crear lista
router.post('/', createList);

// Obtener listas del usuario
router.get('/user/:userId', getUserLists);

// Obtener lista por ID
router.get('/:listId', getListById);

// Agregar película a lista
router.post('/add-movie', addMovieToList);

// Remover película de lista
router.post('/remove-movie', removeMovieFromList);

// Eliminar lista
router.delete('/:listId', deleteList);

module.exports = router;