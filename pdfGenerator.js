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

  let docDefination = {
    header: [
      {
        text: customer.name,
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
  };

  let pdfDoc = pdfmake.createPdfKitDocument(docDefination, {});
  pdfDoc.pipe(fs.createWriteStream("uploads/test.pdf"));
  pdfDoc.end();

};

module.exports = generateBill;
// generateBill(1, 4);
