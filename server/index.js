/** @format */
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const authRoutes = require("./routes/auth")
require('dotenv').config()

const app = express()

const { SERVER_PORT, CONNECTION_STRING } = process.env

const port = SERVER_PORT || 8000

// Middlewares
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.json())

// Route Middlewares
app.use("/auth/user", authRoutes)

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
