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
    getPoseById: (knex, poseId) => {
        return knex 
            .from('yoga_poses AS ps')
            .select(
                'ps.id',
                'ps.name_eng',
                'ps.name_san',
                'ps.benefits',
                'ps.pose_type',
                'ps.pose_level',
                'ps.img',
                'ps.video',
            )
            .where(
                'ps.id',
                poseId
            )
            .first()


    },


    getFlowPoseById: (knex, id) => {
        return knex
            .from('yoga_poses AS ps')
            .select(
                'ps.id',
                'ps.name_eng',
                'ps.name_san',
                'ps.pose_type',
                'ps.pose_level',
                'ps.img',
                'ps.video',
                'fl_ps.main_flow_id',
                'fl_ps.author',
                'fl_ps.section_flow_id',
                'sfl.section',
                'pn.notes'
            )
            .join(
                'flows_poses AS fl_ps',
                'ps.id',
                'fl_ps.pose_id',
            )
            .join(
                'section_flows AS sfl',
                'fl_ps.section_flow_id',
                'sfl.id'
            )
            .join(
                'pose_notes AS pn',
                'ps.id',
                'pn.pose_id'
            )
            .where(
                'ps.id',
                id
            )
            .first()
    },

    insertPoseAttribute: (knex, newAttribute) => {
        return knex 
            .insert(newAttribute)
            .into('pose_attributes')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },

     insertNote: (knex, newNote) => {
         return knex
            .insert(newNote)
            .into('pose_notes')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
     },

    getAttributeIdsByPoseId: (knex, poseId) => {
        return knex
            .from('pose_attributes AS ps_at')
            .select(
                'ps_at.pose_id',
                'ps_at.attribute_id',
                'at_l.attribute',
            )
            .join(
                'attributes_list AS at_l',
                'at_l.id',
                'ps_at.attribute_id'
            )
            .where(
                'ps_at.pose_id',
                poseId
            )
    }

}

module.exports = PosesService;
