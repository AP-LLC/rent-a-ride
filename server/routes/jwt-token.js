const jwt = require("jsonwebtoken")

const verifyToken = (req, res, next) => {
  const token = req.header("auth-token")
  if (!token) return res.status(401).send('Access denied')

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch (err) {
    res.status(400).send(err)
  }
}

module.exports = verifyToken
