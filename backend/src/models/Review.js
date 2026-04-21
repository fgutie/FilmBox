const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    movieId: {
      type: Number,
      required: true,
    },
    movieTitle: {
      type: String,
      required: true,
    },
    moviePoster: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    review: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Índice compuesto para evitar múltiples reviews por usuario y película
reviewSchema.index({ userId: 1, movieId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);