var SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt"

const express = require('express')
const router = express.Router()
var jwt = require('jsonwebtoken')
var exjwt = require('express-jwt')

const jwtMW = exjwt({
    secret: SECRET_KEY
});

const relatorioFacturacaoFunction = require('../../relatorioFacturacaoFunctionWeb')

async function generatePDF(customers, readings, taxas, reportInterval, payments, totalFacturado, totalPagoGlobal) {
    const pdf = await relatorioFacturacaoFunction.createReportPDF(customers, readings, taxas, reportInterval, payments, totalFacturado, totalPagoGlobal)
    return pdf == false ? false : pdf
}

router.post('/', (req, res, next) => {
    // var authorization = req.headers.authorization, decoded
    // try {
    //     decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY)
    // } catch (e) {
    //     return res.status(401).send('unauthorized')
    // }

    const uid = '222'
    const from = req.body.fromDate
    const to = req.body.toDate
    const reportInterval = {
        to, from
    }

    if (uid != null) {
        req.getConnection((err, conn) => {
            if (err) {
                res.status(500).send(JSON.stringify({ success: false, message: err.message }))
            } else {
                conn.query("SELECT * FROM customers", [], (err, customers, fields) => {
                    if (err) {
                        res.status(500).send(JSON.stringify({ success: false, message: err.message }))
                    } else {
                        conn.query("SELECT * FROM readings WHERE createdAt BETWEEN ? AND ?", [from, to], (err, readings, fields) => {
                            if (err) {
                                res.status(500).send(JSON.stringify({ success: false, message: err.message }))
                            } else {
                                conn.query("SELECT * FROM debts WHERE (createdAt BETWEEN ? AND ?) AND status=?", [from, to, 0], (err, taxas, fields) => {
                                    if (err) {
                                        res.status(500).send(JSON.stringify({ success: false, message: err.message }))
                                    } else {
                                        conn.query("SELECT * FROM payments WHERE createdAt BETWEEN ? AND ?", [from, to], (err, payments, fields) => {
                                            if (err) {
                                                // TsenaneL
                                                res.status(500).send(JSON.stringify({ success: false, message: err.message }))
                                            } else {
                                                conn.query("SELECT SUM(totalOfBill) totalAfcturado FROM readings", [], (err, totalPaid, fields) => {
                                                    if (err) {
                                                        res.status(500).send(JSON.stringify({ success: false, message: err.message }))
                                                    } else {
                                                        const totalFacturado = totalPaid[0].totalAfcturado
                                                        conn.query("SELECT SUM(totalPaid) totalPago FROM payments", [], (err, totalPago, fields) => {
                                                            if (err) {

                                                            } else {
                                                                const totalPagoGlobal = totalPago[0].totalPago
                                                                new Promise(async (resolve, reject) => {
                                                                    try {
                                                                        const pdf = await generatePDF(customers, readings, taxas, reportInterval, payments, totalFacturado, totalPagoGlobal)
                                                                        console.log(resolve)
                                                                        res.set({ 'Content-Type': 'application/pdf', 'Content-Length': pdf.length })
                                                                        res.render(pdf)
                                                                        // resolve(generating)
                                                                    } catch (err) {
                                                                        console.log(err)
                                                                        res.send(JSON.stringify({ success: false, message: 'Houve um erro na criação do relatiorio de facturacao.' }))
                                                                        reject(err)
                                                                    }
                                                                })
                                                            }
                                                        })
                                                    }
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })

    }
})

module.exports = router