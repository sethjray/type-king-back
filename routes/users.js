/**@format */

const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const status = require('http-status-codes');

const User = require('../models/user.model')

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
            created: Date.now()
            })

            user.save(error => {
            if (!error) res.status(status.OK).send(User.generateJwt(user))
            else {
                res.status(status.CONFLICT).send(error.message)
                console.log(error)
            }
            })
        } else {
            res
            .status(status.CONFLICT)
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
          if (result) res.status(status.OK).send(User.generateJwt(user))
          else res.status(status.UNAUTHORIZED).send('password does not match')
        })
      } else {
        res.status(status.NOT_FOUND).send('user not found')
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
    jwt.verify(req.body.token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        res.status(status.UNAUTHORIZED).send('failed to verify token')
      } else if (Date.now() < decoded.exp * 1000) {
        User.findById(decoded.id, (err, user) => {
          if (!err && user != null) {
            res.status(status.CREATED).send(User.generateJwt(user))
          } else {
            res.status(status.NOT_FOUND).send('user not found')
          }
        })
      } else {
        res.status(status.UNAUTHORIZED).send('token expired')
      }
    })
})

module.exports = router