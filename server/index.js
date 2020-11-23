/** @format */
require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const authRoutes = require("./routes/auth")
const protectedRoutes = require("./routes/protected")
const verifyToken = require("./routes/jwt-token")

const app = express()

const { SERVER_PORT, CONNECTION_STRING } = process.env

const port = SERVER_PORT

mongoose.connect(
// DB connection
  CONNECTION_STRING,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  },
  () => console.log('🚀 DB Blasting Off')
)

// Middlewares
app.use(express.json())

// Route Middlewares
    app.use("/api/user", authRoutes)
    app.use("/api/protected", verifyToken, protectedRoutes)

// Server Port
app.listen(port, () => {
  console.log(`Server connected on port: ${ SERVER_PORT }`)
})
