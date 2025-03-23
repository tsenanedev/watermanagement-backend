const express = require('express')
const router = express.Router()
var jwt = require('jsonwebtoken')
var exjwt = require('express-jwt')
const fetch = require('node-fetch')

const calculateMunicipalAndFountains = (amount, tariff) => {
    const pricePerCubicMeter = parseFloat(tariff.pricePerCubicMeter)
    const totalPaid = parseFloat(amount)
    const vat = totalPaid * 0.75 * 0.17
    const subTotal = totalPaid - vat
    const quantity = subTotal / pricePerCubicMeter

    const purchase = {
        pricePerCubicMeter: pricePerCubicMeter.toFixed(2),
        quantity: quantity.toFixed(2),
        subTotal: subTotal.toFixed(2),
        vat: vat.toFixed(2),
        totalPaid: totalPaid.toFixed(2),
    }
    // console.log(purchase)
    return [purchase]
}

const calculatePublicAndCommercial = (amount, tariff) => {
    const totalPaid = parseFloat(amount)
    const minimumAmount = parseFloat(tariff.firstTwentyFive)
    const vat = totalPaid * 0.75 * 0.17
    const subTotal = totalPaid - vat

    if (totalPaid < minimumAmount) {
        return 'O valor mínimo de compra é ' + tariff.firstTwentyFive.toFixed(2) + ' MZN'
    } else {


        return pricePerCubicMeter
    }

}

const getTariff = (tarrifTypeId) => {
    let tariff
    if (tarrifTypeId == 1) return 'Fontenária'
    if (tarrifTypeId == 2) return 'Doméstica'
    if (tarrifTypeId == 3) return 'Municipal'
    if (tarrifTypeId == 4) return 'Público & Comercial'
    if (tarrifTypeId == 5) return 'Industrial'
}

var SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt"

const jwtMW = exjwt({
    secret: SECRET_KEY
});
// Add Purchase
router.post('/', jwtMW, (req, res, next) => {

    const meterNumber = req.body.meterNumber
    const amount = req.body.amount
    const provider = req.body.provider

    const reference = Math.floor(Math.random() * 100000) + 1
    const month = new Date().getMonth() + 1
    const date = `${new Date().getFullYear()}-${month < 10 ? '0' + month : month}-${new Date().getDate()}`

    if (amount != null && meterNumber != null) {
        req.getConnection((err, conn) => {
            if (err) {
                res.status(500).send(JSON.stringify({ success: false, message: err }))
            } else {
                conn.query("SELECT * FROM customers WHERE barcode=?", [meterNumber], (err, rows, fields) => {
                    if (err) {
                        res.status(500).send(JSON.stringify({ success: false, message: err }))
                    } else {
                        if (rows.length > 0) {
                            conn.query("SELECT * FROM tarrifs WHERE tarrifTypeId=?", [rows[0].tarrifTypeId], (err, tariff, fields) => {
                                if (err) {
                                    res.status(500).send(JSON.stringify({ success: false, message: err }))
                                } else {

                                    if (tariff[0].tarrifTypeId == 1 || tariff[0].tarrifTypeId == 3) {
                                        // FOUNTAIN AND MUNICIPAL TARIFF
                                        const customerPurchaseDetails = {
                                            customerName: rows[0].name,
                                            meterNumber: rows[0].barcode,
                                            address: rows[0].address,
                                            nuit: rows[0].nuit,
                                            tariff: getTariff(rows[0].tarrifTypeId),
                                            token: Math.floor(Math.random() * 100000000000000000000 - 1),
                                            provider: provider,
                                            receipt: calculateMunicipalAndFountains(amount, tariff[0])
                                        }
                                        console.log(customerPurchaseDetails)
                                        res.send(JSON.stringify({ success: true, result: customerPurchaseDetails }))

                                    } else if (tariff[0].tarrifTypeId == 4) {
                                        // PUBLIC AND COMMERCIAL TARIFF
                                        const customerPurchaseDetails = {
                                            customerName: rows[0].name,
                                            meterNumber: rows[0].barcode,
                                            address: rows[0].address,
                                            nuit: rows[0].nuit,
                                            tariff: getTariff(rows[0].tarrifTypeId),
                                            token: Math.floor(Math.random() * 100000000000000000000 - 1),
                                            provider: provider,
                                            receipt: calculatePublicAndCommercial(amount, tariff[0])
                                        }
                                        console.log(customerPurchaseDetails)
                                        res.send(JSON.stringify({ success: true, result: calculatePublicAndCommercial(amount, tariff[0]) }))
                                    }
                                }
                            })

                        } else {
                            res.status(401).send(JSON.stringify({ success: false, message: 'The meter number provided does not exist.' }))
                        }
                    }
                })
            }
        })

    } else {
        res.send(JSON.stringify({ success: false, message: 'Invalid request' }))
    }
})

module.exports = router