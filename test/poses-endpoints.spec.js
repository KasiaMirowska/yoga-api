const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-data-helpers');
const fixtures = require('./test-fixtures');
const bcrypt = require('bcryptjs');

describe('Poses endpoints', function () {
    let db;

    const { testPoses, testUsers, testFlows, testNotes, testPoseAttributes } = helpers.makeTestFixtures();

    before('make knex instatnce', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })
    after('disconnect from db', () => db.destroy());
    beforeEach('cleanup', () => fixtures.cleanTables(db));
    afterEach('cleanup', () => fixtures.cleanTables(db));

    describe(`GET /api/poses`, () => {
        context('Given no poses', () => {
            it('responds with 200 and empty list', () => {
                return supertest(app)
                    .get('/api/poses')
                    .expect(200, [])
            });
        })

        context('Given poses inside db', () => {
            beforeEach('insert poses', () => {
                return db
                    .into('yoga_poses')
                    .insert(testPoses)
            })
            it('responds with 200 and all poses', () => {
                const expectedPoses = testPoses.map(item =>
                    fixtures.makeExpectedListPose(item)
                );
                return supertest(app)
                    .get('/api/poses')
                    .expect(200, expectedPoses)
            })
        })
        context('Given an XSS attack', () => {
            const { maliciousPose, expectedPose } = helpers.makeMaliciousPose();
            beforeEach('insert maliciousPose', () => {
                return db
                    .into('yoga_poses')
                    .insert(maliciousPose)
            })
            it('removes XSS attack', () => {
                return supertest(app)
                    .get('/api/poses')
                    .expect(200)// do I need here to list all the properites????
                    .expect(res => {
                        expect(res.body[0].name_eng).to.eql(expectedPose.name_eng)
                        expect(res.body[0].name_san).to.eql(expectedPose.name_san)
                        expect(res.body[0].alias).to.eql(expectedPose.alias)
                        expect(res.body[0].pose_level).to.eql(expectedPose.pose_level)
                        expect(res.body[0].pose_type).to.eql(expectedPose.pose_type)
                        expect(res.body[0].img).to.eql(expectedPose.img)
                    })
            })
        })
    })

    describe('GET /api/flow/:pose_id', () => {
        context('Given no poses in db', () => {
            beforeEach('insert users', () => {
                const users = testUsers.map(user => ({
                    ...user,
                    password: bcrypt.hashSync(user.password, 1)
                }));
                return db
                    .into('users')
                    .insert(users)
            })
            it('returns 404', () => {
                const poseId = 1234;
                return supertest(app)
                    .get(`/api/flow/${poseId}`)
                    .set('Authorization', fixtures.makeAuthHeader(testUsers[0]))
                    .expect(404, { error: { message: `Pose with id ${poseId} doesn't exist` } })
            })
        })
        context('Given poses in DB', () => {
            beforeEach('insert users', () => {
                const users = testUsers.map(user => ({
                    ...user,
                    password: bcrypt.hashSync(user.password, 1)
                }));;
                const poses = testPoses;
                return db
                    .into('users')
                    .insert(users)
                    .then(() => {
                        return db
                            .into('yoga_poses')
                            .insert(poses)
                    })
            })

            it('responds with 200 and specified pose', () => {
                const poseId = 2;
                const expectedPose = fixtures.makeExpectedFullPose(testPoses[poseId - 1]);
                return supertest(app)
                    .get(`/api/flow/${poseId}`)
                    .set('Authorization',
                        fixtures.makeAuthHeader(testUsers[0]))
                    .expect(200, expectedPose)
            })
        })

        context('Given an XSS attack', () => {
            const { maliciousPose, expectedPose } = helpers.makeMaliciousPose();
            beforeEach('insert users', () => {
                const users = testUsers.map(user => ({
                    ...user,
                    password: bcrypt.hashSync(user.password, 1)
                }));
                const pose = maliciousPose;
                return db
                    .into('users')
                    .insert(users)
                    .then(() => {
                        return db
                            .into('yoga_poses')
                            .insert(pose)
                    })
            })

            it('removes XSS attack', () => {
                return supertest(app)
                    .get(`/api/flow/${maliciousPose.id}`)
                    .set('Authorization', fixtures.makeAuthHeader(testUsers[0]))
                    .expect(200)
                    .expect(res => {
                        expect(res.body.name_eng).to.eql(expectedPose.name_eng)
                        expect(res.body.name_san).to.eql(expectedPose.name_san)
                        expect(res.body.alias).to.eql(expectedPose.alias)
                        expect(res.body.pose_level).to.eql(expectedPose.pose_level)
                        expect(res.body.pose_type).to.eql(expectedPose.pose_type)
                        expect(res.body.img).to.eql(expectedPose.img)
                    })
            })
        })
    })

    describe('GET /api/flow/flow_id/pose_id', () => {
        context('Given no poses in db', () => {
            beforeEach('insert data', () => {
                const users = testUsers.map(user => ({
                    ...user,
                    password: bcrypt.hashSync(user.password, 1)
                }));
                return db
                    .into('users')
                    .insert(users)
            })

            it('responds 404', () => {
                const poseId = 12345;
                const flowId = 1;
                return supertest(app)
                    .get(`/api/flow/${flowId}/${poseId}`)
                    .set('Authorization', fixtures.makeAuthHeader(testUsers[0]))
                    .expect(404, { error: { message: `Pose with id ${poseId} doesn't exist` } })
            })

        })
        context('given poses in db but no attributes or no notes', () => {
            beforeEach('insert users', () => {
                const users = testUsers.map(user => ({
                    ...user,
                    password: bcrypt.hashSync(user.password, 1)
                }));
                const poses = testPoses;
                return db
                    .into('users')
                    .insert(users)
                    .then(() => {
                        return db
                            .into('yoga_poses')
                            .insert(poses)
                    })
            })
            it('responds 200 and returns selected pose without attributes or notes', () => {
                const poseId = 2;
                const flowId = 2;
                const expectedPose = fixtures.makeExpectedFullPose(testPoses[poseId - 1]);
                return supertest(app)
                    .get(`/api/flow/${flowId}/${poseId}`)
                    .set('Authorization',
                        fixtures.makeAuthHeader(testUsers[0]))
                    .expect(200, expectedPose)
            })
        })
        context('given pose has attributes and notes', () => {
            beforeEach('insert data to tables', () => {
                const users = testUsers.map(user => ({
                    ...user,
                    password: bcrypt.hashSync(user.password, 1)
                }));
                return db
                    .into('users')
                    .insert(users)
                    .then(() => {
                        return db
                            .into('yoga_poses')
                            .insert(testPoses)
                            .then(() => {
                                return db
                                    .into('flows')
                                    .insert(testFlows)
                                    .then(() => {
                                        return db
                                            .into('pose_attributes')
                                            .insert(testPoseAttributes)
                                            .then(() => {
                                                return db
                                                    .into('pose_notes')
                                                    .insert(testNotes)
                                            })
                                    })
                            })
                    })
            })

            it('responds 200 returning pose with attributes and notes', () => {
                const poseId = 2;
                const flowId = 1;
                const expectedPoseAttNotes = fixtures.makeExpectedPoseAttNotes(testUsers[0], testPoses[poseId - 1], flowId, testPoseAttributes, testNotes);
                return supertest(app)
                    .get(`/api/flow/${flowId}/${poseId}`)
                    .set('Authorization',
                        fixtures.makeAuthHeader(testUsers[0]))
                    .expect(200, expectedPoseAttNotes)
            })
        })
    })

    describe('POST /api/flowatt/:pose_id', () => {
        beforeEach('inserts users', () => {
            const users = testUsers.map(user => ({
                ...user,
                password: bcrypt.hashSync(user.password, 1)
            }))
            return db
                .into('users')
                .insert(users)
                .then(() => {
                    return db
                        .into('flows')
                        .insert(testFlows)
                        .then(() => {
                            return db
                                .into('yoga_poses')
                                .insert(testPoses)
                                .then(() => {
                                    return db
                                        .into('pose_attributes')
                                        .insert(testPoseAttributes)
                                })
                        })
                })
        })
    
    it('creates a new attribute object', () => {
        const testPose = testPoses[1].id;
        const testUser = testUsers[0].id;
        const testFlow = testFlows[1].id;
        const testAttributes = ['new attribute1 for pose2', 'new attribute 2 for pose 2']
        const newAttributesReq = {
            assigned_flow_id: testFlow,
            author: testUser,
            pose_id: testPose,
            attribute: testAttributes,
        }
        
        return supertest(app)
            .post(`/api/flowatt/${testPose}`)
            .set('Authorization', fixtures.makeAuthHeader(testUsers[0]))
            .send(newAttributesReq)
            .expect(201)
            .expect(res => {
                expect(res.body[0].assigned_flow_id).to.eql(newAttributesReq.assigned_flow_id)
                expect(res.body[0].author).to.eql(newAttributesReq.author)
                expect(res.body[0].pose_id).to.eql(newAttributesReq.pose_id)
                expect(res.body[0].attribute).to.eql(newAttributesReq.attribute[0])
            })
            .expect(res => {
                return db
                    .from('pose_attributes')
                    .select('*')
                    .where({'pose_id': res.body[0].pose_id || 0, assigned_flow_id: res.body[0].assigned_flow_id} )
                    .then(rows => {
                        expect(rows[0].assigned_flow_id).to.eql(newAttributesReq.assigned_flow_id)
                        expect(rows[0].author).to.eql(newAttributesReq.author)
                        expect(rows[0].pose_id).to.eql(newAttributesReq.pose_id)
                        expect(rows[0].attribute).to.eql(newAttributesReq.attribute[0])
                    })
                })
    })

    })

    describe('POST /api/flownote/pose_id', () => {
        beforeEach('inserts users', () => {
            const users = testUsers.map(user => ({
                ...user,
                password: bcrypt.hashSync(user.password, 1)
            }))
            return db
                .into('users')
                .insert(users)
                .then(() => {
                    return db
                        .into('flows')
                        .insert(testFlows)
                        .then(() => {
                            return db
                                .into('yoga_poses')
                                .insert(testPoses)
                        })
                })
        })
        it('inserts new note to db', () => {
            const user = testUsers[0].id;
            const flow = testFlows[1].id;
            const poseId = testPoses[2].id;
            const note = 'some new note'

            const newNoteReq = {
                assigned_flow_id: flow,
                author: user,
                pose_id: poseId,
                notes: note,
            }

            return supertest(app)
                .post(`/api/flownote/${poseId}`)
                .set('Authorization', fixtures.makeAuthHeader(testUsers[0]))
                .send(newNoteReq)
                .expect(201)
                .expect(res => {
                    expect(res.body).to.have.property('id');
                    expect(res.body.assigned_flow_id).to.eql(newNoteReq.assigned_flow_id)
                    expect(res.body.author).to.eql(newNoteReq.author)
                    expect(res.body.pose_id).to.eql(newNoteReq.pose_id)
                    expect(res.body.notes).to.eql(newNoteReq.notes)
                    expect(res.headers.location).to.eql(`/api/flownote/${res.body.pose_id}/${res.body.id}`)
                })
                .expect(res => {
                    return db
                        .from('pose_notes')
                        .select('*')
                        .where({ id: res.body.id })
                        .first()
                        .then(row => {
                            expect(row.assigned_flow_id).to.eql(newNoteReq.assigned_flow_id)
                            expect(row.author).to.eql(newNoteReq.author)
                            expect(row.pose_id).to.eql(newNoteReq.pose_id)
                            expect(row.notes).to.eql(newNoteReq.notes)
                        })
                })
        })
    })
})
