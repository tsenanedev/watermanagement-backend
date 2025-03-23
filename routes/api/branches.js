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


router.get('/:companyId/:branchId/:userRole', jwtMW, (req, res, next) => {

    var authorization = req.headers.authorization, decoded
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY)
    } catch (e) {
        return res.status(401).send('unauthorized')
    }
    const uid = decoded.uid

    let companyId = req.params.companyId
    let branchId = req.params.branchId
    let userRole = req.params.userRole

    if (uid != null && companyId != null) {
        req.getConnection(function (err, conn) {
            if (userRole > 1) {
                conn.query("SELECT * FROM branches WHERE id=?", [branchId], function (err, rows, fields) {
                    if (err) {
                        res.status(500)
                        res.send(JSON.stringify({ success: false, message: err.message }))
                    }
                    else {
                        if (rows.length > 0) {
                            res.send(JSON.stringify({ success: true, result: rows }))
                        }
                        else {
                            res.send(JSON.stringify({ success: false, message: 'Branch ID not available in our database!' }))
                        }
                    }
                })
            } else {
                conn.query("SELECT * FROM branches WHERE companyId=? ORDER BY name", [companyId], function (err, rows, fields) {
                    if (err) {
                        res.status(500)
                        res.send(JSON.stringify({ success: false, message: err.message }))
                    }
                    else {
                        if (rows.length > 0) {
                            res.send(JSON.stringify({ success: true, result: rows }))
                        }
                        else {
                            res.send(JSON.stringify({ success: false, message: 'Company ID not available in our database!' }))
                        }
                    }
                })
            }
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

    const name = req.body.name
    const id = req.body.id
    const companyId = req.body.companyId
    const provinceId = req.body.provinceId
    const districtId = req.body.districtId
    const createdAt = new Date()

    if (uid != null) {
        if (id > 0) {
            req.getConnection(function (err, conn) {
                conn.query("UPDATE branches SET name=? WHERE id=?", [name, id], function (err, rows, fields) {
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
            req.getConnection(function (err, conn) {
                conn.query("INSERT INTO branches(provinceId, districtId, name, companyId, createdAt) VALUES(?,?,?,?,?)",
                    [provinceId, districtId, name, companyId, createdAt], function (err, rows, fields) {
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
        }
    } else {
        res.send(JSON.stringify({ success: false, message: 'Invalid userUid' }))
    }

})


module.exports = router