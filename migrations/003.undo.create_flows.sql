ALTER TABLE flows_poses
    DROP COLUMN main_flow_id
ALTER TABLE pose_attributes
    DROP COLUMN assigned_flow_id;

DROP TABLE IF EXISTS flows;