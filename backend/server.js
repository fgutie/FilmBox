const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

// Simular usuarios (SIN MONGODB por ahora)
let users = [];

// REGISTER 
app.post('/api/users/register', async (req, res) => {
  try {
    console.log(' REGISTER:', req.body);
    
    const { username, email, password } = req.body;
    
    // Check si existe
    const userExists = users.find(u => u.email === email);
    if (userExists) {
      return res.status(400).json({ message: 'Usuari ja existeix' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = {
      _id: Date.now().toString(),
      username,
      email,
      password: hashedPassword
    };
    
    users.push(newUser);
    console.log(' USUARIO CREADO:', newUser.username);
    
    res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      token: 'fake_jwt_' + newUser._id
    });
  } catch (error) {
    console.error(' REGISTER ERROR:', error);
    res.status(500).json({ message: 'Error servidor' });
  }
});

// LOGIN 
app.post('/api/users/login', async (req, res) => {
  try {
    console.log(' LOGIN:', req.body);
    
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    
    if (user && await bcrypt.compare(password, user.password)) {
      console.log(' LOGIN OK:', user.username);
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: 'fake_jwt_' + user._id
      });
    } else {
      console.log(' LOGIN FALLIDO');
      res.status(401).json({ message: 'Credencials incorrectes' });
    }
  } catch (error) {
    console.error(' LOGIN ERROR:', error);
    res.status(500).json({ message: 'Error servidor' });
  }
});

// SCROLL INFINITO - PELÍCULAS TMDB (PAGINADAS)
app.get('/api/movies', async (req, res) => {
  try {
    const TMDB_API_KEY = 'f5cb4bd58b0a6754b238b1e9c5ac5b88';
    const page = parseInt(req.query.page) || 1;
    
    console.log(`📱 Cargando página ${page} de TMDB...`);
    
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=es-ES&page=${page}`
    );
    
    if (!response.ok) {
      throw new Error('TMDB API error');
    }
    
    const tmdbData = await response.json();
    
    // Transformar datos TMDB → tu formato
    const movies = tmdbData.results.map(movie => ({
      title: movie.title,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : '????',
      avgrating: movie.vote_average,
      posterurl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
      genre: 'Drama, Ci-Fi, Acció, Thriller' // Simplificado
    }));
    
    res.json({ 
      movies, 
      page: tmdbData.page,
      total_pages: tmdbData.total_pages,
      total_results: tmdbData.total_results 
    });
    
  } catch (error) {
    console.error('TMDB Error:', error);
    // FALLBACK hardcodeado
    res.json({ 
      movies: [
        { title: "Oppenheimer", year: 2023, avgrating: 8.4, posterurl: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDyehytLc12u9dH.jpg", genre: "Drama" },
        { title: "Dune: Part Two", year: 2024, avgrating: 8.7, posterurl: "https://image.tmdb.org/t/p/w500/gP1KDofOlLzdXaV9wHMiHFjhd.jpg", genre: "Ci-Fi" }
      ],
      page: 1,
      total_pages: 1,
      total_results: 2 
    });
  }
});

// Test API
app.get('/', (req, res) => {
  res.json({ 
    message: 'FilmBox API OK - SCROLL INFINITO TMDB ACTIVO', 
    usersCount: users.length,
    users: users.map(u => ({ username: u.username, email: u.email })),
    movies_endpoint: 'GET /api/movies?page=1'
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 http://localhost:${PORT}`);
  console.log('👥 Usuaris:', users.length);
  console.log('🎬 TMDB Scroll Infinito ACTIVO');
});
