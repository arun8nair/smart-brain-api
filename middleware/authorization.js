const redisClient = require('../controllers/signin').redisClient

const requireAuth = (req, res, next) => {
    const { authorization } = req.headers;
    console.log("in middleware")
    if(!authorization) return res.status(401).json('Unauthorised')
    
    return redisClient.get(authorization, (err, reply) => {
        if(err || !reply) {
            return res.status(401).json('Unauthorised')
        }
        return next();
    });
    return next();
}

module.exports = {
    requireAuth
}