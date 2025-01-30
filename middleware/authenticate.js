const isAuthenticated = (req, res, next) => {
    console.log('Session data:', req.session); 
    if (!req.session.user) {
       return res.status(401).json('You do not have access.');
    }
    next();
};

module.exports = {
    isAuthenticated
};