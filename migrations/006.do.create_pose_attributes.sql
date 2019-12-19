DROP TABLE IF EXISTS pose_attributes;

CREATE TABLE pose_attributes (
    author REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    assigned_flow_id REFERENCES flows(id) ON DELETE CASCADE NOT NULL,
    pose_id REFERENCES yoga_poses(id) ON DELETE SET NULL,
    attribute_id REFERENCES attributes_list(id) ON DELETE SET NULL,
    
)

