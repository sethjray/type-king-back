/**@format */

const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const status = require('http-status-codes');

const User = require('../models/user.model')
const { Statistics } = require('../models/statistics.model');
const { Mongoose } = require('mongoose');

// <<<<   api/users   >>>>

/**
 * Purpose: Adds a new user to the DB
 * Full path: /api/users/
 * req: name: String
 *      email: String (unique)
 *      password: String
 * res: token
 */
router.post('/', (req, res) => {
    bcrypt.hash(req.body.password, 10, (error, hash1) => {
        if (!error) {
            var user = new User({
              name: req.body.name,
              email: req.body.email,
              password: hash1,
              skillQuestion: req.body.skillQuestion,
              statistics: new Statistics({
                globalStats: {},
                exerciseStats: {
                  exercise1: {},
                  exercise2: {},
                  exercise3: {},
                  exercise4: {},
                  exercise5: {},
                  exercise6: {},
                  exercise7: {},
                  exercise8: {},
                  exercise9: {},
                  exercise10: {}
                },
                achievements: {}
              }),
              friends: []
            })

            user.save(error => {
            if (!error) res.status(status.StatusCodes.OK).send(User.generateJwt(user))
            else {
                res.status(status.StatusCodes.CONFLICT).send(error.message)
                console.log(error)
            }
            })
        } else {
            res
            .status(status.StatusCodes.CONFLICT)
            .send(['failed to hash password or sequrity question'])
        }
    })
})

/**
 * Purpose: Logs a user into the site
 * Full path: /api/users/token
 * req: email: String representing user email (unqiue)
 *      password: String (plaintext)
 * res: status
 */
router.post('/token', (req, res) => {
    User.findOne({ email: req.body.email }, (err, user) => {
      if (!err && user !== null) {
        bcrypt.compare(req.body.password, user.password, (err, result) => {
          if (result) res.status(status.StatusCodes.OK).send(User.generateJwt(user))
          else res.status(status.StatusCodes.UNAUTHORIZED).send('password does not match')
        })
      } else {
        res.status(status.StatusCodes.NOT_FOUND).send('user not found')
      }
    })
})

/**
 * Purpose: Updates the users token with a
 *          new token if they enter the site
 *          before the old one expires ((Default 1 week))
 * Full path: /api/users/token
 * req: old/current token
 * res: new token
 */
router.put('/token', (req, res) => {
    jwt.verify(req.body.token, process.env.JWT_KEY, (err, decoded) => {
      if (err) {
        res.status(status.StatusCodes.UNAUTHORIZED).send('failed to verify token')
      } else if (Date.now() < decoded.exp * 1000) {
        User.findById(decoded.id, (err, user) => {
          if (!err && user != null) {
            res.status(status.StatusCodes.CREATED).send(User.generateJwt(user))
          } else {
            res.status(status.StatusCodes.NOT_FOUND).send('user not found')
          }
        })
      } else {
        res.status(status.StatusCodes.UNAUTHORIZED).send('token expired')
      }
    })
})


/**
 * Purpose: Gets the users statistics
 * Full path: /api/users/userid/
 * req: :userid
 * res: user statistics
 */
router.get('/:userid/', (req, res) => {
  User.findById(req.params.userid, (err, user) => {
    if(!err && user != null) {
      res.status(status.StatusCodes.OK).send(user.statistics)
    } else res.status(status.StatusCodes.UNAUTHORIZED).send('statistics not found')
  })
})


/**
 * Purpose: Updates the users statistics
 * Full path: /api/users/userid/
 * req: exerciseId:
 *      wordsPerMinute:
 *      accuracy:
 *      wordsTyped:
 * res: 
 */
router.put('/:userid/', (req, res) => {

  User.findOneAndUpdate(
    {_id: req.params.userid}, 
    {$set:{"statistics": req.body.statistics}},
    {returnNewDocument: true, useFindAndModify: false}, function(err, user) {
      if(!err) {
        console.log('Successfully updated document.')
        res.sendStatus(status.StatusCodes.OK).send()
      } else res.status(status.StatusCodes.CONFLICT).send(err.message)
    });

})


/**
 * Purpose: Add a friend to a user
 * Full path: /api/users/userid/friends/friendid
 * req: :userid
 *      :friendid
 * res: user.friends
 */
router.post('/:userid/friends/:friendid', (req, res) => {
  User.findByIdAndUpdate(
    req.params.userid,
    {
      $push: { friends: req.params.friendid }
    },
    (err, user) => {
      console.log(user.friends)
      if(!err && user != null)
        res.status(status.StatusCodes.OK).send(req.params.friendid)
      else res.status(status.StatusCodes.NOT_FOUND).send('friend not found')
    }
  )
})

/**
 * Purpose: Add a friend to a user
 * Full path: /api/users/userid/friends/
 * req: :userid
 *      req.body.email
 * res: user.friends
 */
 router.post('/:userid/friends/', (req, res) => {
  User.findOne({email: req.body.email}, (err, friend) =>{
    if(!err && friend != null) {
      User.findOneAndUpdate(
        req.params.userid,
        {
          $push: { friends: friend._id }
        },
        (err, user) => {
          if(!err && user != null)
            res.status(status.StatusCodes.OK).send(user.friends)
          else res.status(status.StatusCodes.NOT_FOUND).send('friend not found')
        }
      )
    }
  })
})

/**
 * Purpose: Gets the users freinds
 * Full path: /api/users/userid/friends/
 * req: :userid
 * res: user.friends
 */
 router.get('/:userid/friends/', (req, res) => {
  User.findById(req.params.userid, (err, user) => {
    if(!err && user != null) {

      User.find({ _id: { $in: user.friends } })
        .select(' _id name statistics')
        .exec((err, friends) => {
          if(!err && friends != null) res.status(status.StatusCodes.OK).send(friends)
          else res.status(status.StatusCodes.NOT_FOUND).send('friends not found...')
        })
    } else res.status(status.StatusCodes.UNAUTHORIZED).send('user not found')
  })
});

/**
 * Purpose: Gets a specific friend
 * Full path: /api/users/userid/friends/friendid
 * req: :userid
 * res: specific friend user.name
 */
 router.get('/:userid/friends/:friendid', (req, res) => {
  User.findById(req.params.friendid, (err, user) => {
    if(!err && user != null) {
      res.status(status.StatusCodes.OK).send(user.name)
    } else res.status(status.StatusCodes.UNAUTHORIZED).send('friends not found')
  })
})

module.exports = router