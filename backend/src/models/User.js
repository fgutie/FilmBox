// Importa Mongoose para definir el esquema del usuario
const mongoose = require('mongoose');

// Importa bcrypt para hashear y comparar contraseñas
const bcrypt = require('bcryptjs');

// Esquema de usuario
const userSchema = new mongoose.Schema(
  {
    // Nombre de usuario visible
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // Email del usuario, único en la base de datos
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    // Contraseña del usuario, guardada hasheada
    password: {
      type: String,
      required: true,
    },

    // Rol del usuario, por defecto user
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    // Biografía del perfil del usuario
    bio: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500,
    },

    // Array con las películas favoritas del usuario
    favoriteMovies: [{
      // ID de la película
      id: { type: Number, required: true },

      // Título de la película
      title: { type: String, required: true },

      // Póster de la película
      posterurl: { type: String, default: '' },

      // Año de la película
      year: { type: String, default: '????' },
    }],
  },
  {
    // Añade createdAt y updatedAt automáticamente
    timestamps: true,
  }
);

// Antes de guardar un usuario, hashea la contraseña si ha cambiado
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Método para comparar la contraseña introducida con la hasheada
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Exporta el modelo User
module.exports = mongoose.model('User', userSchema);