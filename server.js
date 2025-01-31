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

app.use(
    session({
        secret: 'secret', // Use a secure secret key in production
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: process.env.NODE_ENV === 'production', // Set to true if using HTTPS
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 1-day session expiry
        }
    })
);

// Initialize Passport and session management
app.use(passport.initialize());
app.use(passport.session());

// Set CORS and security headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Z-Key, Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

app.use(
    cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed methods
        allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'], // Allowed headers
        credentials: true // Allow credentials (cookies) to be sent
    })
);

app.use('/', require('./routes/index.js'));

// Configure GitHub authentication
passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: process.env.CALLBACK_URL
        },
        function (accessToken, refreshToken, profile, done) {
            return done(null, profile);
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Home route
app.get('/', (req, res) => {
    console.log('Current session:', req.session);
    if (req.session.user) {
        res.send(`Logged in as ${req.session.user.displayName}`);
    } else {
        res.send('Logged Out. <a href="/login">Login</a>');
    }
});

// GitHub authentication callback
app.get(
    '/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    (req, res) => {
        console.log('User after authentication:', req.user); // Debugging
        req.session.user = req.user; // Store user in session
        console.log('Session after setting user:', req.session); // Debugging
        res.redirect('/');
    }
);

// Initialize database and start server
mongodb.initDb((err) => {
    if (err) {
        console.log(err);
    } else {
        app.listen(port, () => {
            console.log(`Database is listening and Node.js server is running on port ${port}`);
        });
    }
});