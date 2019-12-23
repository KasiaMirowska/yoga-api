DROP TABLE IF EXISTS flows_poses;
CREATE TABLE flows_poses (
    main_flow_id INTEGER REFERENCES flows(id) ON DELETE CASCADE NOT NULL,
    author INTEGER REFERENCEs users(id) ON DELETE CASCADE NOT NULL,
    pose_id INTEGER REFERENCES yoga_poses(id) ON DELETE SET NULL,
    section_flow_id INTEGER REFERENCES section_flows(id) ON DELETE CASCADE NOT NULL
);
