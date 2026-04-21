const express = require('express');
const {
  createOrUpdateReview,
  getUserReviews,
  getMovieReview,
  deleteReview,
  updateProfile,
  getUserProfile,
} = require('../controllers/reviewController');
const router = express.Router();

// Reviews
router.post('/', createOrUpdateReview);
router.get('/user/:userId', getUserReviews);
router.get('/movie/:userId/:movieId', getMovieReview);
router.delete('/', deleteReview);

// Profile
router.put('/profile', updateProfile);
router.get('/profile/:userId', getUserProfile);

module.exports = router;