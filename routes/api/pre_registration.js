var SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt"
const express = require('express')
const router = express.Router()

var jwt = require('jsonwebtoken')
var exjwt = require('express-jwt')

const bcrypt = require('bcrypt')
const moment = require('moment')

const jwtMW = exjwt({
    secret: SECRET_KEY
});

// Fetch customersByUid
router.get('/', jwtMW, (req, res, next) => { 

    var authorization = req.headers.authorization, decoded
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY)
    } catch (e) {
        return res.status(401).send('unauthorized')
    }
    const uid = decoded.uid
    const status = req.query.status

    if (uid != null) {
        req.getConnection(function (err, conn) {
            conn.query("SELECT * FROM pre_registration WHERE status=?", [status], function (err, rows, fields) {
                if (err) {
                    res.status(500)
                    res.send(JSON.stringify({ success: false, message: err.message }))
                }
                else {
                    if (rows.length > 0) {
                        conn.query("SELECT * FROM proforma ORDER BY id DESC LIMIT 1", [], (err, preRegistration, fields) => {
                            if (err) {
                                res.status(500)
                                res.send(JSON.stringify({ success: false, message: err.message })) 
                            } else {
                                const invoiceId = preRegistration.length > 0 ? preRegistration[0].invoiceId + 1 : 43
                                res.send(JSON.stringify({ success: true, result: rows, invoiceId }))
                            }
                        })
                    }
                    else {
                        res.send(JSON.stringify({ success: false, message: 'No results!' }))
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
            conn.query("DELETE FROM pre_registration WHERE id=?", [id], function (err, rows, fields) {
                if (err) {
                    res.status(500)
                    res.send(JSON.stringify({ success: false, message: err.message }))
                }
                else {
                    if (rows.affectedRows > 0) {
                        res.send(JSON.stringify({ success: true, message: 'Cliente deletado com sucesso' }))
                    }
                    else {
                        res.send(JSON.stringify({ success: false, message: 'Ocorreu um erro ao excluir este cliente!' }))
                    }
                }
            })
        })
    } else {
        res.send(JSON.stringify({ success: false, message: 'Invalid request' }))
    }
})

// Create company
router.post('/', (req, res, next) => {

    const name = req.body.name
    const email = req.body.email
    const nuit = req.body.nuit
    const phone = req.body.phone
    const nationalId = req.body.nationalId
    const address = req.body.address
    const status = req.body.status
    const createdAt = moment().format("YYYY-MM-DD")

    if (name != null && phone != null && address != null) {
        req.getConnection(function (err, conn) {
            conn.query("INSERT INTO pre_registration(name, phoneNumber, email, nuit, nationalId, address, status, createdAt) VALUES(?,?,?,?,?,?,?,?)", [name, phone, email, nuit, nationalId, address, 0, createdAt], (err, rows, fields) => {
                if (err) {
                    console.log(err)
                    res.status(500)
                    res.send(JSON.stringify({ success: false, message: err.message }))
                } else {
                    res.send(JSON.stringify({ success: true, message: 'Pré-registo efectuado com sucesso! Um dos nossos técnicos entrará em contacto dentro de 24 horas.' }))
                }
            })
        })
    } else {
        res.send(JSON.stringify({ success: false, message: 'Invalid userId' }))
    }
})

module.exports = router