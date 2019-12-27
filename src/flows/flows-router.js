const express = require('express');
const flowsRouter = express.Router();
const FlowsService = require('./flows-service');
const { requireAuth } = require('../middleware/jwt-auth');
const jsonParser = express.json();
const path = require('path');

flowsRouter
    .route('/api/flows')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        FlowsService.getAllUserFlows(knexInstance)
            .then(flows => {
                res.json(flows)
            })
            .catch(next)
    })

flowsRouter
    .route('/api/flows/')
    .all(requireAuth)
    .post(jsonParser, (req, res, next) => {
        const knexInstance = req.app.get('db');
        const newFlow = {
            title: req.body.title,
            author: req.user.id,
        }

        for (const [key, value] of Object.entries(newFlow)) {
            if (value === null) {
                return res.status(400).send({ error: { message: `Missing ${key}` } });
            }
        }

        FlowsService.postNewFlow(knexInstance, newFlow)
            .then(flow => {
                const currentFlow = {
                    id: flow.id,
                    title: flow.title,
                    author: flow.author,
                    assignedPoses: [],
                    warmUp: [],
                    midFlow: [],
                    peakPose: [],
                    breakPoses: [],
                    afterPeak: [],
                }

                flow = currentFlow;
               
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${flow.id}`))
                    .json(flow)
            }).catch(next)
    })

flowsRouter
    .route('/api/flow')
    .all(requireAuth)
    .post(jsonParser, (req, res, next) => {
        const knexInstance = req.app.get('db');
        const { main_flow_id, pose_id, section_flow_id } = req.body
        const newFlowsPose = {
            main_flow_id,
            author: req.user.id,
            pose_id,
            section_flow_id
        }

        for (const [key, value] of Object.entries(newFlowsPose)) {
            if (value === null) {
                return res.status(400).send({ error: { message: `Missing ${key}` } });
            }
        }

        FlowsService.insertPoseIntoFlows(knexInstance, newFlowsPose)
            .then(flowsPose => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${flowsPose.main_flow_id}`))
                    .json(flowsPose)
            })
    })




flowsRouter
    .route('/api/flows/:flow_id')
    .all(requireAuth)
    .all((req, res, next) => {
        const knexInstance = req.app.get('db');
        const flowId = req.params.flow_id;
        FlowsService.getAllPosesInFlow(knexInstance, flowId)
            .then(flow => {
                if (!flow) {
                    return res.status(400).send({ error: { message: `Flow with id ${flowId} doesn't exist` } })
                }
               
                const currentFlow = {
                    id: flow[0].id,
                    title: flow[0].title,
                    author: flow[0].author,
                    assignedPoses: [],
                    warmUp: [],
                    midFlow: [],
                    peakPose: [],
                    breakPoses: [],
                    afterPeak: [],
                };
                flow.map(pose => {
                    if(pose.pose_id === null){
                        return currentFlow;
                    }
                    currentFlow.assignedPoses.push(pose.pose_id);
                    currentFlow[pose.section].push(pose.pose_id);
                });

                res.flow = currentFlow;
                next();
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.status(200).json(res.flow)
    })





module.exports = flowsRouter;