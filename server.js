require('express-async-errors')
const express = require('express')
const app = express()
require('dotenv').config()
require('./startup/routes.js')(app);
require('./startup/db.js')();
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const path = __dirname+'/views/';

process.on('uncaughtException', (ex) => {
    console.log('got an uncaught exception error');
    process.exit(1);
});

process.on('unhandledRejection', (ex) => {
    console.log(ex);
    process.exit(1);
});
// app.get('/', (req, res) => {
//     res.sendFile(path+'/index.html')
// })
app.use(express.static(path))
let port  = process.env.PORT || 3000;
app.listen(port, () => console.log(`App listen at ${port}`));
