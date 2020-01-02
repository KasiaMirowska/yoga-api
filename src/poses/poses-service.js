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

    getPoseAttributesById: (knex, poseId, flowId) => {
        return knex
            .from('pose_attributes AS ps_att')
            .select(
                'ps_att.attribute',
                'ps_att.pose_id',
                'ps_att.assigned_flow_id',
                'ps_att.author',
                'pn.notes'
            )

            .join(
                'pose_notes AS pn',
                'ps_att.pose_id',
                'pn.pose_id'
            )
            .where(
                {
                    'ps_att.assigned_flow_id': flowId,
                    'ps_att.pose_id': poseId,
                }
            )

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
                'attribute',
                'ps_att.assigned_flow_id'
            )
            .join(
                'yoga_poses AS ps',
                'ps.id',
                'ps_att.pose_id'
            )
            .where(
                'ps_at.pose_id',
                poseId
            )
    }

}

module.exports = PosesService;
