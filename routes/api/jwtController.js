var SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt"

var express = require('express')
var router = express.Router()
var jwt = require('jsonwebtoken')
var exjwt = require('express-jwt')

const jwtMW = exjwt({
    secret: SECRET_KEY
});

// JWT TEST
router.get('/', jwtMW, function (req, res, next) {
    var authorization = req.headers.authorization, decoded

    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY)
    } catch (e) {
        return res.status(401).send('unauthorized')
    }
    const uid = decoded.uid

    res.send(JSON.stringify({ success: true, message: uid }))
})

//JWT
router.post('/', function (req, res, next) {

    const uid = req.body.uid

    if (uid != null) {

        let token = jwt.sign({ uid: uid }, SECRET_KEY, {}) // Sign Token

        res.send(JSON.stringify({ success: true, token: token }))
    }
    else {
        res.send(JSON.stringify({ success: false, message: 'Código uid inválido' }))
    }

})

module.exports = router