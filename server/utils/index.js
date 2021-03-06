/** @format */
require('dotenv').config()
require('../passportConfig/passport-setup')
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const bodyParser = require('body-parser')
const cookieSession = require('cookie-session')
const passport = require('passport')
const morgan = require('morgan')
const protectedRoutes = require('../routes/protected')
const verifyToken = require('../routes/validate-token')
const isLoggedIn = require('../middlewares/auth')
const authRoutes = require('../routes/auth')

const { SERVER_PORT, CONNECTION_STRING, COOKIE_SESSION, KEY1, KEY2 } = process.env
const port = SERVER_PORT || 5000
const uri = CONNECTION_STRING

const app = express()

// Middlewares
app.use(morgan('dev'))
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cookieSession({
  name: COOKIE_SESSION,
  keys: KEY1, KEY2
}))
app.use(passport.initialize())
app.use(passport.session())

// Routes Middlewares
app.use('/api/user', authRoutes)
app.use('/api/protected', verifyToken, protectedRoutes)

// Routes
app.get('/', (req, res) => res.send('You are not logged in!'))
app.get('/failed', (req, res) => res.send('You failed to log in correctly!'))
app.get('/success', isLoggedIn,
  (req, res) => res.send('Toast to success mr. or mrs. ${req.user.email}!'))

// Google Auth
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }))

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function (req, res) {
// If 🚀 Success redirect to specified route
    res.redirect('/')
  })

app.get('/logout', (req, res) => {
  req.session = null
  req.logout()
  res.redirect('/')
})

// Startup Server and Connect DB
app.listen(port, (err) => {
  if (err) console.log('Error in server setup')
  console.log(`👨 To Infinity & Beyond on Port => ${ port }`)

  try {
    mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: false
    })
  } catch (error) {
    console.error(error)
  }

  mongoose.connection.on('error', (e) => {
    console.log('mongo connect error!')
  })
  mongoose.connection.on('connected', () => {
    console.log('🚀 DB Blasting Off')
  })
})

