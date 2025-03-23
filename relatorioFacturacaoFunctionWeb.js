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

const geBillingPeriod = function (month) {
    if (month == 1) return 'JANEIRO DE 2022'
    if (month == 2) return 'FEVEREIRO DE 2022'
    if (month == 3) return 'MARÇO DE 2022'
    if (month == 4) return 'ABRIL DE 2022'
    if (month == 5) return 'MAIO DE 2022'
    if (month == 6) return 'JUNHO DE 2022'
    if (month == 7) return 'JULHO DE 2022'
    if (month == 8) return 'AGOSTO DE 2022'
    if (month == 9) return 'SETEMBRO DE 2021'
    if (month == 10) return 'OUTUBRO DE 2021'
    if (month == 11) return 'NOVEMBRO DE 2021'
    if (month == 12) return 'DEZEMBRO DE 2021'
}

const getClientesExistentes = function (customers, tariff) {
    const existentes = customers.filter((a) => {
        return a.tarrifTypeId === tariff;
    });
    // console.log(existentes.length)
    return existentes.length
}

const getClientesFacturados = function (readings, tariff) {
    const facturados = readings.filter((a) => {
        return a.tarrifTypeId === tariff;
    });
    // console.log(facturados.length)
    return facturados.length
}

const getVolumeAguaFacturada = function (readings, tariff) {
    const leituras = readings.filter((a) => {
        return a.tarrifTypeId === tariff;
    });
    let aguaFacturada = leituras.reduce(function (acumulador, valorAtual) {
        return acumulador + valorAtual.consumoFacturado;
    }, 0)
    return aguaFacturada
}

const getFacturacaoSemIva = function (readings, tariff) {
    const leituras = readings.filter((a) => {
        return a.tarrifTypeId === tariff;
    });
    let facturacaoSemIva = leituras.reduce(function (acumulador, valorAtual) {
        return acumulador + valorAtual.subTotal;
    }, 0)
    return parseFloat(facturacaoSemIva).toFixed(2)
}

const getTaxasOutrosMultas = function (taxas, tariff) {
    const taxasOutros = taxas.filter((a) => {
        return a.tarrifTypeId === tariff;
    });
    let taxasOutrosMultas = taxasOutros.reduce(function (acumulador, valorAtual) {
        return acumulador + valorAtual.amount;
    }, 0)
    return parseFloat(taxasOutrosMultas).toFixed(2)
}

const getFacturacaoComIva = function (readings, tariff) {
    const leituras = readings.filter((a) => {
        return a.tarrifTypeId === tariff;
    });
    let facturacaoComIva = leituras.reduce(function (acumulador, valorAtual) {
        return acumulador + valorAtual.totalOfBill;
    }, 0)
    return parseFloat(facturacaoComIva).toFixed(2)
}

const getTotalFacturado = function (readings, tariff, taxas) {
    const leituras = readings.filter((a) => {
        return a.tarrifTypeId === tariff;
    });
    let facturacaoComIva = leituras.reduce(function (acumulador, valorAtual) {
        return acumulador + valorAtual.totalOfBill;
    }, 0)

    const taxasOutros = taxas.filter((a) => {
        return a.tarrifTypeId === tariff;
    });
    let taxasOutrosMultas = taxasOutros.reduce(function (acumulador, valorAtual) {
        return acumulador + valorAtual.amount;
    }, 0)

    return parseFloat(facturacaoComIva + taxasOutrosMultas).toFixed(2)
}

