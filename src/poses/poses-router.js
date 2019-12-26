const express = require('express');
const posesRouter = express.Router();
const PosesService = require('./poses-service');
const {requireAuth} = require('../middleware/jwt-auth');

posesRouter
.route('/api/poses')
.get((req,res,next) => {  
    const knexInstance = req.app.get('db')
    PosesService.getAllPoses(knexInstance)
        .then(poses => {
            res.json(poses)
        })
})

posesRouter
.route('/api/flow/:pose_id')
.all(requireAuth)
.all((req,res,next) => {
    const knexInstance = req.app.get('db');
    const poseId = req.params.pose_id;
    PosesService.getPoseById(knexInstance, poseId)
        .then(pose => {
            if(!pose) {
                return res.status(400).send({error: {message: `Pose with id ${poseId} doesn't exist`}})
            }
            res.pose = pose;
            next()
        })
        .catch(next);
})
.get((req,res,next) => {
    res.status(200).json(res.pose);
});

module.exports = posesRouter;

// PosesService.getFlowPoseById(knexInstance, poseId)
//         .then(pose => {
//             console.log(pose, 'POSE POSEE')
//             if(!pose){
//                 return res.status(400).send({error: {message: `There is no pose with id ${poseId} in this flow`}})
//             }
//             res.pose = pose;
//         })
//         .then(() => {
//             PosesService.getAttributeIdsByPoseId(knexInstance, poseId)
//             .then(attributes => {
//                 if(attributes.length === 0){
//                     return res.status(200).json(res.pose);

//                 }
//                 res.pose.attributesList = [];
//                 attributes.forEach(attribute => {
//                     res.pose.attributesList.push(attribute.attribute);
//                 });
//                 next();
//             })
//         })
//         .catch(next);
// })