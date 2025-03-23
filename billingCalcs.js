const puppeteer = require("puppeteer");
fs = require("fs-extra");
const path = require("path");
const hbs = require("handlebars");
const moment = require("moment");

moment.locale("pt-br");

const compile = async function (templateName, data) {
  const filePath = path.join(process.cwd(), "templates", `${templateName}.hbs`);
  const html = await fs.readFile(filePath, "utf-8");
  return hbs.compile(html)(data);
};

hbs.registerHelper("dateFormat", function (value, format) {
  console.log("formatting", value, format);
  return moment(value).format(format).toUpperCase();
});

hbs.registerHelper("addLimitDatePayment", (value, format) => {
  const date = moment(new Date(value)).add(15, "days").toDate();
  const limitDateOfPayment = moment(date).format(format).toUpperCase();
  return limitDateOfPayment;
});

hbs.registerHelper("uppercase", function (aString) {
  return aString.toUpperCase();
});

const getTariffType = function (tariffId) {
  if (tariffId == 1) {
    return "Fontenária";
  } else if (tariffId == 2) {
    return "Doméstica";
  } else if (tariffId == 3) {
    return "Municipal";
  } else if (tariffId == 4) {
    return "Comercial";
  } else if (tariffId == 5) {
    return "Público";
  } else if (tariffId == 6) {
    return "Industrial";
  } else if (tariffId == 7) {
    return "Toma de Água";
  }
};

const createTariffContent = function (facturas) {
  console.log(facturas);
  // return
  if (facturas[0].id == 0) {
    return `
        <tr>
            <td width="50%">Taxa de disponibilidade de serviço</td>
            <td>1</td>
            <td>${facturas[0].serviceAvailabilityFee.toFixed(2)}</td>
            <td>${facturas[0].serviceAvailabilityFee.toFixed(2)}</td>
        </tr>
        <tr>
        <td width="50%">Escalão Social</td>
        <td>5 m<sup>3</sup></td>
        <td>${(facturas[0].socialTire / 5).toFixed(2)}</td>
        <td>${facturas[0].socialTire.toFixed(2)}</td>
    </tr>
        `;
  } else if (facturas[0].id == 1) {
    return `
        <tr>
            <td width="50%">Venda de Água Fontenária</td>
            <td>${facturas[0].totalUnities}m<sup>3</sup></td>
            <td>${facturas[0].pricePerMeterCubic}</td>
            <td>${facturas[0].subTotal.toFixed(2)}</td>
        </tr>
        `;
  } else if (facturas[0].id == 2 || facturas[0].id == 3) {
    let aboveSeven;

    const firstSeven = `
        <tr>
            <td width="50%">Taxa de disponibilidade de serviço</td>
            <td>1</td>
            <td>${facturas[0].serviceAvailabilityFee.toFixed(2)}</td>
            <td>${facturas[0].serviceAvailabilityFee.toFixed(2)}</td>
        </tr>
        <tr>
            <td width="50%">Escalão 1 * 0 a 5 m<sup>3</sup></td>
            <td>5 m<sup>3</sup></td>
            <td>${(facturas[0].escalaoUm / 5).toFixed(2)}</td>
            <td>${facturas[0].socialTire.toFixed(2)}</td>
        </tr>
        <tr>
            <td width="50%">Escalão 2 * 6 a 7 m<sup>3</sup></td>
            <td>${facturas[0].base[0].baseEscDois} m<sup>3</sup></td>
            <td>${facturas[0].firstSeven.toFixed(2)}</td>
            <td>${(
              facturas[0].firstSeven * facturas[0].base[0].baseEscDois
            ).toFixed(2)}</td>
        </tr>
        `;

    if (facturas[0].base[0].baseEscTres > 0) {
      aboveSeven = `
            <tr>
                <td width="50%">Escalão 3 * Maior que 7 m<sup>3</sup></td>
                <td>${facturas[0].base[0].baseEscTres} m<sup>3</sup></td>
                <td>${facturas[0].aboveSeven.toFixed(2)}</td>
                <td>${(
                  facturas[0].aboveSeven * facturas[0].base[0].baseEscTres
                ).toFixed(2)}</td>
            </tr>
            `;
      return firstSeven + aboveSeven;
    }
    return firstSeven;
  } else if (facturas[0].id >= 4) {
    let escalaoDois;

    const escalaoUm = `
        <tr>
            <td width="50%">Taxa de disponibilidade de serviço</td>
            <td>1</td>
            <td>${facturas[0].serviceAvailabilityFee.toFixed(2)}</td>
            <td>${facturas[0].serviceAvailabilityFee.toFixed(2)}</td>
        </tr>
        <tr>
            <td width="50%">Escalão 1 * 0 a 15 m<sup>3</sup></td>
            <td>15 m<sup>3</sup></td>
            <td>${(facturas[0].firstFifteen / 15).toFixed(2)}</td>
            <td>${facturas[0].firstFifteen.toFixed(2)}</td>
        </tr>
        `;

    if (facturas[0].escalaoDois > 0) {
      escalaoDois = `
            <tr>
                <td width="50%">Escalão 2 * Maior que 15 m<sup>3</sup></td>
                <td>${facturas[0].base[0].baseEscDois} m<sup>3</sup></td>
                <td>${facturas[0].aboveFifteen.toFixed(2)}</td>
                <td>${facturas[0].escalaoDois.toFixed(2)}</td>
            </tr>
            `;
      return escalaoUm + escalaoDois;
    }

    return escalaoUm;
  }
};

