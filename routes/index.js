const router = require('express').Router();
const express = require('express');
const passport = require('passport');
const isAuthenticated = require('../middleware/authenticate');

// Define authentication routes first
router.get('/login', passport.authenticate('github'));

router.get('/logout', function (req, res, next) {
    req.logout(function(err) {
        if (err) { 
            console.error('Logout error:', err);
            return res.status(500).json({ message: 'Logout failed' });
        }
        res.redirect('/');
    });
});

// GitHub OAuth callback route
router.get('/github/callback', passport.authenticate('github', {
    failureRedirect: '/login',
    session: true
}), (req, res) => {
    console.log('User after authentication:', req.user); // Debugging
    req.session.user = req.user; // Store user in session
    console.log('Session after setting user:', req.session); // Debugging
    res.redirect('/');
});

// Load Swagger documentation after authentication routes
router.use('/', require('./swagger'));

// Register API routes
router.use('/pets', require('./pets'));
router.use('/vets', require('./vets'));

// Home route
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

// Error handling middleware
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = router;