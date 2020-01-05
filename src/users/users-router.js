const express = require('express');
const usersRouter = express.Router();
const jsonBodyParser = express.json();
const UsersService = require('./users-service');


usersRouter
.route('/api/register')
.post(jsonBodyParser, (req, res, next) => {
    console.log(req.body)
    for(const field of ['fullname', 'username', 'password']) {
        if(!req.body[field]) {
            
            return res.status(400).json({error: {message: `Missing ${field}`}})
        }
    }

    const {fullname, username, password} = req.body
    const passwordError = UsersService.validatePassword(password)
    if (passwordError) {
      return res.status(400).json({ error: {message: passwordError }})
    }

    const knexInstance = req.app.get('db');
    UsersService.hasUserWithUserName(knexInstance, username)
        .then(takenUser => {
            if(takenUser) {
                return res.status(400).json({error: {message:`Username already taken` }})
            }
            return UsersService.hashPassword(password)
                .then(hashedPassword => {
                    const newUser = {
                        fullname,
                        username,
                        password: hashedPassword,
                    }
                    return UsersService.insertUser(knexInstance, newUser)
                    .then(user => {
                        return res
                            .status(201)
                            .location(path.posix.join(req.originalUrl, `/$user.id`))
                            .json(user)
                    })
                })
        })
        .catch(next)
})

module.exports = usersRouter;