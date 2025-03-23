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

hbs.registerHelper('addLimitDatePayment', (value, format) => {
    const date = moment(new Date(value)).add(15, 'days').toDate()
    const limitDateOfPayment = moment(date).format(format).toUpperCase()
    return limitDateOfPayment
})

hbs.registerHelper('uppercase', function (aString) {
    return aString.toUpperCase()
})

const getTariffType = function (tariffId) {
    if (tariffId == 1) {
        return 'Fontenária'
    } else if (tariffId == 2) { 
        return 'Doméstica'
    } else if (tariffId == 3) {
        return 'Municipal'
    } else if (tariffId == 4) {
        return 'Comercial'
    } else if (tariffId == 5) {
        return 'Público'
    } else if (tariffId == 6) {
        return 'Industrial'
    }
}

const proformaFunctions = {
    async createProforma(company, customer, proformaItems) {

        try {
            const browser = await puppeteer.launch({ headless: true })
            const page = await browser.newPage()
            const category = getTariffType(2)

            const content = await compile('proforma', {
                company,
                customer,
                proformaItems
            })

            await page.setContent(content)
            await page.emulateMediaType('screen')
            await page.pdf({
                path: `./invoices/proforma.pdf`,
                format: 'A4',
                printBackground: true,
            })

            console.log('Done generating the invoice')
            await browser.close()
            return true;

        } catch (err) {
            console.log('There was an error in generating the invoice, try again later.')
            return false
        }
    }
}

module.exports = proformaFunctions