/** @format */
require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')

const app = express()

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.json())

const { SERVER_PORT, CONNECTION_STRING } = process.env

mongoose.connect(CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true }, () => {
  console.log("succesfully connected to database")
})

const port = SERVER_PORT || 8000

app.listen(port, () => {
  console.log(`Server connected on port: ${SERVER_PORT}`)
})
