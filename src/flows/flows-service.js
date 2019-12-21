const FlowsService = {
    getAllFlows: (knex) => {
        return knex
        .from('flows AS fl')
        .select('*')
        .leftJoin(
            'users AS usr',
            'usr.author',
            'usr.id'
            )
        .rightJoin(
            'flows-poses AS fl_ps',
            'fl_ps.main_flow_id',
            'fl.id'
            )
        .rightJoin(
            'pose_attributes AS ps_a',
            'ps_a.assigned_flow',
            'fl.id'
        )
    }
}