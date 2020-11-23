/** @format */
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const authRoutes = require("./routes/auth")
const protectedRoutes = require("./routes/protected")
const verifyToken = require("./routes/jwt-token")
require('dotenv').config()

const app = express()

const { SERVER_PORT, CONNECTION_STRING } = process.env

const port = SERVER_PORT || 8000

// Middlewares
app.use(cors())
app.use(express.json())

// Route Middlewares
app.use("/auth/user", authRoutes)
app.use("/auth/protected", verifyToken, protectedRoutes)

// DB connection
mongoose.connect(
  CONNECTION_STRING,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  },
  () => console.log('🚀 DB Blasting Off')
  )

// Server Port
app.listen(port, () => {
  console.log(`Server connected on port: ${ SERVER_PORT }`)
})
