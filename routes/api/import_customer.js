var SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt"

const express = require('express')
const router = express.Router()
var jwt = require('jsonwebtoken')
var exjwt = require('express-jwt')

const jwtMW = exjwt({
    secret: SECRET_KEY
});

// Users
router.get('/', jwtMW, (req, res, next) => {

    var authorization = req.headers.authorization, decoded
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY)
    } catch (e) {
        return res.status(401).send('unauthorized')
    }
    const uid = decoded.uid
    const searchValues = req.query.searchValues

    if (uid != null && searchValues != null) {
        req.getConnection(function (err, conn) {
            conn.query("SELECT * FROM branches WHERE name LIKE ?", [searchValues], function (err, rows, fields) {
                if (err) {
                    res.status(500)
                    res.send(JSON.stringify({ success: false, message: err.message }))
                }
                else {
                    if (rows.length > 0) {
                        res.send(JSON.stringify({ success: true, result: rows }))
                    }
                    else {
                        res.send(JSON.stringify({ success: false, message: 'Bairro não encontrado.' }))
                    }
                }
            })
        })
    } else {
        res.send(JSON.stringify({ success: false, message: 'Invalid request' }))
    }
})


router.get('/:id/:branchId/:staffName', jwtMW, (req, res, next) => {

    var authorization = req.headers.authorization, decoded
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY)
    } catch (e) {
        return res.status(401).send('unauthorized')
    }
    const uid = decoded.uid

    let barcode = req.params.id
    let branchId = req.params.branchId
    let staffName = req.params.staffName

    if (uid != null && barcode != null) {
        req.getConnection(function (err, conn) {
            conn.query("SELECT * FROM usuarios WHERE celular=? LIMIT 1", [barcode], function (err, rows, fields) {
                if (err) {
                    res.status(500)
                    res.send(JSON.stringify({ success: false, message: err.message }))
                }
                else {
                    if (rows.length > 0) {
                        const id = rows[0].id
                        conn.query("SELECT * FROM leituras WHERE contador=? ORDER BY id DESC", [id], (err, readings, fields) => {
                            if (err) {
                                res.status(500)
                                res.send(JSON.stringify({ success: false, message: err.message }))
                            } else {
                                if (readings.length > 0) {
                                    conn.query("SELECT SUM(preco) AS debt FROM leituras WHERE contador=? AND status=?", [id, 'pendente'], (err, debts, fields) => {
                                        if (err) {
                                            res.status(500)
                                            res.send(JSON.stringify({ success: false, message: err.message }))
                                        } else {
                                            if (debts.length > 0) {
                                                const debt = debts[0].debt
                                                const lastReading = readings[0].l_aterior
                                                const currentReading = readings[0].l_actual
                                                const monthOfReading = readings[0].mes + '_' + readings[0].ano
                                                const status = readings[0].status == 'pendente' ? 0 : 1
                                                const consumption = readings[0].diferenca
                                                const month = readings[0].mes
                                                const year = readings[0].ano
                                                const uniqueBillId = barcode + '_' + monthOfReading
                                                // console.log(id, lastReading, currentReading, monthOfReading, status, debt)

                                                conn.query("INSERT INTO readings (barcode, month, year, uniqueBillId, last, current, consumption, branchId, status, staffName, createdAt, forfeit) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
                                                    [barcode, month, year, uniqueBillId, lastReading, currentReading, consumption, branchId, status, staffName, new Date(), 0], (err, lastReadings, fields) => {
                                                        if (err) {
                                                            res.status(500)
                                                            res.send(JSON.stringify({ success: false, message: err.message }))
                                                        } else {
                                                            if (lastReadings.affectedRows > 0) {
                                                                if (debt !== null) {

                                                                    conn.query("SELECT SUM(credito) AS dividas FROM payments WHERE cliente=? AND status=?", [id, 'divida'], (error, dividaAnterior, fields) => {
                                                                        if (error) {
                                                                            res.status(500)
                                                                            res.send(JSON.stringify({ success: false, message: error.message }))
                                                                        } else {
                                                                            const dividaPend = dividaAnterior[0].dividas + debt
                                                                            conn.query("INSERT INTO debts (barcode, amount, description, status, branchId, staffName, createdAt) VALUES(?,?,?,?,?,?,?)",
                                                                                [barcode, dividaPend, 'Dívidas anteriores acomuladas', 0, branchId, staffName, new Date()], (err, dividas, fields) => {
                                                                                    if (err) {
                                                                                        res.send(JSON.stringify({ success: false, message: err }))
                                                                                    } else {
                                                                                        if (dividas.affectedRows > 0) {
                                                                                            res.send(JSON.stringify({ success: true, message: 'Leitra anterior e dívidas anteriores foram importadas com sucesso', }))
                                                                                        } else {
                                                                                            res.send(JSON.stringify({ success: false, message: 'Erro na importação da leitura anterior.' }))
                                                                                        }
                                                                                    }
                                                                                })
                                                                        }
                                                                    })
                                                                } else {
                                                                    res.send(JSON.stringify({ success: true, message: 'Leitra anterior importada com sucesso', debt: debt }))
                                                                }
                                                            } else {
                                                                res.send(JSON.stringify({ success: false, message: 'Erro na importação da leitura anterior.' }))
                                                            }
                                                        }
                                                    })
                                            } else {
                                                res.send(JSON.stringify({ success: false, message: 'No debts available' }))
                                            }
                                        }
                                    })
                                } else {
                                    res.send(JSON.stringify({ success: false, message: 'Sem nenhuma leitura por imortar.' }))
                                }
                            }
                        })
                    }
                    else {
                        res.send(JSON.stringify({ success: false, message: 'Barcode ID not available in our database!' }))
                    }
                }
            })
        })
    } else {
        res.send(JSON.stringify({ success: false, message: 'Unauthorized User' }))
    }
})

