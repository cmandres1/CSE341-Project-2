const express = require('express');
const bodyParser = require('body-parser');
const mongodb = require('./data/database');
const passport = require('passport');
const session = require('express-session');
const GitHubStrategy = require('passport-github2').Strategy;
const cors = require('cors');
const MongoStore = require('connect-mongo');

const app = express();
const port = process.env.PORT || 10000;

app.use(bodyParser.json());

app.use(
    session({
        secret: 'secret', // Use a secure secret key in production
        resave: false,
        saveUninitialized: true,
        store: MongoStore.create({ 
            mongoUrl: process.env.MONGO_URI,
            ttl: 24 * 60 * 60 
        }),
        cookie: {
            secure: true, // Set to true if using HTTPS
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 1-day session expiry
        },
        name : 'sessionID'
    })
);

// Initialize Passport and session management
app.use(passport.initialize());
app.use(passport.session());

// Set CORS and security headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://cse341-project-2-2pfk.onrender.com');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader(
        'Access-Control-Allow-Headers' ,
        'Origin, X-Requested-With, Content-Type, Accept, Z-Key, Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
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
            try {
                if (!profile || !profile.id) {
                  console.error("GitHub authentication failed: No profile received.");
                  return done(null, false, { message: "GitHub authentication failed" });
                }
        
                console.log("GitHub OAuth callback received:", {
                  profileId: profile.id,
                  username: profile.username,
                  displayName: profile.displayName
                });
        
                // Create user object
                const user = {
                  id: profile.id,
                  username: profile.username,
                  displayName: profile.displayName || profile.username,
                  provider: "github",
                };
            return done(null, profile); 
        } catch (error) {
            console.error("Error in GitHub OAuth callback:", error);
            return done(error); 
        }
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
    if (req.isAuthenticated()) {
      res.send(`Logged in as ${req.user.username || req.user.displayName}`);
    } else {
      res.send('Logged out');
    }
  });

// GitHub authentication callback
app.get(
    '/github/callback',
    passport.authenticate('github', { failureRedirect: '/api-docs' , session: true}),
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
