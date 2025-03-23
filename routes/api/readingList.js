var SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt"

const express = require('express')
const router = express.Router()
var jwt = require('jsonwebtoken')
var exjwt = require('express-jwt')

const reading_list = require('../../reading_list')

const jwtMW = exjwt({
    secret: SECRET_KEY
});

router.post('/', jwtMW, async function (req, res, next) {
    var authorization = req.headers.authorization, decoded
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY)
    } catch (e) {
        return res.status(401).send('unauthorized')
    }
    const uid = decoded.uid

    const branchId = req.body.branchId
    const tarrifTypeId = req.body.tarrifTypeId

    if (branchId != null) {
        req.getConnection((err, conn) => {
            if (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }))
            } else {
                conn.query("SELECT * FROM readings WHERE branchId=? AND status=? AND month !=?", [branchId, 0, 11], (err, dividasFacturas, fields) => {
                    if (err) {
                        res.status(500)
                        res.send(JSON.stringify({ success: false, message: err.message }))
                    } else {
                        if (dividasFacturas.length > 0) {
                            res.send(JSON.stringify({ success: true, result: dividasFacturas }))
                        } else {
                            res.send(JSON.stringify({ success: false, message: 'No data available' }))
                        }
                    }
                })
            }
        })
    } else {
        res.send(JSON.stringify({ success: false, message: 'branchId Not Provided!' }))
    }
})

module.exports = router