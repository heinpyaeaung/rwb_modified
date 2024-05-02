const express = require('express');
const router = express.Router();
const {User} = require('../../models/user.js')
const Token = require('../../models/token.js')
const {Content} = require('../../models/content.js')
const {deleteAllClImg} = require('../../cloudinary.js')
const AuthAdmin = require('../../middlewares/authAdmin.js');

router.delete('/admin/remove/member_acc', AuthAdmin, async(req ,res) => {
    const{email} = JSON.parse(req.query.user_infos);
    let filtered_user = await User.findOneAndDelete({email});
    if(!filtered_user){ return res.json({error: 'user doesn\'t not exist'}) }
    console.log(filtered_user)
    await Token.findOneAndDelete({user_id: filtered_user._id});
    await Content.deleteMany({reserved_author: filtered_user.email});
    deleteAllClImg(res, filtered_user.myClImgIdsArr);
    res.json({message: `${filtered_user.username} removed from your db`})
})

module.exports = router;