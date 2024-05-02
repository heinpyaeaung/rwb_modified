const jwt = require('jsonwebtoken')

async function jwtEncrypt(req, res, next){
    if(!req.cookies.secretkey){
        return res.json({error: 'Not Member'});
    }

    let decoded = await jwt.verify(req.cookies.secretkey, process.env.SECRET_KEY);
    if(!decoded) return res.json({error: 'Access denied'});

    res.user_email = decoded.email;
    res.user_infos = decoded;
    next();
}

module.exports = jwtEncrypt;

