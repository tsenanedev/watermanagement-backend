var SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt"
const express = require('express')
const router = express.Router()

var jwt = require('jsonwebtoken')
var exjwt = require('express-jwt')

const bcrypt = require('bcrypt')

const jwtMW = exjwt({
    secret: SECRET_KEY
});

// Fetch all customers by companyId
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
            conn.query("SELECT * FROM customers ORDER BY id DESC", [], function (err, rows, fields) {
                if (err) {
                    res.status(500)
                    res.send(JSON.stringify({ success: false, message: err.message }))
                }
                else {
                    if (rows.length > 0) {
                        for (let i = 0; i < rows.length; i++) {
                            const customer = rows[i];
                            const tariffTypeId = customer.tarrifTypeId
                            conn.query("UPDATE readings SET tarrifTypeId=? WHERE barcode=?", [tariffTypeId, customer.barcode], (err, updation, fields) => {
                                if (err) {
                                    console.error("Error", barcode)
                                } else {
                                    if (updation.affectedRows > 0) {
                                        console.log("Updated", barcode)
                                    } else {
                                        console.debug("Not Updated", customer.barcode)
                                    }
                                }
                            })
                        }
                        res.send(JSON.stringify({ success: true, message: 'Leituras actualizadas com sucesso.' }))
                    }
                    else {
                        res.send(JSON.stringify({ success: false, message: 'No customers registered!' }))
                    }
                }
            })
        })
    } else {
        res.send(JSON.stringify({ success: false, message: 'Invalid request' }))
    }
})

router.get('/', jwtMW, (req, res, nex) => {
    var authorization = req.headers.authorization, decoded
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY)
    } catch (e) {
        return res.status(401).send('unauthorized')
    }
    const uid = decoded.uid

    if (uid != null) {
        req.getConnection(function (err, conn) {
            conn.query('SELECT * from readings ORDER BY id ASC', [], function (err, rows, fields) {
                if (err) {
                    res.status(500)
                    res.send(JSON.stringify({ success: false, message: err.message }))
                } else {
                    if (rows.length > 0) {
                        let receiptNumber = 1
                        for (let i = 0; i < rows.length; i++) {
                            const reading = rows[i];
                            conn.query("UPDATE payments SET billId=? WHERE barcode=?", [receiptNumber, reading.barcode], (err, rows, fields) => {
                                if (err) {
                                    console.log("Not updated", err.message)
                                } else {
                                    if (rows.affectedRows > 0) {
                                        console.log("Updated successfully", rows.affectedRows)
                                    } else {
                                        console.log("Not updated", reading.barcode)
                                    }
                                }
                            })
                            receiptNumber++
                        }
                        res.send(JSON.stringify({ success: true, result: 'Facturas actualizadas com sucesso' }))
                    } else {
                        res.send(JSON.stringify({ success: false, message: 'Facturas indisponíveis' }))
                    }
                }
            })
        })
    } else {
        res.send(JSON.stringify({ success: false, message: 'Invalid Request' }))
    }
})

router.patch('/', (req, res, nex) => {
    const uid = req.body.uid
    const id = req.body.id

    if (uid != null && id != null) {
        req.getConnection(function (err, conn) {
            conn.query('UPDATE customers SET uid=? WHERE id=?', [uid, id], function (err, rows, fields) {
                if (err) {
                    res.status(500)
                    res.send(JSON.stringify({ success: false, message: err.message }))
                } else {
                    if (rows.affectedRows > 0) {
                        res.send(JSON.stringify({ success: true, message: 'Uid actualizado com sucesso.' }))
                    }
                }
            })
        })
    }
})

module.exports = router