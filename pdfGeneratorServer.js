const fs = require("fs");

const Pdfmake = require("pdfmake");

var fonts = {
  Roboto: {
    normal: "fonts/roboto/Roboto-Regular.ttf",
    bold: "fonts/roboto/Roboto-Medium.ttf",
    italics: "fonts/roboto/Roboto-Italic.ttf",
    bolditalics: "fonts/roboto/Roboto-MediumItalic.ttf",
  },
};

let pdfmake = new Pdfmake(fonts);

const generateBill = async (customer, facturas) => {
  const readingDetails =
    facturas[
      facturas.length > 0 ? facturas.length - 1 : 0
    ];

  if (facturas.length > 0) {
    const body = [];

    for (let row of facturas) {
      const rows = [];

      rows.push({
        text: row.receiptNumber + "/SAF/" + row.year,
        fontSize: 8,
      });
      rows.push({ text: row.dataEmissao, fontSize: 8 });
      rows.push({ text: row.dataLimite, fontSize: 8 });
      rows.push({ text: row.consumoFacturado, fontSize: 8 });
      rows.push({ text: row.subTotal, fontSize: 8 });
      rows.push({ text: row.vat, fontSize: 8 });
      rows.push({ text: row.forfeit, fontSize: 8 });
      rows.push({ text: row.totalOfBill, fontSize: 8 });

      body.push(rows);
    }

    let docDefinition = {
      // watermark: { text: this.company[0].name, opacity: 0.08 },
      header: [
        {
          image: await this.getBase64ImageFromURL(
            "https://saaf-tsenane.herokuapp.com/img/logo_12.2b7a27d2.jpeg"
          ),
          width: 250,
          height: 150,
          margin: [30, 0, 0, 0],
        },
      ],
      footer: {
        columns: [
          {
            text: "Documento processado por computador",
            alignment: "left",
            fontSize: 8,
            margin: [30, 0, 0, 0],
          },
          {
            text: "TSENANE Software",
            alignment: "right",
            fontSize: 8,
            margin: [0, 0, 30, 0],
          },
        ],
      },
      content: [
        {
          columns: [
            [
              {
                text: `Factura/Recibo Nº: ${readingDetails.receiptNumber}\n`,
                bold: true,
                fontSize: 10,
                alignment: "right",
              },
            ],
          ],
        },
        {
          text: "\n\n\n\n\n\n\n",
        },
        {
          columns: [
            [
              [
                {
                  text: `Nome: ${customer.name}`,
                  bold: true,
                  fontSize: 11,
                },
                {
                  text: `Tarifa: ${this.tariffId(customer.tarrifTypeId)}`,
                  bold: true,
                  fontSize: 10,
                },
                {
                  text: `Endereço: ${customer.address}`,
                  fontSize: 10,
                },
                {
                  text: `Telefone: ${customer.phone}`,
                  fontSize: 10,
                },
                {
                  text: `NUIT: ${customer.nuit}`,
                  fontSize: 10,
                },
              ],
            ],
            [
              {
                text: `Data de emissão: ${readingDetails.dataEmissao}`,
                alignment: "right",
                bold: true,
                fontSize: 10,
              },
              {
                text: `Data de vencimento: ${readingDetails.dataLimite}`,
                alignment: "right",
                bold: true,
                fontSize: 10,
              },
            ],
          ],
        },
        {
          text: "Dados da factura",
          style: "sectionHeader",
        },
        {
          table: {
            widths: [
              "*",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
            ],
            body: [
              [
                { text: "Nº/Doc", style: "columnsTitle" },
                { text: "Data", style: "columnsTitle" },
                { text: "Vencimento", style: "columnsTitle" },
                { text: "Consumo", style: "columnsTitle" },
                { text: "Subtotal", style: "columnsTitle" },
                { text: "IVA", style: "columnsTitle" },
                { text: "Multa", style: "columnsTitle" },
                { text: "Total", style: "columnsTitle" },
              ],
              ...body,
            ],
          },
          layout: "lightHorizontalLines",
        },
        {
          text: `\nTOTAL A PAGAR: ${(
            this.getTDbt(customer.barcode) + this.dividaMlt(customer.barcode)
          ).toFixed(2)} MZN`,
          fontSize: 10,
          alignment: "right",
          color: "#000000",
        },
        {
          text: "\n\n Assinatura do técnico: _______________________________",
          alignment: "center",
          fontSize: 10,
        },
      ],
      styles: {
        sectionHeader: {
          bold: true,
          decoration: "underline",
          fontSize: 12,
          margin: [0, 15, 0, 15],
        },
        columnsTitle: {
          fontSize: 8,
          bold: true,
          color: "#000000",
        },
      },
    };

    // pdfmake.createPdf(docDefinition).download(`uploads/${customer.barcode}_.pdf`);
    let pdfDoc = pdfmake.createPdf(docDefinition, {});
    pdfDoc.pipe(fs.createWriteStream(`uploads/${customer.barcode}_.pdf`));
    pdfDoc.end();
  } else {
    return false;
  }
};

module.exports = generateBill;
// generateBill(1, 4);
