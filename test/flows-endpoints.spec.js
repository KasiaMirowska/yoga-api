const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-data-helpers');
const fixtures = require('./test-fixtures');
const bcrypt = require('bcryptjs');

describe('Flows endpoints', function () {
    let db;
    const { testPoses, testUsers, testFlows, testSectionFlows, testFlowsPoses, testNotes, testPoseAttributes } = helpers.makeTestFixtures();

    before('make knex instatnce', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        });
        app.set('db', db);
    });
    after('disconnect from db', () => db.destroy());
    beforeEach('cleanup', () => fixtures.cleanTables(db));
    afterEach('cleanup', () => fixtures.cleanTables(db));

    describe('GET /api/flows', () => {
        context('Given no flows in db', () => {
            beforeEach('insert users', () => {
                const users = testUsers.map(user => ({
                    ...user,
                    password: bcrypt.hashSync(user.password, 1)
                }));
                return db
                    .into('users')
                    .insert(users);
            });

            it('returns 200 and empty array', () => {
                return supertest(app)
                    .get('/api/flows')
                    .set('Authorization', fixtures.makeAuthHeader(testUsers[0]))
                    .expect(200, []);
            });
        });

        context('given flows in db', () => {
            beforeEach('insert flows', () => {
                const users = testUsers.map(user => ({
                    ...user,
                    password: bcrypt.hashSync(user.password, 1)
                }));
                return db
                    .into('users')
                    .insert(users)
                    .then(() => {
                        return db
                            .into('flows')
                            .insert(testFlows);
                    });
            });

            it('returns 200 and all flows', () => {
                const expectedFlows = testFlows;
                return supertest(app)
                    .get('/api/flows')
                    .set('Authorization', fixtures.makeAuthHeader(testUsers[0]))
                    .expect(200, expectedFlows);
            });
        });
    });

    describe('POST /api/flows', () => {
        beforeEach('insert users', () => {
            const users = testUsers.map(user => ({
                ...user,
                password: bcrypt.hashSync(user.password, 1)
            }));
            return db
                .into('users')
                .insert(users);
        });

        it('creates a new flow', () => {
            const title = 'new flow';
            const author = testUsers[1].id;
            const newFlow = {
                title,
                author,
                assignedPoses: [],
                warmUp: [],
                midFlow: [],
                peakPose: [],
                breakPoses: [],
                afterPeak: [],
            };

            return supertest(app)
                .post('/api/flows')
                .set('Authorization', fixtures.makeAuthHeader(testUsers[1]))
                .send(newFlow)
                .expect(201)
                .expect(res => {
                    expect(res.body).to.have.property('id');
                    expect(res.body.title).to.eql(newFlow.title);
                    expect(res.body.author).to.eql(newFlow.author);
                    expect(res.headers.location).to.eql(`/api/flows/${res.body.id}`);
                })
                .expect(res => {
                    return db
                        .from('flows')
                        .select('*')
                        .where({ id: `${res.body.id}` })
                        .first()
                        .then(row => {
                            expect(row.title).to.eql(newFlow.title);
                            expect(row.author).to.eql(newFlow.author);
                        });
                });
        });
    });

    describe('POST /api/flow-pose', () => {
        beforeEach('insert users', () => {
            const users = testUsers.map(user => ({
                ...user,
                password: bcrypt.hashSync(user.password, 1)
            }));
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
                                        .into('section_flows')
                                        .insert(testSectionFlows);
                                });
                        });
                });
        });

        it('returns 201 and creates new flow-pose', () => {
            const newFlowPose = {
                main_flow_id: testFlows[2].id,
                author: testUsers[1].id,
                pose_id: testPoses[3].id,
                section_flow_id: testSectionFlows[1].id,
            };

            return supertest(app)
                .post('/api/flow-pose')
                .set('Authorization', fixtures.makeAuthHeader(testUsers[1]))
                .send(newFlowPose)
                .expect(201)
                .expect(res => {
                    expect(res.body.main_flow_id).to.eql(newFlowPose.main_flow_id);
                    expect(res.body.author).to.eql(newFlowPose.author);
                    expect(res.body.pose_id).to.eql(newFlowPose.pose_id);
                    expect(res.body.section_flow_id).to.eql(newFlowPose.section_flow_id);
                    expect(res.headers.location).to.eql(`/api/flow-pose/${res.body.main_flow_id}`);
                })
                .expect(res => {
                    return db
                        .from('flows_poses')
                        .select('*')
                        .then(rows => {
                            expect(rows[0].main_flow_id).to.eql(newFlowPose.main_flow_id);
                            expect(rows[0].author).to.eql(newFlowPose.author);
                            expect(rows[0].pose_id).to.eql(newFlowPose.pose_id);
                            expect(rows[0].section_flow_id).to.eql(newFlowPose.section_flow_id);
                        });
                });
        });
    });

    describe('/api/flows/flow_id', () => {
        beforeEach('insert users to enable authentication', () => {
            const users = testUsers.map(user => ({
                ...user,
                password: bcrypt.hashSync(user.password, 1)
            }));
            return db
                .into('users')
                .insert(users);
        });

        context('given no flows in db', () => {
            it('returns 400 ', () => {
                const flowId = 1234;
                return supertest(app)
                    .get(`/api/flows/${flowId}`)
                    .set('Authorization', fixtures.makeAuthHeader(testUsers[0]))
                    .expect(400, { error: { message: `Flow with id ${flowId} doesn't exist` } });
            });
        });

        context('Given no poses in the flow', () => {
            beforeEach('insert data', () => {
                return db
                    .into('flows')
                    .insert(testFlows);
            });
        });

        it('returns 200 and an empty flow', () => {
            it('returns 200 and an empty flow', () => {
                const flowId = testFlows[2].id;
                const expectedFlow = {
                    id: testFlows[2].id,
                    author: testUsers[0].id,
                    title: 'flow3'
                };

                return supertest(app)
                    .get(`/api/flows/${flowId}`)
                    .set('Authorization', fixtures.makeAuthHeader(testUsers[0]))
                    .expect(200, expectedFlow);
            });
        });

        context('Given poses in the flow', () => {
            beforeEach('insert data', () => {
                return db
                    .into('flows')
                    .insert(testFlows)
                    .then(() => {
                        return db
                            .into('yoga_poses')
                            .insert(testPoses)
                            .then(() => {
                                return db
                                    .into('section_flows')
                                    .insert(testSectionFlows)
                                    .then(() => {
                                        return db
                                            .into('flows_poses')
                                            .insert(testFlowsPoses);
                                    });
                            });
                    });
            });

            it('returns flow with all its poses', () => {
                const flowId = testFlows[0].id;
                const author = testUsers[0].id;
                const expectedFlow = {
                    id: testFlows[0].id,
                    title: testFlows[0].title,
                    author: author,
                    assignedPoses: [[1, 2], [1], [], [], []]
                };

                return supertest(app)
                    .get(`/api/flows/${flowId}`)
                    .set('Authorization', fixtures.makeAuthHeader(testUsers[1]))
                    .expect(200, expectedFlow);
            });
        });
    });

    describe('DELETE /api/delete/flow_id/pose_id', () => {
        beforeEach('insert users for authentication', () => {
            const users = testUsers.map(user => ({
                ...user,
                password: bcrypt.hashSync(user.password, 1)
            }));

            return db
                .into('users')
                .insert(users)
                .then(() => {
                    return db
                        .into('flows')
                        .insert(testFlows)
                        .then(() => {
                            return db
                                .into('section_flows')
                                .insert(testSectionFlows)
                                .then(() => {
                                    return db
                                        .into('yoga_poses')
                                        .insert(testPoses)
                                        .then(() => {
                                            return db
                                                .into('flows_poses')
                                                .insert(testFlowsPoses);
                                        });
                                });
                        });
                });
        });

        it('deletes selected pose from a flow', () => {
            const flowId = testFlows[0].id;
            const poseToRemove = 2;
            const expectedFlow = {
                id: flowId,
                title: testFlows[0].title,
                author: testUsers[0].id,
                assignedPoses: [[1], [1], [], [], []]
            };
            
            return supertest(app)
                .delete(`/api/delete/${flowId}/${poseToRemove}`)
                .set('Authorization', fixtures.makeAuthHeader(testUsers[0]))
                .expect(204)
                .then(res => {
                    return supertest(app)
                        .get(`/api/flows/${flowId}`)
                        .set('Authorization', fixtures.makeAuthHeader(testUsers[0]))
                        .expect(200, expectedFlow );
                });
        });
    });
});
