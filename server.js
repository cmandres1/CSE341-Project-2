const express = require('express');
const bodyParser = require('body-parser');
const mongodb = require('./data/database');
const passport = require('passport');
const session = require('express-session');
const GitHubStrategy = require('passport-github2').Strategy;
const cors = require('cors');

const app = express();

const port = process.env.PORT || 10000;
app.use(bodyParser.json());
app.use(session({
    secret: '6741051366', // Use a secure secret key in production
    resave: false, 
    saveUninitialized: true, 
    cookie: {
        secure: true, // Set to true if using HTTPS
        httpOnly: true, 
        sameSite: 'lax', // Required for cross-site cookies
        maxAge: 24 * 60 * 60 * 1000 // 1-day session expiry
    }
}));

// This is the basic express session ({...}) initialization
app.use(passport.initialize());
// Init passport on every route call
app.use(passport.session());
//allow passport to use express-session
app.use( (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Z-Key, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

app.use(cors({
    origin: 'https://cse341-project-2-2pfk.onrender.com', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow methods
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'], // Allow specific headers
    credentials: true // Allow credentials (cookies) to be sent
}));
app.use('/', require('./routes/index.js'));

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL
}, (accessToken, refreshToken, profile, done) => {
    // Manually set displayName or fallback to username if not available
    profile.displayName = profile.displayName || profile.username;
    return done(null, profile);
}));

passport.serializeUser((user, done) => {
    done(null, user.id); // Store only the user ID in the session
});

passport.deserializeUser((id, done) => {
    done(null, { id: id });
});

app.get('/session', (req, res) => {
    res.json(req.session);
});

app.get('/', (req, res) => {
    console.log('User object:', req.user);  // Debugging the user object
    if (req.isAuthenticated()) {
        res.send(`Logged in as ${req.user.displayName || req.user.username}`);
    } else {
        res.send('Logged Out. <a href="/login">Login</a>');
    }
});

app.get('/github/callback', passport.authenticate('github', 
    { failureRedirect: '/login' }), 
    (req, res) => {
        console.log('User after authentication:', req.user); // Debugging
        req.session.user = req.user; // Store user in session
        console.log('Session after setting user:', req.session); // Debugging
        res.redirect('/');
    });

    app.get('/login', (req, res) => {
        console.log('Session:', req.session);
        console.log('User:', req.user);
        res.send('Logged in');
      });

mongodb.initDb((err) => {
    if (err) {
        console.log(err);
    } else {
        app.listen(port, () => { console.log(`Database is listening and node running on port ${port}`) });
    }
});