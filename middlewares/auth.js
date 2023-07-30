const jwt = require('jsonwebtoken');
const { NODE_ENV, JWT_SECRET } = process.env;
const Unauthorized = require('../utils/errorConstructor/Unauthorized');

const auth = (req, res, next) => {
  const { authorization } = req.headers;

  // проверяем наличие заголовка
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new Unauthorized('Необходима авторизация');
  }
  // извлекаем токен
  const token = authorization.replace('Bearer ', '');

  let payload;

  try {
    //verify вернет пейлоад токена если она прошел проверку
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'diploma_secret_key', { expiresIn: '7d' })
  } catch(err) {
    throw new Unauthorized('Необходима авторизация');
  }

  req.user = payload;

  return next();
};

module.exports = {
  auth,
};
