const router = require('express').Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const crypto = require('crypto');
const nodemailer = require("nodemailer")

const { registerValidation, loginValidation } = require('../utils/validation')


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
