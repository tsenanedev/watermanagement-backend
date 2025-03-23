const express = require('express')
const router = express.Router()
var jwt = require('jsonwebtoken')
var exjwt = require('express-jwt')

const billingCalcs = require('../../billingCalcs')

var SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt"

const jwtMW = exjwt({
    secret: SECRET_KEY
});

// Fetch billsByUid
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
            conn.query("SELECT * FROM customers WHERE id > 2655 ORDER BY id ASC LIMIT 600", [], function (err, rows, fields) {
                if (err) {
                    res.status(500)
                    res.send(JSON.stringify({ success: false, message: err.message }))
                }
                else {
                    if (rows.length > 0) {
                        for (let i = 0; i < rows.length; i++) {
                            const customer = rows[i];
                            const tariffTypeId = customer.tarrifTypeId;
                            const barcode = customer.barcode;

                            conn.query("SELECT * FROM readings WHERE barcode=? ORDER BY id DESC LIMIT 2", [barcode], (err, readings, fields) => {
                                if (err) {
                                    console.log(err.message)
                                } else {
                                    // const leitura = readings[0]
                                    console.log(customer.id, customer.name + ': ' + barcode, '#Leituras' + readings.length)
                                }
                            })
                        }
                        res.send(JSON.stringify({ success: true, message: 'Actualizacao bem sucessida.' }))
                    }
                    else {
                        res.send(JSON.stringify({ success: false, message: 'Nenhuma cliente disponível até o momento!' }))
                    }
                }
            })
        })
    } else {
        res.send(JSON.stringify({ success: false, message: 'Invalid request' }))
    }
})

// Fetch all bills by companyId
router.get('/:id/:tariffId', jwtMW, (req, res, next) => {
    var authorization = req.headers.authorization, decoded
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY)
    } catch (e) {
        return res.status(401).send('unauthorized')
    }
    const uid = decoded.uid

    let customerId = req.params.id
    let tarrifTypeId = req.params.tariffId

    if (customerId != null && uid != null && tarrifTypeId != null) {

        req.getConnection(function (err, conn) {
            conn.query("SELECT * FROM tarrifs WHERE tarrifTypeId=?", [tarrifTypeId], function (err, rows, fields) {
                if (err) {
                    res.status(500)
                    res.send(JSON.stringify({ success: false, message: err.message }))
                }
                else {
                    if (rows.length > 0) {
                        const tariff = rows[0]
                        req.getConnection(function (err, conn) {
                            conn.query("SELECT * FROM readings WHERE barcode=? ORDER BY id DESC", [customerId], function (err, bills, fields) {
                                if (err) {
                                    res.status(500)
                                    res.send(JSON.stringify({ success: false, message: err.message }))
                                }
                                else {
                                    if (bills.length > 0) {
                                        const billsResponse = []
                                        for (let i = 0; i < bills.length; i++) {
                                            if (tarrifTypeId == 2 && bills[i].consumption <= 5) {
                                                const facturas = billingCalcs.domesticBelowFive(bills[i], rows[0])
                                                billsResponse.push(facturas[0])
                                            } else if (tarrifTypeId == 2 || tarrifTypeId == 3) {
                                                const facturas = billingCalcs.domesticAboveFive(bills[i], rows[0])
                                                billsResponse.push(facturas[0])
                                            } else if (tarrifTypeId == 1) {
                                                const facturas = billingCalcs.fontCalc(bills[i], rows[0])
                                                billsResponse.push(facturas[0])
                                            } else if (tarrifTypeId >= 4) {
                                                const facturas = billingCalcs.calculatePublicComercialAndIndustrial(bills[i], rows[0])
                                                billsResponse.push(facturas[0])
                                            }
                                        }
                                        // console.log(billsResponse)
                                        res.send(JSON.stringify({ success: true, result: bills, facturas: billsResponse }))
                                    }
                                    else {
                                        res.send(JSON.stringify({ success: false, message: 'Nenhuma factura disponível até o momento!' }))
                                    }
                                }
                            })
                        })
                    }
                    else {
                        res.send(JSON.stringify({ success: false, message: 'Company ID not available in our database!' }))
                    }
                }
            })
        })


    } else {
        res.send(JSON.stringify({ success: false, message: 'Invalid request' }))
    }
})

