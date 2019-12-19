DROP TABLE IF EXISTS pose_notes;

CREATE TABLE pose_notes (
    pose_id REFERENCES yoga_poses(id) ON DELETE SET NULL,
    author REFERENCEs users(id) ON DELETE CASCADE NOT NULL,
    notes TEXT
)