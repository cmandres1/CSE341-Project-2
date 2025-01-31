const express = require('express');
const bodyParser = require('body-parser');
const mongodb = require('./data/database');
const passport = require('passport');
const session = require('express-session');
const GitHubStrategy = require('passport-github2').Strategy;
const cors = require('cors');
const MongoStore = require('connect-mongo');
import router from './routes/index.js';

const app = express();
const port = process.env.PORT || 10000;

app.use(bodyParser.json());

app.use(
    session({
      secret:'secret',
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 24 * 60 * 60 // 1 day
      }),
      cookie: {
        secure: true, // Set to true since you're using HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'lax', // Helps with cross-site requests, use 'strict' for stricter policies
        path: '/', // Available to all routes
      },
      name: 'sessionId'
    })
  );

// Initialize Passport and session management
app.use(passport.initialize());
app.use(passport.session());

// Set CORS and security headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://cse341-project-2-2pfk.onrender.com'); // Force HTTPS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Z-Key, Authorization'
    );
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, OPTIONS, DELETE'
    );
    next();
  });

app.use(
    cors({
        origin: ['https://cse341-project-2-2pfk.onrender.com'],
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
        callbackURL: process.env.CALLBACK_URL || "https://cse341-project-2-2pfk.onrender.com/github/callback",
      },
      async function (accessToken, refreshToken, profile, done) {
        try {
          if (!profile || !profile.id) {
            console.error("GitHub authentication failed: No profile received.");
            return done(null, false, { message: "GitHub authentication failed" });
          }
  
          console.log("GitHub OAuth callback received:", {
            profileId: profile.id,
            username: profile.username,
            displayName: profile.displayName || profile.username,
          });
  
          // Set the displayName to username if displayName is not provided by GitHub
          const user = {
            id: profile.id,
            username: profile.username,
            displayName: profile.displayName || profile.username,  // Default to username if displayName is null
            provider: "github",
          };
  
          return done(null, user);
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

// Debug middleware
app.use((req, res, next) => {
  console.log('Session:', {
    isAuthenticated: req.isAuthenticated?.(),
    sessionID: req.sessionID,
    user: req.user?.username
  });
  next();
});

// Debug route
app.get('/debug-session', (req, res) => {
  res.json({
    isAuthenticated: req.isAuthenticated(),
    user: req.user,
    session: req.session
  });
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
    (req, res, next) => {
      console.log('Entering callback route');
      next();
    },
    passport.authenticate('github', { failureRedirect: '/api-docs', session: true }),
    (req, res) => {
      console.log('Authentication successful', { user: req.user?.username });
      // Store user info in session
      req.session.user = req.user; // Make sure this is done after successful login
      res.redirect('/');
    }
  );

  app.get('/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      // Destroy the session and remove the session cookie
      req.session.destroy((err) => {
        if (err) {
          return next(err);
        }
        res.clearCookie('sessionId'); // Clear session cookie
        res.redirect('/'); // Redirect to home after logout
      });
    });
  });
  
  // Use router for all routes
app.use('/', router);

  app.use((req, res, next) => {
    console.log('Session:', req.session);
    next();
  });

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