router.put('/', jwtMW, (req, res, next) => {
    var authorization = req.headers.authorization, decoded
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY)
    } catch (e) {
        return res.status(401).send('unauthorized')
    }
    const uid = decoded.uid

    const last = req.body.last
    const current = req.body.current
    const consumption = req.body.consumption
    const updatedBy = req.body.updatedBy
    const id = req.body.id
    const takenAt = req.body.takenAt

    if (uid != null && last != null && current != null) {
        console.log(last, current, consumption, updatedBy, id)
        req.getConnection(function (err, conn) {
            conn.query("UPDATE readings SET current=?, last=?, consumption=?, updatedBy=? WHERE id=?", [current, last, consumption, updatedBy, id], (err, rows, fields) => {
                if (err) {
                    res.status(500)
                    res.send(JSON.stringify({ success: false, message: err.message }))
                } else {
                    if (rows.affectedRows > 0) {
                        res.send(JSON.stringify({ success: true, message: 'Leitura actualizada com sucesso' }))
                    }
                    else {
                        res.send(JSON.stringify({ success: false, message: 'Ocorreu um erro na actualização da leitura!' }))
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
            conn.query("DELETE FROM readings WHERE id=?", [id], function (err, rows, fields) {
                if (err) {
                    res.status(500)
                    res.send(JSON.stringify({ success: false, message: err.message }))
                }
                else {
                    if (rows.affectedRows > 0) {
                        res.send(JSON.stringify({ success: true, message: 'Leitura excluída com sucesso' }))
                    }
                    else {
                        res.send(JSON.stringify({ success: false, message: 'Ocorreu um erro ao excluir esta leitura!' }))
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
    const branchId = req.body.branchId
    const last = req.body.last
    const current = req.body.current
    const consumption = req.body.consumption
    const status = req.body.status
    const staffName = req.body.staffName
    const takenAt = req.body.takenAt
    const consumptionPeriod = req.body.consumptionPeriod
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    const uniqueBill = barcode + '_' + month + '_' + year
    const createdAt = year + '-' + month + '-' + new Date().getDate();
    // const createdAt = new Date().getDate() + '.' + month + '.' + year
    // console.log(createdAt)

    if (staffName != null && current != null) {
        req.getConnection(function (err, conn) {
            // console.log(price)
            conn.query("SELECT * FROM readings WHERE barcode=? AND uniqueBillId=?", [barcode, uniqueBill], function (err, rows, fields) {
                if (err) {
                    console.log(err.message)
                    res.status(500)
                    res.send(JSON.stringify({ success: false, message: err.message }))
                } else {
                    if (rows.length == 0) {
                        conn.query("SELECT MAX(receiptNumber) AS maxReceiptNumber FROM readings", [], (err, rows, fields) => {
                            if (err) {
                                res.status(500)
                                res.send(JSON.stringify({ success: false, message: err.message }))
                            } else {
                                const maxReceipt = rows[0].maxReceiptNumber + 1
                                conn.query("INSERT INTO readings(barcode, receiptNumber, branchId, uniqueBillId, consumption, current, last, forfeit, month, year, createdAt, staffName, status, takenAt, consumptionPeriod) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                                    [barcode, maxReceipt, branchId, uniqueBill, consumption, current, last, 0, month, year, createdAt, staffName, status, takenAt, consumptionPeriod], function (err, rows, fields) {
                                        if (err) {
                                            res.status(500)
                                            res.send(JSON.stringify({ success: false, message: err.message }))
                                        }
                                        else {
                                            if (rows.affectedRows > 0) {
                                                res.send(JSON.stringify({ success: true, message: 'Leitura submetida com sucesso.' }))
                                            }
                                        }
                                    })
                            }
                        })
                    } else {
                        res.send(JSON.stringify({ success: false, message: "Erro: A leitura deste cliente já foi submitida." }))
                    }


                }
            })
        })
    } else {
        res.send(JSON.stringify({ success: false, message: 'Invalid request' }))
    }
})

module.exports = router