const router = require('express').Router();
const express = require('express');
const passport = require('passport');
const { route } = require('./swagger');

// Define authentication routes first
router.get('/login', passport.authenticate('github'), (req, res) => {});

// Logout route
router.get('/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

// GitHub OAuth callback route
router.get(
    '/github/callback',
    passport.authenticate('github', {
        failureRedirect: '/login',
        session: true // Ensure Passport handles session
    }),
    (req, res) => {
        console.log('Logged in user:', req.user); // Debug log to check user object
        res.redirect('/');
    }
);

// Load Swagger documentation after authentication routes
router.use('/', require('./swagger'));

// Register API routes
router.use('/pets', require('./pets'));
router.use('/vets', require('./vets'));

// Home route
router.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.send(`Logged in as ${req.user.username || req.user.displayName}`);
  } else {
    res.send('Logged out');
  }
});

// Catch-all for unknown routes
router.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

module.exports = router;