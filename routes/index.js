const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');
const { catchErrors } = require('../handlers/errorHandlers');

// Stores Routes
router.get('/', catchErrors(storeController.getStores));
router.get('/stores', catchErrors(storeController.getStores));
router.get('/stores/page/:page', catchErrors(storeController.getStores));
router.get('/add', authController.isLoggedIn, storeController.addStore);
router.get('/store/:id/edit', catchErrors(storeController.editStore));
router.get('/store/:slug', catchErrors(storeController.getStoreBySlug));
router.get('/top', catchErrors(storeController.getTopStores));


router.post(
  '/add',
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.createStore)
);
router.post(
  '/edit/:id',
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.updateStore)
);

// Tags Routes
router.get('/tags', catchErrors(storeController.getStoresByTag));
router.get('/tags/:tag', catchErrors(storeController.getStoresByTag));

// Login Routers
router.get('/login', userController.loginForm);
router.get('/logout', authController.logout);
router.get('/register', userController.registerForm);

router.post('/login', authController.login);
router.post(
  '/register',
  userController.validateRegister,
  catchErrors(userController.register),
  authController.login
);

// Profile routes
router.get('/account', userController.account);
router.post('/account', catchErrors(userController.updateAccount));
router.post('/account/forgot', catchErrors(authController.forgot));
router.get(
  '/account/reset/:token',
  catchErrors(authController.checkResetToken),
  authController.reset
);
router.post(
  '/account/reset/:token',
  authController.checkPasswordsMatch,
  catchErrors(authController.checkResetToken),
  catchErrors(authController.updatePassword)
);

// Map routes
router.get('/map', storeController.map);

// Fav routes
router.get(
  '/favorites',
  authController.isLoggedIn,
  catchErrors(storeController.favoritesPage)
);

// Reviews routes
router.post(
  '/reviews/:storeId',
  authController.isLoggedIn,
  catchErrors(reviewController.addReview)
);

// API routes
router.get('/api/search', catchErrors(storeController.search));
router.get('/api/stores/near', catchErrors(storeController.mapStores));
router.post('/api/stores/:id/favorite', catchErrors(storeController.favorite));

module.exports = router;
