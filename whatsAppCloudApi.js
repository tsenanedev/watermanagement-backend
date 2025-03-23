const axios = require("axios");

const whatsappApiToken = process.env.WHATSAPP_API_TOKEN;
const whatsappPhoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
const whatsappUrl = process.env.WHATSAPP_URL;

const sendWhatsAppMessage = {
  async sendWhatsApp(whatsAppMessage) {
    const authString = `Bearer ` + whatsappApiToken;

    return new Promise(async (resolve, reject) => {
      try {
        const res = await axios.post(
          `${whatsappUrl}${whatsappPhoneNumberId}/messages`,
          whatsAppMessage,
          {
            headers: { Authorization: authString },
          }
        );
        const data = res.data;
        resolve(data);
      } catch (err) {
        reject(err);
      }
    });
  },

  getCustomerDetails(req, phoneNumber) {
    req.getConnection((err, conn) => {
      conn.query(
        "SELECT * FROM customers WHERE phone=? LIMIT 1",
        [phoneNumber],
        (err, rows, fields) => {
          if (err) {
            return {
              success: false,
              message: `O +${phoneNumber} não está associado a nenhuma conta de água.`,
            };
          } else {
            if (rows.length > 0) {
              const customerName = rows[0].name;
              return {
                success: true,
                customer: `Olá *${customerName}*\n`,
              };
            } else {
              return {
                success: false,
                message: `O +${phoneNumber} não está associado a nenhuma conta de água.`,
              };
            }
          }
        }
      );
    });
  },
};

module.exports = sendWhatsAppMessage;
