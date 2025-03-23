var SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt"

const express = require('express')
const router = express.Router()
var jwt = require('jsonwebtoken')
var exjwt = require('express-jwt')

const jwtMW = exjwt({
    secret: SECRET_KEY
});

const proformaFunctions = require('../../proformaFunctions')

async function generateProformaPDF(company, customer, proformaItems) {
    const pdf = await proformaFunctions.createProforma(company, customer, proformaItems)
    return pdf == true ? true : false
}

router.get('/:id', jwtMW, (req, res, next) => {
    var authorization = req.headers.authorization, decoded
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY)
    } catch (e) {
        return res.status(401).send('unauthorized')
    }

    const uid = decoded.uid
    const proformaId = req.params.id

    if (uid != null && proformaId != null) {
        new Promise(async (resolve, reject) => {
            try {
                const generating = await generateProformaPDF(1, 2, 3)
                console.log(generating)
                res.send(JSON.stringify({ success: true, message: 'Factura Proforma criada com sucesso.' }))
                resolve(generating)
            } catch (err) {
                console.log(err)
                res.send(JSON.stringify({ success: false, message: 'Houve um erro na criação da factura proforma.' }))
                reject(err)
            }
        })
    }
})

module.exports = router