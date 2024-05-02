const express = require('express');
const router = express.Router();
const { Content,contentValidation } = require('../../models/content.js');
const AuthAdmin = require('../../middlewares/authAdmin.js');
const {deleteAllClImg, deleteCloudinaryImg} = require('../../cloudinary.js');
//delete content
router.delete('/admin/deletecontent/:id', AuthAdmin, async(req, res) => {
    let filtered_content = await Content.findByIdAndDelete({_id: req.params.id});
    if(!filtered_content){
        res.json({error: 'content not found'})
    }
    deleteCloudinaryImg(res, filtered_content.image.public_id);
    res.status(204).end()
})
module.exports = router;