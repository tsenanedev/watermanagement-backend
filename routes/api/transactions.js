var SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt"
const express = require('express')
const router = express.Router()

var jwt = require('jsonwebtoken')
var exjwt = require('express-jwt')

const jwtMW = exjwt({
    secret: SECRET_KEY
});

// Fetch all Available Banks
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
            conn.query("SELECT * FROM transactions", function (err, rows, fields) {
                if (err) {
                    res.status(500)
                    res.send(JSON.stringify({ success: false, message: err.message }))
                }
                else {
                    if (rows.length > 0) {
                        res.send(JSON.stringify({ success: true, result: rows }))
                    }
                    else {
                        res.send(JSON.stringify({ success: false, message: 'Pagamentos indisponiveis!' }))
                    }
                }
            })
        })
    } else {
        res.send(JSON.stringify({ success: false, message: 'Invalid request' }))
    }
})

// Fetch all Transactions by companyId
router.get('/:id', jwtMW, (req, res, next) => {

    var authorization = req.headers.authorization, decoded
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY)
    } catch (e) {
        return res.status(401).send('unauthorized')
    }
    const uid = decoded.uid

    let companyId = req.params.id

    if (companyId != null && uid != null) {
        req.getConnection(function (err, conn) {
            conn.query("SELECT * FROM transactions WHERE companyId=?", [companyId], function (err, rows, fields) {
                if (err) {
                    res.status(500)
                    res.send(JSON.stringify({ success: false, message: err.message }))
                }
                else {
                    if (rows.length > 0) {
                        res.send(JSON.stringify({ success: true, result: rows }))
                    }
                    else {
                        res.send(JSON.stringify({ success: false, message: 'Pagamentos indisponiveis!' }))
                    }
                }
            })
        })
    } else {
        res.send(JSON.stringify({ success: false, message: 'Invalid request' }))
    }
})

// Delete Transaction
router.delete('/:id', jwtMW, (req, res, next) => {
    var authorization = req.headers.authorization, decoded
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY)
    } catch (e) {
        return res.status(401).send('unauthorized')
    }
    const uid = decoded.uid
    let id = req.params.id

    if (id != null && uid != null) {
        req.getConnection(function (err, conn) {
            conn.query("DELETE FROM transactions WHERE id=? ORDER BY ID DESC", [id], function (err, rows, fields) {
                if (err) {
                    res.status(500)
                    res.send(JSON.stringify({ success: false, message: err.message }))
                }
                else {
                    if (rows.affectedRows > 0) {
                        res.send(JSON.stringify({ success: true, message: 'Pagamento excluido com sucesso' }))
                    }
                    else {
                        res.send(JSON.stringify({ success: false, message: 'Ocorreu um erro ao excluir este pagamento!' }))
                    }
                }
            })
        })
    } else {
        res.send(JSON.stringify({ success: false, message: 'Invalid request' }))
    }
})

// Add BankAccount
router.post('/', (req, res, next) => {

    var authorization = req.headers.authorization, decoded
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY)
    } catch (e) {
        return res.status(401).send('unauthorized')
    }
    const uid = decoded.uid

    const customerId = req.body.customerId
    const billId = req.body.billId
    const amount = req.body.amount
    const transactionId = req.body.transactionId
    const provider = req.body.provider
    const status = req.body.status
    const createdAt = new Date().getTime()

    if (uid != null && billId != null) {
        req.getConnection(function (err, conn) {
            conn.query("INSERT INTO transactions(customerId, billId, amount, transactionId, provider, status, submittedAt) VALUES(?,?,?,?,?,?,?)",
                [customerId, billId, amount, transactionId, provider, status, createdAt], function (err, rows, fields) {
                    if (err) {
                        res.status(500)
                        res.send(JSON.stringify({ success: false, message: err.message }))
                    }
                    else {
                        if (rows.affectedRows > 0) {
                            conn.query("UPDATE billing SET status=? WHERE id=?", [status, billId], function (err, rows, fields) {
                                if (err) {
                                    res.status(500).send(JSON.stringify({ success: false, message: err.message }))
                                } else {
                                    res.send(JSON.stringify({ success: true, message: 'Pagamento efectuado com sucesso.' }))
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