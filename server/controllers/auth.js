// require('../server')
const User = require('../models/User')
const Token = require('../models/Token')
const { sendEmail } = require('../utils/index')
// const ejs = require('ejs')
// const path = require('path')

// @route POST api/auth/register
// @desc Register user
// @access Public
exports.register = async (req, res) => {
  try {
    const { email } = req.body

    // Make sure this account doesn't already exist
    const user = await User.findOne({ email })

    if (user) return res.status(401).
      json(
        { message: 'The email address you have entered is already associated with another account.' })

    const newUser = new User({ ...req.body, role: 'basic' })

    const user_ = await newUser.save()

    await sendVerificationEmail(user_, req, res)

  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @route POST api/auth/login
// @desc Login user and return JWT token
// @access Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })

    if (!user) return res.status(401).
      json({
        msg: 'The email address ' + email +
          ' is not associated with any account. Double-check your email address and try again.'
      })

    //validate password
    if (!user.comparePassword(password)) return res.status(401).
      json({ message: 'Invalid email or password' })

    // Make sure the user has been verified
    if (!user.isVerified) return res.status(401).
      json({
        type: 'not-verified',
        message: 'Your account has not been verified.'
      })

    // Login successful, write token, and send back user
    res.status(200).json({ token: user.generateJWT(), user: user })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ===EMAIL VERIFICATION
// @route GET api/verify/:token
// @desc Verify token
// @access Public
exports.verify = async (req, res) => {
  if (!req.params.token) return res.status(400).
    json({ message: 'We were unable to find a user for this token.' })

  try {
    // Find a matching token
    const token = await Token.findOne({ token: req.params.token })

    if (!token) return res.status(400).
      json(
        { message: 'We were unable to find a valid token. Your token my have expired.' })

    // If we found a token, find a matching user
    User.findOne({ _id: token.userId }, (err, user) => {
      if (!user) return res.status(400).
        json({ message: 'We were unable to find a user for this token.' })

      if (user.isVerified) return res.status(400).
        json({ message: 'This user has already been verified.' })

      // Verify and save the user
      user.isVerified = true
      user.save(function (err) {
        if (err) return res.status(500).json({ message: err.message })

        res.status(200).send('The account has been verified. Please log in.')
      })
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route POST api/resend
// @desc Resend Verification Token
// @access Public
exports.resendToken = async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email })

    if (!user) return res.status(401).
      json({
        message: 'The email address ' + req.body.email +
          ' is not associated with any account. Double-check your email address and try again.'
      })

    if (user.isVerified) return res.status(400).
      json(
        { message: 'This account has already been verified. Please log in.' })

    await sendVerificationEmail(user, req, res)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

async function sendVerificationEmail (user, req, res) {
  try {
    const token = user.generateVerificationToken()

    // Save the verification token
    await token.save()

    const subject = 'Account Verification Token'
    const to = user.email
    const link = 'http://' + req.headers.host + '/api/auth/verify/' +
      token.token
    const from = process.env.FROM_EMAIL
    // html = dhtml: ejs.renderFile(
    //   path.join(__dirname, '/views/email-template.ejs'), {
    //     redirectLink: link,
    //     user: user.username
    //   })

    // `<p>Hi ${ user.username }<p><br><p>Please click on the following <a href="${ link }">link</a> to verify your account.</p>
    //             <br><p>If you did not request this, please ignore this email.</p>`

    let html =
      `  <style type="text/css">
      @media screen {
    @font-face {
        font-family: 'Lato';
        font-style: normal;
        font-weight: 400;
        src: local('Lato Regular'), local('Lato-Regular'), url(https://fonts.gstatic.com/s/lato/v11/qIIYRU-oROkIk8vfvxw6QvesZW2xOQ-xsNqO47m55DA.woff) format('woff');
      }

    @font-face {
        font-family: 'Lato';
        font-style: normal;
        font-weight: 700;
        src: local('Lato Bold'), local('Lato-Bold'), url(https://fonts.gstatic.com/s/lato/v11/qdgUG4U09HnJwhYI-uK18wLUuEpTyoUstqEm5AMlJo4.woff) format('woff');
      }

    @font-face {
        font-family: 'Lato';
        font-style: italic;
        font-weight: 400;
        src: local('Lato Italic'), local('Lato-Italic'), url(https://fonts.gstatic.com/s/lato/v11/RYyZNoeFgb0l7W3Vu1aSWOvvDin1pK8aKteLpeZ5c0A.woff) format('woff');
      }

    @font-face {
        font-family: 'Lato';
        font-style: italic;
        font-weight: 700;
        src: local('Lato Bold Italic'), local('Lato-BoldItalic'), url(https://fonts.gstatic.com/s/lato/v11/HkF_qI1x_noxlxhrhMQYELO3LdcAZYWl9Si6vvxL-qU.woff) format('woff');
      }
    }

    body,
      table,
      td,
      a {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }

    table,
      td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }

    img {
      -ms-interpolation-mode: bicubic;
    }

    /* RESET STYLES */
    img {
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }

    table {
      border-collapse: collapse !important;
    }

    body {
      height: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
    }

    /* iOS BLUE LINKS */
    a[x-apple-data-detectors] {
      color: inherit !important;
      text-decoration: none !important;
      font-size: inherit !important;
      font-family: inherit !important;
      font-weight: inherit !important;
      line-height: inherit !important;
    }

  @media screen and (max-width:600px) {
      h1 {
        font-size: 32px !important;
        line-height: 32px !important;
      }
    }

    div[style*="margin: 16px 0;"] {
      margin: 0 !important;
    }
  </style>
  </head>
    
  <body style="background-color: #f4f4f4; margin: 0 !important; padding: 0 !important;">
  <!-- HIDDEN PREHEADER TEXT -->
  <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: 'Lato', Helvetica, Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;"> We're thrilled to have you here! Get ready to dive into your new account. </div>
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
  <!-- LOGO -->
  <tr>
  <td bgcolor="#FFA73B" align="center">
 <p>Hi ${ user.username }<p><br><p>Please click on the following <a href="${ link }">link</a> to verify your account.</p>
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
  <tr>
  <td align="center" valign="top" style="padding: 40px 10px 40px 10px;"> </td>
  </tr>
  </table>
  </td>
  </tr>
  <tr>
  <td bgcolor="#FFA73B" align="center" style="padding: 0px 10px 0px 10px;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
  <tr>
  <td bgcolor="#ffffff" align="center" valign="top" style="padding: 40px 20px 20px 20px; border-radius: 4px 4px 0px 0px; color: #111111; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 48px; font-weight: 400; letter-spacing: 4px; line-height: 48px;">
  <h1 style="font-size: 48px; font-weight: 400; margin: 2;">Welcome! ${ user.email } </h1> <img src=" https://img.icons8.com/clouds/100/000000/handshake.png" width="125" height="120" style="display: block; border: 0px;" />
  </td>
  </tr>
  </table>
  </td>
  </tr>
  <tr>
  <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
  <tr>
  <td bgcolor="#ffffff" align="left" style="padding: 20px 30px 40px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
  <p style="margin: 0;">We're excited to have you get started. First, you need to confirm your account. Just press the button below.</p>
  </td>
  </tr>
  <tr>
  <td bgcolor="#ffffff" align="left">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
  <tr>
  <td bgcolor="#ffffff" align="center" style="padding: 20px 30px 60px 30px;">
  <table border="0" cellspacing="0" cellpadding="0">
  <tr>
  <td align="center" style="border-radius: 3px;" bgcolor="#FFA73B"><a href="${ link }" target="_blank" style="font-size: 20px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; color: #ffffff; text-decoration: none; padding: 15px 25px; border-radius: 2px; border: 1px solid #FFA73B; display: inline-block;">Confirm Account</a></td>
  </tr>
  </table>
  <tr> 
  </tr>
  </table>
  </td>
  </tr> <!-- COPY -->
  <tr>
  <td bgcolor="#ffffff" align="left" style="padding: 0px 30px 0px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
  <p style="margin: 0;">If that doesn't work, copy and paste the following link in your browser:</p>
  </td>
  </tr> <!-- COPY -->
  <tr>
  <td bgcolor="#ffffff" align="left" style="padding: 20px 30px 20px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
  <p style="margin: 0;"><a href="#" target="_blank" style="color: #FFA73B;">https://bit.li.utlddssdstueincx</a></p>
  </td>
  </tr>
  <tr>
  <td bgcolor="#ffffff" align="left" style="padding: 0px 30px 20px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
  <p style="margin: 0;">If you have any questions, just reply to this email we're always happy to help out.</p>
  </td>
  </tr>
  <tr>
  <td bgcolor="#ffffff" align="left" style="padding: 0px 30px 40px 30px; border-radius: 0px 0px 4px 4px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
  <p style="margin: 0;">Thanks,<br>AP-LLC Team</p>
  </td>
  </tr>
  </table>
  </td>
  </tr>
  <tr>
  <td bgcolor="#f4f4f4" align="center" style="padding: 30px 10px 0px 10px;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
  <tr>
  <td bgcolor="#FFECD1" align="center" style="padding: 30px 30px 30px 30px; border-radius: 4px 4px 4px 4px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
  <h2 style="font-size: 20px; font-weight: 400; color: #111111; margin: 0;">Need more help?</h2>
  <p style="margin: 0;"><a href="#" target="_blank" style="color: #FFA73B;">We&rsquo;re here to help you out</a></p>
  </td>
  </tr>
  </table>
  </td>
  </tr>
  <tr>
  <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
  <tr>
  <td bgcolor="#f4f4f4" align="left" style="padding: 0px 30px 30px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 400; line-height: 18px;"> <br>
  <p style="margin: 0;">If these emails get annoying, please feel free to <a href="#" target="_blank" style="color: #111111; font-weight: 700;">unsubscribe</a>.</p>
  </td>
  </tr>
  </table>
  </td>
  </tr>
  </table>
  </body>`

    await sendEmail({ to, from, subject, html })

    res.status(200).
      json({
        message: 'A verification email has been sent to ' + user.email + '.'
      })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