// Insert new User Or Update
router.delete('/:id', jwtMW, (req, res, next) => {
    var authorization = req.headers.authorization, decoded
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY)
    } catch (e) {
        return res.status(401).send('unauthorized')
    }
    const uid = decoded.uid

    const id = req.params.id

    if (uid != null) {

        req.getConnection(function (err, conn) {
            conn.query("DELETE FROM branches WHERE id=?", [id], function (err, rows, fields) {
                if (err) {
                    res.status(500)
                    res.send(JSON.stringify({ success: false, message: err.message }))
                }
                else {
                    if (rows.affectedRows > 0) {
                        res.send(JSON.stringify({ success: true, message: 'success' }))
                    }
                }
            })
        })
    } else {
        res.send(JSON.stringify({ success: false, message: 'Invalid userUid' }))
    }
})

router.post('/', jwtMW, (req, res, next) => {

    var authorization = req.headers.authorization, decoded
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY)
    } catch (e) {
        return res.status(401).send('unauthorized')
    }
    const uid = decoded.uid

    const barcode = req.body.barcode
    const branchId = req.body.branchId
    const status = 1
    const createdAt = new Date()
    const password = '999992'
    const tariffTypeId = 2

    if (uid != null) {
        req.getConnection(function (err, conn) {
            conn.query("SELECT * FROM usuarios WHERE celular=? ORDER BY id DESC LIMIT 1", [barcode], function (err, user, fields) {
                if (err) {
                    res.send(JSON.stringify({ success: false, message: err }))
                } else {
                    if (user.length == 1) {
                        const uid = `${user[0].id + barcode + user[0].grupo}`
                        const meeter_type = 1
                        const meeter_id = user[0].celular
                        const name = user[0].nome
                        const email = user[0].celular + '@lsa.co.mz'
                        const nuit = user[0].nuit
                        const phone = user[0].phone == 0 ? user[0].celular : '258' + user[0].phone
                        const address = user[0].bairo

                        conn.query("INSERT INTO customers(uid, tarrifTypeId, meeter_type, barcode, meeter_id, name, email, nuit, phone, address, branchId, status, createdAt, password) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                            [uid, tariffTypeId, meeter_type, barcode, meeter_id, name, email, nuit, phone, address, branchId, status, createdAt, password], function (err, rows, fields) {
                                if (err) {
                                    console.log(err)
                                    res.status(500)
                                    res.send(JSON.stringify({ success: false, message: err.message }))
                                }
                                else {
                                    if (rows.affectedRows > 0) {
                                        const barcodeId = rows.insertId
                                        conn.query("UPDATE meters SET status=? WHERE meterNumber=?", [barcodeId, barcode], (err, rows, field) => {
                                            if (err) {
                                                res.send(JSON.stringify({ success: false, message: err.message }))
                                            } else {
                                                res.send(JSON.stringify({ success: true, message: 'Imported successufully', name: name }))
                                            }
                                        })
                                    }
                                }
                            })
                    } else {
                        res.send(JSON.stringify({ success: false, message: 'Sem nenuhum registo' }))
                    }
                }
            })
        })
    } else {
        res.send(JSON.stringify({ success: false, message: 'Invalid userUid' }))
    }

})


module.exports = router