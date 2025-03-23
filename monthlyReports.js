const puppeteer = require('puppeteer')
fs = require('fs-extra')
const path = require("path");
const hbs = require('handlebars')
const moment = require('moment')

moment.locale('pt-br');

const compile = async function (templateName, data) {
    const filePath = path.join(process.cwd(), 'templates', `${templateName}.hbs`)
    const html = await fs.readFile(filePath, 'utf-8')
    return hbs.compile(html)(data)
}

hbs.registerHelper('dateFormat', function (value, format) {
    console.log('formatting', value, format)
    return (moment(value).format(format).toUpperCase())
})

hbs.registerHelper('addLimitDatePayment', (value, format) => {
    const date = moment(new Date(value)).add(15, 'days').toDate()
    const limitDateOfPayment = moment(date).format(format).toUpperCase()
    return limitDateOfPayment
})

hbs.registerHelper('uppercase', function (aString) {
    return aString.toUpperCase()
})

const monthlyReports = {
    async geeneratePDFReports(relatorio, customerDetails) {
        console.log(1111, 2222)
    }
}

module.exports = monthlyReports 