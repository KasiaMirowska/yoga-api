const AuthService = require('../auth/auth-service');

function requireAuth(req,res,next) {
    const authToken = req.get('Authorization') || '';

    let bearerToken;
    if (!authToken.toLowerCase().startsWith('bearer')) {
        return res.status(401).json({error: {message: 'Mising bearer token'}});
    } else {
        bearerToken = authToken.slice(7, authToken.length);
    }

    try{
        const payload = AuthService.verifyJwt(bearerToken);
        const knexInstance = req.app.get('db');
        AuthService.getUserWithUserName(knexInstance, payload.sub)
        .then(user => {
            if(!user) {
                return res.status(401).json({error: {message: 'Unauthorized request'}});
            }
            req.user = user;
            next();
        })
        .catch(error => {
            next(error);
        });
    }
    catch(error) {
        return res.status(401).json({error: {message: 'Unauthorized request'}});
    }
}

module.exports = { requireAuth };