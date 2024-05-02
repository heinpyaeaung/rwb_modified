const express = require('express')
const router = express.Router()
let {User, userValidation} = require('../models/user')
let Token = require('../models/token')
let {authenticatedUserValidation} = require('../models/auth')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Joi = require('joi')
const sgMail = require('@sendgrid/mail')
const jwtEncrypt = require('../middlewares/encryptJwt.js')
const {Content} = require('../models/content.js')
const {deleteAllClImg} = require('../cloudinary.js')

//user login
router.post('/login', async(req, res) => {
    let {error} = authenticatedUserValidation(req.body)
    if(error) return res.json({error: error.details[0].message});  
    
    let user = await User.findOne({email: req.body.email});
    if(!user) return res.json({error: 'Wrong Email Or Password'}); 

    if(!user.isVerified) return res.json({error: 'Not Verified'});

    let checkPwd = await bcrypt.compare(req.body.password, user.password);
    if(!checkPwd) return res.json({error: 'Wrong Email Or Password'});

    let jwtToken = await user.generateJwtToken();
    res.status(200).cookie('secretkey', jwtToken, {httpOnly:false, secure: false}).json({success: true}).end()
})

//user logout
router.get('/logout',async(req, res) => { 
    res.cookie('secretkey','',{maxAge:1}).json({message:'logout scuuessfully'})   
})

//register user
router.post('/register', async(req, res) => {
    const {error} = await userValidation(req.body);
    if(error) return res.json({error: error.details[0].message});

    let name = await User.findOne({username: req.body.username});
    if(name) return res.json({
        error: 'This name has been already exist, try another name'
    });

    let mail = await User.findOne({email: req.body.email});
    if(mail) return res.json({
        error: 'This acc has been already registered'
    })

    let salt = await bcrypt.genSalt(10);
    let hashed = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashed;
    
    let new_user = new User({...req.body});
    console.log(new_user);
    await sendMail(new_user, req, res);
    await new_user.save();
})

//verify token to access log in
router.get('/verify/:token', async(req, res) => {
    if(!req.params.token) return res.json({error: 'Token needed'})

    let token = await Token.findOne({token: req.params.token});
    if(!token) return res.json({error: 'Token is not valid'});

    let user = await User.findOne({_id: token.user_id});
    if(!user) return res.json({error: 'User does not exist'}).render('/home');

    user.isVerified = true;
    await user.save()
    res.json({message: 'Vertification Success'})
})

//delete account
router.get('/delete/my_account', jwtEncrypt,async(req, res) => {
    let filtered_user = await User.findOneAndDelete({email: res.user_email});
    if(!filtered_user) return res.json({error: 'something went wrong'});
    await Token.findOneAndDelete({user_id: filtered_user._id});
    await Content.deleteMany({reserved_author: filtered_user.email});
    deleteAllClImg(res, filtered_user.myClImgIdsArr);
    res.cookie('secretkey','',{maxAge:1}).json({message:'Acc Successfully Deleted'});
})

//reset password function
router.post('/reset', async(req, res) => {
    const Schema = Joi.object({
        resetpwd: Joi.string().required(),
        newpwd: Joi.string().min(6).required(),
        repwd: Joi.string().min(6).required()
    })
    const {error} = Schema.validate(req.body)
    if(error) return res.json({error: error.details[0].message});
    
    let user = await User.findOne({resetpwdtoken: req.body.resetpwd});
    if(!user) return res.json({error: 'This token is not valid'});

    let salt = await bcrypt.genSalt(10);
    let hashed = await bcrypt.hash(req.body.repwd, salt);
    user.password = hashed;
    user.resetpwdtoken = '';
    await user.save();

    res.status(200).json({message: `Your new password has been successfully changed, Go back to log in page`})
})

//forgot pwd function
router.post('/forgot', async(req, res) => {
    const Schema = Joi.object({
        email: Joi.string().required().email()
    })
    const {error} = Schema.validate(req.body)
    if(error) return res.json({error: error.details[0].message});  

    let user = await User.findOne({email: req.body.email});
    if(!user) return res.json({error: 'This account is not registered'});

    sendMailForForgotPassword(user, req, res);
})

//change pwd function
router.patch('/user/profile/changepwd', jwtEncrypt, async(req, res) => {
    const Schema = Joi.object({
        currentpwd: Joi.string().min(6).required(),
        newpwd: Joi.string().min(6).required()
    })
    const {error} = Schema.validate(req.body)
    if(error) return res.json({error: error.details[0].message});

    let {currentpwd, newpwd} = req.body;
    let filtered_user = await User.findOne({email: res.user_email});
    if(!filtered_user) return res.json({error: 'Acc does not register'});
    
    let check_current_pwd = await bcrypt.compare(currentpwd, filtered_user.password);
    if(!check_current_pwd) return res.json({error: 'wrong current password'});

    let salt = await bcrypt.genSalt(10);
    let hashed = await bcrypt.hash(newpwd, salt);
    filtered_user.password = hashed;

    await filtered_user.save();
    res.json({message: 'changed password'})
})

// sending email token to reset password
async function sendMailForForgotPassword(user, req, res) {
    let resetCode = await user.generateResetPasswordToken();
    user.resetpwdtoken = resetCode;
    user.save();

    let to = user.email
    let from = process.env.FROM_EMAIL
    let subject = 'RWB\'S RESET PASSWORD'
    let html = `<strong>Hi ${user.username}, We received a request to reset your RWB acount password. Enter the following password reset code</strong>
    <p><i> Notice that: this token is one time use if you want to change new password again, you need to go back to forgot email page and get a new token<i></p>
    <h1>${resetCode}</h1>`
    await sgMail.send({to,from,subject,html});
    res.json({message: 'Reset password code has been send to your email, Please check in email box'})
}

//sending email link to verify user
async function sendMail(user, req, res) {
    let token = await user.generateVertificationToken();
    await token.save();

    let to = user.email
    let from = process.env.FROM_EMAIL
    let subject = 'RWB\'S ACCOUNT VERTIFICATION EMAIL'
    let link = `http://${req.headers.host}/#/user/verify/${token.token}`
    let html = `<strong>Hi ${user.username}, please click on the following link to verify your account
                <a href="${link}">Click Here</a> if you did not request this, please ignore this email</strong>`

    await sgMail.send({to,from,subject,html});
    res.json({message: 'A Vertification Email has been send to your email, Please check in email box to verify your account'})
}
module.exports = router;