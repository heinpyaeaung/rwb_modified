const Joi = require('joi')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const Token = require('./token')

let userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    member: {
        type: Boolean,
        default: true,
        required: true
    },
    admin:{
        type: Boolean,
        default: false,
        required: true
    },
    myContents:{
        type: Array,
        required: true
    },
    myClImgIdsArr: {
        type: Array,
        required: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
        required: true
    },
    resetpwdtoken: {
        type: String,
        required: false
    }
})

//generate jwt to user
userSchema.methods.generateJwtToken = function(){
    return jwt.sign({ name: this.username, email: this.email, userId: this._id, admin: this.admin, member: this.member }, process.env.SECRET_KEY, { expiresIn: '1h'})
}

//generate reset pwd token
userSchema.methods.generateResetPasswordToken = async function(){
    return crypto.randomBytes(16).toString('hex')
}

//generate verify token
userSchema.methods.generateVertificationToken = async function(){
    let payload = {
        user_id : this._id,
        token : crypto.randomBytes(16).toString('hex')
    }
    return new Token(payload);
}

const User = mongoose.model('User', userSchema);

function userValidation(userInfos) {
    let Schema = Joi.object({
        username: Joi.string().max(40).required(),
        email: Joi.string().required().email(),
        password: Joi.string().min(6).required()
    })
    return Schema.validate(userInfos)
}

module.exports.User = User;
module.exports.userValidation = userValidation;


