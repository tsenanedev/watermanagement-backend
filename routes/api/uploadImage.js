const fs = require('fs')

const express = require('express')
const router = express.Router()
var jwt = require('jsonwebtoken')
var exjwt = require('express-jwt')

var SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt"

const jwtMW = exjwt({
    secret: SECRET_KEY
});

router.post('/', jwtMW, (req, res, next) => {

    if (!req.files) {
        res.status(500)
        res.send(JSON.stringify({ success: false, message: 'No file selected' }))
    }

    const myFile = req.files.file

    myFile.mv(`${__dirname}/public/${myFile.name}`, (err) => {
        if (err) {
            console.log(err)
            res.status(500)
            res.send(JSON.stringify({ success: false, message: 'Error ocured uploading the image!' }))
        } else {
            res.send(JSON.stringify({ success: true, message: 'Success' }))
        }
    })

})

module.exports = router