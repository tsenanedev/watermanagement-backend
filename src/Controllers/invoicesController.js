const ResponseHandler = require("../utils/ResponseHandler");
const {
  readingNotApproved,
  readingLessThanPrevious,
  invalidReadingValue,
  readingNotFound,
} = require("../utils/errors/ReadingErrors");
const { TaxType, CalculationType, TaxOperation } = require("../enums/Enum.js");
const { meterNotFound } = require("../utils/errors/MetersErrors");
const { customerNotFound } = require("../utils/errors/CustomrsErrors");
const { readings, tariffs, invoices, meters, taxs } = require("../models");
const { Op } = require("sequelize");

class invoicesController {
  static async create(req, res) {
    const transaction = await invoices.sequelize.transaction();
    try {
      const { reading_id } = req.body;

      // Buscar leitura com status específico
      const reading = await readings.findOne({
        where: { id: reading_id },
        include: {
          association: "meters",
          include: { association: "customers" },
        },
        transaction,
      });

      // Validações rigorosas
      if (!reading) throw readingNotFound("Leitura não encontrada");

      if (!reading.meters) throw meterNotFound("Contador não encontrada");

      if (!reading.meters.customers)
        throw customerNotFound("Cliente não encontrada");

      if (reading.status !== "approved") {
        throw readingNotApproved(
          "Apenas leituras aprovadas podem ser faturdas"
        );
      }
      const invoiceData = await calculateInvoice(reading);
      // if (reading.consumption <= 0) {
      //   throw new Error("Consumo inválido para faturamento");
      // }
      // const invoiceData = await calculateInvoice(reading, meter);
      // Uso no controller
      //   const { subtotal, total } = await calculateInvoice(reading, meter);

      //   await invoices.create(
      //     {
      //       reading_id: id,
      //       subtotal,
      //       total,
      //       due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      //       billing_date: new Date(),
      //       status: "billed",
      //       tenant_id: req.tenant_id,
      //     },
      //     { transaction }
      //   );

      return ResponseHandler.success(res, invoiceData);
    } catch (error) {
      await transaction.rollback();
      return ResponseHandler.handleError(error, res);
    }
  }
}
const calculateInvoice = async (reading) => {
  // return calculateInvoice1(reading);
  // 1. Buscar tarifas aplicáveis
  const tariff = await tariffs.findAll({
    where: {
      system_supplier_id: reading.meters.customers.system_supplier_id,
      tariff_type_id: reading.meters.customers.tariff_type_id,
      is_active: true,
      valid_from: { [Op.lte]: new Date() },
      valid_to: { [Op.or]: [{ [Op.gte]: new Date() }, { [Op.eq]: null }] },
    },
    order: [["consumption_from", "ASC"]],
  });

  const ivaTax = await taxs.findOne({
    where: {
      tax_type: TaxType.IVA,
      is_active: true,
    },
  });

  if (!ivaTax) throw new Error("IVA não encontrado");

  if (!tariff.length) throw new Error("Nenhuma tarifa encontrada");

  // 2. Extrair taxa de disponibilidade (assumindo que é a mesma para todos os escalões)
  const availabilityFee = parseFloat(tariff[0].availability_fee);

  // 3. Calcular consumo por escalão
  let remainingConsumption = parseFloat(reading.consumption);
  let consumptionCost = 0;
  let excessiveFee = 0;
  let ivaAmount = 0;

  let invoice_items = [];
  for (const item of tariff) {
    // Determinar limite superior do escalão
    const upperLimit = item.consumption_to || Infinity;

    // Calcular faixa de consumo válida para este escalão

    const applicableConsumption = Math.max(
      0,
      Math.min(remainingConsumption, upperLimit - item.consumption_from)
    );
    console.log("*********************************************************");
    console.log(applicableConsumption);
    if (applicableConsumption > 0) {
      consumptionCost +=
        parseFloat(applicableConsumption) * parseFloat(item.price);
      remainingConsumption -= applicableConsumption;
    }
    invoice_items.push({
      level_name: item.level_name,
      consumption_from: item.consumption_from,
      consumption_to: item.consumption_to,
      units_consumed: applicableConsumption,
      price: parseFloat(item.price),
      subtotal: parseFloat(
        (parseFloat(applicableConsumption) * parseFloat(item.price)).toFixed(2)
      ),
    });

    if (remainingConsumption <= 0) break;
  }
  if (tariff.length >= 2) {
    if (tariff[0].price !== tariff[1].price)
      excessiveFee = (tariff[1].price - tariff[0].price) * 5;
  }

  // 4. Calcular totais
  const subtotal = availabilityFee + consumptionCost;

  ivaAmount = subtotal * (ivaTax.value / 100);

  return {
    invoice_items,
    excessiveFee,
    availability_fee: availabilityFee,
    consumption_cost: consumptionCost.toFixed(2),
    subtotal: subtotal.toFixed(2),
    vat: ivaAmount.toFixed(2),
    total: parseFloat(
      subtotal + availabilityFee + excessiveFee + ivaAmount
    ).toFixed(2),
  };
};

module.exports = invoicesController;
