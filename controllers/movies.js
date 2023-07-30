const movieSchema = require('../models/movie');

const NotFound = require('../utils/errorConstructor/NotFound');
const BadRequest = require('../utils/errorConstructor/BadRequest');
const Forbidden = require('../utils/errorConstructor/Forbidden');

const { SUCCESS_CREATED } = require('../utils/constants');

// возвращает все сохранённые текущим  пользователем фильмы
const getMovies = (req, res, next) => {
  const owner = req.user._id;

  movieSchema
    .find({owner})
    .then((movies) => {
      res.send(movies);
    })
    .catch(next);
};

// создаёт фильм
const createMovie = (req, res, next) => {
  const {country, director, duration, year, description, image, trailerLink, nameRU, nameEN, thumbnail, movieId} = req.body;

    movieSchema
      .create({
        country,
        director,
        duration,
        year,
        description,
        image,
        trailerLink,
        nameRU,
        nameEN,
        thumbnail,
        movieId,
        owner: req.user._id,
      })
      .then((movie) => {
        res.status(SUCCESS_CREATED).send(movie);
      })
      .catch((err) => {
        if (err.name === 'ValidationError') {
          next(new BadRequest('Введенные данные некорректны'));
        } else {
          next(err);
        }
      });
};

// удаляет сохранённый фильм по id
const deleteMovie = (req, res, next) => {
  // ищем по id фильма
  movieSchema
    .findById(req.params._id)
    .then((movie) => {
      if (!movie) {
        throw new NotFound('Фильм не найден');
      }
      // проверяем соответствие owner фильма и id тек.ользователя
      if (!movie.owner.equals(req.user._id)) {
         throw new Forbidden('Ошибка доступа');
      }
      return movieSchema
      .findByIdAndDelete(req.params._id)
      .orFail(() => new NotFound('Фильм не найден'))
      .then(() => res.send({ message: 'Фильма удален' }));
    })
    .catch((err) => {
      if (err.name === 'CactError') {
        next(new BadRequest('Некорректные данные'));
      } else {
        next(err);
      }
    });
}

module.exports = {
  getMovies,
  createMovie,
  deleteMovie,
};
