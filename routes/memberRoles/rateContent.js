const express = require('express');
const router = express.Router();
const { Content } = require('../../models/content');
const mongoose = require('mongoose')
const {User} = require('../../models/user.js')
const JwtEncrypt = require('../../middlewares/encryptJwt.js')

router.post('/user/ratecontent/:action/:id',JwtEncrypt, async(req, res) => {  
    const {action, id} = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.json({error: 'no content such a given name'})
    }

    let {userId} = res.user_infos;

    if(action === 'like'){
        let content = await Content.findOneAndUpdate({_id: id},{
            $push: {likedUsers: userId}
        },{new: true});

        return res.json({content: content.likedUsers.length})
    }

    if(action === 'unlike'){
        let content = await Content.findOneAndUpdate({_id: id},{
            $pull: {likedUsers: userId}
        },{new: true});

        return res.json({content: content.likedUsers.length})
    }
    
    res.json({error: 'something went wrong'});
})

module.exports = router;