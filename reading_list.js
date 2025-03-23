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

const generateReports = {

    async generatePDF(lists, neighbor_list) {
        console.log(lists)

        try {
            const browser = await puppeteer.launch({ headless: true })
            const page = await browser.newPage()

            const content = await compile('reading_list', {
                lists,
                neighbor_list,
            })

            await page.setContent(content)
            await page.emulateMediaType('screen')
            await page.pdf({
                path: `./uploads/readings_list/${neighbor_list}.pdf`,
                format: "A4",
                printBackground: true
            })

            console.log('Done generating Reading List.')
            await browser.close()
            return true;
        } catch (e) {
            console.log('There was an error generating the Reading List.', e)
            return false
        }
    }
}

module.exports = generateReports