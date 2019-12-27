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

INSERT INTO attributes_list (attribute) 
VALUES
('grounding pose'),
('cooling pose'),
('heat rising pose'),
('energizing pose'),
('strengthening pose'),
('relaxing pose'),
('releasing pose'),
('stabilizing pose'),
('flexibility building pose');



INSERT INTO pose_notes (pose_id, author, notes)
VALUES
(9, 1, 'I love saturday mornings!'),
(3, 1, 'A flow a day keeps doctor at bay'),
(1, 1, 'Never too many squats');





COMMIT;


