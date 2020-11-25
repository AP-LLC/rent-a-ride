const router = require('express').Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const crypto = require('crypto');
const nodemailer = require("nodemailer")
// const Mailgen = require("mailgen")

const { registerValidation, loginValidation } = require('../utils/validation')
const { EMAIL, PASSWORD, MAIN_URL } = require('../config')


let transporter = nodemailer.createTransport({
  service: "Yahoo",
  secure: true,
  auth: {
    user: EMAIL,
    pass: PASSWORD,
  }
})

let MailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "Nodemailer",
    link: MAIN_URL,
  },
})

router.post('/register', async (req, res, next) => {
  const { error } = registerValidation(req.body)

  if (error) return res.status(400).json({ error: error.details[ 0 ].message })

  const isEmailExist = await User.findOne({ email: req.body.email })

  if (isEmailExist)
    return res.status(400).json({ error: 'Email already exists' })

  const salt = await bcrypt.genSalt(10)
  const password = await bcrypt.hash(req.body.password, salt)

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password
  })

  try {
    await user.save()
    res.status(200).send('Success')
  } catch (error) {
    res.status(400).json({ error })
  }

  const token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });

  // Save the verification token
  token.save(function (err) {
    if (err) { return res.status(500).send({ msg: err.message }); }

    // Send the email
    const  transporter = nodemailer.createTransport({ service: 'Sendgrid', auth: { user: process.env.SENDGRID_USERNAME, pass: process.env.SENDGRID_PASSWORD } });

    const mailOptions = { from: 'matt_the_dev@yahoo.com', to: user.email, subject: 'Account Verification Token', text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + token.token + '.\n' };

    transporter.sendMail(mailOptions, function (err) {
      if (err) { return res.status(500).send({ msg: err.message }); }
      res.status(200).send('A verification email has been sent to ' + user.email + '.');
    });
  });
});
// });
// };
//
// })

// exports.signupPost = function(req, res, next) {
//   req.assert('name', 'Name cannot be blank').notEmpty();
//   req.assert('email', 'Email is not valid').isEmail();
//   req.assert('email', 'Email cannot be blank').notEmpty();
//   req.assert('password', 'Password must be at least 4 characters long').len(4);
//   req.sanitize('email').normalizeEmail({ remove_dots: false });
//
//   // Check for validation errors
//   var errors = req.validationErrors();
//   if (errors) { return res.status(400).send(errors); }
//
//   // Make sure this account doesn't already exist
//   User.findOne({ email: req.body.email }, function (err, user) {
//
//     // Make sure user doesn't already exist
//     if (user) return res.status(400).send({ msg: 'The email address you have entered is already associated with another account.' });
//
//     // Create and save the user
//     user = new User({ name: req.body.name, email: req.body.email, password: req.body.password });
//     user.save(function (err) {
//       if (err) { return res.status(500).send({ msg: err.message }); }
//
//       // Create a verification token for this user
//

router.post('/login', async (req, res) => {
  const { error } = loginValidation(req.body)

  if (error) return res.status(400).json({ error: error.details[ 0 ].message })

  const user = await User.findOne({ email: req.body.email })

  if (!user) return res.status(400).json({ error: 'Email is wrong' })

  const validPassword = await bcrypt.compare(req.body.password, user.password)
  if (!validPassword)
    return res.status(400).json({ error: 'Password is wrong' })

  const token = jwt.sign(
    {
      name: user.name,
      id: user._id
    },
    process.env.TOKEN_SECRET
  )

  res.header('auth-token', token).json({
    status: 200,
    data: {
      token
    }
  })
})

module.exports = router
