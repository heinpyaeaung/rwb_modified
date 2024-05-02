const express = require('express');
const router = express.Router();
const { Content,contentValidation } = require('../../models/content.js');
const {User} = require('../../models/user.js')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const upload = multer()
const {deleteCloudinaryImg} = require('../../cloudinary.js')

//adding content to web
router.post('/member/addcontent', upload.none(), async(req, res) => { 
    let imageInfos = JSON.parse(req.body.cloudinary_img_url);
    if(!req.cookies.secretkey){
        deleteCloudinaryImg(res, imageInfos.public_id);
        return res.json({error: 'Not Member'});
    }
    let decoded = await jwt.verify(req.cookies.secretkey, process.env.SECRET_KEY);
    if(!decoded){
        deleteCloudinaryImg(res, imageInfos.public_id);
        return res.json({error: 'Access denied'});
    }

    let user = await User.findOne({email: decoded.email})
    if( !user || !user.member ){
        deleteCloudinaryImg(res, imageInfos.public_id);
        return res.json({error: 'Not Member'});
    }

    let {error} = contentValidation(req.body);
    if(error){
        deleteCloudinaryImg(res, imageInfos.public_id);
        return res.json({error: error.details[0].message});
    }
    try{
        let new_content = new Content({
            header: req.body.header,
            author: user.username,
            image: imageInfos,
            contentType: req.body.contentType,
            permission: req.body.permission,
            contentBody: JSON.parse(req.body.contentBody),
            reserved_author: user.email
        });
        let saved_db_content = await new_content.save();
        user.myContents.push(saved_db_content._id);
        user.myClImgIdsArr.push(saved_db_content.image.public_id);
        await user.save()
        res.send(saved_db_content);
    }catch(err){
        deleteCloudinaryImg(res, imageInfos.public_id);
        res.json({error: err.message})
    }
})
module.exports = router;
