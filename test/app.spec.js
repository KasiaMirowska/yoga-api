
const app = require('../src/app');

describe('app', () => {
    it('GET / responds with 200 containing "Hello, from yoga capstone!"', () => {
        return supertest(app)
            .get('/')
            .expect(200, "Hello, from yoga capstone!")
    })
})