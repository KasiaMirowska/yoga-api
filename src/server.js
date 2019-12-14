const app = require('../src/app');
const { PORT } = require('./config');

app.listen(PORT, () => {
    console.log(`server listening at http:localhost:${PORT}`)
});
