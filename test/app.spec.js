
const app = require('../src/app');

describe('app', () => {
    it('GET / responds with 200 containing "Hello, boilerplate"', () => {
        return supertest(app)
            .get('/')
            .expect(200, "Hello, boilerplate!")
    })
})