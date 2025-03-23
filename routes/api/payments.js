const express = require('express')
const router = express.Router()
var jwt = require('jsonwebtoken')
var exjwt = require('express-jwt')
var SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt"
const moment = require('moment')

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

    let from = req.query.fromDate
    let to = req.query.toDate
    let paymentMethod = req.query.paymentMethod

    if (uid != null) {
        req.getConnection(function (err, conn) {
            if (paymentMethod == 0) {
                conn.query("SELECT * FROM payments WHERE createdAt BETWEEN ? AND ? ORDER BY id DESC", [from, to], (err, payments, fields) => {
                    if (err) {
                        res.status(500)
                        res.send(JSON.stringify({ success: false, message: err.message }))
                    } else {
                        let totalRecebido = payments.reduce(function (acumulador, valorAtual) {
                            return acumulador + valorAtual.totalPaid;
                        }, 0)
                        res.send(JSON.stringify({ success: true, result: payments, totalRecebido }))
                    }
                })
            } else {
                conn.query("SELECT * FROM payments WHERE createdAt BETWEEN ? AND ? AND paymentMethod=? ORDER BY id DESC", [from, to, paymentMethod], (err, payments, fields) => {
                    if (err) {
                        res.status(500)
                        res.send(JSON.stringify({ success: false, message: err.message }))
                    } else {
                        let totalRecebido = payments.reduce(function (acumulador, valorAtual) {
                            return acumulador + valorAtual.totalPaid;
                        }, 0)
                        res.send(JSON.stringify({ success: true, result: payments, totalRecebido }))
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

    let barcode = req.params.id

    if (barcode != null && uid != null) {
        req.getConnection(function (err, conn) {
            conn.query("SELECT * FROM payments WHERE createdAt=?", [createdAt], function (err, rows, fields) {
                if (err) {
                    res.status(500)
                    res.send(JSON.stringify({ success: false, message: err.message }))
                }
                else {
                    if (rows.length > 0) {
                        res.send(JSON.stringify({ success: true, result: rows }))
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

// Delete Billing
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
            conn.query("DELETE FROM billing WHERE id=?", [id], function (err, rows, fields) {
                if (err) {
                    res.status(500)
                    res.send(JSON.stringify({ success: false, message: err.message }))
                }
                else {
                    if (rows.affectedRows > 0) {
                        res.send(JSON.stringify({ success: true, message: 'Factura excluida com sucesso' }))
                    }
                    else {
                        res.send(JSON.stringify({ success: false, message: 'Ocorreu um erro ao excluir esta factura!' }))
                    }
                }
            })
        })
    } else {
        res.send(JSON.stringify({ success: false, message: 'Invalid request' }))
    }
})

// Comfirm Bill Status
router.put('/', jwtMW, (req, res, next) => {
    const billId = req.body.billId
    
    if (billId != null) {
        req.getConnection(function (err, conn) {
            conn.query("SELECT * FROM payments WHERE billId=?", [billId], (err, rows, fields) => {
                if(err) {
                    res.status(500)
                    console.log(err.message)
                    res.send(JSON.stringify({ success: false, message: err.message }))
                } else {
                    if(rows.length > 0) {
                        res.send(JSON.stringify({ success: true, payments: rows }))
                    } else {
                        res.send(JSON.stringify({ success: false, message: 'Houve um erro, volte a tentar mais tarde.' }))
                    }
                }
            })
        })
    } else {
        res.send(JSON.stringify({ success: false, message: 'Invalid request' })) 
    }
})

// Add bill
router.post('/', jwtMW, (req, res, next) => {

    const barcode = req.body.barcode
    const customerName = req.body.customerName
    const billId = req.body.billId
    const tarrifTypeId = req.body.tarrifTypeId
    const totalPaid = req.body.totalPaid
    const staffName = req.body.staffName
    const reference = req.body.reference
    const saldoDevedor = req.body.saldoDevedor
    const dateOfPayment = req.body.dateOfPayment
    const branchId = req.body.branchId
    const paymentMethod = req.body.paymentMethod
    const createdAt = moment().format("YYYY-MM-DD")
    // const createdAt = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`

    const smsDetails = `Registamos uma operacao de pagamento de água no valor de ${totalPaid} MZN. Obrigado pela preferencia. Saldo devedor: ${saldoDevedor.toFixed(2)} MZN`
    // console.log(smsDetails)

    if (barcode != null && customerName != null) {
        req.getConnection(function (err, conn) {
            conn.query("INSERT INTO payments(phoneNumber, billId, barcode, customerName, tarrifTypeId, totalPaid, staffName, reference, smsDetails, createdAt, paymentMethod, dateOfPayment) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
                ["N/A", billId, barcode, customerName, tarrifTypeId, totalPaid, staffName, reference, smsDetails, createdAt, paymentMethod, dateOfPayment], function (err, rows, fields) {

                    if (err) {
                        res.status(500)
                        // console.log(err.message)
                        res.send(JSON.stringify({ success: false, message: err.message }))
                    }
                    else {
                        if (rows.affectedRows > 0) {
                            if (saldoDevedor > 0) {
                                conn.query("INSERT INTO debts(billId, barcode, amount, description, branchId, staffName, tarrifTypeId, status, createdAt) VALUES(?,?,?,?,?,?,?,?,?)",
                                    [billId, barcode, saldoDevedor, `Saldo devedor da factura nr ${billId}`, branchId, staffName, tarrifTypeId, 0, createdAt], function (err, fields, rows) {
                                        if (err) {
                                            res.status(500)
                                            console.log(err.message)
                                            res.send(JSON.stringify({ success: false, message: err.message }))
                                        } else {
                                            // Field of SMS Functionality
                                            console.log(billId)
                                            conn.query("UPDATE readings SET status=? WHERE receiptNumber=?", [1, billId], (err, rowa, fields) => {
                                                if (err) {
                                                    res.status(500)
                                                    console.log(err.message)
                                                    res.send(JSON.stringify({ success: false, message: err.message }))
                                                } else {
                                                    res.send(JSON.stringify({ success: true, message: 'Pagamento submetido com sucesso!' }))
                                                }
                                            })
                                        }
                                    })
                            } else {
                                conn.query("UPDATE readings SET status=? WHERE receiptNumber=?", [1, billId], (err, rowa, fields) => {
                                    if (err) {
                                        res.status(500)
                                        res.send(JSON.stringify({ success: false, message: err.message }))
                                    } else {
                                        res.send(JSON.stringify({ success: true, message: 'Pagamento submetido com sucesso!' }))
                                    }
                                })
                            }
                        }
                    }
                })

        })
    } else {
        res.send(JSON.stringify({ success: false, message: 'Invalid request' }))
    }
})

module.exports = router