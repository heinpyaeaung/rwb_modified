const express = require('express');
const router = express.Router();
const EncryptJwt = require('../../middlewares/encryptJwt.js');
const { Content,contentValidation } = require('../../models/content.js');
router.get('/profile/mycontents', EncryptJwt, async(req, res) => {
    let user = res.user_infos;
    let allContentsByMe = await Content.find({reserved_author: user.email}).sort('-updatedAt');
    if(!allContentsByMe){
        return res.json({ message: `Something went wrong` })
    }
    return res.json({name: user.name, admin: user.admin, member: user.member, userId: user.userId, allContentsByMe});
})

module.exports = router