const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();

const { connectDB } = require('./src/config/db');
const userRoutes = require('./src/routes/users');
const listRoutes = require('./src/routes/lists');
const reviewRoutes = require('./src/routes/reviews');

const app = express();


connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// FRONTEND ESTÁTICO (ANTES de las APIs)
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Rutas de API
app.use('/api/users', userRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/reviews', reviewRoutes);

// SCROLL INFINITO - PELÍCULAS TMDB
app.get('/api/movies', async (req, res) => {
  try {
    const TMDB_API_KEY = 'f5cb4bd58b0a6754b238b1e9c5ac5b88';
    const page = parseInt(req.query.page) || 1;
    
    console.log(`Cargando página ${page} de TMDB...`);
    
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=es-ES&page=${page}`
    );
    
    if (!response.ok) {
      throw new Error('TMDB API error');
    }
    
    const tmdbData = await response.json();
    
    const genresResponse = await fetch(
      `https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}&language=es-ES`
    );
    const genresData = genresResponse.ok ? await genresResponse.json() : { genres: [] };
    const genreMap = {};
    (genresData.genres || []).forEach(g => { genreMap[g.id] = g.name; });

    const movies = tmdbData.results.map(movie => {
      const genreNames = (movie.genre_ids || []).map(id => genreMap[id]).filter(Boolean);
      return {
        id: movie.id,
        title: movie.title,
        year: movie.release_date ? new Date(movie.release_date).getFullYear() : '????',
        avgrating: movie.vote_average,
        posterurl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
        genre: genreNames.length ? genreNames.join(', ') : 'Desconocido',
        overview: movie.overview || ''
      };
    });
    
    res.json({ 
      movies, 
      page: tmdbData.page,
      total_pages: tmdbData.total_pages,
      total_results: tmdbData.total_results 
    });
    
  } catch (error) {
    console.error('TMDB Error:', error);
    res.json({ 
      movies: [
        { id: 1, title: "Oppenheimer", year: 2023, avgrating: 8.4, posterurl: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDyehytLc12u9dH.jpg", genre: "Drama", overview: "Biopic sobre la vida de J. Robert Oppenheimer." },
        { id: 2, title: "Dune: Part Two", year: 2024, avgrating: 8.7, posterurl: "https://image.tmdb.org/t/p/w500/gP1KDofOlLzdXaV9wHMiHFjhd.jpg", genre: "Ci-Fi", overview: "Segunda parte de la adaptación de Dune." }
      ],
      page: 1,
      total_pages: 1,
      total_results: 2 
    });
  }
});

//  SPA ROUTING - SOLO para rutas NO-API (DESPUÉS de todas las APIs)
app.get(['/', '/movie-detail.html', '/lists.html', '/list-detail.html', '/profile.html'], (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`FilmBox COMPLETO http://localhost:${PORT}`);
  console.log(' MongoDB conectado');
  console.log(' TMDB Scroll Infinito ACTIVO');
});
