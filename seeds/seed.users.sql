BEGIN;


INSERT INTO users (fullname, username, password)
VALUES
('demo', 'demo', '$2a$10$Q/BPUKz7QjGwov.v.yYErO.QA.yXupItMeh4U1BBvr.cTtu2Ozts.'),
('Zuza Lukitch', 'zuza@zuza.com', 'zuzapassword'),
('Kate Smith', 'kate@kate.com', 'katepassword'),
('Libby Adler', 'libby@libby.com', 'libbypassword');

COMMIT;