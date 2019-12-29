BEGIN;



INSERT INTO flows_poses (main_flow_id, author, pose_id, section_flow_id)
VALUES
(1, 1, 1, 1),
(1, 1, 4, 2),
(1, 1, 8, 2),
(1, 1, 13, 1),
(1, 1, 19, 4),
(2, 1, 1, 1),
(2, 1, 4, 2),
(2, 1, 8, 2),
(3, 1, 13, 1);


INSERT INTO pose_notes (id, assigned_flow_id, pose_id, author, notes)
VALUES
(1, 1, 9, 1, 'I love saturday mornings!'),
(2, 1, 3, 1, 'A flow a day keeps doctor at bay'),
(3, 1, 1, 1, 'Never too many squats');





COMMIT;


