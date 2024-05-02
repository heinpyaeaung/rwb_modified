const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const err = require('../middlewares/error.js')
const Auth = require('../routes/auth')
const AdminUserPermission = require('../routes/adminRoles/permissionMember.js')
const AdminDelContent = require('../routes/adminRoles/delContent')
const AdminDelMember = require('../routes/adminRoles/delMember.js')

const MemberAddContent = require('../routes/memberRoles/addContent')
const MemberGetContent = require('../routes/memberRoles/getContent')
const MemberRateContent = require('../routes/memberRoles/rateContent')

const getContentByProfile = require('../routes/profile/getContens.js')
const deleteContentByProfile = require('../routes/profile/delContents.js')
const corsOptions = {
    origin: "*"
}; 
module.exports = function(app){
    app.use(cors(corsOptions));
    app.use(cookieParser());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));

    app.use('/api/', Auth);
    app.use('/api/', AdminUserPermission);
    app.use('/api/', AdminDelContent);
    app.use('/api/', AdminDelMember);

    app.use('/api/', MemberAddContent);
    app.use('/api/', MemberGetContent);
    app.use('/api/', MemberRateContent);

    app.use('/api/', getContentByProfile);
    app.use('/api/', deleteContentByProfile);
    app.use(err);
}