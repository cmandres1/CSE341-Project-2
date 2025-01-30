const express = require('express');
const bodyParser = require('body-parser');
const mongodb = require('./data/database');
const passport = require('passport');
const session = require('express-session');
const GitHubStrategy = require('passport-github2').Strategy;
const cors = require('cors');

const app = express();

const port = process.env.PORT || 10000; // Render will provide the PORT
app.use(bodyParser.json());

// Session configuration
app.use(session({
    secret: 'fallback-secret', // Use environment variable
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Enable secure cookies in production
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1-day session expiry
    }
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// CORS configuration
app.use(cors({
    origin: '*', // Allow specific origins in production
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
    credentials: true
}));

// Routes
app.use('/', require('./routes/index.js'));

// GitHub OAuth strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL || 'https://cse341-project-2-2pfk.onrender.com/github/callback'
}, function (accessToken, refreshToken, profile, done) {
    return done(null, profile);
}));

// Serialize and deserialize user
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Start server
mongodb.initDb((err) => {
    if (err) {
        console.error('Failed to connect to the database:', err);
        process.exit(1); // Exit if database connection fails
    } else {
        app.listen(port, () => {
            console.log(`Database is listening and node running on port ${port}`);
        });
    }
});