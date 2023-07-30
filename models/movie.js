const mongoose = require('mongoose');
const validator = require('validator');

const movieSchema = new mongoose.Schema({
  country: {
    type: String,
    required: true,
  },
  director: {
    type: String,
    required: true,
  },
  duration: {
    required: true,
    type: Number,
  },
  year: {
    required: true,
    type: String,
  },
  description: {
    required: true,
    type: String,
  },
  image: {
    required: true,
    type: String,
    validate: {
      validator: (value) => validator.isURL(value),
      message: 'Введен некорректный адрес URL',
    },
  },
  trailerLink : {
    required: true,
    type: String,
    validate: {
      validator: (value) => validator.isURL(value),
      message: 'Введен некорректный адрес URL',
    },
  },
  thumbnail: {
    required: true,
    type: String,
    validate: {
      validator: (value) => validator.isURL(value),
      message: 'Введен некорректный адрес URL',
    },
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  movieId: {
    type: Number,
    required: true,
  },
  nameRU: {
    required: true,
    type: String
  },
  nameEN: {
    required: true,
    type: String
  },
});

module.exports = mongoose.model('movie', movieSchema);