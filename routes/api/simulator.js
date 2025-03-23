var SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt"

const express = require('express')
const router = express.Router()

router.get('/:id', (req, res, next) => {

    let tarrifTypeId = req.params.id

    if (tarrifTypeId != null) {
        req.getConnection(function (err, conn) {
            conn.query("SELECT * FROM tarrifs WHERE tarrifTypeId=?", [tarrifTypeId], function (err, rows, fields) {
                if (err) {
                    res.status(500)
                    res.send(JSON.stringify({ success: false, message: err.message }))
                }
                else {
                    if (rows.length > 0) {
                        res.send(JSON.stringify({ success: true, result: rows }))
                    }
                    else {
                        res.send(JSON.stringify({ success: false, message: 'Tariff Type ID not provided!' }))
                    }
                }
            })
        })
    } else {
        res.send(JSON.stringify({ success: false, message: 'Ivalid Query' }))
    }
})


module.exports = router