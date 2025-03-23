var SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt"
const express = require('express')
const router = express.Router()

const QRCode = require('qrcode')


var jwt = require('jsonwebtoken')
var exjwt = require('express-jwt')

const jwtMW = exjwt({
    secret: SECRET_KEY
});

router.get('/', (req, res, next) => {

})

// Send SMS
router.post('/', jwtMW, (req, res, next) => {

    var authorization = req.headers.authorization, decoded
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY)
    } catch (e) {
        return res.status(401).send('unauthorized')
    }
    const uid = decoded.uid

    let data = {
        productName: req.body.productName,
        productDescription: req.body.productDescription,
        productPrice: req.body.productPrice,
        productDiscount: req.body.productDiscount,
        productCompanyDetails: req.body.productCompanyDetails,
        productId: req.body.productId,
    }

    if (uid != null && data.productName != null) {
        // COnverting data into String format
        let stringQrCode = JSON.stringify(data)

        // Print the QR COde to terminal
        QRCode.toString(stringQrCode, { type: 'terminal' },
            (err, QRCode) => {
                if (err) {
                    console.log('Houve um erro na gerção de codigo de barra.')
                    res.send(JSON.stringify({ success: false, message: 'Houve um erro  na geração do código de barras.' }))
                } else {
                    console.log(QRCode)
                    res.send(JSON.stringify({ success: true, message: 'Código de barra gerado com sucesso.' }))
                } stringQrCode
            })
        // QRCode.toDataURL(stringQrCode, (err, url) => {
        //     if (err) {
        //         res.status(200).send(JSON.stringify({ success: false, message: 'Error: ' + err }))
        //     } else {
        //         res.send(JSON.stringify({ success: true, url: url }))
        //     }
        // })


    } else {
        res.send(JSON.stringify({ success: false, message: 'Invalid request' }))
    }
})

module.exports = router