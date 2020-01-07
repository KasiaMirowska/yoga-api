const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-data-helpers');
const fixtures = require('./test-fixtures');
const bcrypt = require('bcryptjs');



describe('Flows endpoints', function () {
    let db;
    const { testPoses, testUsers, testFlows, testSectionFlows, testFlowsPoses, testNotes, testPoseAttributes} = helpers.makeTestFixtures();

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

    describe.only('GET /api/flows', () => {
        context('Given no flows in db', () => {
            beforeEach('insert users', () => {
                const users = testUsers.map(user => ({
                    ...user,
                    password: bcrypt.hashSync(user.password, 1)
                }))
                return db
                .into('users')
                .insert(users)
            })
            
            it('returns 200 and empty array', () => {
                return supertest(app)
                .get('/api/flows')
                .set('Authorization', fixtures.makeAuthHeader(testUsers[0]))
                .expect(200, [])
            })
        })
        context('given flows in db', () => {
            beforeEach('insert flows', () => {
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
                })
            })
            it('returns 200 and all flows', () => {
                const expectedFlows = testFlows;
                return supertest(app)
                    .get('/api/flows')
                    .set('Authorization', fixtures.makeAuthHeader(testUsers[0]))
                    .expect(200, expectedFlows)
            })
        })
    })
})