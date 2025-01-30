const isAuthenticated = (req, res, next) => {
/*     console.log('Is user authenticated?', req.isAuthenticated()); */
    if (!req.isAuthenticated()) {
        return res.status(401).json('You do not have access.');
    }
    next();
};


module.exports = { isAuthenticated };