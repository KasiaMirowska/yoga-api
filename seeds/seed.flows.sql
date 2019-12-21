BEGIN;


INSERT INTO flows (name, author, peakpose)
VALUES
('Morning Glory', 'Zuza Lukitch', '22'),
('Moon Flow', 'Libby Adler', '18'),
('Power Class', 'Kate Smith', '8')

INSERT INTO section_flows (name)
VALUES 
('warmUp'),
('midFlow'),
('breakPoses'),
('afterPeak')

INSERT INTO attributes_list (name) 
VALUES
('grounding pose'),
('cooling pose'),
('heat rising pose'),
('energizing pose'),
('strengthening pose'),
('relaxing pose'),
('releasing pose'),
('stabilizing pose'),
('flexcibility building pose')

INSERT INTO flows_poses (main_flow_id, author, pose_id, section_flow_id)
VALUES
(1, 1, 1, 1),
(1, 1, 4, 2),
(1, 1, 8, 2),

INSERT INTO pose_attributes (author, assigned_flow, pose_id, attribute_id)
VALUES
(2, 1, 14, 3),
(2, 1, 14, 4),
(2, 1, 14, 5),
(2, 1, 14, 8) 

INSERT INTO pose_notes (pose_id, author, notes)
(12, 1, 'I love saturday mornings!'),
(3, 1, 'A flow a day keeps doctor at bay')
(1, 1, 'Never too many squats');





COMMIT;


