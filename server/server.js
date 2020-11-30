/** @format */
require('dotenv').config()
require('./passportConfig/passport-setup')

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieSession = require('cookie-session')
const passport = require('passport')
const morgan = require('morgan')

const { SERVER_PORT, CONNECTION_STRING, COOKIE_SECRET } = process.env
const port = SERVER_PORT || 5000
const uri = CONNECTION_STRING

const app = express()

app.use(cookieSession({
  name: COOKIE_SECRET,
  keys: ['key1', 'key2']
}))

app.use(morgan('dev'))
app.use(cors())
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(passport.initialize())
app.use(passport.session())

app.set('views', './views')
app.set('view engine', 'ejs')

// Routes
app.get('/', (req, res) => res.send('You are not logged in!'))
app.get('/failed', (req, res) => res.send('You failed to log in correctly!'))

app.get('/success',
  (req, res) => res.send('Toast to success mr. or mrs. ${req.user.email}!'))

// Google Auth
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }))

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/failed' }),
  (req, res) => {

    res.redirect('/success')
  })

app.get('/logout', (req, res) => {
  req.session = null
  req.logout()

  res.redirect('/')
})

require('./routes')(app)
require('./middlewares/jwt')(passport)

// Startup Server and Connect DB
app.listen(port, (err) => {
  if (err) console.log('Error in server setup')
  console.log(`👨 To Infinity & Beyond on Port => ${ port }`)

  try {
    // mongoose.promise = global.Promise
    mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    })
  } catch (error) {
    console.error(error)
  }

  mongoose.connection.on('error', (err) => {
    console.log(
      'MonogoDB connection error. Please make sure MonogoDB is running. ' + err)
  })
  mongoose.connection.on('connected', () => {
    console.log('🚀 DB Blasting Off')
  })
})

