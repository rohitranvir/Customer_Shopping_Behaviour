const router = require('express').Router();
const { registerVendor, loginVendor } = require('../controllers/authController');

router.post('/register', registerVendor);
router.post('/login', loginVendor);

module.exports = router;
