const router = require("express").Router()

router.get("/profile", (req, res) => {
  res.status(200).send({
    data: {
      title: "My Profile",
      content: "dashboard content",
      user: req.user,
    },
  })
})

module.exports = router
