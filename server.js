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
    secret: "secret",
    resave: false,
    saveUninitialized: false,  // Prevents empty sessions
    cookie: { secure: true } // Set to true if using HTTPS
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
app.use(cors ({methods: ['GET', 'POST', 'PUT', 'UPDATE', 'DELETE', 'PATCH']}));
/* app.use(cors ({origin: '*'})); */
app.use(cors({
    origin: '*',
    credentials: true
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

app.get( '/', (req, res) => { res.send (req.session.user !== undefined ? `Logged in as ${req.session.user.displayName}` : 'Logged Out')});

app.get('/github/callback', passport.authenticate('github', 
    { failureRedirect: '/login', session: true }),
    (req, res) => {
    req.session.user = req.user;
    res.redirect('/');
});


mongodb.initDb((err) => {
    if (err) {
        console.log(err);
    } else {
        app.listen(port, () => { console.log(`Database is listening and node running on port ${port}`) });
    }
});