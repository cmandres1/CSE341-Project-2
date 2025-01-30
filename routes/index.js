const router = require('express').Router();
const express = require('express');
const passport = require('passport');

// Define authentication routes first
router.get('/login', passport.authenticate('github'));


router.get('/logout', function (req, res, next) {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

// GitHub OAuth callback route
router.get('/github/callback', passport.authenticate('github', {
    failureRedirect: '/login',
    session: true  // Ensure session is enabled
}), (req, res) => {
    console.log('Logged in user:', req.user);  // Check if user data is available
    res.redirect('/');
});

// Load Swagger documentation after authentication routes
router.use('/', require('./swagger'));

// Register API routes
router.use('/pets', require('./pets'));
router.use('/vets', require('./vets'));


router.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.send(`Logged in as ${req.user.displayName || req.user.username}`);
    } else {
        res.send('Logged Out. <a href="/login">Login</a>');
    }
});

// Catch-all for unknown routes
router.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

module.exports = router;