const { system_suppliers, contact_persons } = require("../models");
const { Op } = require("sequelize");

exports.create = async (req, res) => {
  const transaction = await system_suppliers.sequelize.transaction();
  try {
    const { name, person_name, person_email, person_phone } = req.body;
    const requiredFields = [
      "name",
      "district_id",
      "system_supplier_id",
      "account_id",
    ];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res
          .status(400)
          .json({ error: `O campo ${field} é obrigatório.` });
      }
    }
    const system_supplier = await system_suppliers.create(
      req.body,
      {
        include: [
          {
            association: "contact_persons",
            required: false,
            attributes: ["id", "name", "phone_number", "email"],
          },
        ],
      },
      { transaction }
    );
    if (system_supplier) {
      if (person_name) {
        await contact_persons.create(
          {
            name: person_name,
            email: person_email,
            phone_number: person_phone,
            table_name: "system_suppliers",
            table_id: system_supplier.id,
          },
          { transaction }
        );
      }
    }
    await system_supplier.reload({ transaction });
    await transaction.commit();
    res.status(201).json(system_supplier);
  } catch (error) {
    logger.error({
      message: error.errors?.map((e) => e.message).join(" | ") || error.message,
      stack: error.stack,
      sql: error.sql,
      parameters: error.parameters,
      timestamp: new Date(),
    });

    res.status(400).json({ error: "Falha ao criar Sistema de abastecimento" });
  }
};

exports.update = async (req, res) => {
  const { person_name, person_email, person_phone } = req.body;
  const transaction = await system_suppliers.sequelize.transaction();
  try {
    const system_supplier = await system_suppliers.findOne({
      where: { id: req.params.id },
      include: [
        {
          association: "contact_persons",
          required: false,
          attributes: ["id", "name", "phone_number", "email"],
        },
      ],
      transaction,
    });

    if (!system_supplier) {
      return res
        .status(404)
        .json({ error: "Sistema de Abastecimento não encontrado" });
    }

    // Atualizar o regulador
    await system_supplier.update(req.body, { transaction });

    // Atualizar ou criar a pessoa de contacto, se necessário
    if (person_name) {
      const contactPerson = system_supplier.contact_persons[0]; // Assume que é um só contacto

      if (contactPerson) {
        await contactPerson.update(
          {
            name: person_name,
            email: person_email,
            phone_number: person_phone,
          },
          { transaction }
        );
      } else {
        await contact_persons.create(
          {
            name: person_name,
            email: person_email,
            phone_number: person_phone,
            table_name: "system_suppliers",
            table_id: system_supplier.id,
          },
          { transaction }
        );
      }
    }
    await system_supplier.reload({ transaction });
    await transaction.commit();
    return res.json(system_supplier);
  } catch (error) {
    res.status(400).json({ error: "Falha ao actualizar" });

    logger.error({
      message: error.errors?.map((e) => e.message).join(" | ") || error.message,
      stack: error.stack,
      sql: error.sql,
      parameters: error.parameters,
      timestamp: new Date(),
    });
  }
};

// Listar todos os reguladores
exports.findAll = async (req, res) => {
  try {
    const allsystem_suppliers = await system_suppliers.findAll();

    res.json(allsystem_suppliers);
  } catch (error) {
    res
      .status(500)
      .json({ error: "erro ao listar todos os sistema de abastecimento" });

    logger.error({
      message: error.errors?.map((e) => e.message).join(" | ") || error.message,
      stack: error.stack,
      sql: error.sql,
      parameters: error.parameters,
      timestamp: new Date(),
    });
  }
};

// Buscar um regulador por ID
exports.findOne = async (req, res) => {
  try {
    const system_supplier = await system_suppliers.findByPk(req.params.id);
    if (!system_supplier) {
      return res
        .status(404)
        .json({ error: "Sistema de abastecimento não encontrado" });
    }
    res.json(system_supplier);
  } catch (error) {
    res
      .status(500)
      .json({ error: "erro buscar um sistema de abastecimento por ID" });

    logger.error({
      message: error.errors?.map((e) => e.message).join(" | ") || error.message,
      stack: error.stack,
      sql: error.sql, // Query SQL (se existir)
      parameters: error.parameters, // Parâmetros (se existirem)
      timestamp: new Date(),
    });
  }
};
exports.delete = async (req, res) => {
  try {
    const deleted = await system_suppliers.destroy({
      where: { id: req.params.id },
    });
    if (deleted === 0) {
      return res
        .status(404)
        .json({ error: "Sistema de abastecimento não encontrado" });
    }
    res.status(204).json("Sistema de abastecimento removido com sucesso");
  } catch (error) {
    res.status(500).json({ error: error.message });

    logger.error({
      message: error.errors?.map((e) => e.message).join(" | ") || error.message,
      stack: error.stack,
      sql: error.sql,
      parameters: error.parameters,
      timestamp: new Date(),
    });
  }
};
