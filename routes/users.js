/**@format */

const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const status = require('http-status-codes');

const User = require('../models/user.model')
const { Statistics } = require('../models/statistics.model')

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
              })
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
  // const query = {"_id": req.params.userid};
  // const update = {
  //   "$inc" : {"statistics.globalStats.wordsTyped": req.body.wordsTyped}
  // };
  // const options = { returnNewDocument: true, useFindAndModify: false };

  // return User.findOneAndUpdate(query, update, options, function(err) {
  //   if(!err) {
  //     res.sendStatus(status.StatusCodes.OK).send()
  //   } else res.status(status.StatusCodes.CONFLICT).send(err.message)
  // })
  // .then(updatedDocument => {
  //   if(updatedDocument) {
  //     console.log(`Successfully updated document: ${updatedDocument}.`)
  //   } else {
  //     console.log("No document matches the provided query.")
  //   }
  // })
  // .catch(err => console.log(err))

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

module.exports = router