var SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt"

const express = require('express')
const router = express.Router()
var jwt = require('jsonwebtoken')
var exjwt = require('express-jwt')
const fetch = require('node-fetch')

const jwtMW = exjwt({
    secret: SECRET_KEY
});

// Insert new User Or Update
router.put('/', jwtMW, (req, res, next) => {

    var authorization = req.headers.authorization, decoded
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY)
    } catch (e) {
        return res.status(401).send('unauthorized')
    }
    const uid = decoded.uid

    const id = req.body.userId
    const token = req.body.token

    if (uid != null) {
        req.getConnection(function (err, conn) {
            conn.query("UPDATE users SET token=? WHERE id=?",
                [token, id], function (err, rows, fields) {
                    if (err) {
                        res.status(500)
                        res.send(JSON.stringify({ success: false, message: err.message }))
                    }
                    else {
                        if (rows.affectedRows > 0) {
                            res.send(JSON.stringify({ success: true, message: 'Successfully updated.' }))
                        }
                    }
                })
        })
    } else {
        res.send(JSON.stringify({ success: false, message: 'Invalid userId' }))
    }

})

module.exports = router