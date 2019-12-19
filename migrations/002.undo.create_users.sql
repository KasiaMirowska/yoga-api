ALTER TABLE flows
    DROP COLUMN author;
ALTER TABLE flows_poses
    DROP COLUMN author;
ALTER TABLE pose_attributes
    DROP COLUMN author;
ALTER pose_notes
    DROP COLUMN author;

DROP TABLE IF EXISTS users;