const getDividaDuranteMes = function (readings, tariff, taxas) {
    const leituras = readings.filter((a) => {
        return a.tarrifTypeId == tariff;
    });
    const leiturasStatus = leituras.filter((a) => {
        return a.status === 0;
    });

    let facturacaoComIva = leiturasStatus.reduce(function (acumulador, valorAtual) {
        return acumulador + parseFloat(valorAtual.totalOfBill);
    }, 0)

    const taxasOutros = taxas.filter((a) => {
        return a.tarrifTypeId == tariff;
    });

    const taxasOutrosStatus = taxasOutros.filter((a) => {
        return a.status === 0;
    });

    let taxasOutrosMultas = taxasOutrosStatus.reduce(function (acumulador, valorAtual) {
        return acumulador + parseFloat(valorAtual.amount);
    }, 0)

    return (facturacaoComIva + taxasOutrosMultas).toFixed(2)
}

const getTotalRecebido = function (payments, tariff) {
    const recebimentos = payments.filter((a) => {
        return a.tarrifTypeId == tariff;
    });
    // console.log(recebimentos)
    let totalRecebido = recebimentos.reduce(function (acumulador, valorAtual) {
        return acumulador + valorAtual.totalPaid;
    }, 0)
    return parseFloat(totalRecebido).toFixed(2)
}

const getTotalFacturadoGlobal = function (readings, taxas) {
    let facturacaoComIva = readings.reduce(function (acumulador, valorAtual) {
        return acumulador + valorAtual.totalOfBill;
    }, 0)

    let taxasOutrosMultas = taxas.reduce(function (acumulador, valorAtual) {
        return acumulador + valorAtual.amount;
    }, 0)

    return parseFloat(facturacaoComIva + taxasOutrosMultas).toFixed(2)
}

const getTotalRecebidoGlobal = function (payments) {
    let totalRecebido = payments.reduce(function (acumulador, valorAtual) {
        return acumulador + valorAtual.totalPaid;
    }, 0)
    return parseFloat(totalRecebido).toFixed(2)
}

