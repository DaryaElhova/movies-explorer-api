const router = require('express').Router();
const usersController = require('../controllers/users');
const { auth } = require('../middlewares/auth');
const { validateUpdateUser } = require('../middlewares/validate');

router.use(auth);
router.get('/users/me', usersController.getCurrentUser);
router.patch('/users/me', validateUpdateUser, usersController.updateUser);

module.exports = router;
