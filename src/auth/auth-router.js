const express = require('express');
const authRouter = express.Router();
const jsonBodyParser = express.json();
const AuthService = require('./auth-service');

authRouter
    .post('/api/login', jsonBodyParser, (req, res, next) => {
        const { userName, password } = req.body;
        const loginUser = { userName, password }; 
        for (const [key, value] of Object.entries(loginUser)) {
            if (value == null) {
                return res.status(400).json({ error: { message: `Missing ${key}` } })
            }
        }
        const knexInstance = req.app.get('db')
        
        AuthService.getUserWithUserName(knexInstance, loginUser.userName)

            .then(dbUser => {
                if (!dbUser) {
                    return res.status(400).send({ error: { message: 'Incorrect user_name or password' } })
                }
                return AuthService.comparePasswords(loginUser.password, dbUser.password)
              
                    .then(compareMatch => {
                        if (!compareMatch) {
                            return res.status(400).json({ error: { message: 'Incorrect user_name or password' } })
                        }
                        const subject = dbUser.username;
                        const payload = { user_id: dbUser.id}
                        
                        return res.json({authToken: AuthService.createJwt(subject, payload)})
                    })
            })
            .catch(next)
    })
    module.exports = authRouter;