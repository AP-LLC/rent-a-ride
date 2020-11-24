/** @format */
require('dotenv').config()
const express = require('express')
const app = express()
const mongoose = require('mongoose')

mongoose.connect(
// DB connection
 process.env.CONNECTION_STRING,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  },
  () => console.log('🚀 DB Blasting Off')
)


// Middlewares
const protectedRoutes = require("../routes/protected")
const verifyToken = require("../routes/validate-token")
const authRoutes = require("../routes/auth")
app.use(express.json())

// Route Middlewares
app.use("/api/user", authRoutes)
app.use("/api/protected", verifyToken, protectedRoutes)

// Google Auth
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }))

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {

  res.redirect('/')
  })

// Server Port
app.listen(process.env.SERVER_PORT, () => {
  console.log(`Server connected on port: ${ process.env.SERVER_PORT }`)
})
