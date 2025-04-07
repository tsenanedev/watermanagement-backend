const { regulators: regulators } = require("../models");
const { Op } = require("sequelize");

exports.create = async (req, res) => {
  try {
    const regulator = await regulators.create(req.body);
    res.status(201).json(regulator);
  } catch (error) {
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
  try {
    const [updated] = await regulators.update(req.body, {
      where: { id: req.params.id },
      validate: true, // Validações do modelo
    });
    if (updated === 0) {
      return res.status(404).json({ error: "Regulador não encontrado" });
    }
    const updatedRegulator = await regulators.findByPk(req.params.id);
    res.json(updatedRegulator);
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
