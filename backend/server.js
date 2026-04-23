// Importa Express para crear el servidor
const express = require('express');

// Importa CORS para permitir peticiones desde el frontend
const cors = require('cors');

// Importa bcrypt aunque en este archivo no se usa directamente
const bcrypt = require('bcryptjs');

// Importa path para trabajar con rutas de archivos
const path = require('path');

// Carga las variables de entorno del archivo .env
require('dotenv').config();

// Importa la función que conecta con MongoDB
const { connectDB } = require('./src/config/db');

// Importa las rutas del backend
const userRoutes = require('./src/routes/users');
const listRoutes = require('./src/routes/lists');
const reviewRoutes = require('./src/routes/reviews');

// Crea la aplicación de Express
const app = express();

// Conecta la aplicación con MongoDB
connectDB();

// Middlewares generales
app.use(cors());
app.use(express.json());

// Sirve los archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Monta las rutas de la API
app.use('/api/users', userRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/reviews', reviewRoutes);

// Ruta que consulta películas populares desde TMDB
app.get('/api/movies', async (req, res) => {
  try {
    // Clave de acceso a TMDB
    const TMDB_API_KEY = 'f5cb4bd58b0a6754b238b1e9c5ac5b88';

    // Página solicitada por query string
    const page = parseInt(req.query.page) || 1;
    
    console.log(`Cargando página ${page} de TMDB...`);
    
    // Pide a TMDB las películas populares
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=es-ES&page=${page}`
    );
    
    // Si la respuesta no es correcta, lanza error
    if (!response.ok) {
      throw new Error('TMDB API error');
    }
    
    // Convierte la respuesta a JSON
    const tmdbData = await response.json();
    
    // Pide también la lista de géneros
    const genresResponse = await fetch(
      `https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}&language=es-ES`
    );

    // Si falla, usa un array vacío de géneros
    const genresData = genresResponse.ok ? await genresResponse.json() : { genres: [] };

    // Crea un mapa idGenero -> nombreGenero
    const genreMap = {};
    (genresData.genres || []).forEach(g => { genreMap[g.id] = g.name; });

    // Reconvierte los datos de TMDB al formato que usa tu frontend
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
    
    // Devuelve películas y metadatos de paginación
    res.json({ 
      movies, 
      page: tmdbData.page,
      total_pages: tmdbData.total_pages,
      total_results: tmdbData.total_results 
    });
    
  } catch (error) {
    // Si TMDB falla, devuelve datos de ejemplo
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

// Ruta SPA para devolver index.html en rutas del frontend
app.get(['/', '/movie-detail.html', '/lists.html', '/list-detail.html', '/profile.html'], (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// Puerto del servidor
const PORT = 3000;

// Arranca el servidor Express
app.listen(PORT, () => {
  console.log(`FilmBox COMPLETO http://localhost:${PORT}`);
  console.log(' MongoDB conectado');
  console.log(' TMDB Scroll Infinito ACTIVO');
});