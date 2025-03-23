/* 1 . RELATORIO COMERCIAL
    a) Volume de Agua Facturada
    b) Numero de Ligacoes Facturadas
    c) Facturacao Sem IVA (Agua e Taxa Fixa)
    d) Facturacao Sem IVA (Outros Servicos & Multas)
    e) Facturacao Com IVA (Agua, Taxa Fixa, Outros Servicos & Multas)
    // 
    f) Numero de Ligacoes Existentes (Fim do mes)
    g) Numero de ligacoes Novas (Fim do mes)
    h) Numero de Ligacoes Cortadas (Final do mes)
    i) Numero de Ligacoes Religadas (Final do mes)
    j) Numero de Ligacoes com contador instalado e operacional
    k) Contadores Avariados e Reparados
    l) Atendimento ao consumidor

    2. RELATORIO FINANCEIRO
    a) Recebimentos incluindo IVA
    b) Slado em divida final do mes (Divida acomulada)
*/

var SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt"
const express = require('express')
const router = express.Router()
const moment = require('moment')

var jwt = require('jsonwebtoken')
var exjwt = require('express-jwt')

const bcrypt = require('bcrypt')

const jwtMW = exjwt({
    secret: SECRET_KEY
});

router.get('/', jwtMW, (req, res, next) => {

    var authorization = req.headers.authorization, decoded
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY)
    } catch (e) {
        return res.status(401).send('unauthorized')
    }
    const uid = decoded.uid
    const tarrifTypeId = req.query.tarrifTypeId
    const month = req.query.month
    const year = req.query.year

    if (tarrifTypeId != null && uid != null && month != null && year != null) {
        req.getConnection(function (err, conn) {
            conn.query(`SELECT SUM(consumoFacturado) AS consumoFacturado,
             COUNT(*) AS totalClientesFacturados, SUM(subTotal) AS totalSemIva,
             SUM(vat) AS totalDeIVA, 
              SUM(forfeit * totalOfBill) AS valorMultasGeradas,
              SUM(totalOfBill + (forfeit * totalOfBill)) AS totalFacturadoComMultas 
              FROM readings WHERE tarrifTypeId=? AND month=? AND year=?`, [tarrifTypeId, month, year], (err, resports, fields) => {
                if (err) {
                    res.status(500).send(JSON({ success: false, message: err }))
                } else {
                    conn.query("SELECT COUNT(*) AS totalDeClientes FROM customers WHERE tarrifTypeId=?", [tarrifTypeId], (err, rows, fields) => {
                        if (err) {
                            res.status(500).send(JSON.stringify({ success: false, message: err }))
                        } else {
                            conn.query("SELECT SUM(consumoFacturado) CASE WHEN consumoFacturado=5 AS escalaoUm, SUM(consumoFacturado) WHEN  consumoFacturado<=7 AS escalaoDois, SUM(consumoFacturado) WHEN consumoFacturado>7 AS escalaoTres END CASE FROM readings WHERE month=? AND year=? AND tarrifTypeId=?", [month, year, tarrifTypeId], (err, escaloes, fields) => {
                                if (err) {
                                    res.status(500).send(JSON.stringify({ success: false, message: err }))
                                } else {
                                    res.status(200).send(JSON.stringify({ success: true, result: resports, totalClientes: rows, escaloes: escaloes }))
                                }
                            })
                        }
                    })
                }
            })
        })

    } else {
        res.status(500).send(JSON.stringify({ success: false, messahe: 'Requisição inválida' }))
    }

})

router.get('/:from/:to/tarrifTypeId', jwtMW, (req, res, next) => {

    var authorization = req.headers.authorization, decoded
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY)
    } catch (e) {
        return res.status(401).send('unauthorized')
    }
    const uid = decoded.uid
    const tarrifTypeId = req.params.tarrifTypeId
    const from = req.params.from
    const to = req.params.to

    if (tarrifTypeId != null && uid != null && from != null && to != null) {
        req.getConnection(function (err, conn) {
            if (err) {
                res.status(500).send(JSON.stringify({ status: false, message: err }))
            } else {
                conn.query("SELECT SUM(totalPaid) AS totalPaid WHERE (dateOfPayment BETWEEN ? AND ?) AND tarrifTyeId=?", [from, to, tarrifTypeId], (err, rows, fields) => {
                    if (err) {
                        res.status(500).send(JSON.stringify({ status: false, message: err }))
                    } else {
                        res.send(JSON.stringify({ success: true, totalPaid: rows }))
                    }
                })
            }
        })
    } else {
        res.status(200).send(JSON.stringify({ success: false, message: 'Invalid Request' }))
    }

})

module.exports = router