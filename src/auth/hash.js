const bcrypt = require("bcryptjs");
const text = 'password';


bcrypt.hash(text, 10).then(hash => {
    console.log(hash);
});
