module.exports = function (err, req, res, next){
    res.json({error: err.message});
}