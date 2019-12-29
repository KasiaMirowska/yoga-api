DROP TABLE IF EXISTS pose_attributes;

CREATE TABLE pose_attributes (
    author INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    assigned_flow_id INTEGER REFERENCES flows(id) ON DELETE CASCADE NOT NULL,
    pose_id INTEGER REFERENCES yoga_poses(id) ON DELETE SET NULL,
    attribute TEXT NOT NULL  
);

