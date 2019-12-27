BEGIN;

INSERT INTO section_flows (section)
VALUES
('warmUp'),
('midFlow'),
('breakPoses'),
('peakPose'),
('afterPeak');

COMMIT;