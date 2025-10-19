const functions = require('firebase-functions')

const sgMail = require('@sendgrid/mail')
const cors = require('cors')({ origin: true })

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

exports.sendEmail = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { to, subject, text } = req.body

      const msg = {
        to,
        from: 'hisomi469@gmail.com',
        subject,
        text,
      }

      await sgMail.send(msg)
      res.status(200).send({ success: true, message: 'Email sent successfully!' })
    } catch (error) {
      console.error('Error sending email:', error)
      res.status(500).send({ success: false, message: error.message })
    }
  })
})

exports.calculateRatingStats = functions.https.onRequest((req, res) => {
  res.send('calculateRatingStats function restored.')
})

exports.generateRatingReport = functions.https.onRequest((req, res) => {
  res.send('generateRatingReport function restored.')
})

exports.getRatingTrends = functions.https.onRequest((req, res) => {
  res.send('getRatingTrends function restored.')
})

exports.validateRating = functions.https.onRequest((req, res) => {
  res.send('validateRating function restored.')
})
