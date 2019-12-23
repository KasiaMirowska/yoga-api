const express = require('express');
const flowsRouter = express.Router();
const FlowsService =require('./flows-service');

flowsRouter
.route('/api/flows')
.get((req,res,next) => {
    const knexInstance = req.app.get('db')
    FlowsService.getAllUserFlows(knexInstance)
        .then(flows => {
            console.log('HERE', flows)
            res.json(flows)
        })
        .catch(next)
})

flowsRouter
.route('/api/flows/:flow_id')
.all((req,res,next) => {
    console.log(req.params, 'KKKKKKKK')
    const knexInstance = req.app.get('db');
    const flowId = req.params.flow_id;
    FlowsService.getAllPosesInFlow(knexInstance, flowId)
        .then(flow => {
            if(!flow) {
                return res.status(400).send({error: {message: `Flow with id ${flowId} doesn't exist`}})
            }
            res.flow = flow;
            next();
        })
        .catch(next)
})
.get((req,res,next) => {
    res.status(200).json(res.flow)
})





module.exports = flowsRouter;