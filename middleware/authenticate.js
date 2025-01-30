function isAuthenticated(req, res, next) {
    console.log("Session User:", req.session.user);
    console.log("Passport User:", req.user);

    if (req.isAuthenticated()) { 
        return next();
    }

    res.status(401).json({ message: "Unauthorized - Please log in" });
}

module.exports = { isAuthenticated };

