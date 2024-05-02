const mongoose = require('mongoose')

let tokenSchema = new mongoose.Schema({
    token: String,
    user_id: mongoose.Schema.Types.ObjectId
})

let Token = mongoose.model('Token', tokenSchema)
module.exports = Token;