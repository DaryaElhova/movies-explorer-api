require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { errors } = require('celebrate');

const { requestLogger, errorLogger } = require('./middlewares/logger');

// роуты
const userRouter = require('./routes/users');
const movieRouter = require('./routes/movies');
const { validateAuth, validateRegisterUser } = require('./middlewares/validate');
const { loginUser, registerUser } = require('./controllers/users');

// централизованный обработчик ошибок
const { errorHandler } = require('./middlewares/error-handler');

const {PORT = 3000} = process.env;
// Подключение базы данных
mongoose.connect('mongodb://127.0.0.1/moviesdb')
  .then(() => {
    console.log('Connecting to database...')
  })
  .catch((err) => {
    console.log(`Ошибка ${err.message}`);
  });

const app = express();
app.use(cors());
app.use(express.json());

app.use(requestLogger);

// подключить роуты
app.post('/signin', validateAuth, loginUser);
app.post('/signup', validateRegisterUser, registerUser);
app.use(userRouter);
app.use(movieRouter);

app.use(errorLogger);

// обработчик ошибок celebrate
app.use(errors());
// централизованный обработчик ошибок
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
});