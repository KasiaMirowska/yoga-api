const FlowsService = {
    getAllUserFlows: (knex) => {
        return knex
            .from('flows AS fl')
            .select(
                'fl.id',
                'fl.title',
                'fl.peakpose',
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
                console.log(rows[0], 'MMMMMMMMMMMMMMM')
                rows[0]
            })
    },

    getAllPosesInFlow: (knex, flowId) => {
        return knex
            .from('flows_poses AS fl_ps')
            .select(
                'fl_ps.main_flow_id',
                'fl.title',
                'fl_ps.author',
                'fl_ps.pose_id',
                'fl.peakpose',
                'fl_ps.section_flow_id',
                'sfl.section',
            )
            .join(
                'flows AS fl',
                'fl.id',
                'fl_ps.main_flow_id')
            .join(
                'section_flows AS sfl',
                'fl_ps.section_flow_id',
                'sfl.id'
            )
            .where(
                'fl_ps.main_flow_id',
                flowId
            )
            

    }

}
module.exports = FlowsService;