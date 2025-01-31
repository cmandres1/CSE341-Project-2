const router = require('express').Router();
const express = require('express');
const passport = require('passport');

// Define authentication routes first
router.get('/login', passport.authenticate('github'));

// Logout route
router.get('/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});


// Load Swagger documentation after authentication routes
router.use('/', require('./swagger'));

// Register API routes
router.use('/pets', require('./pets'));
router.use('/vets', require('./vets'));

// Catch-all for unknown routes
router.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

module.exports = router;