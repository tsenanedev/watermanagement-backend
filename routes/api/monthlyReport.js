var SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt"

const express = require('express')
const router = express.Router()
var jwt = require('jsonwebtoken')
var exjwt = require('express-jwt')
const pdf = require('html-pdf')

const pdfGeneration = require('../../monthlyReports')

const jwtMW = exjwt({
    secret: SECRET_KEY
});

async function generatePDF() {
    const pdf = await pdfGeneration.generatePDF(company, customerDetails, customerReadings, customerPastDues, facturas, branchName)
    return pdf == true ? true : false
}

router.post('/', jwtMW, async function (req, res, next) {
    var authorization = req.headers.authorization, decoded
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY)
    } catch (e) {
        return res.status(401).send('unauthorized')
    }

    const uid = decoded.uid
    const tariffTypeId = req.body.tariffTypeId

    if (tariffTypeId != null) {
        req.getConnection((err, conn) => {
            if (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }))
            } else {
                console.log("Hello from there.")
            }
        })
    } else {
        res.send(JSON.stringify({ success: false, message: 'Invalid Request!' }))
    }
})

router.get('/:id', (re, res, next) => {
    const barcode = req.params.id


});

module.exports = router