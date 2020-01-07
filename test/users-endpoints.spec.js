const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-data-helpers');
const fixtures = require('./test-fixtures');
const bcrypt = require('bcryptjs');

describe('Users endpoint', () => {
    let db;
    const { testUsers } = helpers.makeTestFixtures();

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

    describe('POST /api/register', () => {
        context('user validation', () => {
            beforeEach('insert users', () => {
                const users = testUsers.map(user => ({
                    ...user,
                    password: bcrypt.hashSync(user.password, 1)
                }))
                return db
                    .into('users')
                    .insert(users)
            })
            const requiredFields = ['username', 'password', 'fullname']

            requiredFields.forEach(field => {
                const registerAttemptBody = {
                    fullname: 'test fullname',
                    username: 'test username',
                    password: 'test password'
                }

                it(`responds with 400 required error when '${field}' is missing`, () => {
                    delete registerAttemptBody[field]

                    return supertest(app)
                        .post('/api/register')
                        .send(registerAttemptBody)
                        .expect(400, {
                            error: { message: `Missing ${field}` },
                        })
                })
            })
            it(`responds 400 'Password must be longer that 8 characters`, () => {
                const userShortPassword = {
                    username: 'test_name',
                    password: '12345',
                    fullname: 'test_full-name',
                }
                return supertest(app)
                    .post('/api/register')
                    .send(userShortPassword)
                    .expect(400, { error: { message: `Password must be longer than 8 characters` } })
            })
            it(`responds 400 'Password must be less that 72 characters'`, () => {
                const userLongPass = {
                    username: 'test_user_name',
                    password: '*'.repeat(73),
                    fullname: 'test full name',
                }
                return supertest(app)
                    .post('/api/register')
                    .send(userLongPass)
                    .expect(400, { error: { message: `Password must be less than 72 characters` } })
            })
            it(`responds 400 error when password starts with spaces`, () => {
                const userPassWithSpaces = {
                    username: 'test user name',
                    password: ' 1AAAAAAAa!&',
                    fullname: 'test full name',
                }
                return supertest(app)
                    .post('/api/register')
                    .send(userPassWithSpaces)
                    .expect(400, { error: { message: `Password must not start or end with empty spaces` } })
            })
            it('responds 400 when password ends with spaces', () => {
                const userPassWithSpaces = {
                    username: 'test user name',
                    password: '1Aa!&ddddddddd ',
                    fullname: 'test full name',
                }
                return supertest(app)
                    .post('/api/register')
                    .send(userPassWithSpaces)
                    .expect(400, { error: { message: `Password must not start or end with empty spaces` } })
            })
            it('responds 400 when password not complex enough', () => {
                const userPassNotComplex = {
                    username: 'test user name',
                    password: '1AaDDDDDDDD',
                    fullname: 'test full name',
                }
                return supertest(app)
                    .post('/api/register')
                    .send(userPassNotComplex)
                    .expect(400, { error: { message: `Password must contain 1 upper case, lower case, number and special character` } })
            })


        })
        context('happy path', () => {
            it(`responds 201, serialized user, storing bcypted password`, () => {
                const newUser = {
                    fullname: 'test full name',
                    username: 'test username',
                    password: '11AAbbcc%%',
                }
                return supertest(app)
                    .post('/api/register')
                    .send(newUser)
                    .expect(201)
                    .expect(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.username).to.eql(newUser.username)
                        expect(res.body.fullname).to.eql(newUser.fullname)
                        expect(res.body.password).to.not.have.property('password')
                        expect(res.headers.location).to.eql(`/api/register/${res.body.id}`)
                    })
                    .expect(res => {
                        return db
                            .from('users')
                            .select('*')
                            .where({ id: res.body.id })
                            .first()
                            .then(row => {
                                expect(row.username).to.eql(newUser.username)
                                expect(row.fullname).to.eql(newUser.fullname)
                                return bcrypt.compare(newUser.password, row.password)
                            })
                            .then(compareMatch => {
                                expect(compareMatch).to.be.true
                            })
                    })
            })
        })
    })
})
