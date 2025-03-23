const express = require('express')
const router = express.Router()
var jwt = require('jsonwebtoken')
var exjwt = require('express-jwt')

var SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt"

const jwtMW = exjwt({
    secret: SECRET_KEY
});

// Search by bankId
router.get('/:id', jwtMW, (req, res, next) => {
    var authorization = req.headers.authorization, decoded
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY)
    } catch (e) {
        return res.status(401).send('unauthorized')
    }
    const uid = decoded.uid

    let customerId = req.params.id

    if (customerId != null && uid != null) {
        req.getConnection(function (err, conn) {
            conn.query("SELECT * FROM customerBalance WHERE customerId=? ORDER BY id DESC", [customerId], function (err, rows, fields) {
                if (err) {
                    res.status(500)
                    res.send(JSON.stringify({ success: false, message: err.message }))
                }
                else {
                    if (rows.length > 0) {
                        // res.send(JSON.stringify({ success: true, result: rows }))
                        const payments = rows
                        conn.query("SELECT * FROM customerBalance WHERE customerId=? ORDER BY id DESC LIMIT 1", [customerId], function (err, rows, fields) {
                            if (err) {
                                res.status(500)
                                res.send(JSON.stringify({ success: false, message: err.message }))
                            } else {
                                if (rows.length > 0) {
                                    res.send(JSON.stringify({ success: true, result: payments, currentBalance: rows }))
                                } else {
                                    res.send(JSON.stringify({ success: false, message: 'Sem nenhum pagamento!' }))
                                }
                            }
                        })
                    }
                    else {
                        res.send(JSON.stringify({ success: false, message: 'Sem nenhum pagamento!' }))
                    }
                }
            })
        })
    } else {
        res.send(JSON.stringify({ success: false, message: 'Invalid request' }))
    }
})

// Add BankAccount
router.post('/', jwtMW, (req, res, next) => {

    var authorization = req.headers.authorization, decoded
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY)
    } catch (e) {
        return res.status(401).send('unauthorized')
    }
    const uid = decoded.uid

    const customerId = req.body.customerId
    const barcode = req.body.barcode
    const phoneNumber = req.body.phoneNumber
    const reference = req.body.transactionRef
    const amount = req.body.amount
    const description = req.body.staff
    const provider = req.body.provider

    const status = "paid"

    if (barcode != null && uid != null) {
        req.getConnection(function (err, conn) {
            conn.query("SELECT * FROM customerBalance WHERE customerId=? ORDER BY id DESC LIMIT 1", [customerId], function (err, rows, fields) {
                if (err) {
                    res.status(500)
                    res.send(JSON.stringify({ success: false, message: err.message }))
                } else {
                    if (rows.length > 0) {
                        const balance = parseFloat(rows[0].balance) + parseFloat(amount)
                        const credit = amount
                        const debt = 0

                        conn.query("INSERT INTO customerBalance(customerId, barcode, phoneNumber, debt, credit, balance, reference, description, provider, status) VALUES(?,?,?,?,?,?,?,?,?,?)",
                            [customerId, barcode, phoneNumber, debt, credit, balance, reference, description, provider, status], function (err, fields, rows) {
                                if (err) {
                                    console.log(err)
                                    res.status(500)
                                    res.send(JSON.stringify({ success: false, message: err.message }))
                                } else {
                                    res.send(JSON.stringify({ success: true, message: 'Pagamento submetido com sucesso!' }))
                                }
                            })
                    } else {
                        const balance = parseFloat(amount)
                        const credit = amount
                        const debt = 0

                        conn.query("INSERT INTO customerBalance(customerId, barcode, phoneNumber, debt, credit, balance, reference, description, provider, status) VALUES(?,?,?,?,?,?,?,?,?,?)",
                            [customerId, barcode, phoneNumber, debt, credit, balance, reference, description, provider, status], function (err, fields, rows) {
                                if (err) {
                                    console.log(err)
                                    res.status(500)
                                    res.send(JSON.stringify({ success: false, message: err.message }))
                                } else {
                                    res.send(JSON.stringify({ success: true, message: 'Pagamento submetido com sucesso!' }))
                                }
                            })
                    }
                }
            })
        })
    } else {
        res.send(JSON.stringify({ success: false, message: 'Invalid request' }))
    }
})

module.exports = router