var SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt"

const express = require('express')
const router = express.Router()
var jwt = require('jsonwebtoken')
var exjwt = require('express-jwt')

const bcrypt = require('bcrypt')

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

    if (uid != null) {
        req.getConnection(function (err, conn) {
            if (err) {
                console.log(err)
                res.status(500).send(JSON.stringify({success: false, message: err}))
            } else {
                conn.query("SELECT * FROM tarrif_type", [0], (err, tariffs, fields) => {
                    if (err) {
                        res.send(JSON.stringify({ success: false, message: 'Falha na autenticação.' }))
                    } else {
                        conn.query("SELECT * FROM users WHERE uid=?", [uid], function (err, rows, fields) {
                            if (err) {
                                res.status(500)
                                res.send(JSON.stringify({ success: false, message: err.message }))
                            }
                            else {
                                if (rows.length > 0) {
                                    const response = [{
                                        id: rows[0].id,
                                        name: rows[0].name,
                                        code: rows[0].code,
                                        email: rows[0].email,
                                        phoneNumber: rows[0].phoneNumber,
                                        userRole: rows[0].userRole,
                                        status: rows[0].status,
                                        branchId: rows[0].branchId,
                                        companyId: rows[0].companyId,
                                        uid: rows[0].uid,
                                        createdAt: rows[0].createdAt
                                    }]
                                    res.send(JSON.stringify({ success: true, result: response, tariffs: tariffs }))
                                }
                                else {
                                    res.send(JSON.stringify({ success: false, message: 'Uid not available in our database!' }))
                                }
                            }
                        })
                    }
                })
            }
        })
    } else {
        res.send(JSON.stringify({ success: false, message: 'Invalid request' }))
    }
})

router.get('/:id', jwtMW, (req, res, next) => {

    var authorization = req.headers.authorization, decoded
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY)
    } catch (e) {
        return res.status(401).send('unauthorized')
    }
    const uid = decoded.uid

    let branchId = req.params.id

    if (uid != null && branchId != null) {
        req.getConnection(function (err, conn) {
            conn.query("SELECT * FROM users WHERE branchId=?", [branchId], function (err, rows, fields) {
                if (err) {
                    res.status(500)
                    res.send(JSON.stringify({ success: false, message: err.message }))
                }
                else {
                    if (rows.length > 0) {
                        res.send(JSON.stringify({ success: true, result: rows }))
                    }
                    else {
                        res.send(JSON.stringify({ success: false, message: 'Branch ID not provided!' }))
                    }
                }
            })
        })
    } else {
        res.send(JSON.stringify({ success: false, message: 'Unauthorized User' }))
    }
})

// Insert new User Or Update
router.post('/', jwtMW, (req, res, next) => {

    var authorization = req.headers.authorization, decoded
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY)
    } catch (e) {
        return res.status(401).send('unauthorized')
    }
    const uid = decoded.uid

    id = req.body.id
    const name = req.body.name
    const token = req.body.token
    const phoneNumber = req.body.phoneNumber
    const email = req.body.email
    const status = req.body.status
    const companyId = req.body.companyId
    const branchId = req.body.branchId
    let code = req.body.code
    const userRole = req.body.userRole
    const createdAt = new Date()
    const userUid = code + 'uid' + phoneNumber

    code = code + ''

    if (uid != null) {
        req.getConnection(function (err, conn) {
            if (id > 0) {
                conn.query("UPDATE users SET name=?, phoneNumber=?, email=?, userRole=?, status=? WHERE id=?", [name, phoneNumber, email, userRole, status, id], function (err, rows, fields) {
                    if (err) {
                        res.status(500)
                        res.send(JSON.stringify({ success: false, message: err }))
                    } else if (rows.affectedRows > 0) {
                        res.send(JSON.stringify({ success: true, message: name + ' actualizado com sucesso.' }))
                    } else {
                        res.send(JSON.stringify({ success: false, message: 'Ocorreu um erro' }))
                    }
                })
            } else {
                bcrypt.hash(code, 10, (errBcrypt, hash) => {
                    if (errBcrypt) { 
                        res.status(500)
                        res.send(JSON.stringify({ success: false, message: errBcrypt }))
                    } else {
                        conn.query("INSERT INTO users(uid, password, companyId, code, phoneNumber, email, branchId, status, name, userRole, createdAt) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
                            [userUid, hash, companyId, code, phoneNumber, email, branchId, status, name, userRole, createdAt], function (err, rows, fields) {
                                if (err) {
                                    res.status(500)
                                    res.send(JSON.stringify({ success: false, message: err.message }))
                                }
                                else {
                                    if (rows.affectedRows > 0) {
                                        res.send(JSON.stringify({ success: true, message: name + ' cadastrado com sucesso.' }))
                                    }
                                }
                            })
                    }
                })
            }
        })
    } else {
        res.send(JSON.stringify({ success: false, message: 'Invalid userId' }))
    }

})

router.put('/', (req, res, next) => {
    const phoneNumber = req.body.phoneNumber
    const password = req.body.password

    if (phoneNumber != null && password != null) {
        req.getConnection(function (err, conn) {
            conn.query('SELECT * from users WHERE phoneNumber=? AND password=?', [phoneNumber, password], function (err, rows, fields) {
                if (err) {
                    res.status(500)
                    res.send(JSON.stringify({ success: false, message: err.message }))
                } else {
                    if (rows.length > 0) {
                        res.send(JSON.stringify({ success: true, result: rows }))
                    } else {
                        res.send(JSON.stringify({ success: false, message: 'Unauthorized Staff Member.' }))
                    }
                }
            })
        })
    } else {
        res.send(JSON.stringify({ success: false, message: 'Invalid phoneNumber or Verification code' }))
    }
})


module.exports = router