const billingCalcs = {
  async generatePDF(
    company,
    customerDetails,
    customerReadings,
    dividaPassada,
    facturas,
    branchName = "tsenan"
  ) {
    const leituraActual = customerReadings[0][0];
    const leituras = facturas;
    console.log(dividaPassada);
    let totalDaFactura = leituras.reduce(function (acumulador, valorAtual) {
      return acumulador + parseFloat(valorAtual.total);
    }, 0);

    let totalMultas = dividaPassada.reduce(function (acumulador, valorAtual) {
      return acumulador + parseFloat(valorAtual.amount);
    }, 0);

    totalDaFactura = (totalMultas + totalDaFactura).toFixed(2);
    const cliente = customerDetails[0];
    const empresa = company[0];

    const detalhesDaFactura = createTariffContent(leituras);

    try {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();

      const category = getTariffType(cliente.tarrifTypeId);

      // console.log(leituras.length)

      const content = await compile("invoice", {
        empresa,
        cliente,
        leituraActual,
        leituras,
        category,
        facturas: facturas[0],
        detalhesDaFactura,
        totalDaFactura,
        debts: dividaPassada,
        avisoCorte: leituras.length >= 2 ? true : false,
      });

      await page.setContent(content);
      await page.emulateMediaType("screen");
      await page.pdf({
        path: `./uploads/${branchName}/${customerReadings[0][0].uniqueBillId}.pdf`,
        format: "A4",
        printBackground: true,
      });

      console.log("Done generating invoice.");
      await browser.close();
      return true;
    } catch (e) {
      console.log("There was an error generating the invoice.", e);
      return false;
    }
  },

  domesticBelowFive(bills, tariff) {
    const serviceAvailabilityFee =
      bills.tariffId == 1
        ? tariff.serviceAvailabilityFee
        : tariff.newServiceAvailabilityFee;

    const socialTire =
      bills.tariffId == 1 ? tariff.socialTire : tariff.newSocialTire;

    const subTotal =
      parseFloat(serviceAvailabilityFee) + parseFloat(socialTire);

    const vat =
      bills.year == 2023 ? 0.75 * 0.16 * subTotal : 0.75 * 0.17 * subTotal;

    const total = subTotal + vat;
    const forfeit = bills.forfeit * total;

    const purchaseInformation = [
      {
        billId: bills.receiptNumber,
        id: 0,
        createdAt: bills.consumptionPeriod,
        dataEmissao: bills.dataEmissao,
        dataLimite: bills.dataLimite,
        subTotal: subTotal.toFixed(2),
        vat: vat.toFixed(2),
        total: (total + forfeit).toFixed(2),
        forfeit: forfeit.toFixed(2),
        serviceAvailabilityFee,
        socialTire,
        totalUnities: 5,
        year: bills.year,
        consumoFacturado: bills.consumoFacturado,
        current: bills.current,
        last: bills.last,
        status: bills.status,
        waterMeterImageUrl: bills.waterMeterImageUrl,
      },
    ];
    return purchaseInformation;
  },

  domesticAboveFive(bills, tariff) {
    const quantity = parseFloat(bills.consumption);

    let baseEscDois = 0;
    let baseEscTres = 0;
    let baseEscUm = 5;

    if (quantity == 6) {
      baseEscDois = 1;
    } else if (quantity == 7) {
      baseEscDois = 2;
    } else if (quantity > 7) {
      baseEscTres = quantity - 7;
      baseEscDois = 2;
    }

    const serviceAvailabilityFee =
      bills.tariffId == 1
        ? tariff.serviceAvailabilityFee
        : tariff.newServiceAvailabilityFee;

    const socialTire =
      bills.tariffId == 1 ? tariff.socialTire : tariff.newSocialTire;

    const firstSeven =
      bills.tariffId == 1 ? tariff.firstSeven : tariff.newFirstSeven;

    const aboveSeven =
      bills.tariffId == 1 ? tariff.aboveSeven : tariff.newAboveSeven;

    const escalaoUm = parseFloat(socialTire);
    const escalaoDois = parseFloat(firstSeven) * baseEscDois;
    const escalaoTres = parseFloat(aboveSeven) * baseEscTres;
    const subTotal =
      escalaoUm + escalaoDois + escalaoTres + serviceAvailabilityFee;
    const vat =
      bills.year == 2023 ? 0.75 * 0.16 * subTotal : 0.75 * 0.17 * subTotal;
    const total = subTotal + vat;
    const forfeit = bills.forfeit * total;

    const purchaseInformation = [
      {
        id: 2,
        billId: bills.receiptNumber,
        escalaoUm,
        escalaoDois,
        createdAt: bills.consumptionPeriod,
        dataEmissao: bills.dataEmissao,
        dataLimite: bills.dataLimite,
        escalaoTres,
        firstSeven: firstSeven,
        aboveSeven: aboveSeven,
        subTotal: subTotal.toFixed(2),
        total: (total + forfeit).toFixed(2),
        forfeit: forfeit.toFixed(2),
        vat: vat.toFixed(2),
        socialTire: socialTire,
        serviceAvailabilityFee: serviceAvailabilityFee,
        totalUnities: bills.consumption,
        year: bills.year,
        consumoFacturado: bills.consumoFacturado,
        current: bills.current,
        last: bills.last,
        status: bills.status,
        waterMeterImageUrl: bills.waterMeterImageUrl,
        base: [
          {
            baseEscUm,
            baseEscDois,
            baseEscTres,
          },
        ],
      },
    ];
    return purchaseInformation;
  },

  fontCalc(bills, tariff) {
    const pricePerMeter =
      bills.tariffId == 1
        ? tariff.pricePerMeterCubic
        : tariff.newPricePerMeterCubic;

    const subTotal =
      parseFloat(bills.consumoFacturado) * parseFloat(pricePerMeter);

    const vat =
      bills.year == 2023 ? 0.75 * 0.16 * subTotal : 0.75 * 0.17 * subTotal;

    const total = vat + subTotal;
    const forfeit = bills.forfeit * total;

    const purchaseInformation = [
      {
        id: 1,
        billId: bills.receiptNumber,
        subTotal,
        createdAt: bills.consumptionPeriod,
        dataEmissao: bills.dataEmissao,
        dataLimite: bills.dataLimite,
        vat,
        total: total + forfeit,
        forfeit: forfeit,
        totalUnities: bills.consumption,
        year: bills.year,
        consumoFacturado: bills.consumoFacturado,
        current: bills.current,
        last: bills.last,
        pricePerMeterCubic: pricePerMeter,
        status: bills.status,
        waterMeterImageUrl: bills.waterMeterImageUrl,
      },
    ];
    return purchaseInformation;
  },

  calculatePublicComercialAndIndustrial(bills, tariff) {
    const qty = parseFloat(bills.consumption);

    const firstFifteen =
      bills.tariffId == 1 ? tariff.firstFifteen : tariff.newFirstFifteen;

    const serviceAvailabilityFee =
      bills.tariffId == 1
        ? tariff.serviceAvailabilityFee
        : tariff.newServiceAvailabilityFee;

    const escalaoUm =
      parseFloat(firstFifteen) + parseFloat(serviceAvailabilityFee);

    let baseEscDois = 0;

    if (bills.consumption > 15) {
      baseEscDois = qty - 15;
    }
    const escalaoDois =
      bills.tariffId == 1
        ? baseEscDois * parseFloat(tariff.aboveFifteen)
        : baseEscDois * parseFloat(tariff.newAboveFifteen);

    const subTotal = escalaoUm + escalaoDois;
    const vat =
      bills.year == 2023 ? 0.75 * 0.16 * subTotal : 0.75 * 0.17 * subTotal;
    const total = vat + subTotal;
    const forfeit = bills.forfeit * total;

    const purchaseInformation = [
      {
        id: 4,
        billId: bills.receiptNumber,
        createdAt: bills.consumptionPeriod,
        dataEmissao: bills.dataEmissao,
        dataLimite: bills.dataLimite,
        escalaoUm,
        firstFifteen:
          bills.tariffId == 1 ? tariff.firstFifteen : tariff.newFirstFifteen,
        aboveFifteen:
          bills.tariffId == 1 ? tariff.aboveFifteen : tariff.newAboveFifteen,
        totalUnities: bills.consumption,
        year: bills.year,
        consumoFacturado: bills.consumoFacturado,
        current: bills.current,
        last: bills.last,
        status: bills.status,
        escalaoDois,
        base: [
          {
            baseEscDois,
          },
        ],
        serviceAvailabilityFee,
        subTotal: subTotal.toFixed(2),
        vat: vat.toFixed(2),
        total: (total + forfeit).toFixed(2),
        forfeit: forfeit.toFixed(2),
        waterMeterImageUrl: bills.waterMeterImageUrl,
      },
    ];
    return purchaseInformation;
  },
};

module.exports = billingCalcs;
