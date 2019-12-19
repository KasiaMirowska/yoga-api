ALTER TABLE flows_poses
    DROP COLUMN pose_id;
ALTER TABLE pose_attributes
    DROP COLUMN pose_id;
ALTER TABLE pose_notes
    DROP COLUMN pose_id;


DROP TABLE IF EXISTS yoga_poses;