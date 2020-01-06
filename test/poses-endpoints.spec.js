const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-data-helpers');
const fixtures = require('./test-fixtures');
const bcrypt = require('bcryptjs');

describe('Poses endpoints', function () {
    let db;

    const { testPoses, testUsers, testFlows, testPoseAttributes, testNotes, testAttributes } = helpers.makeTestFixtures();


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
                        expect(res.body[0].video).to.eql(expectedPose.video)
                    })
            })
        })
    })

    describe('GET /api/flow/:pose_id', () => {
        context('Given no poses in db', () => {
            beforeEach('insert users', () => {
                fixtures.seedUsers(db, testUsers)
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
                }));;
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
                    .expect(200)// do I need here to list all the properites???? how come res.body is not an array???????
                    .expect(res => {
                        console.log(res.body, 'RESPONSE????????')
                        expect(res.body.name_eng).to.eql(expectedPose.name_eng)
                        expect(res.body.name_san).to.eql(expectedPose.name_san)
                        expect(res.body.alias).to.eql(expectedPose.alias)
                        expect(res.body.pose_level).to.eql(expectedPose.pose_level)
                        expect(res.body.pose_type).to.eql(expectedPose.pose_type)
                        expect(res.body.img).to.eql(expectedPose.img)
                        expect(res.body.video).to.eql(expectedPose.video)
                    })
            })
        })
    })

    describe('GET /api/flow/:flow_id/:pose_id', () => {
        context('Given no poses in db', () => {
            console.log(db, 'DATABASE!!!!')
            beforeEach(fixtures.seedUsers(db, testUsers));
            it('responds 404', () => {
                const poseId = 2;
                const flowId = 1;
                return supertest(app)
                    .get(`/api/flow/${flowId}/${poseId}`)
                    .set('Authorization', fixtures.makeAuthHeader(testUsers[0]))
                    .expect(404, { error: { message: `Pose with id ${poseId} doesn't exist` } })
            })
        })
        context('given poses in db but no attributes or no notes', () => {
            beforeEach(fixtures.seedPosesForLoggedIn(db, testUsers, testPoses));
            it('responds 200 and returns slected pose without attributes or notes', () => {
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
        context('given pose has attributes but no notes', () => {
            beforeEach(fixtures.seedPosesAttributes(db, testUsers, testPoses, testPoseAttributes));
            it('responds 200 returning pose with attributes', () => {
                const poseId = 2;
                const flowId = 2;
                const expectedPoseAttributes = fixtures.makeExpectedPoseAttributes(db, testUsers[0], testPoses[poseId - 1], flowId, testPoseAttributes);
                return supertest(app)
                    .get(`/api/flow/${flowId}/${poseId}`)
                    .set('Authorization',
                        fixtures.makeAuthHeader(testUsers[0]))
                    .expect(200, expectedPoseAttributes)
            })
        })
        context('given pose has notes but no attributes', () => {
            beforeEach(fixtures.seedPosesNotes(db, testUsers, testPoses, testNotes));
            it('responds 200 returning pose with notes', () => {
                const poseId = 2;
                const flowId = 2;
                const expectedPoseNotes = fixtures.makeExpectedPoseNotes(db, testUsers[0], testPoses[poseId - 1], flowId, testNotes);
                return supertest(app)
                    .get(`/api/flow/${flowId}/${poseId}`)
                    .set('Authorization',
                        fixtures.makeAuthHeader(testUsers[0]))
                    .expect(200, expectedPoseNotes)
            })
        })
        context('given pose has attributes and notes', () => {
            beforeEach(fixtures.seedPosesAttNotes(db, testUsers, testPoses, testPoseAttributes, testNotes));
            it('responds 200 returning pose with notes', () => {
                const poseId = 2;
                const flowId = 2;
                const expectedPoseAttNotes = fixtures.makeExpectedPoseAttNotes(db, testUsers[0], testPoses[poseId - 1], flowId, testPoseAttributes, testNotes);
                return supertest(app)
                    .get(`/api/flow/${flowId}/${poseId}`)
                    .set('Authorization',
                        fixtures.makeAuthHeader(testUsers[0]))
                    .expect(200, expectedPoseAttNotes)

            })
        })
    })

    describe.only('POST /api/flow/flow-att/:pose_id', () => {
        const testPose = testPoses[0];
        const testUser = testusers[0];
        const testFlow = testFlows[0];
        const testAttribute = testAttributes[0];
        const newAttributeObject = {
            assigned_flow_id: testFlow,
            author: testuser,
            pose_id: testPose,
            attribute: testAttribute
        }
        return supertest(app)
            .post(`/api/flow/flow-att/${testPose}`)
            .set('Authorization', helpers.makeAuthHeader(testUser))
            .send(newAttributeObject)
            .expect(201)
            .expect(res => {
                expect(res.body).to.have.property('id')
                expect(res.body.assigned_flow_id).to.eql(newAttributeObject.assigned_flow_id)
                expect(res.body.author).to.eql(newAttributeObject.author)
                expect(res.body.pose_id).to.eql(newAttributeObject.pose_id)
                expect(res.body.attribute).to.eql(newAttributeObject.attribute)
                expect(res.headers.location).to.eql(`/api/flow/flow-att/${res.body.id}`)
            })
            .expect(res =>
                db
                    .from('pose-attributes')
                    .select('*')
                    .where({ id: res.body.id })
                    .first()
                    .then(row => {
                        expect(row.assigned_flow_id).to.eql(newAttributeObject.assigned_flow_id)
                        expect(row.author).to.eql(newAttributeObject.author)
                        expect(row.pose_id).to.eql(newAttributeObject.pose_id)
                        expect(row.attribute).to.eql(newAttributeObject.attribute)
                    })
            )
        })
 })