const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userSchema = require('../models/user');

const NotFound = require('../utils/errorConstructor/NotFound');
const BadRequest = require('../utils/errorConstructor/BadRequest');
const Unauthorized = require('../utils/errorConstructor/Unauthorized');
const ConflictError = require('../utils/errorConstructor/ConflicrError');

const { NODE_ENV, JWT_SECRET } = process.env;
const {
  MONGO_DUPLICATE_KEY_ERROR,
  SUCCESS_CREATED,
  OK,
  SALT_ROUNDS,
} = require('../utils/constants');

const getCurrentUser = (req, res, next) => {
  userSchema
    .findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFound('Такой пользователь не найден');
      } else {
        res.send({
          name: user.name,
          email: user.email,
        });
      }
    })
    .catch(next);
};

const updateUser = (req, res, next) => {
  userSchema
    .findByIdAndUpdate(req.user._id, { ...req.body }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        throw new NotFound('Такой пользователь не найден');
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest('Некорректные данные'));
      } else if (err.code === MONGO_DUPLICATE_KEY_ERROR) {
        next(new ConflictError('Такой пользователь уже существует'));
      } else {
        next(err);
      }
    });
};

const registerUser = (req, res, next) => {
  bcrypt.hash(req.body.password, SALT_ROUNDS)
    .then((hash) => {
      userSchema
        .create({
          name: req.body.name,
          email: req.body.email,
          password: hash,
        })
        .then((newUser) => {
          res.status(SUCCESS_CREATED).send({
            name: newUser.name,
            email: newUser.email,
          });
        })
        .catch((err) => {
          if (err.name === 'ValidationError') {
            next(new BadRequest('Введены некорректные данные'));
          } else if (err.code === MONGO_DUPLICATE_KEY_ERROR) {
            next(new ConflictError('Такой пользователь уже существует'));
          } else {
            next(err);
          }
        });
    });
};

const loginUser = (req, res, next) => {
  const { email, password } = req.body;

  userSchema
    .findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new Unauthorized('Неправильная почта или пароль');
      }
      return Promise.all([user, bcrypt.compare(password, user.password)]);
    })
    .then(([user, isEqual]) => {
      if (!isEqual) {
        throw new Unauthorized('Неправильная почта или пароль');
      }

      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'diploma_secret_key');

      return res.status(OK).send({ token });
    })
    .catch((err) => {
      if (err.message === 'Unauthorized') {
        next(new Unauthorized('Ошибка авторизации'));
      } else {
        next(err);
      }
    });
};

module.exports = {
  getCurrentUser,
  updateUser,
  registerUser,
  loginUser,
};
