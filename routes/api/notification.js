const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const exjwt = require('express-jwt')
const fetch = require('node-fetch')

const SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt"

const jwtMW = exjwt({
    secret: SECRET_KEY
});

router.post('/', jwtMW, (req, res, next) => {

    var authorization = req.headers.authorization, decoded
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY)
    } catch (e) {
        return res.status(401).send('unauthorized')
    }
    const uid = decoded.uid

    const title = req.body.title
    const content = req.body.content
    const fcmToken = req.body.fcmToken

    const fcmTokens = [fcmToken]

    let notification = { title, content }
    let notificationBody = {
        notification,
        registration_ids: fcmTokens
    }

    if (uid != null && content != null) {

        fetch('https://fcm.googleapis.com/fcm/send', {
            "method": "POST",
            "headers": {
                "Authorization": "key=" + "AAAALxnHx9I:APA91bELSDVhqy4sKcgo9IWP3bjPSXwb1Ul4Pjtk5kJ3Vc7KBp2cUhS1EdSN58MjKk62pMhWCY_ksB-N6OM-_Qqo8DBacGHKBaRMLiqURcTLsUtCzcd7pWy6x5y721poNd_zfSmzfIha",
                "Content-Type": "application/json"
            },
            "body": JSON.stringify(notificationBody)
        })
            .then(() => {
                res.status(200)
                res.send(JSON.stringify({ success: true, message: 'Message sent successfully' }))
            })
            .catch((err) => {
                res.status(400)
                res.send(JSON.stringify({ success: false, message: 'Something went wrong' }))
            })

    } else {
        res.send(JSON.stringify({ success: false, message: 'Invalid API key' }))
    }

})



module.exports = router