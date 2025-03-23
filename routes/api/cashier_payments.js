const express = require('express')
const router = express.Router()
var jwt = require('jsonwebtoken')
var exjwt = require('express-jwt')
const fetch = require('node-fetch')
const moment = require('moment')

var SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt"

const jwtMW = exjwt({
    secret: SECRET_KEY
});

// Fetch purchasesByUid
router.get('/', jwtMW, (req, res, next) => {
    var authorization = req.headers.authorization, decoded
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY)
    } catch (e) {
        return res.status(401).send('unauthorized')
    }
    const uid = decoded.uid

    const branchId = req.query.branchId
    const fromDate = req.query.fromDate
    const toDate = req.query.toDate
    const userRole = req.query.userRole
    const provider = req.query.provider

    if (uid != null) {
        req.getConnection(function (err, conn) {
            if (userRole == 2) {
                if (!fromDate) {
                    conn.query("SELECT * FROM payments WHERE branchId=? ORDER BY id DESC", [branchId], function (err, rows, fields) {
                        if (err) {
                            res.status(500)
                            res.send(JSON.stringify({ success: false, message: err.message }))
                        }
                        else {
                            if (rows.length > 0) {
                                res.send(JSON.stringify({ success: true, result: rows }))
                            }
                            else {
                                res.send(JSON.stringify({ success: false, message: 'Nenhuma compra foi registada até o momento!' }))
                            }
                        }
                    })
                } else {
                    conn.query("SELECT * FROM payments WHERE createdAt BETWEEN CAST(? AS DATE) AND CAST(? AS DATE) AND branchId=? ORDER BY id DESC", [fromDate, toDate, branchId], function (err, rows, fields) {
                        if (err) {
                            res.status(500)
                            res.send(JSON.stringify({ success: false, message: err.message }))
                        }
                        else {
                            if (rows.length > 0) {
                                res.send(JSON.stringify({ success: true, result: rows }))
                            }
                            else {
                                res.send(JSON.stringify({ success: false, message: 'Nenhuma compra foi registada até o momento!' }))
                            }
                        }
                    })
                }
            } else {
                conn.query("SELECT * FROM payments ORDER BY id DESC", function (err, rows, fields) {
                    if (err) {
                        res.status(500)
                        res.send(JSON.stringify({ success: false, message: err.message }))
                    }
                    else {
                        if (rows.length > 0) {
                            res.send(JSON.stringify({ success: true, result: rows }))
                        }
                        else {
                            res.send(JSON.stringify({ success: false, message: 'Nenhuma compra foi registada até o momento!' }))
                        }
                    }
                })
            }
        })
    } else {
        res.send(JSON.stringify({ success: false, message: 'Invalid request' }))
    }
})

// Fetch all payments by companyId
router.get('/:id', jwtMW, (req, res, next) => {
    var authorization = req.headers.authorization, decoded
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY)
    } catch (e) {
        return res.status(401).send('unauthorized')
    }
    const uid = decoded.uid

    let staffId = req.params.id
    const createdAt = moment().format("YYYY-MM-DD")

    if (staffId != null && uid != null) {
        req.getConnection(function (err, conn) {
            conn.query("SELECT SUM(totalPaid) AS totalPaid FROM payments WHERE createdAt=?", [createdAt], function (err, rows, fields) {
                if (err) {
                    res.status(500)
                    res.send(JSON.stringify({ success: false, message: err.message }))
                }
                else {
                    if (rows.length > 0) {
                        const totalPaid = rows[0].totalPaid > 0 ? rows[0].totalPaid : 0
                        conn.query("SELECT * FROM payments WHERE createdAt=? ORDER BY customerName", [createdAt], (err, payments, fields) => {
                            if (err) {
                                res.status(500)
                                res.send(JSON.stringify({ success: false, message: err.message }))
                            } else {
                                res.send(JSON.stringify({ success: true, result: payments, totalPaid: totalPaid }))
                            }
                        })
                    }
                    else {
                        res.send(JSON.stringify({ success: false, message: 'Pagamentos indisponíveis!' }))
                    }
                }
            })
        })
    } else {
        res.send(JSON.stringify({ success: false, message: 'Invalid request' }))
    }
})

module.exports = router