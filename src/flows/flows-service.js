const FlowsService = {
    getAllUserFlows: (knex) => {
        return knex
            .from('flows AS fl')
            .select(
                'fl.id',
                'fl.title',
                'fl.author')
            .join(
                'users AS usr',
                'fl.author',
                'usr.id'
            )
         
    },
    postNewFlow : (db, newFlow) => {
        return db
            .insert(newFlow).into('flows').returning('*')
            .then(rows => rows[0])
    },

    insertPoseIntoFlows: (knex, flowsPose) => {
        return knex
            .insert(flowsPose).into('flows_poses').returning('*')
            .then(rows => {
                return rows[0]
            })
    },

    getAllPosesInFlow: (knex, flowId) => {
        return knex
            .from('flows AS fl')
            .select(
                'fl.title',
                'fl.id',
                'fl_ps.main_flow_id',
                'fl_ps.author',
                'fl_ps.pose_id',
                'fl_ps.section_flow_id',
                'sfl.section',
            )
            .leftJoin(
                'flows_poses AS fl_ps',
                'fl.id',
                'fl_ps.main_flow_id')
            .leftJoin(
                'section_flows AS sfl',
                'fl_ps.section_flow_id',
                'sfl.id'
            )
            .where(
                'fl.id',
                flowId
            )
            

    },

    deletePoseFromFlow: (knex, poseId,flowId) => {
        return knex.from('flows_poses').select('*').where({pose_id: poseId, main_flow_id: flowId}).delete();
    }

}
module.exports = FlowsService;