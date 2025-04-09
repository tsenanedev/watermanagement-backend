const { regulators, contact_persons } = require("../models");

exports.create = async (req, res) => {
  const transaction = await regulators.sequelize.transaction();
  const { name, person_name, person_email, person_phone } = req.body;
  try {
    const regulator = await regulators.create(
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
    if (regulator) {
      if (person_name) {
        await contact_persons.create(
          {
            name: person_name,
            email: person_email,
            phone_number: person_phone,
            table_name: "regulators",
            table_id: regulator.id,
          },
          { transaction }
        );
      }
    }
    await regulator.reload({ transaction });
    await transaction.commit();

    res.status(201).json(regulator);
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
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

    res.status(400).json({ error: "Falha ao criar regulador" });
  }
};

exports.update = async (req, res) => {
  const { person_name, person_email, person_phone } = req.body;
  const transaction = await regulators.sequelize.transaction();
  try {
    const regulator = await regulators.findOne({
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

    if (!regulator) {
      return res.status(404).json({ error: "Regulador não encontrado" });
    }

    // Atualizar o regulador
    await regulator.update(req.body, { transaction });

    // Atualizar ou criar a pessoa de contacto, se necessário
    if (person_name) {
      const contactPerson = regulator.contact_persons[0]; // Assume que é um só contacto

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
            table_name: "regulators",
            table_id: regulator.id,
          },
          { transaction }
        );
      }
    }
    await regulator.reload({ transaction });
    await transaction.commit();
    return res.json(regulator);
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
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

// Listar todos os reguladores
exports.findAll = async (req, res) => {
  try {
    const allregulators = await regulators.findAll();

    res.json(allregulators);
  } catch (error) {
    res.status(500).json({ error: "erro ao listar todos os reguladores" });

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
    const regulator = await regulators.findByPk(req.params.id);
    if (!regulator) {
      return res.status(404).json({ error: "Regulador não encontrado" });
    }
    res.json(regulator);
  } catch (error) {
    res.status(500).json({ error: "erro buscar um regulador por ID" });

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
    const deleted = await regulators.destroy({ where: { id: req.params.id } });
    if (deleted === 0) {
      return res.status(404).json({ error: "Regulador não encontrado" });
    }
    res.status(200).json({
      success: true,
      message: "Regulador removido com sucesso",
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
