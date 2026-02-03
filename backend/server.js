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

// Test API
app.get('/', (req, res) => {
  res.json({ 
    message: 'FilmBox API OK ', 
    usersCount: users.length,
    users: users.map(u => ({ username: u.username, email: u.email }))
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(` http://localhost:${PORT}`);
  console.log(' Usuaris:', users.length);
});
