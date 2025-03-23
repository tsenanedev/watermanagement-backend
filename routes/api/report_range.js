var SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt"
const express = require('express')
const router = express.Router()

var jwt = require('jsonwebtoken')
var exjwt = require('express-jwt')

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

    let startDate = req.body.startDate
    let endDate = req.body.endDate

    if (uid != null) {
        req.getConnection(function (err, conn) {
            conn.query("SELECT * FROM transactions WHERE `createdAt` BETWEEN ? AND ?", [startDate, endDate], function (err, rows, fields) {
                if (err) {
                    res.status(500)
                    res.send(JSON.stringify({ success: false, message: err.message }))
                }
                else {
                    if (rows.length > 0) {
                        res.send(JSON.stringify({ success: true, result: rows }))
                    }
                    else {
                        res.send(JSON.stringify({ success: false, message: 'Transacoes indisponiveis!' }))
                    }
                }
            })
        })
    } else {
        res.send(JSON.stringify({ success: false, message: 'Invalid' }))
    }
})

module.exports = router