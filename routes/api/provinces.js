const express = require('express')
const router = express.Router()

// Fetch all provinces
router.get('/', (req, res, next) => {

    req.getConnection(function (err, conn) {
        if (err) {
            console.log(err)
            res.status(500).send(JSON.stringify({success: false, message: err}))
        } else {
            conn.query("SELECT * FROM provinces", function (err, rows, fields) {
                if (err) {
                    res.status(500)
                    res.send(JSON.stringify({ success: false, message: err.message }))
                }
                else {
                    if (rows.length > 0) {
                        res.send(JSON.stringify({ success: true, result: rows }))
                    }
                    else {
                        res.send(JSON.stringify({ success: false, message: 'Provincias indisponives, contacte o provedor do aplicativo!' }))
                    }
                }
            })
        }
    })
})

// Fetch all districtsByProvinceId
router.get('/:id', (req, res, next) => {
    let provinceId = req.params.id

    if (provinceId != null) {
        req.getConnection(function (err, conn) {
            conn.query("SELECT * FROM districts ORDER BY name", function (err, rows, fields) {
                if (err) {
                    res.status(500)
                    res.send(JSON.stringify({ success: false, message: err.message }))
                }
                else {
                    if (rows.length > 0) {
                        res.send(JSON.stringify({ success: true, result: rows }))
                    }
                    else {
                        res.send(JSON.stringify({ success: false, message: 'Distritos nao disponiveis!' }))
                    }
                }
            })
        })
    } else {
        res.send(JSON.stringify({ success: false, message: 'Invalid request' }))
    }
})

module.exports = router