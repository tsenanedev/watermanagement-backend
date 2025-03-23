var SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt"
const express = require('express')
const router = express.Router()

var jwt = require('jsonwebtoken')
var exjwt = require('express-jwt') 

const jwtMW = exjwt({
    secret: SECRET_KEY
});

// Fetch all Transactions by companyId
router.get('/:id', jwtMW, (req, res, next) => {

    var authorization = req.headers.authorization, decoded
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY)
    } catch (e) {
        return res.status(401).send('unauthorized')
    }
    const uid = decoded.uid

    let barcode = req.params.id

    if (barcode != null && uid != null) {
        req.getConnection(function (err, conn) {
            conn.query("SELECT * FROM payments WHERE barcode=? ORDER BY id DESC", [barcode], (err, payments, fields) => {
                if (err) {
                    res.status(500).send(JSON.stringify({ success: false, message: err.message }))
                } else {
                    // console.log(payments)
                    res.send(JSON.stringify({ success: true, payments: payments }))
                }
            })
        })
    } else {
        res.send(JSON.stringify({ success: false, message: 'Invalid request' }))
    }
})

module.exports = router