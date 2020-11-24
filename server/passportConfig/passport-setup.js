const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20')

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: `http://localhost:3000/auth/google/callback`
  },
  function (accessToken, refreshToken, profile, done) {
    User.findOnCreate({ googleId: profile.id }, function (err, user) {
      return done(err, user)
    })
  }
))
