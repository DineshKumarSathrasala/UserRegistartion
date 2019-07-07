var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
var Role = require('./models/role');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

var config = require('./config.js');

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = (user) => {
    return jwt.sign(user, config.secretKey, { expiresIn: 86400 });
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload, done) => {
        console.log("JWT payload: ", jwt_payload);
        User.findOne({
            _id: jwt_payload._id
        }).populate('role').then(user => {
            return done(null, user);
        }).catch(err => {
            done(err, null)
        })
    }));

exports.verifyUser = passport.authenticate('jwt', { session: false });

exports.verifyAdmin = (req, res, next) => {
    console.log("User: ", req.user);
    if (req.user.role && req.user.role.name && req.user.role.name === 'Admin') {
        next();
    }
    else {
        var err = new Error('You are not authorized to perform this operation!');
        err.status = 403;
        return next(err);
    }
}

exports.createRoles = async (req, res, next) => {
    let roles = await Role.find({});
    if (roles && roles.length)
        return next();
    let userRoles = [
        { name: 'Admin' },
        { name: 'User' }
    ];
    return Role.create(userRoles).then(roles => {
        next();
    }).catch(err => {
        next(err);
    })
}