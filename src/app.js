require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const app = express();
const posesRouter = require('./poses/poses-router');
const usersRouter =require('./users/users-router');
const authRouter = require('./auth/auth-router');
const flowsRouter = require('./flows/flows-router');
const morganOption = (NODE_ENV === 'production')? 'tiny' : 'common';

const {CLIENT_ORIGIN} = require('./config');

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use(authRouter);
app.use(usersRouter);
app.use(posesRouter);
app.use(flowsRouter);


app.get('/', (req, res) => {
    res.send('Hello, from yoga capstone!');
});

app.use(function errorHandler(error, req, res, next) {
    let response;
    if(NODE_ENV === 'production') {
        response = { error: { message: 'server error'} };
    } else {
        console.error(error);
        response = { message: error.message, error };
    }
    res.status(500).json(response);
});

module.exports = app;
