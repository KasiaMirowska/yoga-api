BEGIN;

INSERT INTO pose_attributes (author, assigned_flow_id, pose_id, attribute_id)
VALUES
(1, 1, 14, 2),
(1, 1, 14, 4),
(1, 1, 14, 5),
(1, 1, 14, 8), 
(1, 1, 4, 3),
(1, 1, 1, 5),
(1, 1, 1, 6),
(1, 1, 8, 6);
COMMIT;