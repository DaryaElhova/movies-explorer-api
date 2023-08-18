const router = require('express').Router();
const moviesController = require('../controllers/movies');

router.get('/movies', moviesController.getMovies);
router.post('/movies', moviesController.createMovie);
router.delete('/movies/:_id', moviesController.deleteMovie);

module.exports = router;
