// Controlador de autenticación: gestiona el registro y el inicio de sesión
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Genera un token JWT con el id del usuario
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Registro de usuario nuevo
exports.register = async (req, res) => {
  try {
    // Recoge los datos enviados desde el formulario
    const { username, email, password } = req.body;

    // Comprueba que no falten campos obligatorios
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Omple tots els camps' });
    }

    // Verifica si ya existe un usuario con ese email
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Usuari ja existeix' });

    // Crea el nuevo usuario en MongoDB
    const user = await User.create({ username, email, password });

    // Devuelve los datos del usuario y un token de sesión
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Inicio de sesión de usuario
exports.login = async (req, res) => {
  try {
    // Recoge email y contraseña del formulario
    const { email, password } = req.body;

    // Comprueba que no falten campos obligatorios
    if (!email || !password) {
      return res.status(400).json({ message: 'Omple tots els camps' });
    }

    // Busca el usuario por email
    const user = await User.findOne({ email });

    // Comprueba si existe y si la contraseña coincide
    if (user && (await user.matchPassword(password))) {
      // Devuelve los datos del usuario y el token
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      // Si no coincide, devuelve error de credenciales
      res.status(401).json({ message: 'Credencials incorrectes' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};