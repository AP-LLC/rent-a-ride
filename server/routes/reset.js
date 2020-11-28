// const router = require('express').Router()
// const { Token } = require('../models/Token')
// const User = require('../models/User')
// const nodemailer = require('nodemailer')
// const crypto = require('crypto')
//
// router.post('/confirmation', (req, res, next) => {
//   req.assert('email', 'Email is not valid').isEmail()
//   req.assert('email', 'Email cannot be blank').notEmpty()
//   req.assert('token', 'Token cannot be blank').notEmpty()
//   req.sanitize('email').normalizeEmail({ remove_dots: false })
//
//   const errors = req.validationErrors()
//   if (errors) return res.status(400).send(errors)
//
//   Token.findOne({ token: req.body.token }, (err, token) => {
//     if (!token) return res.status(400).
//       send({
//         type: 'not-verified',
//         msg: 'We were unable to find a valid token. Your token my have expired.'
//       })
//
//     User.findOne({ _id: token._userId, email: req.body.email }, (err, user) => {
//       if (!user) return res.status(400).
//         send({ msg: 'We were unable to find a user for this token.' })
//       if (user.isVerified) return res.status(400).
//         send({
//           type: 'already-verified',
//           msg: 'This user has already been verified.'
//         })
//
//       user.isVerified = true
//       user.save(err => {
//         if (err) { return res.status(500).send({ msg: err.message }) }
//         res.status(200).send('The account has been verified. Please log in.')
//       })
//     })
//   })
// })
//
// router.post('/resend', (req, res, next) => {
//   req.assert('email', 'Email is not valid').isEmail()
//   req.assert('email', 'Email cannot be blank').notEmpty()
//   req.sanitize('email').normalizeEmail({ remove_dots: false })
//
//   const errors = req.validationErrors()
//   if (errors) return res.status(400).send(errors)
//
//   User.findOne({ email: req.body.email }, function (err, user) {
//     if (!user) return res.status(400).
//       send({ msg: 'We were unable to find a user with that email.' })
//     if (user.isVerified) return res.status(400).
//       send({ msg: 'This account has already been verified. Please log in.' })
//
//     const token = new Token(
//       { _userId: user._id, token: crypto.randomBytes(16).toString('hex') })
//
//     token.save(function (err) {
//       if (err) { return res.status(500).send({ msg: err.message }) }
//
//       const transporter = nodemailer.createTransport({
//         service: 'Sendgrid',
//         auth: {
//           user: process.env.SENDGRID_USERNAME,
//           pass: process.env.SENDGRID_PASSWORD
//         }
//       })
//
//       const mailOptions = {
//         from: 'no-reply@codemoto.io',
//         to: user.email,
//         subject: 'Account Verification Token',
//         text: 'Hello,\n\n' +
//           'Please verify your account by clicking the link: \nhttp:\/\/' +
//           req.headers.host + '\/confirmation\/' + token.token + '.\n'
//       }
//
//       transporter.sendMail(mailOptions, (err) => {
//         if (err) { return res.status(500).send({ msg: err.message }) }
//         res.status(200).
//           send('A verification email has been sent to ' + user.email + '.')
//       })
//     })
//   })
// })
//
// module.exports = router
