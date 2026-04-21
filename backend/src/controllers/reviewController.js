const Review = require('../models/Review');
const User = require('../models/User');

exports.createOrUpdateReview = async (req, res) => {
  try {
    const { userId, movieId, movieTitle, moviePoster, rating, review } = req.body;

    if (!userId || !movieId || !movieTitle || !rating) {
      return res.status(400).json({ message: 'Falten camps obligatoris' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'La puntuació ha de ser entre 1 i 5' });
    }

    // Buscar review existente o crear nueva
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

    res.status(200).json(existingReview);
  } catch (error) {
    console.error('Error en review:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Ja has fet una review d\'aquesta pel·lícula' });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

exports.getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await Review.find({ userId }).sort({ updatedAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMovieReview = async (req, res) => {
  try {
    const { userId, movieId } = req.params;
    const review = await Review.findOne({ userId, movieId });
    res.json(review || null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { userId, movieId } = req.body;
    await Review.findOneAndDelete({ userId, movieId });
    res.json({ message: 'Review eliminada' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { userId, bio, favoriteMovies } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID requerit' });
    }

    const updateData = {};
    if (bio !== undefined) updateData.bio = bio;
    if (favoriteMovies !== undefined) updateData.favoriteMovies = favoriteMovies;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Usuari no trobat' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Usuari no trobat' });
    }

    // Obtener estadísticas
    const reviewCount = await Review.countDocuments({ userId });
    const listCount = await require('../models/List').countDocuments({ userId });

    // Obtener últimas 4 reviews
    const recentReviews = await Review.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(4)
      .select('movieId movieTitle moviePoster rating review updatedAt');

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