const relatorioFacturacao = {
    async createReportPDF(customers, readings, taxas, reportInterval, payments, totalFacturadoLifeCicle, totalPagoGlobalFacturado) {
        const currentDate = `${new Date().getFullYear()}-0${new Date().getMonth() + 1}-${new Date().getDate()}`

        const totalClientes = {
            totalFont: getClientesExistentes(customers, 1),
            totalDom: getClientesExistentes(customers, 2),
            totalMunic: getClientesExistentes(customers, 3),
            totalComer: getClientesExistentes(customers, 4),
            totalPubl: getClientesExistentes(customers, 5),
            totalIndust: getClientesExistentes(customers, 6)
        }

        const totalFacturados = {
            totalFont: getClientesFacturados(readings, 1),
            totalDom: getClientesFacturados(readings, 2),
            totalMunic: getClientesFacturados(readings, 3),
            totalComer: getClientesFacturados(readings, 4),
            totalPubl: getClientesFacturados(readings, 5),
            totalIndust: getClientesFacturados(readings, 6)
        }

        const aguaFacturada = {
            totalFont: getVolumeAguaFacturada(readings, 1),
            totalDom: getVolumeAguaFacturada(readings, 2),
            totalMunic: getVolumeAguaFacturada(readings, 3),
            totalComer: getVolumeAguaFacturada(readings, 4),
            totalPubl: getVolumeAguaFacturada(readings, 5),
            totalIndust: getVolumeAguaFacturada(readings, 6)
        }

        const facturacaoSemIva = {
            totalFont: getFacturacaoSemIva(readings, 1),
            totalDom: getFacturacaoSemIva(readings, 2),
            totalMunic: getFacturacaoSemIva(readings, 3),
            totalComer: getFacturacaoSemIva(readings, 4),
            totalPubl: getFacturacaoSemIva(readings, 5),
            totalIndust: getFacturacaoSemIva(readings, 6)
        }

        const taxasOutrosMultas = {
            totalFont: getTaxasOutrosMultas(taxas, 1),
            totalDom: getTaxasOutrosMultas(taxas, 2),
            totalMunic: getTaxasOutrosMultas(taxas, 3),
            totalComer: getTaxasOutrosMultas(taxas, 4),
            totalPubl: getTaxasOutrosMultas(taxas, 5),
            totalIndust: getTaxasOutrosMultas(taxas, 6)
        }

        const facturacaoComIva = {
            totalFont: getFacturacaoComIva(readings, 1),
            totalDom: getFacturacaoComIva(readings, 2),
            totalMunic: getFacturacaoComIva(readings, 3),
            totalComer: getFacturacaoComIva(readings, 4),
            totalPubl: getFacturacaoComIva(readings, 5),
            totalIndust: getFacturacaoComIva(readings, 6)
        }

        const totalFacturado = {
            totalFont: getTotalFacturado(readings, 1, taxas),
            totalDom: getTotalFacturado(readings, 2, taxas),
            totalMunic: getTotalFacturado(readings, 3, taxas),
            totalComer: getTotalFacturado(readings, 4, taxas),
            totalPubl: getTotalFacturado(readings, 5, taxas),
            totalIndust: getTotalFacturado(readings, 6, taxas)
        }

        const totalRecebido = {
            totalFont: getTotalRecebido(payments, 1),
            totalDom: getTotalRecebido(payments, 2),
            totalMunic: getTotalRecebido(payments, 3),
            totalComer: getTotalRecebido(payments, 4),
            totalPubl: getTotalRecebido(payments, 5),
            totalIndust: getTotalRecebido(payments, 6)
        }

        const dividaDuranteMes = {
            totalFont: getDividaDuranteMes(readings, 1, taxas),
            totalDom: getDividaDuranteMes(readings, 2, taxas),
            totalMunic: getDividaDuranteMes(readings, 3, taxas),
            totalComer: getDividaDuranteMes(readings, 4, taxas),
            totalPubl: getDividaDuranteMes(readings, 5, taxas),
            totalIndust: getDividaDuranteMes(readings, 6, taxas)
        }

        const totalFacturadoGeral = getTotalFacturadoGlobal(readings, taxas)
        const totalRecebidoGeral = getTotalRecebidoGlobal(payments)
        const dividaDuranteMesGeral = (totalFacturadoGeral - totalRecebidoGeral).toFixed(2)

        try {
            // const browser = await puppeteer.launch({ headless: true })
            // const page = await browser.newPage()

            const content = await compile('relatorio_facturacao', {
                from: geBillingPeriod(readings[0].month),
                to: reportInterval.to,
                printedAt: currentDate,
                totalClientes,
                totalFacturados,
                aguaFacturada,
                facturacaoSemIva,
                taxasOutrosMultas,
                facturacaoComIva,
                totalFacturado,
                totalRecebido,
                dividaDuranteMes,
                totalFacturadoGeral,
                totalRecebidoGeral,
                negatiVo: dividaDuranteMesGeral <= 0 ? false : true,
                dividaDuranteMesGeral: dividaDuranteMesGeral <= 0 ? (dividaDuranteMesGeral * (-1)) + '' : dividaDuranteMesGeral,
                totalFacturadoLifeCicle: totalFacturadoLifeCicle == null ? '0.00' : totalFacturadoLifeCicle.toFixed(2),
                totalPagoGlobalFacturado: totalPagoGlobalFacturado == null ? '0.00' : totalPagoGlobalFacturado.toFixed(2),
                dividaGeralAcomulado: (totalFacturadoLifeCicle - totalPagoGlobalFacturado).toFixed(2)
            })

            console.log(content)

            // await page.setContent(content)
            // await page.emulateMediaType('screen')
            // const pdfReport = await page.pdf({
            //     // path: `./reports/${fileName}.pdf`,
            //     format: 'A4',
            //     printBackground: true,
            //     landscape: true
            // })

            // console.log('Done generating the report')
            
            // await page.close()
            // await browser.close()

            return true;

        } catch (err) {
            console.log('There was an error in generating the report, try again later.')
            return false
        }
    }
}

module.exports = relatorioFacturacao