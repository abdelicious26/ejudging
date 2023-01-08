const express = require('express');
const mongoose = require('mongoose');
const app = express();
const User = require('./models/User');

const port = process.env.PORT || 4000;
require('dotenv').config();

mongoose.connect(process.env.REACT_APP_DBCONNECTONLINE, (err) => {
    if (!err) console.log('database connected');
    else console.log('database error');
});


app.get('/', (request, response) => {
    console.log('Here');
    response.send("Hi");
    // response.render('index');
});

const userRouter = require('./backend/routes/users');
app.use('/users', userRouter);

//run()
// async function run() {
//     const user = new User({
//         firstName: "Saud",
//         lastName: "Passrain",
//         username: "admin",
//         password: "admin"
//     });

//     await user.save()
//     console.log(user);
// }

app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
})