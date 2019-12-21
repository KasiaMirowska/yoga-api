const express = require('express');
const posesRouter = express.Router();
const PosesService = require('./poses-service');


posesRouter
.route('/api/poses')
.get((req,res,next) => {  
    const knexInstance = req.app.get('db')
    PosesService.getAllPoses(knexInstance)
        .then(poses => {
            res.json(poses)
        })
})

module.exports = posesRouter;