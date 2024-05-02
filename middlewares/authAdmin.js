const jwt = require('jsonwebtoken')
async function AuthAdmin(req, res, next){
       if(!req.cookies.secretkey) return res.json({error: 'session expired'});
       let decoded = await jwt.verify(req.cookies.secretkey,  process.env.SECRET_KEY);
       if(!decoded) return res.json({error: 'Access denied'});

       if(!decoded.admin) return res.json({error: 'Not Allowed'});
       
       next();
}

module.exports = AuthAdmin;


