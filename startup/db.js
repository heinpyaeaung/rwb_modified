const mongoose = require('mongoose');
module.exports = function(){
    mongoose.connect(process.env.DATABASE)
        .then(() => console.log('Connected to MongoDB'))
        .catch(err => console.log(err.message))
}
