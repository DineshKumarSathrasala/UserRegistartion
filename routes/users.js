var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Role = require('../models/role');
var passport = require('passport');
var authenticate = require('../authenticate');

router.get('/', authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  User.find({})
    .populate('role')
    .then((users) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(users);
    }, (err) => next(err))
    .catch((err) => next(err));
});

router.post('/signup', authenticate.createRoles, (req, res, next) => {
  User.register(new User({ username: req.body.username }),
    req.body.password).then(async user => {
      if (req.body.firstname)
        user.firstname = req.body.firstname;
      if (req.body.lastname)
        user.lastname = req.body.lastname;
      let role = await Role.find({ name: { $in: ['Admin', 'User'] } }).lean();
      if (role && role.length) {
        let adminRole = role.find((r) => {
          return r.name === 'Admin';
        });
        let userRole = role.find((r) => {
          return r.name === 'User';
        });
        let useradmin = await User.findOne({ role: adminRole && adminRole._id }).lean();
        if (!useradmin)
          user.role = adminRole && adminRole._id;
        else
          user.role = userRole && userRole._id;
      } else {
        return res.json({ success: false, error: 'Something went wrong!' });
      }
      user.save().then(user => {
        passport.authenticate('local')(req, res, () => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({ success: true, status: 'Registration Successful!' });
        });
      }).catch(err => {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({ err: err });
      });
    }).catch(err => {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({ err: err });
    });
});

router.post('/login', passport.authenticate('local'), (req, res) => {
  var token = authenticate.getToken({_id: req.user._id});
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, token: token, status: 'You are successfully logged in!'});
});

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;