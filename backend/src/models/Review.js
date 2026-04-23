// Importa Mongoose para definir el esquema de reviews
const mongoose = require('mongoose');

// Esquema de una review de película
const reviewSchema = new mongoose.Schema(
  {
    // Usuario que ha escrito la review
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ID de la película en TMDB
    movieId: {
      type: Number,
      required: true,
    },
    
    // Título de la película reseñada
    movieTitle: {
      type: String,
      required: true,
    },

    // URL del póster de la película
    moviePoster: {
      type: String,
      default: '',
    },

    // Puntuación que el usuario da a la película
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    // Texto libre de la review
    review: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    // Añade fechas automáticas de creación y actualización
    timestamps: true,
  }
);

// Índice único para que un usuario no pueda repetir review de la misma película
reviewSchema.index({ userId: 1, movieId: 1 }, { unique: true });

// Exporta el modelo Review
module.exports = mongoose.model('Review', reviewSchema);