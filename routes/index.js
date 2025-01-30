const router = require('express').Router();
const passport = require('passport');

// Define authentication routes first
router.get('/login', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/logout', function (req, res, next) {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

// Load Swagger documentation after authentication routes
router.use('/', require('./swagger'));

// Basic Hello World endpoint
/* router.get('/', (req, res) => {
    res.send("Hello User!");
}); */
router.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.send(`Logged in as ${req.user.displayName || req.user.username}`);
    } else {
        res.send('Logged Out. <a href="/login">Login</a>');
    }
});

// Register API routes
router.use('/pets', require('./pets'));
router.use('/vets', require('./vets'));

// Catch-all for unknown routes
router.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

module.exports = router;