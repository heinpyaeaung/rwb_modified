const cloudinary = require('cloudinary')
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_CLOUD_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
})
async function deleteCloudinaryImg(res,img_url){
    let resOfCl = await cloudinary.v2.uploader.destroy(img_url);
    if(!resOfCl.result === 'ok'){
        return res.json({error: 'something wrong'});
    }  
}

async function deleteAllClImg(res,img_ids){
    let resOfCl = await cloudinary.v2.api.delete_resources(img_ids);
    if(!resOfCl.result === 'ok'){
        return res.json({error: 'something went wrong'});
    } 
}
module.exports.deleteAllClImg = deleteAllClImg;
module.exports.deleteCloudinaryImg = deleteCloudinaryImg;
