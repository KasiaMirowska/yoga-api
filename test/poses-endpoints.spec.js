const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-data-helpers');
const fixtures = require('./test-fixtures');
const bcrypt = require('bcryptjs');

describe('Poses endpoints', function() {
    let db;

    const { testPoses, testUsers, testFlows, testAttributes, testNotes, } = helpers.makeTestFixtures();
    

    before('make knex instatnce', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })
    after('disconnect from db',() => db.destroy());
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
                    .expect(404, {error: {message: `Pose with id ${poseId} doesn't exist`}})
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
                const expectedPose = fixtures.makeExpectedFullPose(testPoses[poseId-1]);
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

    describe()

})