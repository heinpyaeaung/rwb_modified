const express = require('express')
const router = express.Router()
const { User }= require('../../models/user')
const AuthAdmin = require('../../middlewares/authAdmin')

router.get('/admin/userslist', pagination, (req, res) => {
    res.json({paginatedUsers: res.result, totalLengthOfUsers: res.totalLengthOfUsers});
})

router.get('/totalusers', pagination, (req, res) => {
   res.json({totalLengthOfUsers: res.totalLengthOfUsers})
})

router.get('/admin/userslist/searchby',AuthAdmin, async (req, res) => {
    const {email} = req.query;
    if(!email) return res.json({error: 'type a email which you want to find'})

    let rgx = new RegExp(`${email}`, 'i');
    let found_users  = await User.find({username: rgx}).select('email admin member isVerified');
    if(!found_users.length) return res.json({error: 'there is no user such a given email'});

    res.json({filteredUsers: found_users, totalLengthOfUsers: found_users.length})
})

router.post('/admin/userslist/:action/:id',AuthAdmin, async (req , res) => {
    let user = await User.findById(req.params.id)
    if(!user) return res.json({error: 'user is not found'})

    switch(req.params.action){
        case 'changeadmin':
            user.admin = !user.admin
            break;

        case 'changemember':
            user.member = !user.member
            break;

        case 'changeverify':
            user.isVerified = !user.isVerified
            break;

        default:
            return res.json({error: 'something went wrong'})
    }

    await user.save()
    res.json({message: 'update sucessfully'})
})

async function pagination(req, res, next) {
    const {page = 1,  limit = 5} = req.query;  
    const totalLengthOfUsers = await User.find().count();
    const paginatedUsers = await User.find()
        .select('-password')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort();
    res.totalLengthOfUsers = totalLengthOfUsers;
    res.result = paginatedUsers;
   
    next();
}

module.exports = router;