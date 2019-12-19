const PosesService = {
    getAllPoses: (knex) => {
        return knex
            .from('yoga_poses AS ps').select(
            'ps.id',
            'ps.name_eng',
            'ps.name_san',
            'ps.pose_type',
            'ps.pose_level',
            'ps.img'
        );
    },
    getPoseById: (knex, id) {
        return knex
            .from('yoga_poses AS ps').select('*')
            .rightJoin(
                'flows_poses AS fl_ps',
                'ps.id',
                'fl_ps.pose_id',
            )
            .leftJoin(
                'pose_attributes AS psa',
                'ps'
            )
    }
}