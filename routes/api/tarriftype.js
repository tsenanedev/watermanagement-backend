var SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt"

const express = require('express')
const router = express.Router()
var jwt = require('jsonwebtoken')
var exjwt = require('express-jwt')

const jwtMW = exjwt({
    secret: SECRET_KEY
});

// Users
router.get('/', jwtMW, (req, res, next) => {

    var authorization = req.headers.authorization, decoded
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY)
    } catch (e) {
        return res.status(401).send('unauthorized')
    }
    const uid = decoded.uid

    if (uid != null) {
        req.getConnection(function (err, conn) {
            conn.query("SELECT * FROM tarrif_type", [uid], function (err, rows, fields) {
                if (err) {
                    res.status(500)
                    res.send(JSON.stringify({ success: false, message: err.message }))
                }
                else {
                    if (rows.length > 0) {
                        res.send(JSON.stringify({ success: true, result: rows }))
                    }
                    else {
                        res.send(JSON.stringify({ success: false, message: 'Uid not available in our database!' }))
                    }
                }
            })
        })
    } else {
        res.send(JSON.stringify({ success: false, message: 'Invalid request' }))
    }
})

router.get('/:id', jwtMW, (req, res, next) => {

    var authorization = req.headers.authorization, decoded
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY)
    } catch (e) {
        return res.status(401).send('unauthorized')
    }
    const uid = decoded.uid

    let tarrifTypeId = req.params.id

    if (uid != null && tarrifTypeId != null) {
        req.getConnection(function (err, conn) {
            conn.query("SELECT * FROM tarrifs WHERE tarrifTypeId=?", [tarrifTypeId], function (err, rows, fields) {
                if (err) {
                    res.status(500)
                    res.send(JSON.stringify({ success: false, message: err.message }))
                }
                else {
                    if (rows.length > 0) {
                        res.send(JSON.stringify({ success: true, result: rows }))
                    }
                    else {
                        res.send(JSON.stringify({ success: false, message: 'Company ID not available in our database!' }))
                    }
                }
            })
        })
    } else {
        res.send(JSON.stringify({ success: false, message: 'Unauthorized User' }))
    }
})

// Insert new User Or Update
router.post('/', jwtMW, (req, res, next) => {

    var authorization = req.headers.authorization, decoded
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY)
    } catch (e) {
        return res.status(401).send('unauthorized')
    }
    const uid = decoded.uid

    const tarrifTypeId = req.body.tarrifTypeId
    const pricePerMeterCubic = req.body.pricePerMeterCubic
    const socialTire = req.body.socialTire
    const serviceAvailabilityFee = req.body.serviceAvailabilityFee
    const firstFive = req.body.firstFive
    const firstSeven = req.body.firstSeven
    const aboveSeven = req.body.aboveSeven
    const firstFifteen = req.body.firstFifteen
    const aboveFifteen = req.body.aboveFifteen
    const createdAt = new Date().getTime()

    if (uid != null) {
        req.getConnection(function (err, conn) {
            conn.query("INSERT INTO tarrifs(tarrifTypeId, pricePerMeterCubic, socialTire, serviceAvailabilityFee, firstFive,  firstSeven, aboveSeven, firstFifteen, aboveFifteen, createdAt) VALUES(?,?,?,?,?,?,?,?,?,?)",
                [tarrifTypeId, pricePerMeterCubic, socialTire, serviceAvailabilityFee, firstFive, firstSeven, aboveSeven, firstFifteen, aboveFifteen, createdAt], function (err, rows, fields) {
                    if (err) {
                        res.status(500)
                        res.send(JSON.stringify({ success: false, message: err.message }))
                    }
                    else {
                        if (rows.affectedRows > 0) {
                            res.send(JSON.stringify({ success: true, message: 'success' }))
                        }
                    }
                })
        })
    } else {
        res.send(JSON.stringify({ success: false, message: 'Invalid userUid' }))
    }

})


module.exports = router