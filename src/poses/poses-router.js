const express = require('express');
const posesRouter = express.Router();
const PosesService = require('./poses-service');
const { requireAuth } = require('../middleware/jwt-auth');
const jsonParser = express.json();
const path = require('path');
const xss = require('xss');

const serializePose = (pose) => {
    return ({
        id: pose.id,
        name_eng: xss(pose.name_eng),
        alias: xss(pose.alias),
        name_san: xss(pose.name_san),
        benefits: xss(pose.benefits),
        pose_level: xss(pose.pose_level),
        pose_type: xss(pose.pose_type),
        img: xss(pose.img),
        video: pose.video,
    })
}

const serializeAttPose = (pose) => {
    return ({
        id: pose.id,
        name_eng: xss(pose.name_eng),
        alias: xss(pose.alias),
        name_san: xss(pose.name_san),
        benefits: xss(pose.benefits),
        pose_level: xss(pose.pose_level),
        pose_type: xss(pose.pose_type),
        img: xss(pose.img),
        video: pose.video,
        attributesList: pose.attributesList.map(att => xss(att)),
        notes: pose.notes.map(note => xss(note)),
    })
}

posesRouter
    .route('/api/poses')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        PosesService.getAllPoses(knexInstance)
            .then(poses => {
                res.status(200).json(poses.map(serializePose))
            })
    })

posesRouter
    .route('/api/flow/:pose_id')
    .all(requireAuth)
    .all((req, res, next) => {
        const knexInstance = req.app.get('db');
        const poseId = req.params.pose_id;
        PosesService.getPoseById(knexInstance, poseId)
            .then(pose => {
                if (!pose) {
                    return res.status(404).send({ error: { message: `Pose with id ${poseId} doesn't exist` } })
                }
                res.pose = pose;
                next()
            })
            .catch(next);
    })
    .get((req, res, next) => {
        res.status(200).json(serializePose(res.pose));
    });

posesRouter
    .route('/api/flow/:flow_id/:pose_id')
    .all(requireAuth)
    .all((req, res, next) => {
        const knexInstance = req.app.get('db');
        const poseId = Number(req.params.pose_id);
        const flowId = Number(req.params.flow_id);
        PosesService.getPoseById(knexInstance, poseId)
            .then(pose => {
                if (!pose) {
                    return res.status(404).send({ error: { message: `Pose with id ${poseId} doesn't exist` } })
                }
                res.pose = pose;

                PosesService.getPoseAttNotesById(knexInstance, poseId, flowId)
                    .then(attributes => {
                        if (!attributes[0]) {
                            res.status(200).json(serializePose(res.pose));
                        } else {
                            let attributesList = {};
                            let notes = {};

                            attributes.forEach(att => attributesList[att.attribute] = true)
                            attributes.forEach(att => notes[att.notes] = true)

                            res.poseAttributes = {
                                ...res.pose,
                                attributesList: Object.keys(attributesList),
                                notes: Object.keys(notes)
                            };

                            next()
                        }
                        next()
                    })
                    .catch(next)
            })
    })
    .get((req, res, next) => {
        res.status(200).json(serializeAttPose(res.poseAttributes));
    });


   
posesRouter
    .route('/api/flow-att/:pose_id')
    .all(requireAuth)
    .post(jsonParser, (req, res, next) => {
        console.log('HERE?????????????')
        const knexInstance = req.app.get('db');
        const author = req.user.id;
        const { assigned_flow_id, pose_id, attributes } = req.body;
        console.log(req.body, 'BODY')
        for (const [key, value] of Object.entries(req.body)) {
            if (value === null) {
                return res.status(400).send({ error: { message: `Missing ${key}` } });
            }
        }

        Promise.all(attributes.map((att, index) => {
            console.log('HERE?????????????', att)
            PosesService.insertPoseAttribute(knexInstance, {
                assigned_flow_id,
                author: author,
                pose_id,
                attribute: att
            })
                .then(saved => {
                    if (!saved) {
                        return res.status(500).send({ error: { message: `Error saving ${att} at ${index} to DB` } });
                    }
                    return saved;
                })
        }))
            .then(saved => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${saved.pose_id}`))
                    .json(saved);

            })
            .catch(next)

    })

posesRouter
    .route(('/api/flow-note/:pose_id'))
    .all(requireAuth)
    .post(jsonParser, (req, res, next) => {
        const knexInstance = req.app.get('db');
        const { assigned_flow_id, pose_id, notes } = req.body;
        const author = req.user.id;
        const newNote = { assigned_flow_id, pose_id, author, notes };
        console.log(newNote, 'NEWNOTE')
        for (const [key, value] in Object.entries(newNote)) {
            if (value === null) {
                return res.status(400).send({ error: { message: `Missing ${key}` } })
            }
        }
        PosesService.insertNote(knexInstance, newNote)
            .then(note => {
                console.log(path.posix.join(req.originalUrl, `/${note.id}`))
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${note.id}`))
                    .json(note)
            }).catch(next)
    })
module.exports = posesRouter;

