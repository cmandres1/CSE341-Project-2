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
    secret: 'secret', 
    resave: false, 
    saveUninitialized: true, 
    cookie: {
        secure: true, // Set to true if using HTTPS
        httpOnly: true, 
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
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow methods
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'], // Allow specific headers
    credentials: true // Allow credentials (cookies) to be sent
}));
app.use('/', require('./routes/index.js'));

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL
}, function (accessToken, refreshToken, profile, done) {
    return done(null, profile);
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

app.get('/', (req, res) => {
    if (req.session.user) {
        res.send(`Logged in as ${req.session.user.displayName}`);
    } else {
        res.send('Logged Out. <a href="/login">Login</a>');
    }
});

app.get('/github/callback', passport.authenticate('github', 
    { failureRedirect: '/login' }), 
    (req, res) => {
        req.session.user = req.user; // Store user in session
        res.redirect('/');
    });


mongodb.initDb((err) => {
    if (err) {
        console.log(err);
    } else {
        app.listen(port, () => { console.log(`Database is listening and node running on port ${port}`) });
    }
});