function isAuthenticated(options = {}) {
    return function(req, res, next) {
        if (typeof req.isAuthenticated !== 'function') {
            return res.status(500).json({ message: "Authentication middleware not configured correctly" });
        }

        if (req.isAuthenticated()) {
            return next();
        }

        if (options.redirectTo) {
            return res.redirect(options.redirectTo);
        }

        if (req.accepts('json')) {
            res.status(401).json({ message: options.message || "Unauthorized - Please log in" });
        } else {
            res.status(401).send('Unauthorized - <a href="/login">Please log in</a>');
        }
    };
}

module.exports = isAuthenticated;