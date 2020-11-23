const router = require("express").Router()

router.get("/", (req, res) => {
  res.json({
    data: {
      title: "My Profile",
      content: "dashboard content",
      user: req.user,
    },
  })
})

module.exports = router
