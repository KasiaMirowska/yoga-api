const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-data-helpers');
const fixtures = require('./test-fixtures');

describe.only('Poses endpoints', function() {
    let db;

    const { testPoses, testUsers, testFlows, testAttributes, testNotes} = helpers.makeTestFixtures();
    

    before('make knex instatnce', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })
    after('disconnect from db',() => db.destroy());
    before('cleanup', () => fixtures.cleanTables(db));
    afterEach('cleanup', () => fixtures.cleanTables(db));

    describe(`GET /api/poses`, () => {
        context('Given no poses', () => {
            it('responds with 200 and empty list', () => {
                return supertest(app)
                    .get('/api/poses')
                    .expect(200, [])
            })
        })
        context.only('Given poses inside db', () => {
            before('insert poses', () => {
                fixtures.seedPoses(db)
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
    })

})