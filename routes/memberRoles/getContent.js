const express = require('express');
const router = express.Router();
const { Content } = require('../../models/content')
const jwt = require('jsonwebtoken');
//get all content api
router.get('/user/allcontents', async (req, res) => {
    const {page = 1, limit = 10} = req.query;
    let totalContents = await Content.count()
    let allContents = await Content.find()
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort('-updatedAt');

    if(req.cookies.secretkey){
        let decoded = await jwt.verify(req.cookies.secretkey, process.env.SECRET_KEY);        
        if(decoded) return res.json({allContents, totalContents, member: decoded.member, admin: decoded.admin, userId: decoded.userId})
    }else{
        res.status(200).json({allContents, totalContents, member: false, admin: false, userId: null});
    }            
})
//get today contents
router.get('/user/todayupdate', async(req, res) => {
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth();
    let day = date.getDate();

    let today_contents = await Content.find({
        "updatedAt": {"$gt": new Date(year,month,day)}
    });

    let today_contents_number = await Content.find({
        "updatedAt": {"$gt": new Date(year,month,day)}
    }).count();

    res.json({today_contents_number, today_contents});
})
//get content by searching...
router.get('/user/content/searchby',async(req, res) => {
    const {header, limit=10, page=1} = req.query;
    if(!header) return res.json({error: 'type a name which you want to find'});
    let rgx = new RegExp(`${header}`, 'i');
    let filtered_contents = await Content.find({$or: [{header: rgx}, {author: rgx}]})
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort('-updatedAt');

    let filtered_contents_length = await Content.find({$or: [{header: rgx}, {author: rgx}]}).count();
    if(filtered_contents_length === 0) return res.json({error: 'Not Found'});

    return res.json({filteredContents: filtered_contents, filteredContentsLength: filtered_contents_length});
})
//get specify one content by ID
router.get('/user/content/:id', async(req, res) => { 
    let content_id = req.params.id;
    let content = await Content.findById(content_id);
    if(!content) return res.json({error: 'something went wrong'});

    res.status(200).json({content}); 
})
//for specify content by type such as horror,thriller...
router.get('/user/content', async (req, res) => {
    const {type, page = 1, limit = 10} = req.query;
    let totalContents = await Content.find({contentType: type}).count()
    let filteredContents = await Content.find({contentType: type})
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort('-updatedAt');
    if(!filteredContents) return res.json({error: 'Not Found'})
    res.json({filteredContents: filteredContents, totalContents: totalContents});
})

module.exports = router;