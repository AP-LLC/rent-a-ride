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
const resetRoutes = require('../routes/reset')
// const payRoute = require('../routes/payment')

const { SERVER_PORT, CONNECTION_STRING, COOKIE_SECRET } = process.env
const port = SERVER_PORT || 5000
const uri = CONNECTION_STRING

const app = express()

// Middlewares
app.use(morgan('dev'))
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cookieSession({
  name: COOKIE_SECRET,
  keys: ['key1', 'key2']
}))
app.use(passport.initialize())
app.use(passport.session())

// Routes Middlewares
app.use('/api/user', authRoutes)
app.use('/api/protected', verifyToken, protectedRoutes)
app.use('/api/reset', resetRoutes)
// app.use('./api/payment', payRoute)

// TODO check that the verifyToken lines up with success route
// Routes
app.get('/', (req, res) => res.send('You are not logged in!'))
app.get('/failed', (req, res) => res.send('You failed to log in correctly!'))

// TODO getting unauthorized error using auth middleware needs fix
app.get('/success', isLoggedIn,
  (req, res) => res.send('Toast to success mr. or mrs. ${req.user.email}!'))

// Google Auth
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }))

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/failed' }),
  (req, res) => {
// If 🚀 Success redirect to specified route
    res.redirect('/success')
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
      useCreateIndex: true
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

