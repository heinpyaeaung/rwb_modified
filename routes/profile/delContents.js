const express = require('express');
const router = express.Router();
const { Content,contentValidation } = require('../../models/content.js');
const {User} = require('../../models/user.js')
const AuthMember = require('../../middlewares/authMember.js')
const {deleteCloudinaryImg} = require('../../cloudinary.js')

router.delete('/profile/deletecontent/:id', AuthMember, async(req, res) => {
    let filtered_content = await Content.findByIdAndDelete({_id: req.params.id});
    if(!filtered_content){
        res.json({error: 'content not found'})
    }
    let filtered_user = await User.findOneAndUpdate({_id: res.user_infos_id},{
        $pull: {myContents: filtered_content._id, myClImgIdsArr: filtered_content.image.public_id}
    },{new: true});
  
    await filtered_user.save();
    deleteCloudinaryImg(res, filtered_content.image.public_id);
    res.status(204).end();
})

module.exports = router;