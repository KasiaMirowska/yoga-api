DROP TABLE IF EXISTS yoga_poses;

CREATE TABLE yoga_poses (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    name_eng TEXT NOT NULL,
    alias TEXT,
    name_san TEXT NOT NULL,
    benefits TEXT,
    pose_level TEXT NOT NULL,
    pose_type TEXT NOT NULL,
    img TEXT,
    video TEXT NOT NULL
);

