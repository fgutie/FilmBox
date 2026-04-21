"define cómo es una lista de películas guarda el Id, ttulo, año la descripción y el array movies"
const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    title: { type: String, required: true },
    year: { type: [String, Number], default: '????' },
    avgrating: { type: Number, default: 0 },
    posterurl: { type: String, default: '' },
    genre: { type: String, default: 'Desconocido' },
    overview: { type: String, default: '' },
    release_date: { type: String, default: '' },
  },
  { _id: false }
);

const listSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    movies: {
      type: [movieSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('List', listSchema);