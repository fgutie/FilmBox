// Importa Mongoose para definir el esquema y el modelo de la colección List
const mongoose = require('mongoose');

// Esquema que define cómo se guarda cada película dentro de una lista
const movieSchema = new mongoose.Schema(
  {
    // ID de la película en TMDB
    id: { type: Number, required: true },

    // Título de la película
    title: { type: String, required: true },

    // Año de estreno o valor por defecto si no se conoce
    year: { type: [String, Number], default: '????' },

    // Valoración media de la película
    avgrating: { type: Number, default: 0 },

    // URL del póster de la película
    posterurl: { type: String, default: '' },

    // Género o géneros de la película
    genre: { type: String, default: 'Desconocido' },

    // Sinopsis o resumen de la película
    overview: { type: String, default: '' },

    // Fecha de estreno
    release_date: { type: String, default: '' },
  },

  // Evita que cada movie embebida tenga su propio _id
  { _id: false }
);

// Esquema principal de la lista
const listSchema = new mongoose.Schema(
  {
    // Referencia al usuario propietario de la lista
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Nombre de la lista
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Descripción opcional de la lista
    description: {
      type: String,
      default: '',
      trim: true,
    },

    // Array de películas guardadas dentro de la lista
    movies: {
      type: [movieSchema],
      default: [],
    },
  },
  {
    // Añade createdAt y updatedAt automáticamente
    timestamps: true,
  }
);

// Crea y exporta el modelo List para usarlo en los controladores
module.exports = mongoose.model('List', listSchema);