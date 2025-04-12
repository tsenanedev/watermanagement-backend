const { operators, contact_persons } = require("../models");

exports.create = async (req, res) => {
  const transaction = await operators.sequelize.transaction();
  try {
    const { name, person_name, person_email, person_phone } = req.body;
    const operator = await operators.create(
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
    if (operator) {
      if (person_name) {
        await contact_persons.create({
          name: person_name,
          email: person_email,
          phone_number: person_phone,
          table_name: "operators",
          table_id: operator.id,
        });
      }
    }
    await operator.reload({ transaction });
    await transaction.commit();
    res.status(201).json(operator);
  } catch (error) {
    if (
      error.name === "SequelizeValidationError" ||
      error.name === "SequelizeUniqueConstraintError"
    ) {
      const errorMessages = error.errors.map((e) => e.message).join(" | ");
      return res
        .status(400)
        .json({ error: `Falha na validação: ${errorMessages}` });
    }
    logger.error({
      message: error.errors?.map((e) => e.message).join(" | ") || error.message,
      stack: error.stack,
      sql: error.sql,
      parameters: error.parameters,
      timestamp: new Date(),
    });
    await transaction.rollback();
    res.status(400).json({ error: "Falha ao criar operador" });
  }
};

exports.update = async (req, res) => {
  const { person_name, person_email, person_phone } = req.body;
  const transaction = await operators.sequelize.transaction();
  try {
    const operator = await operators.findOne({
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

    if (!operator) {
      return res.status(404).json({ error: "Regulador não encontrado" });
    }

    await operator.update(req.body, { transaction });

    if (person_name) {
      const contactPerson = operator.contact_persons[0];

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
            table_name: "operators",
            table_id: operator.id,
          },
          { transaction }
        );
      }
    }
    await operator.reload({ transaction });
    await transaction.commit();
    return res.json(operator);
  } catch (error) {
    if (
      error.name === "SequelizeValidationError" ||
      error.name === "SequelizeUniqueConstraintError"
    ) {
      const errorMessages = error.errors.map((e) => e.message).join(" | ");
      return res
        .status(400)
        .json({ error: `Falha na validação: ${errorMessages}` });
    }
    logger.error({
      message: error.errors?.map((e) => e.message).join(" | ") || error.message,
      stack: error.stack,
      sql: error.sql,
      parameters: error.parameters,
      timestamp: new Date(),
    });
    res.status(400).json({ error: "Falha ao actualizar" });
  }
};

// Listar todos os Operatores
exports.findAll = async (req, res) => {
  try {
    const alloperator = await operators.findAll({
      include: [
        {
          association: "system_suppliers", // Associação definida em operators.js
          include: [
            {
              association: "districts", // Associação definida em system_suppliers.js
              attributes: ["id", "name"], // Campos específicos de districts
            },
          ],
          attributes: ["id", "name", "createdAt"], // Campos de system_suppliers
        },
      ],
    });

    res.json(alloperator);
  } catch (error) {
    logger.error({
      message: error.errors?.map((e) => e.message).join(" | ") || error.message,
      stack: error.stack,
      sql: error.sql,
      parameters: error.parameters,
      timestamp: new Date(),
    });
    res.status(500).json({ error: "erro ao listar todos os Operatores" });
  }
};

// Buscar um Operator por ID
exports.findOne = async (req, res) => {
  try {
    const operator = await operators.findByPk(req.params.id);
    if (!operator) {
      return res.status(404).json({ error: "Operator não encontrado" });
    }
    res.json(operator);
  } catch (error) {
    res.status(500).json({ error: "erro buscar um Operator por ID" });

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
    const deleted = await operators.destroy({ where: { id: req.params.id } });
    if (deleted === 0) {
      return res.status(404).json({ error: "Operator não encontrado" });
    }
    res.status(200).json({
      success: true,
      message: "Operator removido com sucesso",
      data: null,
    });
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
