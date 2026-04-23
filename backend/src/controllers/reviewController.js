// Controlador de reviews y perfil de usuario
const Review = require('../models/Review');
const User = require('../models/User');

// Crea una review nueva o actualiza una existente
exports.createOrUpdateReview = async (req, res) => {
  try {
    // Recoge los datos enviados desde el frontend
    const { userId, movieId, movieTitle, moviePoster, rating, review } = req.body;

    // Comprueba que no falten campos obligatorios
    if (!userId || !movieId || !movieTitle || !rating) {
      return res.status(400).json({ message: 'Falten camps obligatoris' });
    }

    // Valida el rango de la puntuación
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'La puntuació ha de ser entre 1 i 5' });
    }

    // Busca si ya existe una review de ese usuario para esa película
    // Si existe, la actualiza; si no, la crea
    const existingReview = await Review.findOneAndUpdate(
      { userId, movieId },
      {
        movieTitle,
        moviePoster: moviePoster || '',
        rating,
        review: review || '',
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    // Devuelve la review guardada o actualizada
    res.status(200).json(existingReview);
  } catch (error) {
    console.error('Error en review:', error);

    // Si hay error por índice único, significa que ya existe una review
    if (error.code === 11000) {
      res.status(400).json({ message: 'Ja has fet una review d\'aquesta pel·lícula' });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// Obtiene todas las reviews de un usuario
exports.getUserReviews = async (req, res) => {
  try {
    // Obtiene el id del usuario desde la URL
    const { userId } = req.params;

    // Busca todas sus reviews y las ordena por fecha
    const reviews = await Review.find({ userId }).sort({ updatedAt: -1 });

    // Devuelve el array de reviews
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtiene la review de un usuario para una película concreta
exports.getMovieReview = async (req, res) => {
  try {
    // Obtiene el id del usuario y el id de la película
    const { userId, movieId } = req.params;

    // Busca la review concreta
    const review = await Review.findOne({ userId, movieId });

    // Devuelve la review o null si no existe
    res.json(review || null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Elimina una review concreta
exports.deleteReview = async (req, res) => {
  try {
    // Recoge usuario y película a borrar
    const { userId, movieId } = req.body;

    // Elimina la review de MongoDB
    await Review.findOneAndDelete({ userId, movieId });

    // Devuelve mensaje de confirmación
    res.json({ message: 'Review eliminada' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualiza datos del perfil del usuario
exports.updateProfile = async (req, res) => {
  try {
    // Recoge los campos que se quieren cambiar
    const { userId, bio, favoriteMovies } = req.body;

    // Comprueba que el userId exista
    if (!userId) {
      return res.status(400).json({ message: 'User ID requerit' });
    }

    // Prepara solo los campos que se van a actualizar
    const updateData = {};
    if (bio !== undefined) updateData.bio = bio;
    if (favoriteMovies !== undefined) updateData.favoriteMovies = favoriteMovies;

    // Actualiza el usuario y excluye la contraseña de la respuesta
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password');

    // Si no existe, devuelve error
    if (!user) {
      return res.status(404).json({ message: 'Usuari no trobat' });
    }

    // Devuelve el usuario actualizado
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtiene el perfil completo de un usuario
exports.getUserProfile = async (req, res) => {
  try {
    // Obtiene el id del usuario desde la URL
    const { userId } = req.params;

    // Busca el usuario y oculta la contraseña
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Usuari no trobat' });
    }

    // Cuenta cuántas reviews tiene el usuario
    const reviewCount = await Review.countDocuments({ userId });

    // Cuenta cuántas listas tiene el usuario
    const listCount = await require('../models/List').countDocuments({ userId });

    // Obtiene las 4 reviews más recientes
    const recentReviews = await Review.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(4)
      .select('movieId movieTitle moviePoster rating review updatedAt');

    // Devuelve datos de usuario, estadísticas y reviews recientes
    res.json({
      user,
      stats: {
        reviews: reviewCount,
        lists: listCount,
      },
      recentReviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};